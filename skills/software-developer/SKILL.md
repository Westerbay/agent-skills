---
name: software-developer
description: Default base workflow to implement, fix, refactor, or extend software end to end across backend, frontend, database, integration, and bug-fix work. Use for authorized code changes unless a narrower installed skill explicitly orchestrates the whole task; still use it with compatible specialist skills such as TDD or UI guidance. Covers repository inspection, minimal vertical implementation, review-derived quality checks, validation, and safe non-production test-data seeding when missing data blocks verification. Do not use for read-only explanation, review, planning, or diagnosis unless the user also asks for changes.
---

# Software Developer

Deliver the smallest maintainable change that fits the repository, preserves existing
paths, and can be meaningfully exercised.

## Portable use and authorization

This skill works with local repository tools. It requires no hosting provider,
issue tracker, messaging service, MCP server, or other installed skill.
Resolve reference paths relative to this skill's directory, not the project directory.
Follow the user's instructions and the repository's conventions over this skill's
style preferences. Apply language-specific guidance only to that language or framework.

Use the tools actually available in the environment. Prefer repository scripts and
native local commands; do not assume a particular agent API or desktop application.
If a useful capability is unavailable, use an equivalent local check or report the
specific validation limit. Do not install other skills or connect services automatically.

Implementation authorization covers in-scope local edits and safe validation. Preserve
unrelated work. Do not commit, rebase, push, publish, deploy, send messages, or mutate
external services without user authorization for that action. Keep planning artifacts
local unless publication is requested. Never alter secrets or production configuration
without explicit authorization, or mutate production or an unverified/shared database.
For material architecture, contract, data, auth, or destructive changes, first check
whether the user already authorized them. Explain and seek confirmation only for
changes outside that scope or unresolved choices that materially affect the result.

When the user requests issue, review-request, or communication work, use their existing
provider and available tools. A pull request and a merge request serve the same role
here. Do not require a hosting account to complete local development. If external access
is unavailable, prepare a local handoff and state what remains unperformed.

## 1. Establish the local contract

Before editing:

1. Read applicable repository instructions, docs and ADRs, nearby code and tests,
   schemas, current git state, and relevant history. Preserve unrelated user work.
2. State the observable change, behavior that must remain unchanged, affected public or
   persisted contracts, and validation route.
3. Build a small impact map. Find the rule or contract owner, then trace every writer,
   reader, caller, omitted/default call site, UI/export surface, cache, background path,
   and provider boundary affected by the change. Search by symbol and by duplicated
   literal/value; inspect sibling implementations and transitive consumers.
4. Search before creating. Reuse existing components, helpers, formatters, schemas,
   types, constants, domain predicates, factories, fixtures, and workflow scripts.
   When the requested capability has a mature package ecosystem or many known edge cases,
   check current official documentation and package registries before writing it from
   scratch. Compare an existing dependency or one credible package with a local
   implementation. Adopt a package only when it materially reduces code or correctness
   risk after considering maintenance, security, license, compatibility, runtime/bundle
   cost, and escape hatch. Skip this research for trivial helpers.
5. Write a scenario matrix proportional to risk: happy path plus relevant null, empty,
   zero, partial/mixed, stale, retry, duplicate, concurrent, locale/time-zone,
   cross-scope, and legacy-data cases. Do not assume an optional value or omitted
   dependency means the feature should silently switch off.
6. Match the repository's package manager, commands, architecture, naming, formatting,
   test style, comment style, and generated-file workflow.
   Prefer rebase over merge commits when synchronizing feature branches. This preference
   does not authorize rewriting published history or force-pushing; obtain explicit
   authorization for those actions.
7. Ask only when unresolved ambiguity materially changes architecture, security, auth,
   permissions, payments, data models, migrations, public APIs, destructive behavior, or
   long-term maintenance. Investigate discoverable facts first.

For non-trivial work, give a short plan covering change, validation, and material risks.
Re-plan when evidence invalidates it.

## 2. Work in vertical behavior slices

- Implement one observable behavior at a time.
- For meaningful business rules, regressions, backend logic, and silently breakable
  transformations with a useful observable test seam, follow the test workflow in
  [references/standalone-workflows.md](references/standalone-workflows.md). An installed
  compatible testing skill may supplement it, but is not required. Only add tests that
  protect real behavior.
- Reproduce bugs before fixing them when practical, then protect the root cause with a
  regression test when the failure can be reproduced through a meaningful observable
  seam.
- Test the changed integration seam, not only new pure helpers. When behavior crosses a
  shared component, caller default, cache, query, provider, script, or UI/server
  boundary, prefer a test or runtime check that crosses that boundary.
- Prefer a root-cause fix. Label any temporary mitigation and state its follow-up risk.
- Apply a test-value gate before writing each test. A test earns its maintenance cost
  only if it protects a non-trivial decision, business invariant, regression,
  transformation, failure mode, or integration contract and would fail for a plausible
  defect that matters to a caller or user.
- Do not write tests for getters or setters, value echoing, tautological equality,
  constants, framework behavior, trivial wiring/pass-through code, or static component
  size, spacing, CSS classes, and visual styling. An equality matcher is fine when it
  proves a meaningful rule; it is not useful when it merely compares a value with the
  same value the test just assigned or passed in.
- It is valid to add no tests when the change contains no behavior worth protecting.
  Do not create a test merely to increase coverage or to claim that testing occurred.
  Validate trivial code through the narrowest relevant existing check, runtime flow, or
  visual inspection instead.
- For material UI structure, visual design, responsive behavior, interaction, or UX work,
  use the UI workflow in [references/standalone-workflows.md](references/standalone-workflows.md).
  A compatible installed design skill may supplement it when useful.
- For an explicit architecture review or a genuine cross-module design problem, use the
  architecture workflow in that reference. Do not require a separate architecture skill
  or a review ceremony for every large change.

## 3. Implement with repository-shaped boundaries

- For React, UI, forms, client state, localization, or accessibility changes, read and
  follow [references/frontend.md](references/frontend.md).
- For persistence, transactions, migrations, external providers, or background side
  effects, read and follow
  [references/data-and-integrations.md](references/data-and-integrations.md).

### Scope and reuse

- Preserve public APIs, data contracts, migrations, and user-visible behavior unless the
  request requires changing them.
- Prefer standard library, existing dependencies, and established local utilities. Add a
  dependency only when it clearly lowers risk or complexity, and explain in the handoff
  why existing options were insufficient.
- Keep changes focused. Avoid unrelated cleanup and whole-file reformatting.
- Centralize each business rule in one source of truth. Reuse domain predicates,
  constants, and mappings across entry points instead of copying equivalent lists or
  conditions.
- Place constants with the module that owns their meaning. Public product identity,
  deployment settings, infrastructure defaults, protocol statuses, and feature rules
  should not accumulate in one shared configuration object. Share a rule only across
  real consumers, and wire its authoritative enforcement as well as its UI validation.
  Prefer framework protocol constants where available. Naming a literal is insufficient
  if it creates a dependency in the wrong direction or a setting with no runtime effect.
- Express time-based configuration through named constants owned by the relevant module.
  Make the unit part of the name and keep the human duration visible in a short comment
  when arithmetic alone does not make it immediately obvious.
- Let the owning module export a named contract and canonical mapping. Derive lookup
  tables and subsets from it, or make copies compile-time checked; do not maintain
  disconnected lists that can drift.
- When adding a parameter or dependency, inspect every caller. Make required behavior
  required; if omission is valid, name and test the fallback instead of silently
  bypassing the new behavior.
- When changing a shared component, helper, default, cache key, formatter, or error,
  inspect every existing consumer and keep unrelated behavior opt-in.
- Extract code only for a real repeated pattern, a clear responsibility, a domain seam,
  or a concrete testability/locality gain.
- Optimize for sufficient quality, not maximal ceremony. Stop once the requested
  behavior is maintainable and proportionally validated. Do not add speculative
  abstractions, generic frameworks, exhaustive edge handling unsupported by the product
  contract, duplicate tests, or documentation that merely restates the code.
- Remove dead exports, unreachable branches, obsolete props, unused messages, and
  scaffolding introduced by the change.

### Responsibilities and data flow

- Split a file or module when it mixes independent responsibilities or materially harms
  navigation. Do not split into shallow pass-through wrappers.
- Reserve ternary expressions for short choices between simple scalar values or existing
  references. If either branch constructs a full object or array, use a named variable
  with `if`/`else`, a guard clause, or an early return so the control flow stays readable.
- Keep compound conditions readable. Before an `if` accumulates several clauses or mixes
  unrelated concepts, name the intermediate booleans or extract a focused private/domain
  predicate. Prefer guard clauses and one conceptual decision per condition. Place named
  intermediate values before the control statement; do not hide business rules inside a
  dense boolean expression. Avoid extracting a helper when one short, obvious condition
  is clearer inline.
- Treat a new complexity or lint suppression as evidence to revisit the boundary. Keep
  provider-neutral domain code free of provider-specific imports when a repository seam
  already exists.

### Types, validation, and errors

- Reuse the concrete exported type owned by the data or API contract.
- Prefer explicit named boundary and domain types that reveal intent at the usage site.
  Avoid derived utility types such as `Pick`, `Omit`, `NonNullable`, `ReturnType`, deep
  indexed-access chains, and similar type machinery when an owned named type can express
  the contract directly. Use those utilities only for a genuinely mechanical local
  transformation where introducing a named contract would be less clear.
- Follow repository policy for annotations. Omit redundant return types already inferred
  from a typed local; use an explicit named interface when it documents a real module or
  public boundary.
- Validate untrusted runtime input at the boundary with the project's schema/validator.
  Do not re-parse already trusted, typed internal values without a concrete reason.
- Do not bypass type problems with `as`, double assertions, `any`, non-null assertions,
  or error-ignore directives. Fix the contract or validate and narrow at the boundary.
  Prefer annotations, generics, inference, `satisfies`, and discriminated unions.
  Import aliases are not casts.
- Do not use lint disables, wildcard imports, or swallowed exceptions to silence a design
  or type problem.
- Preserve useful error status, cause, and context. Never report success after a failed
  operation.
- Keep logs structured and exclude secrets, tokens, payment data, and personal data.

## 4. Walk the impact map before review

Inspect the final diff, then replay the impact map against actual code:

1. Trace each changed invariant end to end: input/write -> domain owner -> persistence or
   provider -> query/read -> API -> UI, export, notification, or background consumer.
2. Search every changed shared symbol again. For each caller, verify required behavior,
   fallback semantics, cache identity, error handling, formatting, and user feedback.
3. Compare equivalent paths. The same rule, status, price, permission, locale, or display
   value must not produce different answers across list/detail, web/admin, table/export,
   sync/async, or create/update flows unless the difference is explicit.
4. Exercise the scenario matrix. Pay special attention to null/empty/zero values,
   partial or mixed aggregates, retries and duplicate delivery, stale state, concurrency,
   legacy rows/defaults, time zones, and cross-scope data.
5. Confirm one owner per rule or contract; no new disconnected list, mapping, formatter,
   predicate, optional bypass, dead export, unreachable branch, speculative wrapper,
   cast, suppression, or generic error replacing actionable context.
6. Check auth, ownership, permissions, privacy, enumeration, logs, query bounds, cache
   reuse, transaction boundaries, provider-call concurrency, generated artifacts, and
   deployed-resource replacement behavior where relevant.

Fix concrete problems found. Do not refactor unrelated pre-existing debt; report it
separately when relevant.

## 5. Validate and make the feature exercisable

1. Run the narrowest meaningful behavior test first when one exists. New tests are not
   required when none pass the test-value gate.
2. Add related typecheck, lint, format check, integration tests, or broader suites as risk
   increases.
3. For security, auth, permissions, payments, data, and migrations, run broader relevant
   checks and state residual risk explicitly.
4. Visually or interactively verify material UI behavior when the environment permits.
5. If missing local data prevents automated or manual verification, read and follow
   [references/dev-test-data.md](references/dev-test-data.md).
6. Inspect the final diff after automated fixes and generated-file updates.

Do not claim completion when validation was not attempted. State the exact blocker and
residual risk when a check cannot run.

## 6. Hand off a reproducible result

Report:

- behavior and files changed;
- validation commands and outcomes;
- when no test was added, the concise reason no meaningful behavior required one;
- skipped or failed checks and remaining risk;
- assumptions or intentional non-changes;
- when data was seeded: exact seed command, route/screen, record identifiers or local
  account, test steps, expected result, cleanup/reset command, and untested behavior.

## Preserved local development preferences

- Define named behavior and render callbacks before JSX or the objects configuring them:
  `onClick={handleNextPage}`, `queryFn: fetchPage`, `cell: renderStatus`.
  Pass an existing callable directly instead of adding a forwarding wrapper.
- Do not import a persistence adapter merely to obtain an injection token or type.
  Keep those contracts independent of the adapter's runtime imports.
- Put shared limits/defaults with their contract, feature display and filter settings
  with the feature, and seed counts/random seeds with the seeder. Wire one configured
  value through consumers and include varying parameters in cache identity.
  Obvious indices/increments do not need configuration; name ambiguous library sentinels.
- Check branch base and repository naming conventions before creating a branch;
  prefer `feat/<name>` for features when no convention exists. Avoid including commits
  from another feature silently.
- Update documentation whose facts or procedures changed, removing obsolete information
  rather than appending a historical log.
- For React/TypeScript query wrappers, tables, or pagination, also read
  [references/react-typescript.md](references/react-typescript.md). It preserves the
  detailed guidance on native query options, cancellation, stable table inputs,
  cursor ordering, accessibility, and retry after returning to a cached page.