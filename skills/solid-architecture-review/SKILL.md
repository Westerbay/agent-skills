---
name: solid-architecture-review
description: Review SOLID, module boundaries, dependency direction, extensibility, and file or folder organization in a diff or codebase. Use for architecture and modularity reviews; perform focused refactors when changes are authorized. Does not impose a feature-planning lifecycle.
---

# SOLID and Architecture Review

Make the next supported change local, understandable, and safe. Diagnose the concrete
dependency or contract that makes change expensive; do not grade code by how many
interfaces, design patterns, layers, or files it contains.

This skill is standalone and works with local source, Git, and available repository
checks. No other skill, service, or agent framework is required. Resolve bundled paths
relative to this directory. Follow the repository's language and framework conventions.

## Establish scope and authority

- For a review-only request, inspect and report without changing source. For an explicit
  review-and-refactor request or an implementation task that already authorizes changes,
  perform the useful in-scope refactors and validate them. Do not stop at suggestions
  when the task authorizes the fix. Skill selection alone does not grant edit authority.
- Record the actual review target: supplied patch, staged changes, working changes,
  branch versus its verified base, or named modules. Inspect Git status first. When
  reviewing a diff, distinguish newly introduced issues from relevant pre-existing debt.
  Include untracked files only when they belong to the intended change.
- Read applicable instructions, architecture decisions, package boundaries, public
  exports, consumers, and tests before proposing a new structure. Trace runtime wiring
  as well as imports; a type-only dependency can still expose the wrong ownership.
- Preserve unrelated work and existing public and persisted contracts. Local internal
  refactoring within the authorized scope needs no repeated confirmation. For material
  architecture expansion, public API, data model, migration, auth, permission, payment,
  or destructive changes outside that authority, prepare the concrete proposal and
  obtain approval before implementing it. Review permission never authorizes publication,
  deployment, production access, secret changes, or external writes.

## Review through actual change scenarios

1. Map the affected path: entry point -> application operation -> domain policy ->
   adapter or persistence -> result and downstream consumers. Identify each rule owner,
   contract, state owner, and composition point. Inspect transitive consumers of changed
   shared symbols, not only changed lines.
2. Choose one or two scenarios grounded in the request, supported variants, or recent
   local history: add a provider, introduce another rule, change representation, or
   support another delivery channel. Label a hypothetical scenario as a thought
   experiment, not a promised feature or permission to implement it.
3. For each scenario, name the files and contracts that must change, the modules that
   should remain unaffected, and the behavioral test that would reveal a broken
   boundary. An assertion that code is "not extensible" needs this evidence.
4. Apply [the SOLID review guide](references/solid.md) to the observed responsibilities,
   variation points, and substitutability contracts. Apply
   [the module and refactoring guide](references/modules-and-refactoring.md) when the
   concern crosses files, folders, packages, or composition points. Its structural
   signals are investigation aids, not numerical pass/fail rules.
5. Choose the smallest effective intervention. A clearer function, moved rule, explicit
   dependency, narrowed capability, or cohesive module often suffices. Compare its
   navigation and validation costs with leaving the current code in place. Prefer a
   concrete maintainability improvement over a speculative framework.

Use independent review when supported, authorized, and useful for the risk. Give a
reviewer the source and scenario rather than the desired conclusion. Otherwise use a
separate skeptical pass and do not imply independent verification occurred.

## Refactor and verify when authorized

Separate structural change from behavior change. Preserve return values, errors,
ordering, transaction scope, identity, cancellation, side effects, and public import
paths unless changing them is part of the request. Add a focused characterization or
contract test only when it protects meaningful behavior that existing checks miss.

Move one responsibility at a time, update every consumer, and rerun the narrow relevant
checks. Follow the migration and validation steps in the module guide for cross-file
work. Do not replace useful boundary tests with mocks of the new internal structure.
Keep changes reviewable; no broad formatting sweep or unrelated directory reorganization.

Inspect the resulting dependency graph and final diff, then replay the scenario. Check
that the new seam is actually used, the old implementation is not still reachable, and
the refactor has not merely hidden coupling behind a new name or service locator.

## Return evidence and an actionable result

Report findings by concrete impact. Each finding needs a precise location or import
edge, current behavior or demonstrated change cost, the violated boundary or contract,
the smallest useful refactor, and how to validate it. Use severity consistent with the
repository; a possible future extension inconvenience is not an urgent production bug.
Consolidate multiple symptoms of the same root cause. Keep optional preferences separate.

For applied changes, state what moved or changed ownership, which consumers were checked,
commands and outcomes, and any residual risk. For deferred changes, explain the exact
scope or evidence gap and give a concrete next step. If no actionable issue is found,
say so and state the reviewed scope and limits. Do not promise that future changes can
never break the system.

The guides are an original practical synthesis of the primary references listed in
[sources.md](references/sources.md), not a mandate to adopt any author's entire architecture.
