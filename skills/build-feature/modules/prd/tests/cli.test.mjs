import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {digest} from '../scripts/execution.mjs';

test('a portable runtime renders offline with CRLF assets, valid CSP and escaped JSON', async()=>{
  const dir=await mkdtemp(join(tmpdir(),'feature-doc-runtime-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  try {
    await cp(join(root,'scripts'),join(dir,'scripts'),{recursive:true});
    await cp(join(root,'assets'),join(dir,'assets'),{recursive:true});
    const readerPath=join(dir,'assets/reader.js');
    const reader=await readFile(readerPath,'utf8');
    await writeFile(readerPath,reader.replace(/\r\n?|\n/g,'\r\n'));
    const doc=JSON.parse(await readFile(join(root,'examples/reader.prd.json'),'utf8'));
    doc.profile='product';delete doc.techPlan;
    doc.tasks.forEach(task=>task.planRefs=[]);
    doc.title='Literal </script><script>bad()</script> & content';
    const source=join(dir,'sample.prd.json'),out=join(dir,'sample.html');
    await writeFile(source,JSON.stringify(doc));
    execFileSync(process.execPath,[join(dir,'scripts/prd.mjs'),'render',source,'--out',out],{encoding:'utf8',cwd:dir});
    const html=await readFile(out,'utf8');
    assert.ok(html.includes('&lt;/script&gt;'));
    assert.ok(!html.includes('<script>bad()'));
    const embedded=html.match(/id="document-data">([^]*?)<\/script>/)[1];
    assert.equal(JSON.parse(embedded).document.title,doc.title);
    assert.equal((html.match(/<script/g)||[]).length,2);
    const browserScript=html.match(/<script>([^]*?)<\/script>/)[1].replace(/\r\n?/g,'\n');
    const cspHash=html.match(/script-src 'sha256-([^']+)'/)[1];
    assert.equal(cspHash,createHash('sha256').update(browserScript).digest('base64'));
    assert.throws(()=>execFileSync(process.execPath,[join(dir,'scripts/prd.mjs'),'render',source,'--out',source],{stdio:'pipe'}));
    assert.equal(JSON.parse(await readFile(source,'utf8')).title,doc.title);
  }finally{await rm(dir,{recursive:true,force:true});}
});

test('missing diagram dependencies explain setup without replacing the previous HTML',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'feature-doc-missing-dependencies-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  try {
    await cp(join(root,'scripts'),join(dir,'scripts'),{recursive:true});
    await cp(join(root,'assets'),join(dir,'assets'),{recursive:true});
    const source=join(dir,'plan.json'),out=join(dir,'plan.html');
    await cp(join(root,'examples/reader.tech-plan.json'),source);
    await writeFile(out,'Previous verified document');
    assert.throws(()=>execFileSync(process.execPath,[join(dir,'scripts/prd.mjs'),'render',source,'--out',out],{stdio:'pipe'}),error=>{
      assert.equal(error.status,1);
      const message=error.stderr.toString();
      assert.match(message,/npm ci --ignore-scripts/);
      assert.ok(message.includes(dir));
      assert.match(message,/--diagram-source/);
      assert.match(message,/playwright-core/);
      return true;
    });
    assert.equal(await readFile(out,'utf8'),'Previous verified document');
  }finally{await rm(dir,{recursive:true,force:true});}
});

test('technical plan has an explicit offline diagram-source fallback',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'feature-doc-diagrams-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  try {
    const doc=JSON.parse(await readFile(join(root,'examples/reader.tech-plan.json'),'utf8'));
    for(const [locale,label] of [['en','Diagram shown as source'],['fr','Diagramme présenté en source']]) {
      const source=join(dir,`plan-${locale}.json`),out=join(dir,`plan-${locale}.html`);
      await writeFile(source,JSON.stringify({...doc,locale}));
      const result=execFileSync(process.execPath,[join(root,'scripts/prd.mjs'),'render',source,'--diagram-source','--out',out],{encoding:'utf8'});
      assert.match(JSON.parse(result).warnings.join(' '),/SVG compilation/);
      const html=await readFile(out,'utf8');
      assert.ok(html.includes('sequenceDiagram'));
      assert.ok(html.includes(label),`Missing ${locale} diagram fallback label`);
      assert.ok(html.includes(`lang="${locale}"`));
    }
  }finally{await rm(dir,{recursive:true,force:true});}
});

test('worker context identifies approved sources and refuses an edited plan without a revision bump',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'feature-doc-context-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  const source=join(dir,'reader.prd.json'),planPath=join(dir,'reader.tech-plan.json');
  const state=join(dir,'run.json'),out=join(dir,'context.json');
  const cli=(command,...args)=>JSON.parse(execFileSync(process.execPath,[join(root,'scripts/prd.mjs'),command,
    source,'--plan',planPath,'--state',state,...args],{encoding:'utf8',stdio:'pipe'}));
  try {
    await cp(join(root,'examples/reader.prd.json'),source);
    await cp(join(root,'examples/reader.tech-plan.json'),planPath);
    const doc=JSON.parse(await readFile(source,'utf8'));
    const plan=JSON.parse(await readFile(planPath,'utf8'));
    const taskId=doc.tasks.find(item=>item.kind==='code').id;
    const planning=JSON.parse(execFileSync(process.execPath,[join(root,'scripts/prd.mjs'),'task-context',
      source,taskId,'--plan',planPath],{encoding:'utf8',stdio:'pipe'}));
    assert.equal(Object.hasOwn(planning,'execution'),false);
    assert.equal(Object.hasOwn(planning.sourceFiles,'execution'),false);
    assert.equal(planning.planDigest,digest(plan));
    cli('init-run');
    for(const gate of ['A','B']) cli('approve','--gate',gate,'--revision',doc.revision,'--evidence','Synthetic user approval');
    cli('record-task',taskId,'--phase','started','--evidence','Synthetic owned scope claim');
    const context=cli('task-context',taskId);
    assert.deepEqual(context.sourceFiles,{prd:source,technicalPlan:planPath,execution:state});
    assert.equal(context.specDigest,digest(doc));
    assert.equal(context.planDigest,digest(plan));
    assert.equal(context.execution.approvals.B.digest,digest({specDigest:context.specDigest,planDigest:context.planDigest}));
    assert.equal(context.execution.tasks[taskId].phase,'started');
    await writeFile(out,JSON.stringify(context));
    plan.entries[0].body+=' Changed design without a new revision.';
    await writeFile(planPath,JSON.stringify(plan));
    assert.throws(()=>cli('task-context',taskId,'--out',out),/different technical-plan digest/);
    assert.deepEqual(JSON.parse(await readFile(out,'utf8')),context);
  }finally{await rm(dir,{recursive:true,force:true});}
});

test('CLI runs parallel implementation, one combined review, and separate local deliveries',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'feature-doc-local-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  const source=join(root,'examples/reader.prd.json');
  const plan=join(root,'examples/reader.tech-plan.json');
  const state=join(dir,'run.json');
  const cli=(command,...args)=>JSON.parse(execFileSync(process.execPath,[join(root,'scripts/prd.mjs'),command,source,'--plan',plan,'--state',state,...args],{encoding:'utf8',stdio:'pipe'}));
  try {
    cli('init-run','--delivery','local');
    assert.equal(cli('next').status,'blocked');
    for(const gate of ['A','B']) cli('approve','--gate',gate,'--revision','1','--evidence','Synthetic test-only user approval');
    const first=cli('next').taskIds[0];
    let next=cli('next');
    let sawParallelBatch=false;
    while(next.status==='ready') {
      sawParallelBatch ||= next.parallelTaskIds.length>1;
      for(const id of next.parallelTaskIds) cli('record-task',id,'--phase','started','--evidence','Synthetic owned scope claim');
      for(const id of next.parallelTaskIds) {
        for(const phase of ['implemented','validated']) cli('record-task',id,'--phase',phase,'--evidence','Synthetic observed task checks');
      }
      next=cli('next');
    }
    assert.equal(sawParallelBatch,true);
    assert.equal(next.status,'feature');
    assert.throws(()=>cli('record-task',first,'--phase','ready-to-open','--evidence','Attempt to skip final review'),/final feature review/);
    for(const phase of ['integrated','validated','simplified','revalidated','reviewed','ready-to-deliver'])
      cli('record-feature','--phase',phase,'--evidence','Synthetic observed cumulative feature evidence');
    while((next=cli('next')).status==='delivery') {
      for(const id of next.taskIds) {
        for(const phase of ['ready-to-open','delivered-local']) cli('record-task',id,'--phase',phase,'--evidence','Saved synthetic task checkpoint');
      }
    }
    assert.equal(next.status,'human-qa');
    const saved=JSON.parse(await readFile(state,'utf8'));
    assert.equal(saved.deliveryMode,'local');
    assert.equal(saved.tasks[first].phase,'delivered-local');
    assert.equal(saved.feature.reviewPasses,1);
    assert.equal(saved.schemaVersion,2);
    const out=join(dir,'result.html');
    const rendered=cli('render','--out',out,'--diagram-source');
    assert.match(rendered.warnings.join(' '),/SVG compilation/);
    const html=await readFile(out,'utf8');
    assert.ok(html.includes('Delivered locally'));
    assert.ok(!html.includes('>delivered-local<'));
    assert.ok(html.includes('sequenceDiagram'));
    assert.ok(!html.includes('Gate C'));
    const payload=JSON.parse(html.match(/id="document-data">([^]*?)<\/script>/)[1]);
    assert.equal(payload.technicalPlan.id,'feature-documents-plan');
  }finally{await rm(dir,{recursive:true,force:true});}
});
