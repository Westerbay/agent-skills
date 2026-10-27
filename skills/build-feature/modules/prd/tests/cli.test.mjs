import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('a portable runtime renders offline without npm and escapes embedded JSON', async()=>{
  const dir=await mkdtemp(join(tmpdir(),'feature-doc-runtime-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  try {
    await cp(join(root,'scripts'),join(dir,'scripts'),{recursive:true});
    await cp(join(root,'assets'),join(dir,'assets'),{recursive:true});
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
