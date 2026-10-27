# Standalone specialists in the feature workflow

Use relevant standalone review expertise within the existing feature phases. The skills
remain independently usable; this adapter supplies feature scope, role authority, and the
host review contract. It does not add approval gates, output dimensions, or review loops.

## Resolve capabilities once for the phase

Discover `code-quality-review`, `solid-architecture-review`, `web-review`, and
`security-audit` through the host's actual skill catalog. A coordinator may instead supply
an explicit, verified repository source directory. Read the selected skill's actual
`SKILL.md` and resolve its references relative to that directory. Do not assume sibling
installations, hardcoded paths, matching versions, or automatic access to other skills.
Do not install, update, copy, or connect anything merely to satisfy this adapter.

Record which skills are available, selected, unnecessary for the scope, or unavailable
in the existing review notes. Select by the behavior and boundaries affected:

| Skill | Apply when | Existing review owner |
| --- | --- | --- |
| `code-quality-review` | Implemented code needs assessment of names, decisions, cohesion, constants, or test value | `quality`; its behavioral-test guidance may inform `regression` for actual coverage of changed contracts |
| `solid-architecture-review` | Responsibilities, dependencies, supported extension points, or module boundaries change | `architecture` |
| `web-review` | Changed rendering, interactions, metadata, route delivery, headers, or shared dependencies affect a web surface | `quality` |
| `security-audit` | The request or changed trust boundary needs security review | `security`, through [security-audit integration](security-audit-integration.md) |

Web impact includes server loaders, route handlers, and metadata builders; a filename
extension alone neither requires nor excludes the web pass. Trace the shipped surface.
Keep conventions and logic with their existing reviewers. Assign a duplicated concern
to one owner: test maintainability belongs to quality, while a missing regression check
for a changed contract belongs to regression. Share context without reporting it twice.

Select **full host review** whenever architecture or security checks are needed, so the
manifest includes those dimensions. Light covers quality, conventions, regression, and
logic; full adds architecture and security. Full is still the host's six-dimension
review, not permission for Cloudflare's complete audit workflow or a broader code scope.

## Apply expertise at the right phase

| Phase | Specialist use and authority |
| --- | --- |
| Before Gate B | Use relevant SOLID/architecture expertise to critique the proposed logic, contracts, ownership, and supported change scenario. Source stays read-only; concrete design risks enter the combined technical and execution plan before its single approval. |
| CODE implementation | Apply quality and relevant SOLID/web guidance while implementing each owned task and its useful behavior checks. Do not dispatch a formal review or simplifier after each task. |
| After all CODE tasks validate | Integrate the work, then run one simplifier over the cumulative feature. Give it exact edit ownership and explicit refactor authority. Recheck affected behaviors and cross-task seams before freezing the result. |
| Final cumulative review | Run the selected specialists in one read-only checkpoint over that frozen feature result, including cross-task interactions. Return evidence without editing source. |
| Corrections | Separate authorized writers apply accepted fixes/refactors to the owning tasks. Revalidate affected paths and the integrated result, then use the remaining review round on a fresh snapshot when needed. Deliver task patches/PRs only after this checkpoint completes. |

A pre-Gate B design critique consumes no formal review round and does not approve
implementation. Gate A approves scope; Gate B approves the combined technical and
execution plan. There is no separate Gate C or per-task review gate.
Do not fabricate changed-file findings for code that exists only in a proposed design.
During simplification, retain the [simplifier's boundaries](../../../references/simplifier.md):
no new feature, changed public contract, redesigned approved architecture, or weakened
behavioral protection. A useful improvement outside that scope becomes a concrete plan
decision at the earliest affected gate, not an unapproved source edit.

The security audit role always inspects target source read-only. Route any remediation
to a separate authorized writer. Preserve the security adapter's operating-mode,
sandbox, certainty, and evidence rules; do not treat ordinary test execution as a
substitute for required sandboxed security validation.

## One cumulative checkpoint, one snapshot, existing owners

Use the same saved feature baseline/integrated result, file list, hashes, patch digest,
and approved feature/task
context for every selected specialist in a review round. Reuse the reviewer already
owning the dimension: the quality reviewer can apply both code-quality and web expertise
without spawning a second competing review. Queue work when concurrency is limited;
sequential passes use the same snapshot and disclose their lack of independence.
An expertise lens may apply to only some files, but its owning reviewer still covers
the whole assigned manifest scope. In particular, the quality reply must not reduce
`scope.files` to web files and silently omit the other quality checks.

The dispatch must include:

- the absolute paths to the saved scope, manifest, assigned dimension, and
  [output contract](contract.md), plus repository instructions and task constraints;
- the resolved specialist paths, relevant guidance, and why each applies;
- an explicit instruction: **review this saved cumulative feature snapshot read-only; do not modify
  source or recollect a different current Git diff; return the host dimension JSON**;
- permitted validation and the exact missing capabilities, including security controls
  where applicable.

This explicit checkpoint instruction overrides a specialist's default UI prompt that
offers review and refactoring. General implementation authority does not make the
reviewer a writer. Supporting source outside the patch may be inspected to establish
consumers and invariants, but tie it to the reviewed revision/checkpoint rather than
mixing changing source into the evidence. Source changes invalidate the saved result;
finish fixes before capturing the next review snapshot.

Keep the six section names and [JSON schema](contract.md) unchanged. Translate specialist
observations into the owning dimension's evidence, severity, recommendations, and
coverage. Preserve uncertainty; an unverified hypothesis is not a ranked defect.
Consolidate the same root cause across specialists before aggregation, preserving the
original evidence and owner. Do not rely on exact-text deduplication to catch semantic
duplicates, or issue one output file per skill instead of one per assigned dimension.

## Missing expertise and failed checks

When a skill is unavailable, disclose that it was not run and use the relevant bundled
criteria without pretending to have applied that standalone skill:

- quality: [maintainability](../../development/references/maintainability.md) and the
  [behavioral test workflow](../../development/references/standalone-workflows.md);
- architecture: [modular design](../../development/references/modular-design.md);
- web: [frontend](../../development/references/frontend.md);
- security: the source-based checks and explicit limits in the existing security adapter.

Unavailability alone need not block a feature whose required checks the bundled workflow
can actually complete. An explicitly requested specialist/audit requirement remains unmet
and must be reported. If a selected available skill fails to run or a decisive check is
blocked, preserve partial/error coverage and its exact cause; do not silently downgrade
to a fallback and label that specialist review complete. Follow the host's existing
single retry for failed replies. Incomplete coverage blocks the checkpoint until resolved
or explicitly accepted with its stated limitation.

## Fix findings within the existing loop

Accept maintainability findings with a concrete rule, consumer, or change hazard and
a proportionate remedy. The authorized writer applies the focused root-cause refactor;
neither a complexity score nor the 80/15/5 preference justifies deleting useful coverage.
Follow the [implementation pipeline](../../../references/implementation-orchestration.md)
for remediation, affected checks, fresh snapshots, and the review limit: all selected
specialists belong to one host review round, with **two feature review rounds total**,
not two per task or skill. Map each accepted fix to its owning task and eventual
patch/PR; coordinate shared-file edits through one writer. Switching specialists,
renaming a task, or delivering tasks separately does not reset the count. Unresolved material
findings or incomplete coverage keep their existing blocking effect; scope changes
return to the relevant gate. This adapter grants no additional write authority.
