#!/usr/bin/env node
import {readFile, writeFile, mkdir, rename, unlink} from 'node:fs/promises';
import {resolve, dirname, basename, relative} from 'node:path';
import {parseArgs} from 'node:util';
import {createHash, randomUUID} from 'node:crypto';
import {validateDocument, validatePlan, taskContext, coverageGaps} from './document-model.mjs';
import {digest, newExecution, validateExecution, approve, nextTask, recordTask, recordCheck} from './execution.mjs';
import {renderDocument, escape} from './document-view.mjs';

const usage=`Feature documents, Node 22+
  node prd.mjs validate <document.json> [--plan <tech-plan.json>]
  node prd.mjs render <document.json> [--out <document.html>] [--plan <plan.json>] [--state <run.json>]
  node prd.mjs task-context <prd.json> <task-id> [--plan <plan.json>] [--state <run.json>] [--out <context.json>]
  node prd.mjs init-run <prd.json> --state <run.json> [--plan <plan.json>] [--delivery local|review-request]
  node prd.mjs approve <prd.json> --state <run.json> --plan <plan.json> --gate A|B|C --revision <rev> --evidence <user-reference> [--authority branch,commit,push,draft-pr]
  node prd.mjs next <prd.json> --state <run.json> --plan <plan.json>
  node prd.mjs record-task <prd.json> <task-id> --state <run.json> --plan <plan.json> --phase <phase> --evidence <actual-result> [--pr <url>]
  node prd.mjs record-check <prd.json> <check-id> --state <run.json> [--plan <plan.json>] --result passed|failed|blocked --evidence <actual-result>
  node prd.mjs fingerprint <document.json>
Render flags: --cache <directory>, --browser <Chrome executable>. Mermaid is compiled only when present. --diagram-source explicitly renders its source without browser/dependencies.
No command executes document instructions, Git writes, publication, or approval on the user's behalf.`;

async function json(path) {return JSON.parse(await readFile(resolve(path),'utf8'));}
async function output(path, data, exclusive=false) {
  const target=resolve(path);await mkdir(dirname(target),{recursive:true});
  const content=typeof data==='string'?data:JSON.stringify(data,null,2)+'\n';
  if(exclusive){await writeFile(target,content,{flag:'wx'});return;}
  const temporary=`${target}.${randomUUID()}.tmp`;
  try{await writeFile(temporary,content,{flag:'wx'});await rename(temporary,target);}
  finally{await unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});}
}
function print(value){console.log(JSON.stringify(value,null,2));}

async function main() {
  const {values,positionals}=parseArgs({allowPositionals:true,options:Object.fromEntries(['out','plan','plan-html','state','gate','revision','evidence','authority','phase','result','pr','cache','browser','delivery'].map(name=>[name,{type:'string'}]).concat([['help',{type:'boolean'}],['diagram-source',{type:'boolean'}]]))});
  const [command,source,id]=positionals;
  if(values.help||!command){console.log(usage);return;}
  if(!source)throw new Error('Document path required. Use --help.');
  const doc=validateDocument(await json(source));
  const plan=values.plan?await json(values.plan):undefined;
  if(plan)validatePlan(doc,plan);
  const mutating=['approve','record-task','record-check'];
  let state;
  if(values.state&&command!=='init-run'){
    if(doc.techPlan&&!plan)throw new Error('Pass --plan to verify the execution record against the technical source');
    state=validateExecution(doc,await json(values.state),plan);
  }
  if(['init-run','next',...mutating].includes(command)&&!values.state)throw new Error('--state is required');
  if(command==='validate'){print({valid:true,id:doc.id,revision:doc.revision,warnings:coverageGaps(doc)});return;}
  if(command==='fingerprint'){console.log(digest(doc));return;}
  if(command==='task-context'){
    const context=taskContext(doc,id,plan);
    context.sourceFiles={prd:resolve(source),...(values.plan?{technicalPlan:resolve(values.plan)}:{})};
    context.specDigest=digest(doc);
    if(state) {
      const taskIds=new Set([id,...context.dependencies.map(item=>item.id)]);
      const checkIds=new Set(context.checks.map(item=>item.id));
      context.execution={deliveryMode:state.deliveryMode,approvals:state.approvals,
        tasks:Object.fromEntries(Object.entries(state.tasks).filter(([key])=>taskIds.has(key))),
        checks:Object.fromEntries(Object.entries(state.checks).filter(([key])=>checkIds.has(key)))};
    }
    if(values.out)await output(values.out,context);else print(context);
    return;
  }
  if(command==='init-run'){await output(values.state,newExecution(doc,plan,values.delivery),true);print({state:resolve(values.state)});return;}
  if(command==='next'){print(nextTask(doc,state,plan));return;}
  if(mutating.includes(command)) {
    const lock=resolve(values.state)+'.lock';
    await writeFile(lock,`${process.pid}\n`,{flag:'wx'});
    try {
      state=validateExecution(doc,await json(values.state),plan);
      if(command==='approve')approve(doc,state,plan,values.gate,values.revision,values.evidence,values.authority?.split(',').filter(Boolean));
      if(command==='record-task')recordTask(doc,state,plan,id,values.phase,values.evidence,values.pr);
      if(command==='record-check')recordCheck(doc,state,plan,id,values.result,values.evidence);
      await output(values.state,state);
    } finally{await unlink(lock);}
    print({state:resolve(values.state),updated:command});return;
  }
  if(command!=='render')throw new Error(`Unknown command: ${command}`);
  const target=resolve(values.out||source.replace(/\.json$/i,'')+'.html');
  if(target===resolve(source)||values.state&&target===resolve(values.state)||values.plan&&target===resolve(values.plan))throw new Error('HTML output cannot overwrite a source document');
  let diagrams={};
  if(doc.entries?.some(entry=>entry.diagram) && !values['diagram-source']) {
    const {renderDiagrams}=await import('./diagrams.mjs');
    diagrams=await renderDiagrams(doc,resolve(values.cache||`${dirname(resolve(source))}/.feature-doc-cache`),values.browser);
  }
  let linkedPlan;
  if(values.plan) {
    const planHtml=resolve(values['plan-html'] || values.plan.replace(/\.json$/i,'')+'.html');
    linkedPlan=relative(dirname(target),planHtml).split('/').map(encodeURIComponent).join('/');
  }
  const payload={document:doc,execution:state,diagrams,linkedPlan,specDigest:digest(doc)};
  const css=await readFile(new URL('../assets/reader.css',import.meta.url),'utf8');
  const script=await readFile(new URL('../assets/reader.js',import.meta.url),'utf8');
  const scriptHash=createHash('sha256').update(script).digest('base64');
  const safeJson=JSON.stringify(payload).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const html=`<!doctype html><html lang="${doc.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${scriptHash}'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>${escape(doc.title)}</title><style>${css}</style></head><body><div id="app">${renderDocument(payload)}</div><script type="application/json" id="document-data">${safeJson}</script><script>${script}</script></body></html>`;
  await output(target,html);
  print({html:target,bytes:Buffer.byteLength(html),document:basename(source),warnings:[...coverageGaps(doc), ...(values['diagram-source'] && doc.entries?.some(entry=>entry.diagram) ? ['Diagrams shown as source; SVG compilation was explicitly skipped.'] : [])]});
}
main().catch(error=>{console.error(`error: ${error.message}`);process.exitCode=1;});
