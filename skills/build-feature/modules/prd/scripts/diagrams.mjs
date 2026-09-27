import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
import {digest} from './execution.mjs';

export async function renderDiagrams(doc, cacheDir, executablePath) {
  const entries=(doc.entries || []).filter(entry=>entry.diagram);
  if(!entries.length)return {};
  await mkdir(cacheDir,{recursive:true});
  const bundlePath=fileURLToPath(new URL('../assets/mermaid.js',import.meta.url));
  const bundle=await readFile(bundlePath,'utf8');
  const bundleDigest=digest(bundle);
  const diagrams={},missing=[];
  for(const entry of entries) {
    if (/%%\{|^---/m.test(entry.diagram)) throw new Error(`${entry.id}: diagram configuration directives are not allowed; configure the shared renderer`);
    const key=digest({source:entry.diagram,id:entry.id,bundleDigest,renderer:1});
    const file=`${cacheDir}/${key}.svg`;
    if(existsSync(file))diagrams[entry.id]=await readFile(file,'utf8');
    else missing.push({entry,file});
  }
  if(!missing.length)return diagrams;
  const options={headless:true};
  if(executablePath)options.executablePath=executablePath;
  else if(process.platform==='darwin'&&existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')) options.executablePath='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  else options.channel='chrome';
  const browser=await chromium.launch(options);
  try {
    const page=await browser.newPage();
    await page.route('**/*',route=>route.abort());
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({content:bundle});
    await page.evaluate(()=>window.featureMermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'neutral',htmlLabels:false,
      flowchart:{htmlLabels:false},fontFamily:'Arial',maxTextSize:50000,secure:['securityLevel','startOnLoad','maxTextSize','htmlLabels','flowchart']}));
    for(const {entry,file} of missing) {
      const svg=await page.evaluate(async ({source,id})=>{
        const {svg}=await window.featureMermaid.render(`diagram-${id}`,source);
        const parsed=new DOMParser().parseFromString(svg,'image/svg+xml');
        if(parsed.querySelector('parsererror'))throw new Error('Invalid generated SVG');
        parsed.querySelectorAll('script,foreignObject,iframe,image,a,animate,set').forEach(el=>el.remove());
        for(const el of parsed.querySelectorAll('*'))for(const attr of [...el.attributes]) {
          if(/^on/i.test(attr.name)|| /href$/i.test(attr.name) || /url\(\s*['"]?(?!#)/i.test(attr.value))el.removeAttribute(attr.name);
        }
        return new XMLSerializer().serializeToString(parsed.documentElement);
      },{source:entry.diagram,id:entry.id});
      diagrams[entry.id]=svg;
      await writeFile(file,svg,{flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});
    }
  } finally {await browser.close();}
  return diagrams;
}
