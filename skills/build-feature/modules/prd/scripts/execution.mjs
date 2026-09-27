import {createHash} from 'node:crypto';
import {coverageGaps, validateDocument, validatePlan} from './document-model.mjs';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
export const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');

export function newExecution(doc, plan, deliveryMode = 'local') {
  if (!['local', 'review-request'].includes(deliveryMode)) throw new Error('Delivery mode must be local or review-request');
  validateDocument(doc);
  if (doc.kind !== 'prd') throw new Error('Execution requires a PRD');
  if (doc.techPlan && !plan) throw new Error('Pass --plan for an implementation PRD');
  if (plan) validatePlan(doc, plan);
  return {schemaVersion: 1, deliveryMode, documentId: doc.id, revision: doc.revision, specDigest: digest(doc),
    planDigest: plan ? digest(plan) : null, approvals: {}, authorities: [], tasks: {}, checks: {}};
}

export function validateExecution(doc, state, plan) {
  if (!state || state.schemaVersion !== 1 || state.documentId !== doc.id || state.revision !== doc.revision || state.specDigest !== digest(doc)) {
    throw new Error('Execution record is stale or belongs to another PRD; initialize a new revision record');
  }
  if (!['local', 'review-request'].includes(state.deliveryMode)) throw new Error('Invalid delivery mode');
  if (state.approvals?.A && state.approvals.A.deliveryMode !== state.deliveryMode) throw new Error('Delivery mode differs from Gate A approval; start a new run with explicit approval');
  if (plan && state.planDigest !== digest(plan)) throw new Error('Execution record references a different technical-plan digest');
  if (plan) validatePlan(doc, plan);
  for (const key of ['approvals', 'tasks', 'checks']) {
    if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) throw new Error(`Invalid execution ${key}`);
  }
  if (!Array.isArray(state.authorities) || state.authorities.some(item => !['branch', 'commit', 'push', 'draft-pr'].includes(item))) throw new Error('Invalid delivery authorities');
  for (const [gate, record] of Object.entries(state.approvals)) {
    if (!['A', 'B', 'C'].includes(gate) || !record || typeof record.evidence !== 'string' || !record.evidence.trim() || typeof record.revision !== 'string' || typeof record.recordedAt !== 'string') throw new Error(`Invalid approval record: ${gate}`);
    const expected = gate === 'B' ? state.planDigest : state.specDigest;
    if (record.digest !== expected) throw new Error(`Stale approval: ${gate}`);
  }
  for (const [id, record] of Object.entries(state.tasks)) {
    const task = doc.tasks.find(item => item.id === id);
    const phases = task?.kind === 'code' ? codePhases(state) : ['accepted'];
    if (!task || !record || !phases.includes(record.phase) || !record.evidence?.trim() || !Number.isInteger(record.reviewPasses) || record.reviewPasses < 0 || record.reviewPasses > 2) throw new Error(`Invalid task evidence: ${id}`);
    if (record.phase === 'published' && !/^https:\/\//.test(record.pr || '')) throw new Error(`${id}: published task requires a PR/MR URL`);
  }
  for (const [id, record] of Object.entries(state.checks)) {
    if (!doc.checks.some(item => item.id === id) || !record || !['passed', 'failed', 'blocked'].includes(record.result) || !record.evidence?.trim()) throw new Error(`Invalid check evidence: ${id}`);
  }
  return state;
}

export function approve(doc, state, plan, gate, revision, evidence, authorities) {
  validateExecution(doc, state, plan);
  if (!['A', 'B', 'C'].includes(gate) || !evidence?.trim() || !revision?.trim()) throw new Error('Approval needs gate A/B/C, revision and explicit user evidence');
  if (gate === 'B' && !plan) throw new Error('Gate B requires --plan');
  if (gate === 'B' && !state.approvals.A || gate === 'C' && !state.approvals.B) throw new Error('Record the preceding gate first');
  if (gate === 'C' && revision !== doc.revision || gate === 'B' && revision !== plan.revision) throw new Error('Approval revision does not match the document');
  if (gate === 'C' && coverageGaps(doc).length) throw new Error(`PRD coverage incomplete: ${coverageGaps(doc).join('; ')}`);
  state.approvals[gate] = {revision, ...(gate === 'A' ? {deliveryMode: state.deliveryMode} : {}), digest: gate === 'B' ? digest(plan) : digest(doc), evidence, recordedAt: new Date().toISOString()};
  if (authorities) {
    if (gate !== 'A') throw new Error('Delivery authority is recorded with Gate A');
    if (authorities.some(item => !['branch', 'commit', 'push', 'draft-pr'].includes(item))) throw new Error('Unknown delivery authority');
    state.authorities = [...new Set(authorities)];
  }
  return state;
}

const CODE_PHASES = ['implemented', 'validated', 'simplified', 'revalidated', 'reviewed', 'ready-to-open'];
const terminalPhase = state => state.deliveryMode === 'local' ? 'delivered-local' : 'published';
const codePhases = state => [...CODE_PHASES, terminalPhase(state)];

export function nextTask(doc, state, plan) {
  validateExecution(doc, state, plan);
  const missing = ['A', 'B', 'C'].filter(gate => !state.approvals[gate]);
  if (missing.length) return {status: 'blocked', reason: `Approval required: ${missing.join(', ')}`};
  if (doc.techPlan && !plan) throw new Error('Pass --plan before dispatch');
  const active = doc.tasks.find(task => task.kind === 'code' && state.tasks[task.id] && state.tasks[task.id].phase !== terminalPhase(state));
  if (active) return {status: 'in-progress', taskId: active.id, phase: state.tasks[active.id].phase};
  const complete = id => [terminalPhase(state), 'accepted'].includes(state.tasks[id]?.phase);
  const ready = doc.tasks.find(task => task.kind === 'code' && !state.tasks[task.id] && task.dependsOn.every(complete));
  if (ready) return {status: 'ready', taskId: ready.id};
  const qa = doc.tasks.filter(task => task.kind === 'human-qa' && !complete(task.id) && task.dependsOn.every(complete)).map(task => task.id);
  if (qa.length) return {status: 'human-qa', taskIds: qa};
  if (doc.tasks.every(task => complete(task.id))) return {status: 'task-chain-complete', integratedVerification: 'Still required; task completion is not integrated acceptance.'};
  return {status: 'blocked', reason: 'Unfinished dependencies or acceptance tasks'};
}

export function recordTask(doc, state, plan, id, phase, evidence, pr) {
  validateExecution(doc, state, plan);
  if (!evidence?.trim()) throw new Error('Record actual evidence, not a planned check');
  const task = doc.tasks.find(item => item.id === id);
  if (!task) throw new Error(`Unknown task: ${id}`);
  const next = nextTask(doc, state, plan);
  const permitted = next.taskId === id || next.status === 'human-qa' && next.taskIds.includes(id);
  if (!permitted) throw new Error(`Task ${id} cannot advance: ${JSON.stringify(next)}`);
  const previous = state.tasks[id];
  let reviewPasses = previous?.reviewPasses || 0;
  if (task.kind === 'human-qa') {
    if (phase !== 'accepted') throw new Error('Human QA can only be accepted with human evidence');
  } else {
    const phases = codePhases(state);
    const expected = phases[(previous ? phases.indexOf(previous.phase) : -1) + 1];
    const fixing = previous?.phase === 'reviewed' && phase === 'implemented' && reviewPasses < 2;
    if (phase !== expected && !fixing) throw new Error(`Expected ${expected}; review fixes are bounded to two review passes`);
    if (phase === 'reviewed') reviewPasses += 1;
    if (phase === 'published' && (!state.authorities.includes('draft-pr') || !state.authorities.includes('push') || !/^https:\/\//.test(pr || ''))) throw new Error('Published status requires authorized push/draft-pr and an actual PR/MR URL');
  }
  const record = {phase, evidence, reviewPasses, recordedAt: new Date().toISOString(), ...(pr ? {pr} : {})};
  state.tasks[id] = {...record, history: [...(previous?.history || []), record]};
  return state;
}

export function recordCheck(doc, state, plan, id, result, evidence) {
  validateExecution(doc, state, plan);
  if (!doc.checks.some(item => item.id === id) || !['passed', 'failed', 'blocked'].includes(result) || !evidence?.trim()) throw new Error('Check needs a known ID, passed/failed/blocked and actual evidence');
  state.checks[id] = {result, evidence, recordedAt: new Date().toISOString()};
  return state;
}
