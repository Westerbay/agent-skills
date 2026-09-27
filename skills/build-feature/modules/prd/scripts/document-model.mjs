import validateSchema from '../assets/validate.cjs';

export function validateDocument(doc) {
  if (!validateSchema(doc)) {
    const errors = validateSchema.errors.map(e => `${e.instancePath || '/'} ${e.message} ${JSON.stringify(e.params)}`);
    throw new Error(errors.join('\n'));
  }
  const collections = doc.kind === 'prd' ? ['requirements', 'tasks', 'checks', 'seeds', 'risks'] : ['entries'];
  const allIds = new Set();
  for (const collection of collections) {
    for (const item of doc[collection]) {
      if (Object.hasOwn(Object.prototype, item.id) || item.id === 'prototype') throw new Error(`Reserved ID: ${item.id}`);
      if (allIds.has(item.id)) throw new Error(`Duplicate ID: ${item.id}`);
      allIds.add(item.id);
    }
  }
  const requireRefs = (item, field, valid) => {
    for (const ref of item[field] || []) {
      if (!valid.has(ref)) throw new Error(`${item.id}.${field}: unknown reference ${ref}`);
    }
  };
  if (doc.kind === 'tech-plan') {
    for (const item of doc.entries) requireRefs(item, 'refs', allIds);
    return doc;
  }
  const requirements = new Set(doc.requirements.map(item => item.id));
  const tasks = new Map(doc.tasks.map(item => [item.id, item]));
  const seeds = new Set(doc.seeds.map(item => item.id));
  for (const item of [...doc.tasks, ...doc.checks, ...doc.seeds]) requireRefs(item, 'requirementIds', requirements);
  for (const item of [...doc.tasks, ...doc.checks]) requireRefs(item, 'seedIds', seeds);
  for (const item of doc.tasks) requireRefs(item, 'dependsOn', tasks);
  if (!doc.techPlan && doc.tasks.some(task => task.planRefs.length)) throw new Error('planRefs require a referenced technical plan');
  const done = new Set(), visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`Dependency cycle at ${id}`);
    if (done.has(id)) return;
    visiting.add(id);
    for (const dependency of tasks.get(id).dependsOn) visit(dependency);
    visiting.delete(id);
    done.add(id);
  }
  for (const id of tasks.keys()) visit(id);
  return doc;
}

export function coverageGaps(doc) {
  if (doc.kind !== 'prd') return [];
  return doc.requirements.flatMap(req => {
    const gaps = [];
    if (!doc.checks.some(check => check.requirementIds.includes(req.id))) gaps.push(`${req.id}: no evidence route`);
    if (!doc.tasks.some(task => task.requirementIds.includes(req.id))) gaps.push(`${req.id}: no delivery task`);
    return gaps;
  });
}

export function validatePlan(doc, plan) {
  validateDocument(plan);
  if (plan.kind !== 'tech-plan' || !doc.techPlan || doc.techPlan.id !== plan.id || doc.techPlan.revision !== plan.revision) {
    throw new Error('Technical plan does not match the referenced ID and revision');
  }
  const ids = new Set(plan.entries.map(item => item.id));
  for (const task of doc.tasks) {
    for (const ref of task.planRefs) if (!ids.has(ref)) throw new Error(`${task.id}: unknown plan reference ${ref}`);
  }
}

export function taskContext(doc, taskId, plan) {
  validateDocument(doc);
  if (doc.kind !== 'prd') throw new Error('Task context requires a PRD');
  if (doc.techPlan && !plan) throw new Error('Pass --plan to include the referenced technical constraints');
  if (plan) validatePlan(doc, plan);
  const task = doc.tasks.find(item => item.id === taskId);
  if (!task) throw new Error(`Unknown task: ${taskId}`);
  const dependencies = new Set();
  function collect(id) {
    for (const dep of doc.tasks.find(item => item.id === id).dependsOn) {
      if (!dependencies.has(dep)) { dependencies.add(dep); collect(dep); }
    }
  }
  collect(taskId);
  const dependencyTasks = doc.tasks.filter(item => dependencies.has(item.id));
  const requirementIds = new Set(task.requirementIds);
  const checks = doc.checks.filter(item => item.requirementIds.some(id => requirementIds.has(id)));
  const seedIds = new Set([...task.seedIds, ...checks.flatMap(item => item.seedIds)]);
  const planIds = new Set([...task.planRefs, ...dependencyTasks.flatMap(item => item.planRefs)]);
  const entries = plan?.entries || [];
  for (const entry of entries) if (entry.global) planIds.add(entry.id);
  function collectPlan(id) {
    for (const ref of entries.find(item => item.id === id).refs) {
      if (!planIds.has(ref)) { planIds.add(ref); collectPlan(ref); }
    }
  }
  for (const id of [...planIds]) collectPlan(id);
  return {
    document: {id: doc.id, revision: doc.revision, title: doc.title},
    constraints: doc.constraints, preDraft: doc.preDraft,
    task, requirements: doc.requirements.filter(item => requirementIds.has(item.id)),
    dependencies: dependencyTasks.map(({id, title, scope, planRefs}) => ({id, title, scope, planRefs})),
    technicalPlan: plan && {id: plan.id, revision: plan.revision, constraints: plan.constraints, preDraft: plan.preDraft,
      entries: entries.filter(item => planIds.has(item.id))},
    seeds: doc.seeds.filter(item => seedIds.has(item.id)), checks,
    risks: doc.risks.filter(item => item.status === 'open'),
    sourceAccess: 'This is a derived excerpt. Read the full PRD and technical plan if a cross-task contract remains unclear.',
  };
}
