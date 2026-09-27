# Standalone specialist workflows

Read only the section relevant to the current change. These workflows require no other
skills or remote services. Compatible installed skills can add depth when useful.

## Behavior tests

Use for meaningful business rules, regressions, transformations, and integration seams.

1. Choose one observable behavior and a plausible defect the test must catch. Exercise
   the public seam used by the caller; avoid coupling assertions to private helpers.
2. Write the smallest test using the repository's existing runner, fixtures, and style.
   Run it before implementation. Confirm it fails for the missing behavior, not a broken
   environment or unrelated error. For an existing fix, reproduce the failure first
   when practical; do not undo unrelated user work to manufacture a red test.
3. Implement just enough to satisfy that behavior and run the test again.
4. Refactor while green, then run related checks. Repeat for the next behavior rather
   than writing a speculative batch of tests before learning from implementation.

Mock external boundaries only when needed for deterministic, isolated verification.
Prefer real domain logic and realistic data. Test retries, failures, permissions, and
concurrency when the changed contract makes them relevant. A test that only mirrors
implementation details or checks trivial wiring does not earn its maintenance cost.
If execution is blocked, report the blocker; never claim a red/green cycle occurred.

## UI and interaction

Use for material UI or UX changes; follow frontend.md for framework-specific guidance.

- Inspect existing screens, tokens, shared components, and interaction conventions.
  Identify the main user action and the states needed to complete it.
- Reuse the design system. Keep hierarchy, labels, spacing, and feedback coherent with
  adjacent screens. Adapt layout to content and viewport rather than one screenshot.
- Include pending, empty, error, success, validation, and disabled states where relevant.
  Preserve input after failures and expose actionable recovery.
- Use semantic controls and labels; verify keyboard operation, visible focus, focus
  restoration, contrast, and reduced-motion behavior where applicable.
- Exercise the affected flow in the available browser or preview at representative
  narrow and wide viewports. Inspect overflow and long content. If visual tooling is
  unavailable, report that limit instead of claiming visual verification.

## Module and architecture decisions

Use for explicit architecture work or a concrete cross-module design problem.

- Trace the invariant, its owner, consumers, and dependency direction before proposing
  a boundary. Read relevant architecture decisions and preserve public contracts.
- Prefer a module that owns a coherent rule and hides meaningful complexity. Avoid
  layers that merely forward calls or abstractions with no current consumer.
- Compare the smallest local change with one justified alternative. Explain concrete
  costs, migration implications, and how the behavior will be verified.
- Keep domain decisions independent of infrastructure providers when the repository
  already supports that separation. Introduce new seams only for demonstrated needs.
- Confirm material contract or architecture changes when outside the authorized scope.
  Implement incrementally and verify existing callers along with the new path.
