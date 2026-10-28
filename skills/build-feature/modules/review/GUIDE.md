# Bundled feature review

Review the exact cumulative change read-only, then route supported fixes to authorized
writers. This module works locally without another skill, hosting provider or agent API.
Resolve `<review-dir>` as `<skill-dir>/modules/review`.

In `build-feature`, review after all CODE work is integrated and checked, before delivery.
Inspect cross-task simplification opportunities first; no useful refactor is a valid
outcome, and unchanged snapshots can reuse relevant passing checks. Do not repeat a
formal review after each CODE task. A standalone review covers only its requested scope.

## Select reviewers by risk

Use one **general** reviewer for quality, conventions, regression and logic. Add only the
specialists needed by the actual change: **architecture**, **web**, **security**. An
architecture review does not require a security review, and a `.tsx` filename alone does
not establish web impact. Follow [specialist routing](references/specialist-reviews.md)
for triggering evidence, installed skills and disclosed bundled fallbacks.

## Prepare an immutable snapshot

For a committed change with an explicitly resolved base:

```sh
python3 <review-dir>/scripts/argus_tools.py prepare --repo <repo> --base <base> --branch <branch> --out <new-run-dir>
```

The default is `general`. Add, for example, `--reviewers general,architecture` or
`--reviewers general,web,security` for the selected concerns. `--full` explicitly selects
all four reviewers and cannot be combined with `--reviewers`; it is not the normal path.
`--staged` reviews staged changes. No command stages, commits or publishes source.
Inspect preparation errors and excluded generated/lock/snapshot material separately when
it affects contracts, migrations, dependencies or security.

For uncommitted work, the committed/staged helper does not capture the complete scope.
Use exact before/after copies or patches, including untracked, deleted and binary files,
with per-file hashes and CODE ownership. Exclude unrelated edits and local planning
artifacts. `git diff --no-index -- <before> <after>` can produce local patches (exit 1
means differences; higher codes are errors). Do not substitute individual task diffs for
the cumulative feature review.

For local aggregation, create `manifest.json` with `schemaVersion: 2`, `mode: "local"`,
`base` and `branch` naming the saved baseline/result, repo-relative `files`, selected
`reviewers` (including `general`), and `patchDigest`: the lowercase SHA-256 of the saved
concatenated patch bytes. Keep snapshot paths and hashes beside it. If binary content
cannot be assessed, report the coverage gap. `anchors` expects real Git diff hunks.

Use a new directory for every changed snapshot. Pause writers during capture and review;
reviewers may inspect relevant consumers from that same revision. The helper requires
v2 replies carrying the exact `scope.patchDigest`, and rejects missing or stale digests.
It does not prove that an agent read the patch; the coordinator still checks evidence
and compares final content with the reviewed snapshot before delivery. Old v1 manifests
and replies remain historical records; prepare fresh v2 evidence rather than relabeling
them or inventing a missing digest.

## Dispatch and aggregate

Read [dimensions](references/dimensions.md) and [reply contract](references/contract.md).
Give each selected reviewer absolute paths to the snapshot, manifest, applicable
instructions, approved scope/UML/design references and assigned concerns. Include the
resolved specialist skill path when used and an explicit read-only assignment. General
implementation authority does not make a reviewer a writer. Security assignments also
include the mode and capabilities from the [security adapter](references/security-audit-integration.md).

Use independent agents when available and permitted, queueing work if needed. Otherwise
perform distinct sequential passes and disclose the lack of independence. Save one v2
reply per reviewer as `general.json`, `architecture.json`, `web.json` or `security.json`.
Do not silently omit a selected concern or dispatch four agents for general's four topics.

```sh
python3 <review-dir>/scripts/argus_tools.py aggregate --manifest <run-dir>/manifest.json --replies <reply-dir> --out <run-dir>/report.json
```

Retry malformed or missing replies once on the unchanged snapshot. Unresolved partial
coverage remains visible and blocks the checkpoint unless explicitly accepted with its
limitation. The helper validates identity, scope, counts and exact duplicates, not the
semantic truth of a finding. Coverage confidence is not reviewer independence.

## Triage, correct and finish

Apply [coordinator judgment](references/coordinator-judgment.md) to cited code and impact,
consolidating root causes. Use the [verifier](references/verifier.md) for consequential or
contested warnings/criticals when a second opinion is useful; security retains its own
required independent verification. No extra verifier is needed for nits or a clean reply.
Preserve raw evidence and reasons for rejected findings.

Critical findings block; warnings need attention; missing/partial coverage is incomplete.
Report scope, concrete findings, observed checks and limits using [report format](references/report-format.md).
Writers apply accepted fixes separately, run affected checks and capture a fresh snapshot.
All selected reviewers together count as one feature round. Two rounds may run
autonomously; a further targeted round requires actual user authorization recorded with
`prd.mjs authorize-review --evidence <user-reference> --reason <remaining-finding-or-scope>`
against the current run. It grants one additional round without resetting history.
Never force delivery or silently restart the run to bypass an unresolved finding.

This module posts no comments or approvals. `anchors` only classifies possible comment
locations; its suggested event is not permission to post. Each task delivery references
its relevant evidence from the integrated review rather than starting another ceremony.
