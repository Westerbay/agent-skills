# Implementation orchestration

## Baselines and ownership

Confirm Gate A/B and current approval fingerprints using the execution helper. Preserve
unrelated edits and recorded Git/delivery authority. Capture the cumulative feature
baseline and attributable task before/after patches in local scratch, including added,
deleted and binary files. Keep private planning documents outside code diffs.

Extend the baseline before first touching a newly identified file. Do not stage or commit
just to capture a patch. Use isolated worktrees when supported and authorized; concurrent
agents must never switch branches in a shared checkout.

## Dispatch a safe parallel batch

Use `prd.mjs next` with both sources and the run record. It proposes dependency-ready
`taskIds` and a disjoint `parallelTaskIds` batch; it launches nothing and claims no files.
Recheck dependencies and claim scope with `record-task --phase started`. The state writer
serializes claims, not implementation. A CODE prerequisite must be `validated` before its
consumer starts; unrelated active work need not finish first.

Inspect actual shared resources as well as paths: symlinks, schemas, generated outputs,
test databases and build steps can overlap. Use concrete files/subtrees; unknown/glob
scopes serialize conservatively. Assign one writer to each shared surface.

### Carry the approved contract into each assignment

```bash
node <skill-dir>/modules/prd/scripts/prd.mjs task-context <feature>.prd.json CODE-001 --plan <feature>.tech-plan.json --state <feature>.run.json --out <local-scratch>/CODE-001.context.json
```

Inspect the excerpt before dispatch. It preserves linked/global entries and diagrams,
but cannot discover an unlinked mockup or a UX decision left only in chat. Supply:

- task ID, absolute excerpt/source paths, approved revisions/digests, worktree root and
  code baseline;
- acceptance/plan IDs with applicable UML, schemas and UX/UI decisions; exact design
  file/frame/section references and a readable approved snapshot when needed;
- owned and excluded paths, shared-surface owner, validated prerequisite outputs and
  their actual code/checkpoint locations;
- repository instructions, the absolute [development guide](../modules/development/GUIDE.md)
  path, relevant references, checks and safe fixture responsibilities;
- the user's conversation/output language for explanations, findings and handoffs,
  plus explicit artifact-language exceptions; keep identifiers and English Git names;
- an explicit boundary: no unrelated cleanup, publication or out-of-scope writes;
- a return contract: attributable patch, changed files, acceptance/plan IDs mapped to
  behavior/check evidence, deviations and unverified areas.

Do not assume inherited chat, attachments or authenticated design access. Make references
readable in the worker's environment using absolute paths or verified local copies of the
approved revision; do not commit planning files to transfer them. Keep full sources
accessible without copying the whole conversation. Supply an already-approved entry
omitted from the excerpt directly by reference instead of rewriting approved sources.

Before editing, workers read applicable contracts/designs and identify missing or conflicting
inputs to the coordinator. This is not another human gate. Resolve discoverable gaps;
only materially undecided changes return to the affected gate. Do not invent a replacement
UI or schema because its reference is inaccessible. Independent work may continue.
After an approved contract revision, regenerate affected contexts and reject stale outputs.

Workers implement, run focused checks and record `implemented -> validated`. Check actual
behavior against the approved contracts and UI decisions; tests alone do not prove fidelity.
Fix failed local checks or unapproved deviations. Missing visual tooling remains explicit.
There is no per-CODE specialist review, simplifier or publication. Without subagents,
follow the same contracts sequentially and disclose that limit; human QA is never CODE.

## Integrate and review the result

After all CODE tasks validate:

1. Combine their exact outputs, compare cross-task flows/schemas/UX with the approved
   contract and resolve integration drift. Record `integrated`.
2. Run relevant combined checks and record actual results plus feature `validated`.
3. Inspect [simplification opportunities](simplifier.md). Apply useful owned refactors or
   record that none are needed. Record `simplified`; use no extra writer solely for ceremony.
4. Re-run checks affected by edits, or reuse still-valid evidence for unchanged inputs.
   Save the immutable cumulative result and record `revalidated`.
5. Follow [review](../modules/review/GUIDE.md): one general reviewer plus selected
   architecture/web/security expertise from [specialist routing](../modules/review/references/specialist-reviews.md).
   Reviewers are read-only and share the baseline, result and approved design references.
6. Aggregate once and record feature `reviewed`, then triage concrete findings.

Use the feature's original baseline, not the latest task patch. Pause writers during
capture and review. Replies must carry the exact `scope.patchDigest`; the helper rejects
missing/stale identities. The coordinator still verifies cited evidence and final content.
All selected reviewers together count as one round, not one round per task or skill.

## Correct findings within a bounded allowance

Verify code/impact and consolidate duplicate root causes. Assign supported fixes and useful
refactors to bounded writers; security audit roles stay read-only. Preserve approved UX,
contracts and ownership. Ordinary scoped internal refactors need no new permission;
material contract/scope changes return to the affected gate.

Map repairs back to owning task patches. Verify actual task bases so redistribution does
not leave missing imports, broken intermediate states or duplicated prerequisite diffs.
Run affected checks, record `corrected -> revalidated`, capture a fresh cumulative result
and review it against the original baseline. Unchanged checks need no ceremonial rerun.

Two review rounds may run autonomously. If material findings or decisive coverage gaps
remain, report the concrete blocker. Further focused correction/review requires actual
user authorization recorded with `authorize-review` as described in the
[execution reference](../modules/prd/references/execution.md). It grants one extra round,
retaining history. Never reset a run, rename reviewers or force delivery to evade the
limit. A malformed reply may be retried once on the unchanged snapshot without consuming
another implementation round.

## Deliver the reviewed work

Compare the actual tree with the final reviewed snapshot before `ready-to-deliver`.
Every delivery-stage check must pass or have a current, specific human-accepted waiver;
the helper blocks missing/failed/blocked results otherwise. Acceptance-stage checks are
separate. Use [delivery guidance](delivery.md) for one small checkpoint or authorized
PR/MR per CODE, preserving its intended base and attribution.

Splitting changes can invalidate evidence. Verify each base/head composition and resolve
any newly discovered problem before publication, using the remaining or explicitly
extended review allowance. Once delivery begins, preserve delivered snapshots and handle
substantive changes as a scoped revision. Hand off actual checks, accepted limitations,
links and reproducible QA; only real human acceptance permits `accepted`.
