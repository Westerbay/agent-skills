# Standalone specialists in the feature workflow

Keep specialist skills independently usable. This adapter selects their expertise for
one cumulative feature review; it adds no approval gate or per-CODE review loop.

## Select expertise and resolve capabilities

Discover skills through the host catalog or a verified source directory. Read the actual
selected entrypoints and resolve references from each directory. Do not assume sibling
installations, automatic access, matching versions or permission to install a companion.

| Reviewer | Scope and optional skill |
| --- | --- |
| `general` (always) | Quality, conventions, regression and logic; use `code-quality-review` for maintainability and behavioral-test value. |
| `architecture` | Changed responsibility, module dependency or consequential extension boundary; use `solid-architecture-review`. |
| `web` | Changed rendered pages, interaction, semantic HTML, indexing or route delivery; use `web-review`. |
| `security` | Requested review or changed trust boundaries, auth, permissions, isolation, secrets or execution; use `security-audit` through the [security adapter](security-audit-integration.md). |

Choose specialists by actual impact, not filename or a fixed reviewer count. Web impact
can come from server code; an unrelated TSX fixture need not trigger it. Architecture
alone does not select security. State selected reviewers and triggering evidence in the
existing review notes. The CLI defaults to `general`; `--reviewers general,architecture`
is sufficient for architecture without web/security. `--full` is an explicit all-four
shortcut, not permission for a full security audit.

General retains correctness coverage when specialists run. Give overlapping concerns one
reporting owner: test maintainability to quality, missing behavioral protection to
regression, UI-specific behavior to web. Consolidate the same root cause across replies.

## Use the existing phases

- **Before Gate B:** focused read-only design critique when useful. Resolve concrete
  weaknesses in logic, ownership and supported change scenarios before approval.
- **During CODE:** apply relevant development guidance and targeted checks. No formal
  specialist review or separate simplifier per task.
- **After integration:** inspect cross-task duplication and boundaries. Apply only useful
  authorized refactors; no-change is valid and unchanged checks need not be repeated.
- **Final review:** selected reviewers assess one frozen cumulative result read-only.
- **Corrections:** authorized writers repair accepted findings within their owned files,
  validate affected behavior, and present a fresh snapshot for the remaining round.

Reviewers never inherit write permission from a specialist's default review-and-refactor
prompt. Simplifier/correction writers preserve approved behavior and design; material
scope changes return to the affected gate. Security audit roles always inspect source
read-only and route remediation to implementation owners.

## Dispatch one contract per reviewer

Pass absolute paths to the saved patch/checkpoint, v2 manifest, [reply contract](contract.md),
assigned concerns, applicable repository instructions, and approved scope/UML/design
references. Include selected skill paths and available validation capabilities. Explicitly
state: read-only, use this snapshot, return the assigned reviewer's JSON with the exact
`scope.patchDigest`; do not recollect a changing Git diff.

Use one agent for general's four topics. Selected specialists may run in parallel; queue
when capacity is limited. Without delegation, use distinct sequential passes and report
that they are not independent. All reviewers see the same cumulative scope and snapshot;
supporting consumers must come from that revision. Save one reply per reviewer, not one
per skill or general topic.

A selected reviewer assesses its concern across the complete manifest. Do not omit files
silently. The helper rejects a stale/missing digest, but cannot prove a reviewer read
source or that a finding is correct; the coordinator still verifies cited evidence.

## Missing expertise and bounded corrections

If an optional companion is unavailable, disclose that and use bundled criteria:
[maintainability](../../development/references/maintainability.md) and
[tests](../../development/references/standalone-workflows.md) for general,
[modular design](../../development/references/modular-design.md) for architecture,
[frontend](../../development/references/frontend.md) for web, and the security adapter
for source-based security checks. Never claim an absent skill ran.

Missing optional expertise alone need not block work the bundled criteria can cover.
An explicitly requested audit remains unmet if unavailable. Preserve a selected reviewer's
failed/partial checks; do not disguise failure as a successful fallback. Retry malformed
replies once on the unchanged snapshot. Unresolved decisive gaps block delivery unless
explicitly accepted with the stated limitation.

All selected reviewers count as one integrated round. Two rounds run autonomously by
default; further focused work needs actual user authorization via `authorize-review`,
granting one extra round while retaining evidence and history. Never reset the run or
change reviewer names to evade the limit. Map repairs to the owning CODE patches/PRs;
metrics or a test ratio alone do not justify rewrites or deletion of useful tests.
