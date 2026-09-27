import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDocument, taskContext} from '../scripts/document-model.mjs';
import {newExecution, approve, recordTask, nextTask, validateExecution} from '../scripts/execution.mjs';

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
  for(const gate of ['A','B','C'])approve(doc,state,plan,gate,'1','Explicit user approval in fixture');
  assert.equal(nextTask(doc,state,plan).taskId,'CODE-001');
  recordTask(doc,state,plan,'CODE-001','implemented','Reader exists');
  recordTask(doc,state,plan,'CODE-001','validated','Offline exercise passed');
  assert.equal(state.tasks['CODE-001'].history[0].evidence,'Reader exists');
  const changed=structuredClone(doc);changed.requirements[0].description='Changed behavior';
  assert.throws(()=>validateExecution(changed,state,plan),/stale/);
});

test('rejects a dependency cycle before a task can be dispatched', () => {
  const doc = fixture();
  doc.tasks.push({...doc.tasks[0], id: 'CODE-002', dependsOn: ['CODE-001']});
  doc.tasks[0].dependsOn = ['CODE-002'];
  assert.throws(() => validateDocument(doc), /cycle/i);
});
