# Software Developer

Deliver the smallest maintainable change that fits the repository and can be meaningfully
exercised. Keep names, responsibilities and extension boundaries clear while implementing;
apply useful in-scope refactors instead of leaving problems for a later review.

Use the user's current conversation language for questions, plans, explanations, review
findings and delivery summaries unless they explicitly request another output language.
English instructions, examples and source code do not select that language. Pass it to
delegated agents. Preserve exact identifiers, commands, paths and quoted evidence, the
required English Git names, and explicit language requirements for edited repository
artifacts or product UI; those requirements do not change chat or local plan language.

## Scope and authority

This workflow needs only local repository tools. Resolve references relative to this
skill directory. Follow user instructions and repository conventions; apply stack-specific
guidance only where that stack exists. Do not install skills or connect services implicitly.

Implementation authority covers relevant local edits and safe validation. Preserve unrelated
work. Git writes, publication, deployment, messaging and external mutations need their own
user authority; existing explicit authorization remains valid. Keep planning artifacts local
unless publication was requested. Do not alter secrets or production configuration without
explicit authorization, or mutate production or an unverified/shared database. Resolve
material architecture, contract, data, auth or destructive choices outside the agreed scope
before implementing them. Missing external access should leave a useful local handoff.

## 1. Understand the change at the right depth

Inspect applicable instructions, current Git state, the owning code and relevant tests.
Identify the requested observable behavior, contracts to preserve and a validation route.
Reuse existing components, schemas, types, constants, predicates and fixtures before adding
another implementation. Match the repository's commands and generated-file workflow.

For a small local change, inspect the affected owner and callers, then proceed with a
focused check. A written impact map, scenario matrix or separate plan is not required when
it adds no useful decision. For shared rules, cross-module changes or higher-risk behavior,
use the impact and scenario guidance in
[maintainability.md](references/maintainability.md#impact-and-scenarios-for-shared-or-risky-changes).
Give a short plan for non-trivial work and revise it when evidence changes the approach.

Investigate discoverable facts before asking questions. Ask only when unresolved choices
materially affect the result, compatibility, security or long-term maintenance. For a
capability with a mature ecosystem or many known edge cases, compare an existing dependency
or one credible package with a local implementation using current official documentation.
Consider maintenance, license, compatibility, security and runtime cost; skip package
research for trivial helpers. Add a dependency only for a concrete benefit.

When delegated from an approved plan, read the supplied task context and referenced UML,
schemas and UX/UI artifacts before editing. Check access and revision; inherited chat is
not a substitute. Preserve approved decisions while choosing unconstrained implementation
details. Resolve missing/conflicting inputs with the coordinator and report deviations
instead of silently redesigning. Return conformance evidence using the acceptance/plan IDs.

## 2. Implement cohesive behavior slices

Implement one observable behavior at a time, then simplify its decisions and ownership.
Prefer a root-cause fix; reproduce a bug when practical and identify any temporary mitigation.
Preserve public APIs, persisted contracts and unrelated behavior unless their change was
requested. Avoid unrelated cleanup, whole-file formatting and speculative frameworks.

Use these references only when relevant:

| Change | Guidance |
| --- | --- |
| Non-trivial logic, types, shared rules or refactoring | [Maintainability](references/maintainability.md) |
| New responsibilities, variants or module dependencies | [Modular design and SOLID](references/modular-design.md) |
| Web UI, forms, state, accessibility, localization or route delivery | [Frontend](references/frontend.md) |
| React/TypeScript query wrappers, tables or pagination | [React/TypeScript](references/react-typescript.md) |
| Persistence, transactions, migrations, providers or background effects | [Data and integrations](references/data-and-integrations.md) |
| Behavioral tests, material UI/UX work or architecture choices | Relevant section of [specialist workflows](references/standalone-workflows.md) |

Keep these invariants throughout implementation:

- Give business rules, constants and contracts a meaningful owner. Share real policies
  across consumers, not merely similar syntax; avoid disconnected mappings and a global
  constants collection. Check all callers when changing shared defaults or dependencies.
- Name domain decisions clearly. Decompose dense conditions when it helps comprehension,
  preserving short circuiting, evaluation order, exceptions and logical/bitwise semantics.
  Short idiomatic expressions may remain inline when an extraction adds no meaning.
- Extract cohesive responsibilities or useful reuse seams. Keep lifecycle ownership,
  authorization, transactions, side effects and cleanup visible. File counts and LOC are
  investigation signals, not reasons to introduce forwarding wrappers.
- Validate untrusted input at its boundary, then use the owned concrete type internally.
  Do not replace validation or a broken contract with unsafe assertions, `any`, arbitrary
  generic promises or error suppression. Keep useful error causes and statuses visible;
  logs must exclude secrets and sensitive data.
- Remove dead exports, obsolete props, disconnected implementations and scaffolding added
  by the change. Update docs whose facts or procedures changed.

Tests earn their maintenance cost by protecting a plausible defect in caller-visible
behavior, a rule, a regression or an integration contract. Reuse sufficient existing
coverage. Use TDD for useful new/regressed behavior as described in the test workflow;
a behavior-preserving refactor can start from existing green tests. Do not manufacture
red/green cycles or tests for trivial getters, constant echoes, wiring or private helpers.
A validating accessor does have behavior. It is valid to add no test when none adds value.

Exercise the real changed seam, not only a new pure helper. Prefer unit tests for rules,
integration tests for collaborations and a small set of critical E2E journeys. The 80/15/5
portfolio preference is contextual guidance for suite assessments, never a test quota.
Targeted visual regression can protect an approved UI contract; incidental CSS assertions
or a screenshot for every component do not follow from that permission.

## 3. Verify the result and its consumers

Run the narrowest meaningful check, then related type, lint, build or integration checks
as risk requires. Security, auth, permissions, payments, persisted data and migrations
need broader relevant validation. Reuse still-valid evidence for unchanged code rather
than repeating an entire suite after every step.

For shared or risky changes, replay the impact map against the actual result: check the
owner and all affected consumers, defaults, error behavior, equivalent flows and relevant
failure/concurrency/legacy-data cases. Verify that new boundaries are actually used and
that no disconnected rule or optional bypass remains. A local change needs only the
corresponding focused check, not an exhaustive cross-repository ceremony.

For material UI changes, compare actual interactions and rendered output with approved
designs at relevant states and viewports. Inspect emitted semantics and route delivery
where affected. If missing local data blocks verification, use
[non-production test data](references/dev-test-data.md); its target and side-effect guards
apply before writes. State exactly what could not be exercised.

Inspect the final diff after fixes and generated-file updates. Correct concrete problems
introduced by the change; report unrelated debt separately. Stop once the requested
behavior is maintainable and proportionally validated, or report the exact blocker.

The bundled guidance works without other skills. Available `code-quality-review`,
`solid-architecture-review` or `web-review` can deepen an applicable check; discover their
actual paths and do not run every specialist automatically. A requested `security-audit`
retains its own mode, read-only source and execution controls. Ordinary development does
not imply a full audit. Follow the orchestrator's review boundaries when part of a larger
workflow instead of adding another review ceremony to each task.

## 4. Deliver a reproducible handoff

Before authorized branch/commit delivery, follow
[Git naming and delivery](references/git-conventions.md): English `type(scope): summary`
commits and `<type>/<short-english-kebab-case-description>` branches. Preserve explicit
user names and published history; naming conventions do not grant Git authority. Use the
repository's hosting provider when requested, or keep delivery local when unavailable.

Report resulting behavior, changed files, meaningful checks and outcomes, unverified areas
and residual risks. When no test was added, state briefly why existing checks or another
validation route were sufficient. For delegated work, include the applicable acceptance/
plan IDs and any deviation. If seeding was needed, include the safe command, screen/record,
steps, expected result and scoped cleanup from the test-data guide. Do not claim completion
from passing tests alone when an approved behavior remains missing or contradicted.
