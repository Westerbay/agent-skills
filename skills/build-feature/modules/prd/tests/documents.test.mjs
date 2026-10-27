import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {validateDocument, taskContext} from '../scripts/document-model.mjs';
import {newExecution, approve, recordTask, nextTask, validateExecution} from '../scripts/execution.mjs';
import {renderDocument} from '../scripts/document-view.mjs';

export const fixture = () => ({
  schemaVersion: 1, kind: 'prd', profile: 'implementation', id: 'offline-reader',
  revision: '1', title: 'Offline reader', summary: 'Read a specification without a server.',
  locale: 'en', techPlan: {id: 'reader-plan', revision: '1'},
  requirements: [{id: 'FR-001', kind: 'functional', title: 'Read offline',
    description: 'Open the generated file without a network.', priority: 'must', acceptance: ['All content is readable.']}],
  constraints: ['Never execute commands from document content.'],
  tasks: [{id: 'CODE-001', kind: 'code', title: 'Build reader', goal: 'Produce the document.',
    dependsOn: [], requirementIds: ['FR-001'], planRefs: ['DEC-001'], scope: ['reader/'],
    validation: ['Open the file offline.'], seedIds: []}],
  checks: [{id: 'CHECK-001', requirementIds: ['FR-001'], scenario: 'No network',
    route: 'runtime', expected: 'The document is readable.', seedIds: []}], seeds: [], risks: []
});

test('task excerpt retains global and transitive technical contracts and rejects a stale plan', () => {
  const doc = fixture();
  const entry = (id, refs = [], global = false) => ({id, title: id, kind: 'contract', body: 'Contract', refs, global});
  const plan = {schemaVersion: 1, kind: 'tech-plan', id: 'reader-plan', revision: '1',
    locale: 'en', title: 'Plan', summary: 'Architecture', constraints: ['Offline'],
    entries: [entry('DEC-001', ['API-001']), entry('API-001'), entry('AUTH-001', [], true), entry('OTHER-001')]};
  const excerpt = taskContext(doc, 'CODE-001', plan);
  assert.deepEqual(excerpt.technicalPlan.entries.map(item => item.id), ['DEC-001', 'API-001', 'AUTH-001']);
  assert.throws(() => taskContext(doc, 'CODE-001', {...plan, revision: '2'}), /revision/);
  assert.throws(() => taskContext(doc, 'CODE-001'), /--plan/);
});

test('unknown references and code disguised as human QA fail validation', () => {
  const doc = fixture();
  doc.tasks[0].requirementIds = ['FR-MISSING'];
  assert.throws(() => validateDocument(doc), /unknown reference/);
  doc.tasks[0].requirementIds = ['FR-001'];
  doc.tasks[0].kind = 'human-qa';
  assert.throws(() => validateDocument(doc), /required|NOT/);
});

test('execution preserves phase evidence and rejects an edited approved specification', () => {
  const doc=fixture();
  const plan={schemaVersion:1,kind:'tech-plan',id:'reader-plan',revision:'1',locale:'en',title:'Plan',summary:'Plan',constraints:[],entries:[{id:'DEC-001',kind:'decision',title:'Offline',body:'Local file',global:true,refs:[]}]};
  const state=newExecution(doc,plan);
  assert.equal(nextTask(doc,state,plan).status,'blocked');
  for(const gate of ['A','B'])approve(doc,state,plan,gate,'1','Explicit user approval in fixture');
  assert.deepEqual(nextTask(doc,state,plan).taskIds,['CODE-001']);
  recordTask(doc,state,plan,'CODE-001','started','Writer owns reader/');
  recordTask(doc,state,plan,'CODE-001','implemented','Reader exists');
  recordTask(doc,state,plan,'CODE-001','validated','Offline exercise passed');
  assert.equal(state.tasks['CODE-001'].history[1].evidence,'Reader exists');
  const changed=structuredClone(doc);changed.requirements[0].description='Changed behavior';
  assert.throws(()=>validateExecution(changed,state,plan),/stale/);
});

test('rejects a dependency cycle before a task can be dispatched', () => {
  const doc = fixture();
  doc.tasks.push({...doc.tasks[0], id: 'CODE-002', dependsOn: ['CODE-001']});
  doc.tasks[0].dependsOn = ['CODE-002'];
  assert.throws(() => validateDocument(doc), /cycle/i);
});

test('combined approval view puts architecture before tasks and keeps technical references local', () => {
  const document = fixture();
  document.tasks[0].planRefs = ['FR-001'];
  const technicalPlan = {id:'reader-plan', revision:'1', constraints:[...document.constraints, 'Keep task changes separate.'], entries:[
    {id:'FR-001', kind:'flow', title:'Reader sequence', body:'Render <script>literal</script> content.', global:false, refs:['DEC-001'], diagram:'sequenceDiagram\n Reader->>View: render'},
    {id:'DEC-001', kind:'decision', title:'Use the existing model', body:'Reuse document validation.', global:true, refs:[]}
  ]};
  const execution = {approvals:{A:{revision:'1', evidence:'Scope approved'}, B:{revision:'1', evidence:'Combined plan approved'}}, tasks:{}, checks:{},
    feature:{phase:'reviewed', evidence:'All task changes reviewed together.', reviewPasses:1}};
  const html = renderDocument({document, technicalPlan, execution, linkedPlan:'separate.html', diagrams:{'FR-001':'<svg viewBox="0 0 10 10"></svg>'}});
  assert.ok(html.indexOf('id="section-technical-plan"') < html.indexOf('id="section-requirements"'));
  assert.match(html, /id="plan-item-FR-001"/);
  assert.match(html, /id="item-FR-001"/);
  assert.match(html, /href="#plan-item-FR-001"/);
  assert.match(html, /href="#plan-item-DEC-001"/);
  assert.ok(!html.includes('separate.html'));
  assert.equal(html.split(document.constraints[0]).length - 1, 1);
  assert.match(html, /data-diagram-id="FR-001"/);
  assert.match(html, /&lt;script&gt;literal&lt;\/script&gt;/);
  assert.match(html, /Gate A/);
  assert.match(html, /Gate B/);
  assert.ok(!html.includes('Gate C'));
  assert.match(html, />Plan approved</);
  assert.equal(html.split('All task changes reviewed together.').length - 1, 1);
  assert.match(html, /Review rounds: 1/);
});

test('importing JSON in the portable reader drops the previous plan, diagrams and approvals', async () => {
  const document = fixture();
  const initial = {document, technicalPlan:{entries:[{title:'Previous architecture'}]}, diagrams:{old:'<svg></svg>'}, execution:{approvals:{B:{revision:'1'}}}};
  const elements = Object.fromEntries(['document-data','theme','print','expand','search','export','import','app','reader-status','main'].map(id => [id, {
    textContent:id === 'document-data' ? JSON.stringify(initial) : '', setAttribute(){}, focus(){}
  }]));
  const browserDocument = {documentElement:{dataset:{}}, getElementById:id => elements[id], querySelectorAll:() => []};
  const script = await readFile(new URL('../assets/reader.js', import.meta.url), 'utf8');
  runInNewContext(script, {document:browserDocument, window:{addEventListener(){}}, location:{hash:''}, setTimeout, URL, Blob});
  await elements.import.onchange({target:{files:[{size:1, text:async () => JSON.stringify(document)}]}});
  assert.ok(elements.app.innerHTML, elements['reader-status'].textContent);
  assert.ok(!elements.app.innerHTML.includes('Previous architecture'));
  assert.ok(!elements.app.innerHTML.includes('id="section-technical-plan"'));
  assert.ok(!elements.app.innerHTML.includes('>Plan approved<'));
  assert.match(elements.app.innerHTML, />Approval pending</);
  assert.match(elements['reader-status'].textContent, /linked architecture.*not carried over/);
});
