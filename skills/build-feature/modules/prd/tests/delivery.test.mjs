import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newExecution, approve, recordTask, nextTask, validateExecution} from '../scripts/execution.mjs';

function scenario(mode = 'local', authorities) {
  const plan = {schemaVersion:1,kind:'tech-plan',id:'plan',revision:'1',locale:'en',title:'Plan',summary:'Plan',constraints:[],entries:[{id:'DEC-1',kind:'decision',title:'Local',body:'Local delivery',global:true,refs:[]} ]};
  const doc = {schemaVersion:1,kind:'prd',profile:'implementation',id:'feature',revision:'1',locale:'en',title:'Feature',summary:'Feature',constraints:[],techPlan:{id:'plan',revision:'1'},
    requirements:[{id:'FR-1',kind:'functional',title:'Behavior',description:'Behavior',priority:'must',acceptance:['Works']}],
    tasks:[...['CODE-1','CODE-2'].map((id,i)=>({id,kind:'code',title:id,goal:'Behavior',scope:['src/'],dependsOn:i?['CODE-1']:[],requirementIds:['FR-1'],planRefs:[],seedIds:[],validation:['Check behavior']})),
      {id:'QA-1',kind:'human-qa',title:'Accept',dependsOn:['CODE-2'],requirementIds:['FR-1'],planRefs:[],seedIds:[],steps:['Exercise'],expected:'Works',cleanup:'None'}],
    checks:[{id:'CHECK-1',requirementIds:['FR-1'],scenario:'Exercise',route:'runtime',expected:'Works',seedIds:[]}],seeds:[],risks:[]};
  const state = newExecution(doc,plan,mode);
  for (const gate of ['A','B','C']) approve(doc,state,plan,gate,'1','Synthetic explicit approval',gate==='A'?authorities:undefined);
  return {doc,plan,state};
}
function reviewed({doc,plan,state}, id) {
  for(const phase of ['implemented','validated','simplified','revalidated','reviewed','ready-to-open']) recordTask(doc,state,plan,id,phase,'Observed fixture evidence');
}

test('local delivery advances dependencies without commits, publication authority, or fake URLs',()=>{
  const s=scenario(); reviewed(s,'CODE-1');
  assert.equal(nextTask(s.doc,s.state,s.plan).taskId,'CODE-1');
  recordTask(s.doc,s.state,s.plan,'CODE-1','delivered-local','Saved task diff and successful checks');
  assert.equal(nextTask(s.doc,s.state,s.plan).taskId,'CODE-2');
  reviewed(s,'CODE-2');
  recordTask(s.doc,s.state,s.plan,'CODE-2','delivered-local','Saved second checkpoint');
  assert.equal(nextTask(s.doc,s.state,s.plan).status,'human-qa');
  assert.equal(s.state.tasks['QA-1'],undefined);
  recordTask(s.doc,s.state,s.plan,'QA-1','accepted','Synthetic human acceptance');
  assert.equal(nextTask(s.doc,s.state,s.plan).status,'task-chain-complete');
  assert.deepEqual(s.state.authorities,[]);
  assert.ok(!s.state.tasks['CODE-1'].pr);
});

test('publication mode blocks without authority and accepts a real-shaped GitLab MR URL when authorized',()=>{
  const s=scenario('review-request'); reviewed(s,'CODE-1');
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','published','Opened request','https://gitlab.example.test/team/repo/-/merge_requests/1'),/authorized/);
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','delivered-local','Local bypass'),/Expected/);
  approve(s.doc,s.state,s.plan,'A','1','Synthetic publication authorization',['push','draft-pr']);
  recordTask(s.doc,s.state,s.plan,'CODE-1','published','Synthetic created MR','https://gitlab.example.test/team/repo/-/merge_requests/1');
  assert.equal(nextTask(s.doc,s.state,s.plan).taskId,'CODE-2');
});

test('local mode cannot publish or skip review, and an edited delivery mode invalidates approval',()=>{
  const s=scenario();
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','delivered-local','Skip pipeline'),/Expected/);
  reviewed(s,'CODE-1');
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','published','Wrong mode','https://host.example.test/1'),/Expected/);
  s.state.deliveryMode='review-request';
  assert.throws(()=>validateExecution(s.doc,s.state,s.plan),/delivery/i);
});

test('the review correction loop remains bounded to two passes in local mode',()=>{
  const s=scenario();
  for(let pass=0;pass<2;pass++) {
    for(const phase of ['implemented','validated','simplified','revalidated','reviewed']) recordTask(s.doc,s.state,s.plan,'CODE-1',phase,'Actual fixture review');
  }
  assert.throws(()=>recordTask(s.doc,s.state,s.plan,'CODE-1','implemented','Third fix loop'),/two review passes/);
});
