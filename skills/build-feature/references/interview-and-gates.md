# Guided Discovery and Approval Gates

## Interview discipline

Ask one to three concise questions per turn. Start with the decisions that could change
scope, architecture, data contracts, security, or delivery. Do not ask the user for facts
that repository inspection, supplied designs, business documents, or existing tickets
can answer.

After each answer:

1. update confirmed requirements, assumptions, open questions, and out-of-scope items;
2. identify contradictions with earlier answers or repository evidence;
3. paraphrase any material interpretation before relying on it;
4. ask the next smallest set of questions.

Recommend an answer with rationale when the user wants guidance or when a tradeoff is
non-obvious. Do not overwhelm the user with a fixed questionnaire.

## Coverage map

Cover only relevant branches, but do not finish discovery with a material branch unknown:

- problem, target users, trigger, outcome, and success signal;
- happy path, alternative paths, failure states, retries, cancellation, and recovery;
- roles, ownership, authorization, privacy, audit, and abuse cases;
- source of truth, data lifecycle, legacy data, migration, retention, and deletion;
- external providers, offline behavior, rate limits, idempotency, and timeouts;
- API, UI, accessibility, localization, notification, export, and background surfaces;
- performance, scale, concurrency, caching, observability, rollout, and rollback;
- explicit non-goals, compatibility promises, deadlines, and future extensions;
- acceptance evidence, seed data needs, test environment, and manual QA constraints;
- local or review-request delivery mode; whether branch/worktree creation, checkpoint
  commits, push, and draft PR/MR creation are authorized. Record each authority separately.

## Gate A — scope approval

Present a short feature contract containing:

- problem and users;
- outcomes and observable behaviors;
- acceptance boundaries and success measures;
- constraints and dependencies;
- out of scope;
- assumptions and unresolved questions;
- authorized and unauthorized delivery actions.

Ask for explicit approval. If the user changes the contract, revise it and ask again.

## Gate B — implementation-plan approval

Present one combined HTML focused on implementation logic, useful UML, non-obvious rules,
relevant reuse and the CODE task graph. Include owned paths, true dependencies, parallel
groups and small PR boundaries alongside concise acceptance/check routes. Keep decisions
brief; omit irrelevant sections and repeated scope/architecture narrative.

Ask once for approval of the exact technical and implementation source revisions together.
This replaces the former separate B/C approvals. Implementation starts only after this
combined Gate B and Gate A. A plan revision or changed task contract needs the affected
approval renewed; a routine scoped implementation/refactor does not create a new gate.
