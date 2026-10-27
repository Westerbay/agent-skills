# Internal Simplifier Role

Run one focused simplification pass after all CODE tasks are validated and integrated,
before the cumulative feature review and any task delivery. Use a separate subagent when
available and permitted; otherwise perform the pass in the current agent and disclose
that it was not independent. Do not repeat this ceremony after each CODE task.

## Inputs

Give the agent the cumulative feature diff or exact checkpoint range, acceptance IDs,
approved architecture decisions, repository instructions, and exact editable files with
their CODE owners. Pause other writers while this integrated pass edits shared surfaces.

## Use specialists within this pass

Follow the [specialist adapter](../modules/review/references/specialist-reviews.md) to
discover available skills and read their actual entrypoints. State the assignment
explicitly: simplify and refactor the integrated feature's owned files within the hard
boundaries below. This is an implementation pass, not a formal review round.
Apply `code-quality-review` to the implementation, `solid-architecture-review` when
responsibilities or module boundaries changed, and `web-review` when the diff affects
actual web output or interaction. Trace rendered effects rather than selecting web
review solely by extension. These are lenses for this existing simplification pass,
not additional specialist rounds or user approval gates.

When a companion is unavailable, continue with the bundled
[maintainability](../modules/development/references/maintainability.md),
[modular design](../modules/development/references/modular-design.md), and relevant
[frontend](../modules/development/references/frontend.md) guidance. Do not install skills,
assume fixed paths, or claim a missing specialist ran. Keep `security-audit` in the
separate read-only security-review role under the
[security adapter](../modules/review/references/security-audit-integration.md); its
findings do not widen the simplifier's edit authority.

## Mission

Reduce accidental complexity while preserving every approved behavior and contract:

- remove duplication introduced across the feature's tasks;
- flatten unnecessary indirection, wrappers, abstractions, and speculative extension
  points;
- simplify branching, naming, data flow, and error handling;
- remove dead exports, unused scaffolding, redundant comments, and obsolete paths added
  by the feature;
- reuse existing repository primitives when that makes the result smaller and clearer;
- keep the chosen architecture/pattern only where its documented forces still apply.

Apply justified refactors rather than returning advice alone. Name the rule or behavior
being moved and its owner; inspect all consumers of a changed shared symbol. Preserve
short circuiting, evaluation order, side effects, exceptions, state ownership, and native
HTML/control semantics. Prefer cohesive functions, meaningful predicates, and shared
components for actual common behavior. Do not split by LOC/file quotas or remove tests
to reach an 80/15/5 ratio; preserve unique behavioral and integration coverage.

## Hard boundaries

Do not add features, change acceptance criteria, redesign the approved architecture,
alter public APIs, schemas, migrations, auth, permissions, payment behavior, or widen the
feature. Do not weaken validation or delete meaningful behavior tests. Do not add getters,
setters, aliases, helpers, or layers merely to make the code look organized.

If a worthwhile simplification requires crossing a hard boundary, report it as a
proposal instead of editing. If a shared refactor needs an unowned consumer changed,
return the concrete dependency to the coordinator rather than editing outside the file
list or leaving the consumer broken. The coordinator may reassign ownership within the
approved feature and give one writer the shared refactor; other owners must consume its
updated contract. Keep each resulting hunk attributable to its task's eventual patch/PR.
After edits, exercise the changed seam and relevant consumers, rerun affected task checks
and integrated checks, and inspect the final cumulative diff. Return files changed,
owner tasks, simplifications made, behavior-preservation evidence, unavailable specialist
or validation coverage, and deferred ideas. Capture the review snapshot only after this
work and its validation finish.
