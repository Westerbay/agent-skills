# Small task deliveries

Choose `local` (default) or `review-request` at Gate A. Implementation approval does not
authorize publication. Existing explicit authority remains valid within its scope.
All CODE tasks are implemented and the cumulative feature is reviewed before any task
delivery. Keep one local checkpoint or one draft PR/MR per CODE task.
Before `ready-to-deliver` and each task delivery, all delivery-stage checks must pass or
have a current, specific human-accepted waiver recorded with `waive-check`. Missing,
failed and blocked results otherwise stop delivery. Disclose accepted limitations;
acceptance-stage checks and human QA occur after delivery and do not satisfy this guard.

## Make each change readable

Plan a PR around one coherent change with its directly related tests and explanation.
Keep prerequisite refactors separate where useful; do not mix unrelated formatting,
dependency upgrades or speculative cleanup. Include enough working usage/context that
the reviewer can assess a new abstraction. Each PR must work against its declared base.

Use actual `git diff --stat` and `--numstat` against the intended base. Count handwritten
production/test changes and touched responsibilities; report generated/vendor/lock churn
separately. Prefer a few hundred changed lines when practical. Around 400 handwritten
lines triggers a decomposition check; around 1,000 usually calls for splitting unless
the operation is genuinely indivisible. These are local alerts, not formal Git limits;
a small change across dozens of unrelated files may still be too broad. Do not split
by arbitrary line count or move useful related tests into another PR just to shrink it.

The principle comes from Google's [small changes guidance](https://google.github.io/eng-practices/review/developer/small-cls.html):
one self-contained, understandable change, with enough context and related tests.
Use [description guidance](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)
to explain what changes and why; the numeric alerts above are this workflow's policy.

## Branches, dependencies and correction ownership

Follow [Git naming](../modules/development/references/git-conventions.md) for every
authorized commit/branch. Give a task a concrete name such as `feat/csv-export`,
`fix/cache-expiry` or `refactor/export-contract`, not a generic `codex/task`.
PR/MR titles also use English `type(scope): summary`, describing actual resulting behavior.

For independent tasks, use branches based on the same verified target when their patches
work independently. For real prerequisites, use an explicitly authorized stacked base
and link predecessor requests; each child diff must contain only its own task's changes.
A task needing several sibling outputs cannot simply target one sibling: choose a coherent
stack/merge-base strategy under existing authority and verify it before publication.
Do not silently merge/rebase branches or require an artificial implementation chain
just to simplify Git history.

Preserve each task's attributable patch from the start. Assign global-review corrections
to their owning tasks, update dependent compositions, and verify the final combined tree
matches the reviewed snapshot. Never publish the cumulative feature diff once per task.
If splitting reveals a contract problem, fix and validate it before claiming delivery;
record any resulting review invalidation.

## Local delivery

After feature `ready-to-deliver`, each task advances `ready-to-open -> delivered-local`.
Save task-specific before/after copies or patches, evidence and a reference to the shared
feature review. Include added/deleted/binary files and exclude unrelated user work.
No commit, remote or hosting account is required. Never invent a PR URL.

## Draft PR/MR delivery

Use `--delivery review-request` and record branch, commit, push and request-creation
authority separately as applicable. CLI `draft-pr` and `--pr` also cover draft MRs;
these names do not mandate GitHub. Choose the existing repository provider and available
CLI/API/connector. Do not install a service automatically.

Prepare each task's exact branch/base diff and description before requesting any missing
publication authority. Follow the repository template; otherwise keep the description
proportional to the change:

- concrete problem and resulting behavior;
- dependency/base and reading order when stacked;
- actual validation plus a concise reference to the shared integrated review;
- material limits and reproducible manual steps only where needed.

Exclude local PRD/plan/run documents unless their publication was explicitly requested,
preserving local copies. Check for an existing request on the same branch. Verify URL,
base, head and draft state before recording `published`. If the host supports task
attachments, attach each created PR as required by that host. Never mark an uncreated
request published. Missing authority/provider access leaves a concrete local handoff at
`ready-to-open`; unsupported draft mode needs an explicit delivery decision.

## Mode changes and acceptance

Never edit the run's delivery mode to bypass a blocker. Obtain a scope/delivery decision
and initialize a new record; carry forward only genuinely valid decisions and evidence.
Human-QA tasks start after all CODE deliveries; no PR for the act of acceptance.
Issue tracking/messaging are optional, explicitly requested actions. Never merge or deploy.
