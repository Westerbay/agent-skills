# Bundled Argus review

Read-only, evidence-based review with deterministic preparation and aggregation. No
provider CLI, installed review skill, model choice, or external posting is required.
Resolve `<review-dir>` as `<skill-dir>/modules/review`.

Light review covers quality, conventions, regression, and logic. Full adds architecture
and security, with an adversarial check of warnings/criticals. Use full for auth, payments,
security, consequential architecture changes, or unresolved integration risk.

## Prepare the exact scope

For committed changes with an explicitly resolved base:

```sh
python3 <review-dir>/scripts/argus_tools.py prepare --repo <repo> --base <base> --branch <branch> --out <new-run-dir>
```

The helper also supports `--staged` and `--full`. It writes no Git state and performs no
external actions. Do not stage or commit just to run it. Inspect manifest errors and
excluded generated/lock/snapshot files; inspect excluded material separately when it
could affect behavior, migrations, dependencies, or security.

For local, uncommitted delivery, the committed/staged helper does **not** cover the task.
Use its saved before/after checkpoint, record the task's exact file list and hashes, and
review both added and deleted content. Produce task-only patches from those copies with
`git diff --no-index -- <before> <after>` where useful (exit 1 means differences; higher
codes mean errors). Include untracked/new files explicitly. Never confuse HEAD's cumulative
diff with this task's diff or include pre-existing user edits.

For local aggregation, create `manifest.json` with `mode: "local"`, `base` naming the saved
baseline, `branch` naming the saved result, repo-relative `files`, the selected `reviewers`
array, and `patchDigest` as SHA-256 of the saved concatenated task patch bytes. Retain the
snapshot paths and per-file hashes alongside it. If a binary change cannot be meaningfully
reviewed, report partial coverage; do not pretend an empty text patch proves correctness.
Use the same saved baseline/result labels in every reply. Do not use `anchors` for local
snapshots: it expects real Git review-request hunks.

## Execute the review

Read [dimensions](references/dimensions.md) and [contract](references/contract.md). With
available and permitted subagents, assign a separate read-only reviewer to each dimension;
parallel readers are allowed. Give absolute paths to the checkpoint/patch, manifest,
contract, assigned dimension, repository instructions and approved task context.
Queue dimensions when concurrency is limited; do not silently omit them.

Without subagents, execute the same dimensions in separate sequential passes yourself.
Save one JSON reply per dimension as `<section>.json`, using the same contract. State
clearly that this is a single-agent review with no independent verification. The helper's
confidence label measures coverage only; it does not establish reviewer independence.

```sh
python3 <review-dir>/scripts/argus_tools.py aggregate --manifest <run-dir>/manifest.json --replies <reply-dir> --out <run-dir>/report.json
```

Retry malformed, missing or failed replies once. Incomplete coverage stays visible and
blocks the task checkpoint until resolved or explicitly accepted with its limitation.
The helper validates scope, coverage, counts and exact deduplication, not semantic truth.

## Triage and report

Use [coordinator judgment](references/coordinator-judgment.md). Preserve original replies
and reasons for corrections. In full mode use [verifier](references/verifier.md) for
warnings/criticals, never nits. If an independent verifier is unavailable, perform the
pass sequentially and label it non-independent. Failed verification never silently removes
a finding. Reaggregate accepted corrections separately from originals.

Critical => blocking; warning => needs-attention; missing/partial coverage => incomplete;
otherwise pass. Include concrete file/line evidence, impact, suggested fix, checked scope,
unverified areas and the independence limit. See [report format](references/report-format.md).

Return findings to the implementation coordinator; do not fix during the read-only pass.
No posting is part of this module. The `anchors` helper is an optional local classification
utility; its suggested event is not authorization to comment, approve or request changes.
