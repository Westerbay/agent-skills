# Standalone specialist workflows

Read only the section relevant to the current change. These workflows require no other
skills or remote services. Compatible installed skills can add depth when useful.

## Behavior tests

Use for meaningful business rules, regressions, transformations, and integration seams.

Apply the test-value gate before starting a red/green cycle. Reuse an existing test when
it already protects the changed behavior; do not create one test per method, new file,
getter, setter, or refactoring step. A behavior-preserving refactor normally starts from
existing green tests. Trivial, reversible changes can use relevant existing checks
without adding a test. Getters or setters with validation or state invariants still
have meaningful behavior.

1. Choose one observable behavior and a plausible defect the test must catch. Exercise
   the public seam used by the caller at the lowest reliable test layer; avoid coupling
   assertions to private helpers. Use a real integration boundary when a unit test
   cannot catch the defect, and reserve E2E for critical assembled journeys.
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

### Portfolio and test cleanup

For a suite assessment or substantial test changes, prefer **80% unit / 15% integration /
5% end-to-end** as an advisory target. This is a distribution of tests, not a code-coverage
percentage. It does not require a repository-wide census for each small code change.
Classify by what actually executes: a unit protects a narrow behavior with controlled
external systems; integration exercises a real collaboration boundary; E2E exercises a
journey through the assembled application. Folder names and browser tools do not decide
the category. Count executable cases consistently, excluding retries and environment-matrix
repetitions; disclose parameterized-case counting, unknown cases, and skipped cases.

When a reliable inventory is available, report counts, scope, and proportions over the
classified cases. For a nonempty portfolio that differs from 80/15/5, flag the deviation,
explain context, and inspect possible redundant or trivial tests. An unknown or empty
inventory has no meaningful percentages; do not fabricate them. Small or boundary-heavy
projects may justify another balance. Preserve a documented project strategy and explain
the tradeoff rather than changing it silently.

Before deleting or moving a test, identify the protected behavior and the remaining test
that catches the same plausible defect, or establish that it checks no meaningful behavior.
Preserve real serialization, transaction, adapter, permission, and critical journey coverage.
Add meaningful replacement protection first when needed, then run the affected suites.
Make cleanup only within the authorized scope. Removing trivial unit tests can worsen the
ratio while improving the suite; never compensate with filler or delete a useful E2E test
just to meet the target. Report duration or flakiness only when measured.

This applies the maintainability and public-behavior guidance in
[Software Engineering at Google, chapter 12](https://abseil.io/resources/swe-book/html/ch12.html)
and the boundary tradeoffs in [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html).
Google's book suggests roughly 80% unit and 20% broader tests; the 15/5 split is this
workflow's preference, not a universal result established by that source.

## UI and interaction

Use for material UI or UX changes; follow frontend.md for framework-specific guidance.

- Inspect existing screens, tokens, shared components, and interaction conventions.
  Identify the main user action and the states needed to complete it.
- When an approved UI design or flow exists, inspect its exact referenced revision and
  preserve its decisions. Compare the rendered result and interactions with it during
  validation; adjacent screens and generic preferences do not override that contract.
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

Use for explicit architecture work or a concrete cross-module design problem. Apply
[modular-design.md](modular-design.md) during ordinary implementation when choosing new
responsibilities, extension boundaries, and dependencies; do not wait for an architecture
review to establish those decisions.

- Compare the smallest local change with one justified alternative. Explain concrete
  costs, migration implications, and how the behavior will be verified.
- Confirm material contract or architecture changes when outside the authorized scope.
  Implement incrementally and verify existing callers along with the new path.
