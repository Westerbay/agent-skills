# Bundled Argus review

Read-only, evidence-based review with deterministic preparation and aggregation. No
provider CLI, installed review skill, model choice, or external posting is required.
Resolve `<review-dir>` as `<skill-dir>/modules/review`.

In `build-feature`, run this checkpoint once on the cumulative feature after every CODE
task is validated and the integrated simplification and checks have finished, before any
task delivery. Corrections may require one fresh review round: at most two rounds for
the feature, not two per task or specialist. A standalone invocation reviews its requested
scope without requiring the feature lifecycle.

Light review covers quality, conventions, regression, and logic. Full adds architecture
and security, with an adversarial check of warnings/criticals. Select skills and mode with
[specialist routing](references/specialist-reviews.md) before preparing the manifest.
Use full when SOLID/module boundaries or security need their owning dimension, including
auth, payments, consequential architecture changes, or unresolved integration risk.
Web and code-quality checks fit within light review unless those wider concerns apply.

## Prepare the exact scope

For committed changes with an explicitly resolved base:

```sh
python3 <review-dir>/scripts/argus_tools.py prepare --repo <repo> --base <base> --branch <branch> --out <new-run-dir>
```

The helper also supports `--staged` and `--full`; pass `--full` for the selected full
review, rather than adding architecture/security replies to a light manifest. It writes
no Git state and performs no external actions. Do not stage or commit just to run it.
Inspect manifest errors and excluded generated/lock/snapshot files; inspect excluded
material separately when it could affect behavior, migrations, dependencies, or security.

For local, uncommitted delivery, the committed/staged helper does **not** cover the scope.
Use its saved before/after checkpoint, record the exact file list and hashes, and
review both added and deleted content. Produce scoped patches from those copies with
`git diff --no-index -- <before> <after>` where useful (exit 1 means differences; higher
codes mean errors). Include untracked/new files explicitly. In `build-feature`, use the
saved feature baseline and integrated result, including every CODE task and cross-task
refactor. Exclude pre-existing user edits; retain task ownership alongside the cumulative
patch for the later task deliveries. Do not substitute isolated task diffs for this review.

For local aggregation, create `manifest.json` with `mode: "local"`, `base` naming the saved
baseline, `branch` naming the saved result, repo-relative `files`, the selected `reviewers`
array, and `patchDigest` as SHA-256 of the saved concatenated scoped patch bytes. Retain the
snapshot paths and per-file hashes alongside it. If a binary change cannot be meaningfully
reviewed, report partial coverage; do not pretend an empty text patch proves correctness.
Use the same saved baseline/result labels in every reply. Do not use `anchors` for local
snapshots: it expects real Git review-request hunks.

Use a new run directory and reply directory for each changed result. Local result labels
must uniquely identify the round/snapshot, for example a feature ID plus round and digest;
branch reviews should pass resolved immutable commit refs. Record the staged patch
digest and relevant file hashes when using `--staged`. The helper does not bind a reply
to its patch digest: the coordinator must keep readers on the frozen source, reject old
replies after any change, and compare actual result hashes/digest before delivery.
Do not run implementation or simplifier writers while reviewers/verifiers inspect it.

## Specialist routing

Use [specialist routing](references/specialist-reviews.md) to select the available quality,
SOLID, web, and security skills from the actual scope. Record selected skills, resolved
paths, triggering evidence, and unavailable/not-applicable checks alongside the manifest;
no new reviewer dimensions or schema fields are required. Discover and read each selected
skill's actual instructions. For security, retain the separate
[security adapter](references/security-audit-integration.md) and its mode, sandbox, and
evidence requirements. Internal full review does not authorize a complete security audit.

## Execute the review

Read [dimensions](references/dimensions.md) and [contract](references/contract.md). With
available and permitted subagents, assign a separate read-only reviewer to each dimension;
parallel readers are allowed. Give absolute paths to the checkpoint/patch, manifest,
contract, assigned dimension, repository instructions and approved scope context. Also
pass selected skill paths, relevant concerns, and the adapter's explicit read-only
envelope; never dispatch a standalone skill's default review-and-refactor prompt during
this pass. Each dimension owner incorporates its applicable specialist checks into one
reply. For security, also pass the selected audit mode and security adapter. Disclose
fallback criteria when a specialist is unavailable.
Queue dimensions when concurrency is limited; do not silently omit them.

Without subagents, execute the same dimensions in separate sequential passes yourself.
Save one JSON reply per dimension as `<section>.json`, using the same contract. State
clearly that this is a single-agent review with no independent verification. The helper's
confidence label measures coverage only; it does not establish reviewer independence.

```sh
python3 <review-dir>/scripts/argus_tools.py aggregate --manifest <run-dir>/manifest.json --replies <reply-dir> --out <run-dir>/report.json
```

Retry malformed, missing or failed replies once. Incomplete coverage stays visible and
blocks the review checkpoint until resolved or explicitly accepted with its limitation.
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
Accepted findings enter the [focused correction pass](../../references/implementation-orchestration.md#correct-accepted-findings).
Review a fresh saved result after corrections; an earlier report cannot approve later edits.
For a feature, aggregate all selected dimensions into one round, then return accepted
findings to their CODE owners. Do not restart review separately for each task delivery or
add another integrated-review ceremony after this cumulative checkpoint.
No posting is part of this module. The `anchors` helper is an optional local classification
utility; its suggested event is not authorization to comment, approve or request changes.
