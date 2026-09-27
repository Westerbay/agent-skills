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

## Gate B — technical-plan approval

After scope approval, present the technical plan: architecture, relevant UML (including
the class/domain model when applicable), package-versus-custom decisions, and any
formulas or non-obvious rules explained in plain language. Clearly label what changes
and what remains untouched. Keep alternatives brief and only for consequential choices.
Ask the user to approve the technical plan or request revisions.

## Gate C — PRD approval

After technical-plan approval, generate and render the lean implementation PRD. Reference
Gate B instead of copying it. Show requirements, the separated `code` and `human-qa`
tasks, dependencies, acceptance/QA traceability, risks, and any remaining open question.
Implementation begins only after the user explicitly approves this exact revision.
