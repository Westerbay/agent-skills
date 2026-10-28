---
name: code-quality-review
description: Review code quality, readability, function complexity, naming, constants, and behavioral test value in a diff or selected codebase; perform focused refactoring when edits are authorized. Use for maintainability and test-suite reviews, not a security audit or a full architecture redesign.
---

# Code Quality Review

Make the next correct change easier. Find concrete maintenance hazards and remove them
through focused refactoring when authorized; do not substitute a style checklist for
reasoning about behavior. This is a standalone skill with bundled references and no
required provider, external service, other skill, or feature-planning workflow.

Use the user's current conversation language for questions, findings, review reports
and refactor summaries unless they explicitly request another output language. English
source or examples do not select the response language. Preserve exact identifiers,
schema keys/enums, paths, commands and quoted evidence. Pass the chosen language to
delegated reviewers.

## Scope and authority

- A request for review, explanation, or recommendations alone is read-only. Return
  actionable refactor proposals. A request to review and refactor, fix, or implement
  authorizes the relevant local edits and safe validation; act on that authority without
  repeatedly asking permission for ordinary internal simplification.
- Preserve unrelated changes and observable behavior. An internal rename or extraction
  must not silently alter a public API, wire format, persisted field, exception contract,
  evaluation order, or side effect. Material changes to architecture, contracts, data,
  authentication, or permissions require authority for that scope.
- No commits, publishing, deployments, external writes, secret changes, or production
  data operations follow from invoking this skill. Follow repository instructions and
  use existing local tools. Report unavailable checks without inventing their results.

## Establish the review target

Read applicable instructions, existing naming/lint/test conventions, current Git status,
and the requested diff. Identify whether the target is staged work, unstaged work, a
specified base/head comparison, or named files; do not silently substitute one for
another. When reviewing current local changes, include staged and unstaged changes and
inspect relevant untracked source files. Use an established base for a branch review;
resolve material base ambiguity before claiming complete coverage.

Read complete changed functions, their callers, relevant types, and tests. Inspect nearby
code and shared consumers when needed to understand consequences. Separate newly
introduced problems from pre-existing debt; do not expand a focused diff review into an
unrequested repository cleanup.

## Review the code and its tests

Read [references/readability-and-metrics.md](references/readability-and-metrics.md) for
code review. Apply its naming, conditional decomposition, cohesive function, constant
ownership, and measurement guidance. Explain which real change becomes error-prone;
length, duplication, or a metric alone does not establish a defect.

For changed tests, production behavior requiring test protection, or a requested test
portfolio review, also read [references/test-value.md](references/test-value.md). Inspect
the actual behavior and dependencies of tests. Use **80% unit / 15% integration / 5% E2E**
as this skill's preferred portfolio target when a suite assessment is relevant. Report
actionable imbalance and cleanup supported by missing coverage, duplication or cost, not
every numerical deviation. Preserve unique behavioral coverage; the target is neither a
coverage percentage nor a deletion quota.

Prioritize:

1. Misleading names or conditions likely to cause incorrect changes; hidden mutations,
   lost errors, and drift between copies of the same rule.
2. Mixed responsibilities, hard-to-follow control flow, ambiguous units/constants, and
   unnecessary indirection that make an actual maintenance task harder.
3. Tests coupled to implementation details, tests without meaningful assertions, missing
   protection for changed behavior, and expensive duplicated cases.

Do not flag familiar short idioms merely for being compact. Do not invent generic
abstractions to avoid a few local lines. Prefer an existing domain name or owner over a
new `utils`, `helpers`, or global constants collection.

## Refactor and verify when authorized

For each substantive change, identify the behavior to preserve and the narrowest useful
check. Use existing tests first; add a characterization or regression test only for a
meaningful behavior that otherwise lacks protection. Perform small steps such as a
domain rename, extracting a decision or cohesive operation, flattening nested control
flow, or consolidating a duplicated rule with its owner.

Trace consumers of renamed or extracted code, then exercise the original boundary.
Preserve short circuiting, side effects, timing, null handling, and language-specific
operator semantics. Run the repository's relevant tests and static checks. Compare the
final diff and any before/after metrics; fewer lines or a lower score cannot compensate
for an altered contract or harder navigation. Do not add suppressions just to clear a
quality warning.

When a test is a deletion or replacement candidate, establish the behavior it protects
and where that protection remains. Preserve boundary-specific integration/E2E coverage.
Make such edits only within authorized test cleanup/refactoring scope; do not perform a
mass deletion to reach the target ratio.

## Report a review that can be acted on

Lead with concrete findings or the completed refactors. For each substantive finding,
include the exact file/line or symbol, observed problem, realistic maintenance or defect
scenario, proposed smallest change, and how to verify it. Rank by actual impact; keep
optional style suggestions separate and do not manufacture findings.

Include the reviewed scope, relevant measured hotspots and measurement method, test
portfolio figures when assessed, checks actually run, and remaining limits. Distinguish
fixed findings, open findings, and recommendations requiring a scope decision. If no
meaningful problem is found, say so with the review coverage and validation limits.
