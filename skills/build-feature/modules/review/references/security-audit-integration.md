# Optional security-audit integration

Use this adapter when the user requests security review, or the scoped change affects
trust boundaries such as authentication, authorization, tenant isolation, cryptography,
untrusted input, secrets, deployment permissions or external execution.

## Resolve the companion and mode

Discover an installed `security-audit` skill through the host's skill catalog and read its
actual `SKILL.md`; resolve companion files relative to that discovered directory. The
upstream project is [Cloudflare's security-audit-skill](https://github.com/cloudflare/security-audit-skill).
Do not assume a hardcoded installation path, matching version, or available agent/runtime
capabilities. Do not install, update or vendor the companion automatically.

Choose the operating mode from the user's request and the installed skill's triggers.
Focused security checks and ordinary task/PR reviews use guidance mode: load only relevant
methodology and domain companions, with no automatic six-phase run or audit artifacts.
Explicit codebase audits, pen tests, full/comprehensive/end-to-end review requests, or
requested audit reports may require full audit mode under that skill. An internal review
label such as `full` does not itself constitute such a request. If the user's intent is
ambiguous, clarify before creating audit artifacts or starting the full workflow.

For an authorized full audit, follow the companion's complete scope, isolation, coverage,
verification, artifact and terminal-state requirements. Preserve the host review's scope
and consume the resulting evidence; do not claim that its shorter checklist completed the
audit. If required capabilities or budget are unavailable, report an incomplete audit and
the exact blocker. Loading a companion does not grant delegation or external-write authority.

When the companion is unavailable, continue the host's source-based security checks and
state that companion-specific audit coverage was not performed. If a full audit was
requested, make that unmet requirement explicit; do not silently label the fallback a
completed audit. This adapter and its source link keep the host workflow portable.

## Carry safety into the review

Source inspection stays read-only. Before executing target-controlled tests, builds,
fixtures, browsers or other processes for security validation, enforce the companion's
OS sandbox requirements: no external network, only isolated loopback when needed, an
empty allowlisted environment with scratch-local home/caches, read-only target/toolchain,
writes confined to assigned scratch, and explicit CPU, memory, process, file-size, disk
and wall-clock limits. Never expose host credentials, sockets or shared services. Use
available dependencies and dummy data; do not install dependencies or probe live systems.

If any control cannot be enforced, keep source inspection and report the exact validation
blocker and safe plan. Do not substitute an ordinary test runner for sandboxed evidence.
Apply the companion's retained-artifact and write-isolation rules in the selected mode.

## Adapt evidence without changing the host protocol

Pass the resolved companion path, selected mode, exact review scope and permitted actions
to the relevant reviewer/verifier. Keep the host's JSON schema, dimension ownership and
severity vocabulary; do not replace them with the audit's report schema during guidance.

Only confirmed security results with a concrete boundary, affected principal/resource and
supported consequence can become ranked host findings. Map their demonstrated impact to
the host's scale; do not mechanically equate differently named severity levels. Preserve
audit certainty and evidence in the finding's existing evidence fields or linked report.

Keep `needs_validation` as an unranked investigation note with its exact missing fact and
safe next step, never as a confirmed finding or a low-severity substitute. In structured
host reviews, use `notes`, and set partial status/coverage with `errors` when the gap blocks
the assigned check. An empty findings list or a failed verifier cannot turn unresolved
evidence into confirmation or complete coverage. Preserve original candidates and reasons
when triaging, without promoting them through an automatic fail-open rule.
