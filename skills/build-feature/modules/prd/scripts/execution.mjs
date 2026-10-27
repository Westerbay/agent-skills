import {createHash} from 'node:crypto';
import {coverageGaps, validateDocument, validatePlan} from './document-model.mjs';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
export const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');

const AUTHORITIES = ['branch', 'commit', 'push', 'draft-pr'];
const IMPLEMENTATION_PHASES = ['started', 'implemented', 'validated'];
const FEATURE_PHASES = ['integrated', 'validated', 'simplified', 'revalidated', 'reviewed', 'corrected', 'ready-to-deliver'];
const terminalPhase = state => state.deliveryMode === 'local' ? 'delivered-local' : 'published';
const codePhases = state => [...IMPLEMENTATION_PHASES, 'ready-to-open', terminalPhase(state)];
const codeTasks = doc => doc.tasks.filter(task => task.kind === 'code');
const isValidated = record => ['validated', 'ready-to-open', 'delivered-local', 'published'].includes(record?.phase);
const isActive = record => ['started', 'implemented'].includes(record?.phase);
const isDelivered = (state, id) => [terminalPhase(state), 'accepted'].includes(state.tasks[id]?.phase);
const hasEvidence = record => record && typeof record.evidence === 'string' && record.evidence.trim() && typeof record.recordedAt === 'string';
const planApprovalDigest = state => digest({specDigest: state.specDigest, planDigest: state.planDigest});

function validateTaskGraph(doc) {
  const humanTasks = new Set(doc.tasks.filter(task => task.kind === 'human-qa').map(task => task.id));
  for (const task of codeTasks(doc)) {
    if (task.dependsOn.some(id => humanTasks.has(id))) throw new Error(`${task.id}: CODE tasks cannot depend on human QA; acceptance follows all code deliveries`);
  }
}

export function newExecution(doc, plan, deliveryMode = 'local') {
  if (!['local', 'review-request'].includes(deliveryMode)) throw new Error('Delivery mode must be local or review-request');
  validateDocument(doc);
  if (doc.kind !== 'prd') throw new Error('Execution requires a PRD');
  if (doc.techPlan && !plan) throw new Error('Pass --plan for an implementation PRD');
  if (plan) validatePlan(doc, plan);
  validateTaskGraph(doc);
  return {schemaVersion: 2, deliveryMode, documentId: doc.id, revision: doc.revision, specDigest: digest(doc),
    planDigest: plan ? digest(plan) : null, approvals: {}, authorities: [], tasks: {}, checks: {}, feature: null};
}

export function validateExecution(doc, state, plan) {
  if (state?.schemaVersion === 1) throw new Error('Execution schema v1 uses separate Gate C and per-task reviews. Preserve this record; initialize a new v2 record after explicit approval of the combined plan. Do not copy old approvals automatically.');
  if (!state || state.schemaVersion !== 2 || state.documentId !== doc.id || state.revision !== doc.revision || state.specDigest !== digest(doc)) {
    throw new Error('Execution record is stale or belongs to another PRD; initialize a new revision record');
  }
  if (doc.techPlan && !plan) throw new Error('Pass --plan to verify the execution record against both approved sources');
  if (!['local', 'review-request'].includes(state.deliveryMode)) throw new Error('Invalid delivery mode');
  if (state.approvals?.A && state.approvals.A.deliveryMode !== state.deliveryMode) throw new Error('Delivery mode differs from Gate A approval; start a new run with explicit approval');
  if (plan && state.planDigest !== digest(plan)) throw new Error('Execution record references a different technical-plan digest');
  if (plan) validatePlan(doc, plan);
  validateTaskGraph(doc);
  for (const key of ['approvals', 'tasks', 'checks']) {
    if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) throw new Error(`Invalid execution ${key}`);
  }
  if (!Array.isArray(state.authorities) || state.authorities.some(item => !AUTHORITIES.includes(item))) throw new Error('Invalid delivery authorities');
  for (const [gate, record] of Object.entries(state.approvals)) {
    if (!['A', 'B'].includes(gate) || !hasEvidence(record) || typeof record.revision !== 'string') throw new Error(`Invalid approval record: ${gate}`);
    const expected = gate === 'B' ? planApprovalDigest(state) : state.specDigest;
    if (record.digest !== expected || gate === 'B' && (record.revision !== doc.revision || record.planRevision !== plan?.revision)) throw new Error(`Stale approval: ${gate}`);
  }
  const publicationUrls = new Set();
  for (const [id, record] of Object.entries(state.tasks)) {
    const task = doc.tasks.find(item => item.id === id);
    const phases = task?.kind === 'code' ? codePhases(state) : ['accepted'];
    if (!task || !hasEvidence(record) || !phases.includes(record.phase)) throw new Error(`Invalid task evidence: ${id}`);
    if (['ready-to-open', 'delivered-local', 'published'].includes(record.phase) && state.feature?.phase !== 'ready-to-deliver') throw new Error(`${id}: delivery requires the final feature review`);
    if (record.phase === 'published') {
      if (!/^https:\/\//.test(record.pr || '')) throw new Error(`${id}: published task requires a PR/MR URL`);
      if (publicationUrls.has(record.pr)) throw new Error(`${id}: each code task needs its own PR/MR URL`);
      publicationUrls.add(record.pr);
    }
  }
  if (state.feature !== null) {
    const feature = state.feature;
    if (!hasEvidence(feature) || !FEATURE_PHASES.includes(feature.phase) || !Number.isInteger(feature.reviewPasses) || feature.reviewPasses < 0 || feature.reviewPasses > 2) throw new Error('Invalid feature evidence');
    if (!codeTasks(doc).every(task => isValidated(state.tasks[task.id]))) throw new Error('Feature review requires all code tasks to be validated');
    if (['reviewed', 'corrected', 'ready-to-deliver'].includes(feature.phase) && feature.reviewPasses < 1) throw new Error('Feature phase requires review evidence');
  }
  for (const [id, record] of Object.entries(state.checks)) {
    if (!doc.checks.some(item => item.id === id) || !hasEvidence(record) || !['passed', 'failed', 'blocked'].includes(record.result)) throw new Error(`Invalid check evidence: ${id}`);
  }
  return state;
}

export function approve(doc, state, plan, gate, revision, evidence, authorities) {
  validateExecution(doc, state, plan);
  if (!['A', 'B'].includes(gate) || !evidence?.trim() || !revision?.trim()) throw new Error('Approval needs gate A/B, revision and explicit user evidence; Gate B approves the combined plan');
  if (gate === 'B' && !plan) throw new Error('Gate B requires --plan');
  if (gate === 'B' && !state.approvals.A) throw new Error('Record Gate A first');
  if (gate === 'B' && revision !== doc.revision) throw new Error('Gate B revision must match the implementation document revision');
  if (gate === 'B' && coverageGaps(doc).length) throw new Error(`Combined plan coverage incomplete: ${coverageGaps(doc).join('; ')}`);
  if (authorities) {
    if (gate !== 'A') throw new Error('Delivery authority is recorded with Gate A');
    if (authorities.some(item => !AUTHORITIES.includes(item))) throw new Error('Unknown delivery authority');
  }
  state.approvals[gate] = {revision, ...(gate === 'A' ? {deliveryMode: state.deliveryMode} : {planRevision: plan.revision}),
    digest: gate === 'B' ? planApprovalDigest(state) : state.specDigest, evidence, recordedAt: new Date().toISOString()};
  if (authorities) state.authorities = [...new Set(authorities)];
  return state;
}

function requireApprovals(state) {
  const missing = ['A', 'B'].filter(gate => !state.approvals[gate]);
  if (missing.length) throw new Error(`Approval required: ${missing.join(', ')}`);
}

// Literal paths are conservative ownership boundaries, not filesystem access grants.
// Unknown expressions and globs reserve the whole repository until validation.
function literalScope(value) {
  const path = value.trim().replaceAll('\\', '/').replace(/^\.\//, '').replace(/\/+$/, '').toLowerCase();
  if (!path || path.startsWith('/') || /[:*?\[\]{}<>|"!]/.test(path) || path.split('/').some(part => !part || part === '.' || part === '..')) return null;
  return path;
}

function scopesOverlap(left, right) {
  if (!left.scope.length || !right.scope.length) return true;
  return left.scope.some(leftPath => right.scope.some(rightPath => {
    const a = literalScope(leftPath), b = literalScope(rightPath);
    return a === null || b === null || a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
  }));
}

function featureNextPhases(feature) {
  if (!feature) return ['integrated'];
  if (feature.phase === 'reviewed') return feature.reviewPasses < 2 ? ['corrected', 'ready-to-deliver'] : ['ready-to-deliver'];
  if (feature.phase === 'ready-to-deliver') return feature.reviewPasses < 2 ? ['corrected'] : [];
  return {integrated: ['validated'], validated: ['simplified'], simplified: ['revalidated'], revalidated: ['reviewed'], corrected: ['revalidated']}[feature.phase];
}

export function nextTask(doc, state, plan) {
  validateExecution(doc, state, plan);
  const missing = ['A', 'B'].filter(gate => !state.approvals[gate]);
  if (missing.length) return {status: 'blocked', reason: `Approval required: ${missing.join(', ')}`};
  const codes = codeTasks(doc);
  const activeTasks = codes.filter(task => isActive(state.tasks[task.id]));
  const active = activeTasks.map(task => ({taskId: task.id, phase: state.tasks[task.id].phase}));
  const candidates = codes.filter(task => !state.tasks[task.id] && task.dependsOn.every(id => isValidated(state.tasks[id])));
  const blockedByScope = candidates.map(task => ({taskId: task.id, conflictsWith: activeTasks.filter(other => scopesOverlap(task, other)).map(other => other.id)})).filter(item => item.conflictsWith.length);
  const ready = candidates.filter(task => !blockedByScope.some(item => item.taskId === task.id));
  if (ready.length) {
    const parallel = [];
    for (const task of ready) if (!parallel.some(other => scopesOverlap(task, other))) parallel.push(task);
    return {status: 'ready', taskIds: ready.map(task => task.id), parallelTaskIds: parallel.map(task => task.id), active, blockedByScope};
  }
  if (active.length) return {status: 'in-progress', active, blockedByScope};
  if (!codes.every(task => isValidated(state.tasks[task.id]))) return {status: 'blocked', reason: 'Unfinished implementation dependencies'};
  if (state.feature?.phase !== 'ready-to-deliver') return {status: 'feature', phase: state.feature?.phase || 'pending', nextPhases: featureNextPhases(state.feature)};
  const delivery = codes.filter(task => !isDelivered(state, task.id) && task.dependsOn.every(id => isDelivered(state, id)));
  if (delivery.length) return {status: 'delivery', taskIds: delivery.map(task => task.id), active: delivery.filter(task => state.tasks[task.id].phase === 'ready-to-open').map(task => ({taskId: task.id, phase: 'ready-to-open'}))};
  if (!codes.every(task => isDelivered(state, task.id))) return {status: 'blocked', reason: 'Unfinished delivery dependencies'};
  const qa = doc.tasks.filter(task => task.kind === 'human-qa' && !isDelivered(state, task.id) && task.dependsOn.every(id => isDelivered(state, id))).map(task => task.id);
  if (qa.length) return {status: 'human-qa', taskIds: qa};
  if (doc.tasks.every(task => isDelivered(state, task.id))) return {status: 'task-chain-complete'};
  return {status: 'blocked', reason: 'Unfinished acceptance tasks'};
}

function appendEvidence(previous, fields) {
  const record = {...fields, recordedAt: new Date().toISOString()};
  return {...record, history: [...(previous?.history || []), record]};
}

export function recordTask(doc, state, plan, id, phase, evidence, pr) {
  validateExecution(doc, state, plan);
  requireApprovals(state);
  if (!evidence?.trim()) throw new Error('Record actual evidence, not a planned check');
  const task = doc.tasks.find(item => item.id === id);
  if (!task) throw new Error(`Unknown task: ${id}`);
  const previous = state.tasks[id];
  if (task.kind === 'human-qa') {
    if (phase !== 'accepted') throw new Error('Human QA can only be accepted with human evidence');
    if (previous || !codeTasks(doc).every(item => isDelivered(state, item.id)) || !task.dependsOn.every(dependency => isDelivered(state, dependency))) throw new Error('Human QA requires all code deliveries and its preceding acceptance tasks');
  } else {
    const phases = codePhases(state);
    const expected = phases[(previous ? phases.indexOf(previous.phase) : -1) + 1];
    if (phase !== expected) throw new Error(`Expected ${expected || 'no further task phase'}; reviews and corrections belong to the integrated feature`);
    if (phase === 'started') {
      if (!task.dependsOn.every(dependency => isValidated(state.tasks[dependency]))) throw new Error(`${id}: implementation dependencies are not validated`);
      const conflicts = codeTasks(doc).filter(other => isActive(state.tasks[other.id]) && scopesOverlap(task, other));
      if (conflicts.length) throw new Error(`${id}: write scope overlaps active tasks: ${conflicts.map(other => other.id).join(', ')}`);
    }
    if (['ready-to-open', terminalPhase(state)].includes(phase)) {
      if (state.feature?.phase !== 'ready-to-deliver') throw new Error('Task delivery requires the final feature review and ready-to-deliver evidence');
      if (!task.dependsOn.every(dependency => isDelivered(state, dependency))) throw new Error(`${id}: deliver its dependency tasks first`);
    }
    if (phase === 'published' && (!state.authorities.includes('draft-pr') || !state.authorities.includes('push') || !/^https:\/\//.test(pr || ''))) throw new Error('Published status requires authorized push/draft-pr and an actual PR/MR URL');
    if (phase === 'published' && Object.values(state.tasks).some(record => record.pr === pr)) throw new Error('Each code task needs its own PR/MR URL');
  }
  if (pr && phase !== 'published') throw new Error('A PR/MR URL belongs only to published task evidence');
  state.tasks[id] = appendEvidence(previous, {phase, evidence, ...(pr ? {pr} : {})});
  return state;
}

export function recordFeature(doc, state, plan, phase, evidence) {
  validateExecution(doc, state, plan);
  requireApprovals(state);
  if (!evidence?.trim()) throw new Error('Record actual integrated evidence, not a planned check');
  if (!codeTasks(doc).every(task => isValidated(state.tasks[task.id]))) throw new Error('Integrate only after all code tasks are validated');
  if (codeTasks(doc).some(task => ['ready-to-open', terminalPhase(state)].includes(state.tasks[task.id]?.phase))) throw new Error('Feature evidence is frozen once task delivery starts; preserve delivered snapshots and assess a new scoped revision');
  const previous = state.feature;
  if (!featureNextPhases(previous).includes(phase)) throw new Error(`Expected ${featureNextPhases(previous).join(' or ') || 'no further feature phase'}; corrections are bounded to two feature review passes`);
  const reviewPasses = (previous?.reviewPasses || 0) + (phase === 'reviewed' ? 1 : 0);
  if (reviewPasses > 2) throw new Error('Corrections are bounded to two feature review passes');
  state.feature = appendEvidence(previous, {phase, evidence, reviewPasses});
  return state;
}

export function recordCheck(doc, state, plan, id, result, evidence) {
  validateExecution(doc, state, plan);
  if (!doc.checks.some(item => item.id === id) || !['passed', 'failed', 'blocked'].includes(result) || !evidence?.trim()) throw new Error('Check needs a known ID, passed/failed/blocked and actual evidence');
  state.checks[id] = {result, evidence, recordedAt: new Date().toISOString()};
  return state;
}
