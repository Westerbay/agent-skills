# Architecture and Technical PRD

## Pre-draft evidence

Apply the bundled document module's gates before proposing architecture:

1. Use [reuse scouting](reuse-scouting.md) to identify reusable components, contracts, types, hooks,
   utilities, feature flags, fixtures, and scripts with exact paths.
2. Identify shared surfaces and their consumers. Prefer a local extension. When an
   in-place shared edit is unavoidable, require backward compatibility and a regression
   check.
3. Resolve sources in this order: user instruction > supplied design > business document >
   existing code. Surface contradictions before drafting.
4. When the feature or a substantial part of it is commonly solved by maintained
   libraries, search current official documentation and package registries before
   designing it from scratch. Prefer an existing project dependency when suitable.
   Compare build versus adopt on repository fit, covered edge cases, maintenance,
   security, license, bundle/runtime cost, and escape hatch. Do not perform package
   research for a trivial helper.

Also build an impact map from each proposed contract owner to all writers, readers,
callers, defaults, UI/export surfaces, caches, jobs, providers, and legacy paths.

## Architecture process

Start from constraints and change pressure, not fashionable patterns:

1. Describe the current relevant architecture and the concrete limitation.
2. Define the desired boundaries, invariants, ownership, and data flow.
3. When a choice materially affects contracts, coupling, operations, migration, or long-
   term maintenance, compare the recommendation with one credible alternative, usually
   the minimal/no-new-pattern option. Skip alternatives for obvious local decisions.
4. Compare only the dimensions that could change the decision; avoid exhaustive tables.
5. Recommend one option and state its costs. Avoid speculative extensibility.

Add a decision record only for a consequential selected pattern or architecture choice:

| Field | Required content |
|---|---|
| Problem | Specific problem in this feature |
| Forces | Constraints and competing concerns |
| Chosen pattern | Pattern and concrete repository mapping |
| Alternative | One credible option, usually the simplest one |
| Why chosen | Evidence-based advantage in this context |
| Consequences | Complexity, coupling, testing and operational costs |
| Revisit when | Observable condition that invalidates the choice |

State **No named pattern required** when ordinary functions, modules, or existing
repository conventions solve the problem cleanly.

## UML rules

Use Mermaid UML-style diagrams and keep their source in the Gate B technical plan. Include only diagrams
that answer a decision or implementation question:

- flowchart or component diagram for ownership and dependencies;
- sequence diagram for multi-party request, event, retry, or async flows;
- class/domain diagram whenever the feature adds or changes meaningful entities, value
  objects, services, invariants, or relationships; if omitted, state why the feature has
  no useful class/domain model to show;
- state diagram for lifecycle, permissions, transitions, or failure recovery;
- deployment diagram only when runtime topology changes.

Every diagram must agree with the written contracts and use repository/domain names.
Follow it with a short interpretation and the decision it supports. Update diagrams when
the approved design changes.

## Calculations and non-obvious logic

Gate B is the technical teaching document. Identify every formula, score, allocation,
threshold, ordering rule, eligibility condition, or compound boolean that a reviewer
could not infer immediately. For each relevant rule, show:

- the formula or truth rule with named inputs;
- units, ranges, precision, rounding, precedence, and boundary behavior;
- one small worked example;
- the plain-language reason for the rule and where it is owned in code;
- failure, zero, null, and overflow behavior when relevant.

Do not manufacture mathematical formalism for ordinary CRUD or obvious conditions.

## Seeds and QA

The seed plan must cover every specified behavior and relevant boundary condition with
the smallest useful scenario set. Seeds must be deterministic, idempotent, guarded from
production, use no real personal or secret data, and document setup plus cleanup/reset.
Prefer existing factories and seed infrastructure.

Separate:

- automated tests that pass the bundled development test-value gate;
- runtime/integration exercises;
- manual UI, accessibility, visual, provider, or exploratory QA;
- checks that cannot run locally and why.

Create a traceability table with at least:

| Requirement ID | Scenario | Risk/edge | Seed or fixture | Evidence route | Expected result | Status |
|---|---|---|---|---|---|---|

Do not turn a planned check into a claimed result. Static style, dimensions, getters,
setters, tautological equality, trivial wiring, and framework behavior do not justify
automated tests.

## Gate C implementation PRD output

Author `<feature>.prd.json` with the bundled document module implementation profile. Follow its
compact authoring contract rather than copying a Markdown template. Reference the approved
Gate B ID/revision and technical entry IDs. Keep requirements unique and acceptance observable.

Code tasks record dependencies, write scope, acceptance IDs, validation and seed responsibility.
Human-QA tasks record prerequisites, steps, expected observations and cleanup; they receive no
implementation agent, simplifier, Argus pass or PR. The renderer derives the dependency map.

Validate and render with `<skill-dir>/modules/prd/scripts/prd.mjs`. JSON is authoritative, HTML is the only
human-facing deliverable, and run JSON holds actual evidence separately. New source changes
invalidate stale run fingerprints; reopen affected gates instead of editing approved history.
