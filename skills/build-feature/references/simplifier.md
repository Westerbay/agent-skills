# Integrated simplification inspection

Inspect the combined feature after CODE tasks are validated and integrated, before final
review. Look for problems introduced at task boundaries that local checks could miss.
The coordinator may do this inspection directly; no separate agent or writer is required
when there is no useful refactor. Do not repeat it as a ceremony after every CODE task.

## Scope and useful changes

Use the cumulative baseline/result, approved acceptance/UML/design references, repository
instructions and CODE ownership. Inspect cross-task duplication, mixed ownership,
unnecessary wrappers or branches, and obsolete scaffolding. Keep a change only when it
makes an actual behavior easier to understand or maintain. "No additional refactor needed"
is a valid outcome; do not invent edits to satisfy the `simplified` phase.

Apply the bundled [maintainability](../modules/development/references/maintainability.md),
[modular design](../modules/development/references/modular-design.md) and
[frontend](../modules/development/references/frontend.md) criteria where relevant. Available
standalone skills may deepen a concrete concern through [specialist routing](../modules/review/references/specialist-reviews.md),
without creating extra review rounds or requiring every specialist. Security audit roles
remain read-only under their [adapter](../modules/review/references/security-audit-integration.md).

When a worthwhile refactor exists, give one authorized writer its exact files and owning
CODE tasks, pausing overlapping writers. Preserve short circuiting, evaluation order,
exceptions, lifecycle/state ownership, authorization, transactions, cleanup and native UI
semantics. Inspect consumers of changed shared symbols. Do not split by LOC quotas or
remove useful tests to reach a ratio.

## Boundaries and evidence

Preserve approved behavior, UX, acceptance criteria, architecture and public/persisted
contracts. Do not expand auth, permissions, payment or data behavior, weaken validation,
or add speculative layers. Report a useful change outside that authority as a concrete
proposal. If another consumer must change, let the coordinator reassign ownership rather
than editing an unowned file or leaving it broken.

Keep each hunk attributable to its task's eventual patch/PR. After edits, inspect the diff
and rerun affected behavior/integration checks. Reuse passing evidence only where its code
and inputs remain unchanged. Report the actual refactor and evidence, or the inspection's
no-change result. Record `simplified` and `revalidated` using those observations; these
states do not require a new process or duplicate test run. Capture the review snapshot
only after any real edits and required checks finish.
