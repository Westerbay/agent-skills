---
name: build-feature
description: Orchestrate a substantial feature through scope approval, one concise implementation-plan approval, parallel code tasks, a final integrated review with refactoring, and small task-specific deliveries. Use for the complete feature lifecycle, not a small isolated change, a PRD-only request, or implementation from an already-approved specification.
---

# Build Feature

Turn a feature idea into an approved, implemented, reviewed change. Keep the current
phase, decisions and actual approvals explicit across turns.

Use the user's current conversation language for questions, progress, scope proposals,
PRDs, implementation plans, UML labels/explanations, reviews and handoffs unless the user
explicitly requests another output language. English skill instructions, examples or
repository code do not select the output language. Preserve code identifiers, schema
keys/enums, commands, paths and quoted evidence; keep the required English Git names.
Honor an explicit language requirement for a particular repository artifact without
applying it to local planning documents or chat. Pass the chosen language and these
exceptions to every writer, reviewer and other delegated agent.

## Runtime and approvals

Resolve `<skill-dir>` as this file's directory. Bundled modules work without companion
skills or a hosting account. Node 22+ runs the document tools; Python 3.10+ and Git run
review helpers. Read [document setup](modules/prd/GUIDE.md) before rendering Mermaid:
compile diagrams normally and disclose any blocked source-only fallback. JSON is the
source; generated HTML supports offline reading, math and copying diagrams as images.

```text
Discovery -> Gate A: scope -> Gate B: implementation plan (logic + UML + task graph)
          -> Ready CODE tasks in parallel -> Integration and validation
          -> Simplification inspection and final review -> Corrections if needed
          -> Small delivery per CODE task -> Human acceptance
```

There are two approvals. Gate B includes the former technical-plan and implementation
PRD decisions; there is no separate Gate C. Do not write feature code before A and B.
Return to the earliest affected gate for a material contract or scope change. Approval
to implement does not authorize commits, pushes, external review requests or deployment.

At Gate A, choose `local` (default) or `review-request` delivery and record each authorized
Git/external action. Use [Git conventions](modules/development/references/git-conventions.md):
English `type(scope): summary` commits and `<type>/<short-kebab-case-description>`
branches, using the appropriate change type. Do not prepend `codex/` to generated names.
Keep explicit user names and existing work intact; naming rules do not authorize Git writes.

## 1. Approve the scope

Inspect repository instructions, relevant code/docs, branch and `git status --short`.
Preserve unrelated edits. Follow [discovery](references/interview-and-gates.md), asking
only questions that inspection cannot resolve. Present a concise contract: problem,
observable outcomes, constraints, exclusions and delivery authority. Record the user's
explicit approval as **Gate A — Scope approved**.

## 2. Approve one implementation plan

Follow [architecture and planning](references/architecture-and-prd.md). Show how the
logic will work using repository names, useful UML, important rules and a small reuse
map. Explain consequential choices only. Do not fill generic architecture checklists,
repeat the scope, manufacture alternatives or introduce speculative extension layers.

Include the CODE task graph in the same proposal. Each task should be one small coherent
change with owned paths, real prerequisites and meaningful validation. Favor independent
slices after a minimal shared contract; never chain tasks simply because they are listed
in order. Make shared-file ownership and proposed parallel groups explicit. A task must
be reviewable as its own PR/MR, including its directly related tests.

Use the [document contract](modules/prd/references/authoring.md): concise technical entries
in `<feature>.tech-plan.json`, requirements/tasks/checks in `<feature>.prd.json` with
`profile: "implementation"`. These are two internal sources for **one human-facing plan**;
reference entry IDs rather than copying narrative. Render one combined HTML:

```bash
node <skill-dir>/modules/prd/scripts/prd.mjs validate <feature>.prd.json --plan <feature>.tech-plan.json
node <skill-dir>/modules/prd/scripts/prd.mjs render <feature>.prd.json --plan <feature>.tech-plan.json
```

For consequential design choices, apply a focused read-only critique using
[specialist routing](modules/review/references/specialist-reviews.md); do not manufacture
an architecture ceremony when no such choice exists. Show the HTML, only
material unresolved decisions, and ask for **Gate B — Implementation plan approved**.
That approval binds both source contracts and their task graph. Follow the
[execution reference](modules/prd/references/execution.md) to record real user decisions
and fingerprints in local run JSON. Never infer consent from silence or tool success.

## 3. Implement ready CODE tasks

Follow [orchestration](references/implementation-orchestration.md). Dispatch a safe batch
of dependency-ready tasks to separate subagents when supported and permitted; otherwise
implement sequentially and disclose that limitation. Give each writer a verified task
context with the approved UML, schemas and applicable UX/UI decisions, readable source
references, owned paths and a return contract. Do not rely on inherited chat history.
Only one writer owns a shared surface at a time.

Each task follows the [development guide](modules/development/GUIDE.md): implement the
behavior, keep the code clear, run targeted meaningful checks, and save an attributable
checkpoint. `validated` releases dependent implementation work; it does not mean reviewed
or delivered. Do not run a separate simplifier, specialist review or correction ceremony
for every CODE task. Fixing a failing local check remains part of implementation.

Use TDD when it protects meaningful behavior. Reuse sufficient existing tests; no forced
test per method, getter, trivial wiring or behavior-preserving refactor. Check the
80/15/5 unit/integration/E2E preference as a portfolio signal, never a deletion quota.
Record runtime/manual routes where they provide the appropriate evidence.

## 4. Review and refactor the integrated feature

After all CODE tasks are validated, integrate their results and verify their contracts.
Inspect cross-task simplification using the [simplifier guidance](references/simplifier.md).
No useful refactor is a valid outcome; reuse still-valid checks on unchanged code. Use
[bundled review](modules/review/GUIDE.md) on one immutable cumulative feature diff: one
general reviewer, plus architecture, web or security specialists only where applicable.
Standalone skills remain independently usable.

Reviewers are read-only. A separate writer applies accepted fixes and useful refactors,
including across task boundaries, while preserving approved behavior and task ownership.
Map each correction back to its delivery patch. Validate the corrected result and review
the fresh cumulative snapshot once more when needed. All specialists together count as
one round. Two rounds may run autonomously; a further focused round requires explicit
user authorization recorded with `authorize-review`, without resetting history. Unresolved
material findings or decisive coverage gaps block delivery; do not force a clean verdict.

## 5. Deliver small changes and prepare acceptance

Once the integrated result is ready, follow [delivery](references/delivery.md): one local
checkpoint or one authorized draft PR/MR per CODE task. Keep each actual base/head diff
small and coherent. Use independent branches for independent slices and explicit stacked
bases for real dependencies; a task PR must not contain the cumulative feature diff.
Verify every delivery matches the reviewed result. Publication requires recorded authority.
Every delivery-stage check must pass or have a specific human-accepted waiver; missing,
failed or blocked checks otherwise prevent delivery. Post-delivery acceptance is separate.

Record observed checks and delivery links, then re-render the same plan. Hand off actual
behavior, checks, remaining risks and reproducible `human-qa` steps. Human QA is acceptance
by a person; never dispatch it as implementation or create a PR for it. Only an actual
human acceptance message may be recorded as `accepted`. Keep planning documents local
unless their publication was explicitly requested. Never merge or deploy in this skill.

Finish when the approved behavior is delivered and the acceptance handoff is reproducible;
report pending human acceptance separately. Do not add speculative abstractions, duplicate
tests or further review ceremonies after the required checks have passed.
