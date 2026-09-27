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
      assert.ok(html.includes('flowchart LR'));
      assert.ok(html.includes(label),`Missing ${locale} diagram fallback label`);
      assert.ok(html.includes(`lang="${locale}"`));
    }
  }finally{await rm(dir,{recursive:true,force:true});}
});

test('CLI local checkpoint persists, releases dependent work and renders the delivered status',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'feature-doc-local-'));
  const root=fileURLToPath(new URL('../',import.meta.url));
  const source=join(root,'examples/reader.prd.json');
  const plan=join(root,'examples/reader.tech-plan.json');
  const state=join(dir,'run.json');
  const cli=(command,...args)=>JSON.parse(execFileSync(process.execPath,[join(root,'scripts/prd.mjs'),command,source,'--plan',plan,'--state',state,...args],{encoding:'utf8'}));
  try {
    cli('init-run','--delivery','local');
    assert.equal(cli('next').status,'blocked');
    for(const gate of ['A','B','C']) cli('approve','--gate',gate,'--revision','1','--evidence','Synthetic test-only user approval');
    const first=cli('next').taskId;
    for(const phase of ['implemented','validated','simplified','revalidated','reviewed','ready-to-open','delivered-local'])
      cli('record-task',first,'--phase',phase,'--evidence','Synthetic observed test evidence');
    const saved=JSON.parse(await readFile(state,'utf8'));
    assert.equal(saved.deliveryMode,'local');
    assert.equal(saved.tasks[first].phase,'delivered-local');
    assert.notEqual(cli('next').taskId,first);
    const out=join(dir,'result.html');
    cli('render','--out',out);
    const html=await readFile(out,'utf8');
    assert.ok(html.includes('Delivered locally'));
    assert.ok(!html.includes('>delivered-local<'));
  }finally{await rm(dir,{recursive:true,force:true});}
});
