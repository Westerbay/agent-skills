---
name: build-feature
description: Orchestrate a substantial software feature from guided discovery through an approved technical architecture, a lean implementation PRD, and task-by-task delivery where each code task is implemented, simplified, reviewed, and delivered locally or as a draft PR/MR. Use when the user wants the complete feature lifecycle, not for a small isolated change, a PRD-only request, or implementation from an already-approved specification.
---

# Build Feature

Turn an initial feature idea into an approved, implemented, reviewed, and reproducible
change. This workflow deliberately spans multiple user turns. Keep the current phase,
confirmed decisions, open questions, and approvals explicit so work can resume safely.

## Portable runtime

Resolve `<skill-dir>` as the directory containing this file. All modules and scripts are
bundled under it; no other installed skill or MCP server is required. Read modules only
when their phase applies. Node.js 22+ runs the document tools; Python 3.10+ and Git run
the review helpers. Technical diagram compilation optionally needs the pinned npm
dependencies and Chrome/Chromium; see [document setup](modules/prd/GUIDE.md).

Use the user's language in conversation. Repository instructions and explicit user
choices take precedence over style preferences. Use the actual repository tools and
available agent capabilities, without hardcoded model names or vendor APIs.

At Gate A, choose `local` (default) or `review-request` delivery explicitly. Local mode
requires no hosting, issue tracker, messaging service, commits, or pushes. Preserve the
three approval gates and record only explicit user decisions. Never infer consent from
elapsed time, generated content, or a successful script exit.

When subagents are supported and permitted, use separate implementation, simplification,
and review roles. Otherwise perform distinct sequential passes in the current agent,
cover every review dimension, and disclose that the review was not independent. Never
pretend another agent ran. No automatic skill installation or service connection.

## Non-negotiable gates

Follow this state machine in order:

```text
Discovery -> Scope approval -> Technical-plan approval -> PRD approval
          -> Code task 1 pipeline + delivery -> Code task 2 pipeline + delivery -> ...
          -> Integrated verification -> Human acceptance
```

Do not write feature code before all three approvals. A later requirement change returns
the workflow to the earliest affected gate. Approval of scope does not approve an
architecture; approval of architecture does not approve implementation; local approval
does not authorize commits, pushes, PR/MR creation, deployment, or another external write.

At the start, inspect applicable repository instructions, documentation, ADRs, current
branch and `git status --short`. Preserve unrelated work. Resolve facts available in the
repository before asking the user.

## 1. Discover and approve the scope

Read and follow [references/interview-and-gates.md](references/interview-and-gates.md).
Use the bundled [document guide](modules/prd/GUIDE.md), asking only one to three
focused questions at a time. Keep four explicit lists: confirmed requirements,
assumptions, open questions, and out-of-scope items.

End this phase with a concise feature contract: problem, users, desired outcomes,
observable behaviors, exclusions, constraints, success signals, and delivery authority.
Ask the user to approve it. Record approval as **Gate A — Scope approved**.

## 2. Design and approve the architecture

Read and follow
[references/architecture-and-prd.md](references/architecture-and-prd.md). Run the
bundled document pre-draft gates, including [reuse scouting](references/reuse-scouting.md), before proposing new
components or contracts.

Produce a technical plan proportional to the feature:

- impact and reuse map;
- current and proposed boundaries and data flow;
- public API, data, auth, permission, background-job, cache, and integration effects;
- relevant UML diagrams, including a class/domain diagram when the domain model changes;
- formulas, algorithms, thresholds, units, rounding rules, and non-obvious conditions;
- concise decision records only for consequential choices;
- compatibility, migration, rollout, observability, and failure strategy where relevant;
- risks, unresolved decisions, and implementation constraints.

Patterns and alternatives are not goals. Prefer the simplest repository-shaped design.
Compare at most the recommended option and one credible alternative, and only when the
choice is consequential. For an obvious repository-standard choice, state it directly.
Explain non-intuitive calculations and conditions in plain language so the user can
review the reasoning, not merely the structure.

Author the technical plan as `<feature>.tech-plan.json` using the bundled document module
`kind: "tech-plan"` contract, with stable entry IDs and cross-cutting constraints marked global.
Render its HTML through the same CLI. Present it before drafting the implementation PRD
and ask for approval. Record approval
as **Gate B — Technical plan approved**. Never interpret silence as approval.

## 3. Produce and approve the implementation PRD

Use the bundled document module JSON contract with `profile: "implementation"`. Author
`<feature>.prd.json`; never create `<feature>.prd.md`. The JSON is authoritative for
implementation. Reference the approved Gate B ID/revision and entry IDs; retain only
constraints needed to execute. Requirements, checks, seeds and the `code`/`human-qa`
task graph are structured data. Do not repeat architecture narrative or draw the graph.

Render using the bundled document module CLI:

```bash
node <skill-dir>/modules/prd/scripts/prd.mjs validate <feature>.prd.json --plan <feature>.tech-plan.json
node <skill-dir>/modules/prd/scripts/prd.mjs render <feature>.prd.json --plan <feature>.tech-plan.json
```

Initialize `<feature>.run.json` and record the actual Gate A/B decisions and their user
message references, following [execution reference](modules/prd/references/execution.md). Present only the HTML path,
key risks and open decisions; ask for explicit Gate C approval. Record **Gate C — PRD
approved for implementation** against this exact source revision and fingerprint.
Keep source JSON and execution records local; do not publish planning artifacts unless
explicitly asked. No command infers consent from file contents or silence.

Do not start implementation while requirements, architecture decisions, acceptance
criteria, task dependencies, or required delivery authority remain materially unclear.

## 4. Deliver code tasks one at a time

Read and follow
[references/implementation-orchestration.md](references/implementation-orchestration.md).
Use the PRD task graph as the implementation contract. Do not dispatch all ready tasks at
once. Select one ready `code` task and complete its entire pipeline before starting the
next code task. Use one implementation subagent when available and permitted; otherwise implement it
in the current agent. The coordinator owns shared surfaces and final integration.

`human-qa` tasks are acceptance instructions for a person, not coding work: do not send
them to implementation agents, simplify them, run Argus on them, or create PRs for them.
A seed, fixture, migration, test, script, configuration change, or documentation change
made in the repository is a `code` task even when its main purpose is acceptance.

Each implementation pass must follow the bundled
[development guide](modules/development/GUIDE.md), including its standalone test workflow
only when a test protects meaningful behavior. Seed data is not a substitute for tests and tests are not
required for trivial behavior. Every implemented requirement must still have an
automated check, runtime exercise, or manual QA route recorded in the traceability
matrix.

For each code task, complete this checkpoint before starting any other code task:

```text
implementation -> targeted validation -> simplification -> validation
               -> review light -> fix verified findings -> validation
               -> local delivery or authorized draft PR/MR
```

The simplifier is the internal role defined in
[references/simplifier.md](references/simplifier.md). [Bundled review](modules/review/GUIDE.md) remains read-only;
use a separate focused implementation pass to fix accepted findings. Re-run a task review at most once
after fixes. If material warnings remain after two review passes, stop that dependency
chain and ask the user rather than looping indefinitely. Delivery follows [delivery modes](references/delivery.md). Local mode ends each task at
`delivered-local`; review-request mode ends at an authorized draft PR/MR. Missing
publication authority blocks that mode at `ready-to-open`; do not silently change modes.

## 5. Verify the delivered task chain and prepare acceptance

After all code-task deliveries:

1. Replay the PRD acceptance and impact maps across the integrated diff.
2. Run relevant type, lint, build, behavior, integration, migration, and security checks
   proportional to risk.
3. Exercise the documented seeds and QA scenarios when the environment permits, and
   record actual results separately from planned checks.
4. Inspect cross-task contracts and run a full Argus review only when the combined change
   introduces integration risk not already covered by the per-task reviews. Do not add a
   ceremonial duplicate review.
5. Record actual task/check evidence in the separate run JSON and re-render the HTML.
6. Re-explain the delivered behavior, architecture, pattern consequences, files and
   contracts changed, validation evidence, manual QA plan, residual risks, and intentional
   non-changes.
7. Hand the user the separate `human-qa` tasks with seed commands, steps, and expected
   results. Do not create a PR for the act of acceptance itself.

Never merge or deploy as part of this skill. A draft PR/MR is the terminal external action in review-request mode.

## Completion criteria

The workflow is complete only when every code task has passed its pipeline and has its recorded local delivery or authorized draft PR/MR, integrated validation has completed or has a reported blocker,
and human-QA instructions are reproducible. Stop when the approved behavior is clear,
maintainable, and sufficiently validated; do not add speculative abstractions, exhaustive
documents, duplicate tests, or extra review ceremonies in pursuit of “surquality”. Report
skipped checks and residual risk without converting planned tests into claimed results.
