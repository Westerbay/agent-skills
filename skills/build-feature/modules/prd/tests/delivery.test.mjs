import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newExecution, approve, recordTask, recordFeature, nextTask, validateExecution, digest} from '../scripts/execution.mjs';

function scenario(mode = 'local', authorities) {
  const plan = {schemaVersion:1,kind:'tech-plan',id:'plan',revision:'1',locale:'en',title:'Plan',summary:'Plan',constraints:[],entries:[{id:'DEC-1',kind:'decision',title:'Local',body:'Local delivery',global:true,refs:[]} ]};
  const doc = {schemaVersion:1,kind:'prd',profile:'implementation',id:'feature',revision:'1',locale:'en',title:'Feature',summary:'Feature',constraints:[],techPlan:{id:'plan',revision:'1'},
    requirements:[{id:'FR-1',kind:'functional',title:'Behavior',description:'Behavior',priority:'must',acceptance:['Works']}],
    tasks:[...['CODE-1','CODE-2'].map((id,i)=>({id,kind:'code',title:id,goal:'Behavior',scope:['src/'],dependsOn:i?['CODE-1']:[],requirementIds:['FR-1'],planRefs:[],seedIds:[],validation:['Check behavior']})),
      {id:'QA-1',kind:'human-qa',title:'Accept',dependsOn:['CODE-2'],requirementIds:['FR-1'],planRefs:[],seedIds:[],steps:['Exercise'],expected:'Works',cleanup:'None'}],
    checks:[{id:'CHECK-1',requirementIds:['FR-1'],scenario:'Exercise',route:'runtime',expected:'Works',seedIds:[]}],seeds:[],risks:[]};
  const state = newExecution(doc,plan,mode);
  for (const gate of ['A','B']) approve(doc,state,plan,gate,'1','Synthetic explicit approval',gate==='A'?authorities:undefined);
  return {doc,plan,state};
}
function implemented({doc,plan,state}, id) {
  for(const phase of ['started','implemented','validated']) recordTask(doc,state,plan,id,phase,'Observed fixture evidence');
}

function reviewed({doc,plan,state}, ready=true) {
  const phases=['integrated','validated','simplified','revalidated','reviewed'];
  if(ready)phases.push('ready-to-deliver');
  for(const phase of phases) recordFeature(doc,state,plan,phase,'Observed integrated fixture evidence');
}

function deliver(s,id,url) {
  recordTask(s.doc,s.state,s.plan,id,'ready-to-open','Verified task diff and final review');
  recordTask(s.doc,s.state,s.plan,id,url?'published':'delivered-local','Observed task delivery',url);
}

function independentScenario(count=2, scopes) {
  const {doc,plan}=scenario();
  const template=doc.tasks[0];
  doc.tasks=Array.from({length:count},(_,i)=>({...structuredClone(template),id:`CODE-${i+1}`,dependsOn:[],scope:scopes?.[i]||[`src/task-${i+1}/`]}));
  const state=newExecution(doc,plan);
  for(const gate of ['A','B'])approve(doc,state,plan,gate,'1','Synthetic explicit approval');
  return {doc,plan,state};
}

test('validated tasks release dependencies, while all task deliveries wait for one final review',()=>{
  const s=scenario();
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-2','started','Too early'),/dependencies are not validated/);
  implemented(s,'CODE-1');
  assert.deepEqual(nextTask(s.doc,s.state,s.plan).taskIds,['CODE-2']);
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','ready-to-open','Early delivery'),/final feature review/);
  assert.throws(()=>recordFeature(s.doc,s.state,s.plan,'integrated','Partial feature'),/all code tasks/);
  implemented(s,'CODE-2');
  assert.equal(nextTask(s.doc,s.state,s.plan).status,'feature');
  reviewed(s);
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-2','ready-to-open','Wrong stack order'),/dependency tasks first/);
  deliver(s,'CODE-1');
  assert.deepEqual(nextTask(s.doc,s.state,s.plan).taskIds,['CODE-2']);
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'QA-1','accepted','Early QA'),/all code deliveries/);
  deliver(s,'CODE-2');
  assert.equal(nextTask(s.doc,s.state,s.plan).status,'human-qa');
  assert.equal(s.state.tasks['QA-1'],undefined);
  recordTask(s.doc,s.state,s.plan,'QA-1','accepted','Synthetic human acceptance');
  assert.equal(nextTask(s.doc,s.state,s.plan).status,'task-chain-complete');
  assert.deepEqual(s.state.authorities,[]);
  assert.ok(!s.state.tasks['CODE-1'].pr);
  assert.equal(s.state.feature.reviewPasses,1);
  assert.ok(!Object.hasOwn(s.state.tasks['CODE-1'],'reviewPasses'));
});

test('publication requires authority and records one distinct MR per task after final review',()=>{
  const s=scenario('review-request');
  implemented(s,'CODE-1');implemented(s,'CODE-2');reviewed(s);
  recordTask(s.doc,s.state,s.plan,'CODE-1','ready-to-open','Prepared first task diff');
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','published','Opened request','https://gitlab.example.test/team/repo/-/merge_requests/1'),/authorized/);
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','delivered-local','Local bypass'),/Expected/);
  approve(s.doc,s.state,s.plan,'A','1','Synthetic publication authorization',['push','draft-pr']);
  recordTask(s.doc,s.state,s.plan,'CODE-1','published','Synthetic created MR','https://gitlab.example.test/team/repo/-/merge_requests/1');
  assert.deepEqual(nextTask(s.doc,s.state,s.plan).taskIds,['CODE-2']);
  recordTask(s.doc,s.state,s.plan,'CODE-2','ready-to-open','Prepared second task diff');
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-2','published','Reused monolithic request',s.state.tasks['CODE-1'].pr),/own PR\/MR URL/);
  recordTask(s.doc,s.state,s.plan,'CODE-2','published','Observed second MR','https://gitlab.example.test/team/repo/-/merge_requests/2');
  assert.notEqual(s.state.tasks['CODE-1'].pr,s.state.tasks['CODE-2'].pr);
  assert.equal(s.state.feature.reviewPasses,1);
});

test('local mode cannot publish or skip review, and an edited delivery mode invalidates approval',()=>{
  const s=scenario();
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','delivered-local','Skip pipeline'),/Expected/);
  implemented(s,'CODE-1');implemented(s,'CODE-2');reviewed(s);
  recordTask(s.doc,s.state,s.plan,'CODE-1','ready-to-open','Prepared first task diff');
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','published','Wrong mode','https://host.example.test/1'),/Expected/);
  s.state.deliveryMode='review-request';
  assert.throws(()=>validateExecution(s.doc,s.state,s.plan),/delivery/i);
});

test('five implementation tasks share one bounded feature review and correction cycle',()=>{
  const s=independentScenario(5);
  for(const task of s.doc.tasks)implemented(s,task.id);
  reviewed(s,false);
  assert.equal(s.state.feature.reviewPasses,1);
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','reviewed','Extra task review'),/integrated feature/);
  for(const phase of ['corrected','revalidated','reviewed'])recordFeature(s.doc,s.state,s.plan,phase,'Corrected and checked integrated result');
  assert.equal(s.state.feature.reviewPasses,2);
  assert.throws(()=>recordFeature(s.doc,s.state,s.plan,'corrected','Third loop'),/two feature review passes/);
  recordFeature(s.doc,s.state,s.plan,'ready-to-deliver','Remaining findings resolved');
  for(const task of s.doc.tasks)deliver(s,task.id);
  assert.equal(nextTask(s.doc,s.state,s.plan).status,'task-chain-complete');
  assert.throws(()=>recordFeature(s.doc,s.state,s.plan,'corrected','Reopen delivered work'),/frozen/);
});

test('a pre-delivery finding can reopen the first review without bypassing validation or the review cap',()=>{
  const s=independentScenario();
  for(const task of s.doc.tasks)implemented(s,task.id);
  reviewed(s);
  recordFeature(s.doc,s.state,s.plan,'corrected','Fixed issue found when checking final task diffs');
  assert.equal(s.state.feature.reviewPasses,1);
  assert.equal(nextTask(s.doc,s.state,s.plan).status,'feature');
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','ready-to-open','Skip corrected review'),/final feature review/);
  assert.throws(()=>recordFeature(s.doc,s.state,s.plan,'ready-to-deliver','Skip revalidation'),/Expected revalidated/);
  for(const phase of ['revalidated','reviewed','ready-to-deliver'])recordFeature(s.doc,s.state,s.plan,phase,'Verified corrected snapshot');
  assert.equal(s.state.feature.reviewPasses,2);
  assert.throws(()=>recordFeature(s.doc,s.state,s.plan,'corrected','Third review attempt'),/two feature review passes/);

  const delivering=independentScenario(1);
  implemented(delivering,'CODE-1');reviewed(delivering);
  recordTask(delivering.doc,delivering.state,delivering.plan,'CODE-1','ready-to-open','Task delivery started');
  assert.throws(()=>recordFeature(delivering.doc,delivering.state,delivering.plan,'corrected','Reopen active delivery'),/frozen/);
  assert.equal(delivering.state.feature.reviewPasses,1);
});

test('disjoint ready tasks remain dispatchable while another implementation runs',()=>{
  const s=independentScenario();
  assert.deepEqual(nextTask(s.doc,s.state,s.plan).parallelTaskIds,['CODE-1','CODE-2']);
  recordTask(s.doc,s.state,s.plan,'CODE-1','started','Claimed first write scope');
  const next=nextTask(s.doc,s.state,s.plan);
  assert.deepEqual(next.taskIds,['CODE-2']);
  assert.deepEqual(next.active,[{taskId:'CODE-1',phase:'started'}]);
  recordTask(s.doc,s.state,s.plan,'CODE-2','started','Claimed second write scope');
  assert.equal(nextTask(s.doc,s.state,s.plan).active.length,2);
});

test('overlapping, aliased and uncertain scopes cannot have simultaneous writers',()=>{
  for(const scopes of [[['src/'],['src/module.mjs']],[['./SRC/api/'],['src\\api\\handler.mjs']],[['src/**'],['tests/']],[['../outside'],['src/']]]) {
    const s=independentScenario(2,scopes);
    assert.deepEqual(nextTask(s.doc,s.state,s.plan).parallelTaskIds,['CODE-1']);
    recordTask(s.doc,s.state,s.plan,'CODE-1','started','Claimed scope');
    assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-2','started','Conflicting writer'),/overlaps active tasks: CODE-1/);
    assert.deepEqual(nextTask(s.doc,s.state,s.plan).blockedByScope,[{taskId:'CODE-2',conflictsWith:['CODE-1']}]);
    recordTask(s.doc,s.state,s.plan,'CODE-1','implemented','Saved implementation');
    recordTask(s.doc,s.state,s.plan,'CODE-1','validated','Checked implementation');
    assert.deepEqual(nextTask(s.doc,s.state,s.plan).taskIds,['CODE-2']);
  }
});

test('Gate B binds both sources and their revisions without a separate Gate C',()=>{
  const {doc,plan}=scenario();
  plan.revision='plan-2';doc.techPlan.revision=plan.revision;
  const state=newExecution(doc,plan);
  assert.throws(()=>approve(doc,state,plan,'B','1','Out of order'),/Gate A first/);
  approve(doc,state,plan,'A','scope-1','Synthetic scope approval');
  assert.throws(()=>recordTask(doc,state,plan,'CODE-1','started','No technical approval'),/Approval required: B/);
  assert.throws(()=>approve(doc,state,plan,'B','plan-2','Wrong revision'),/implementation document revision/);
  approve(doc,state,plan,'B','1','Synthetic combined approval');
  assert.equal(state.approvals.B.planRevision,'plan-2');
  assert.equal(state.approvals.B.digest,digest({specDigest:digest(doc),planDigest:digest(plan)}));
  assert.throws(()=>approve(doc,state,plan,'C','1','Obsolete gate'),/gate A\/B/);
  assert.throws(()=>validateExecution({...doc,summary:'Changed'},state,plan),/stale/);
  assert.throws(()=>validateExecution(doc,state,{...plan,summary:'Changed'}),/technical-plan digest/);
  const forged=structuredClone(state);forged.approvals.B.digest=digest(plan);
  assert.throws(()=>validateExecution(doc,forged,plan),/Stale approval: B/);
});

test('combined approval rejects missing requirement coverage and v1 migration cannot silently copy consent',()=>{
  const {doc,plan}=scenario();
  doc.checks=[];
  const state=newExecution(doc,plan);
  approve(doc,state,plan,'A','1','Synthetic scope approval');
  assert.throws(()=>approve(doc,state,plan,'B','1','Incomplete approval'),/coverage incomplete/);
  assert.equal(state.approvals.B,undefined);
  assert.throws(()=>validateExecution(doc,{...state,schemaVersion:1},plan),/Preserve this record.*explicit approval.*Do not copy old approvals/);
});

test('human acceptance cannot block CODE work before the final delivery stage',()=>{
  const {doc,plan}=scenario();
  doc.tasks[0].dependsOn=['QA-1'];doc.tasks[2].dependsOn=[];
  assert.throws(()=>newExecution(doc,plan),/CODE tasks cannot depend on human QA/);
});
