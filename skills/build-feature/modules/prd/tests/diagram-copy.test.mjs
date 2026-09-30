import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {renderDocument} from '../scripts/document-view.mjs';

const sample=JSON.parse(await readFile(new URL('../examples/reader.tech-plan.json',import.meta.url),'utf8'));

test('each compiled diagram gets its own copy button; source-only diagrams cannot be copied',()=>{
  const document=structuredClone(sample);
  const first=document.entries.find(entry=>entry.diagram);
  document.entries.push({...first,id:'FLOW-002',title:'A second flow',refs:[]});
  const html=renderDocument({document,diagrams:{'FLOW-001':'<svg viewBox="0 0 10 10"></svg>'}});
  assert.match(html,/<button[^>]+class="diagram-copy"[^>]+data-diagram-id="FLOW-001"/);
  assert.ok(!html.includes('data-diagram-id="FLOW-002"'));
  assert.ok(!html.includes('id="copy-image"'));
});

test('each copy button writes a PNG containing only its diagram', {skip:process.env.DIAGRAM_BROWSER_TEST!=='1'}, async()=>{
  const {chromium}=await import('playwright-core');
  const dir=await mkdtemp(join(tmpdir(),'feature-diagram-copy-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  let browser;
  try {
    const document=structuredClone(sample);
    const first=document.entries.find(entry=>entry.diagram);
    document.entries.push({...first,id:'FLOW-002',title:'A second flow',
      diagram:'flowchart LR\n X[SECOND DIAGRAM] --> Y[OTHER]',refs:[]});
    const source=join(dir,'plan.json'),out=join(dir,'plan.html');
    await writeFile(source,JSON.stringify(document));
    execFileSync(process.execPath,[join(root,'scripts/prd.mjs'),'render',source,'--out',out],{encoding:'utf8'});
    browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
    const page=await browser.newPage();
    await page.addInitScript(()=>{
      window.ClipboardItem=class {constructor(types){this.types=types;}getType(type){return this.types[type];}};
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{write:async items=>{
        window.copiedDiagram=await items[0].getType('image/png');
      }}});
    });
    await page.goto(`file://${out}`);
    const copies=[];
    for(const id of ['FLOW-001','FLOW-002']) {
      await page.locator(`[data-diagram-id="${id}"]`).click();
      await page.waitForFunction(()=>document.getElementById('reader-status').textContent.includes('copied to clipboard'));
      copies.push(await page.evaluate(async()=>{
        const bytes=new Uint8Array(await window.copiedDiagram.arrayBuffer());
        const view=new DataView(bytes.buffer);
        return {type:window.copiedDiagram.type,signature:[...bytes.slice(0,8)],
          width:view.getUint32(16),height:view.getUint32(20),size:bytes.length};
      }));
    }
    for(const copy of copies) {
      assert.equal(copy.type,'image/png');
      assert.deepEqual(copy.signature,[137,80,78,71,13,10,26,10]);
      assert.ok(copy.width>0&&copy.width<4096);
      assert.ok(copy.height>0&&copy.height<4096);
      assert.ok(copy.size>1000);
    }
    assert.notDeepEqual(copies[0],copies[1]);
  }finally{await browser?.close();await rm(dir,{recursive:true,force:true});}
});
