# Components and reusable behavior

Find reusable concepts through real consumers and rules that should change together.
Similar markup is evidence to investigate, not proof that unrelated domain features
need one generic component. Search the repository's primitives, composition patterns,
hooks/composables, and route utilities before introducing another abstraction.

## Choose the useful seam

| Repeated concern | Candidate seam | Contract to establish |
| --- | --- | --- |
| Same semantic interaction and presentation | A focused component | Roles, labels, state, events, variant differences, composition slots |
| Same stateful behavior with different presentation | A hook, composable, controller, or framework equivalent | Inputs, returned behavior, lifetime, cancellation and cleanup |
| Same pure domain decision | A domain predicate or transformation | Inputs, output, rule owner and meaningful edge behavior |
| Same route metadata policy | A route-aware builder owned by delivery | Origin, locale, entity identity, indexability and override rules |
| Similar visuals with different business rules | Composition of smaller primitives | Which primitive is truly shared; which policy remains feature-local |

Prefer an explicit domain name over `GenericComponent`, `useCommon`, or a growing
`utils` module. A successful extraction reduces the number of places that must change
for one actual requirement. Name a concrete consumer change to demonstrate that gain.

## Review state and effects separately from markup

Trace who owns state, who may change it, and which inputs establish its identity.
Preserve controlled versus uncontrolled contracts, defaults, callback timing, and
loading/error behavior. Shared logic must not accidentally create shared mutable state.
In React, two calls to a custom hook are independent; a hook shares logic, not one state
instance. Prefer use-case-oriented hooks to lifecycle wrappers that conceal dependencies.
See [React's custom-hook guidance](https://react.dev/learn/reusing-logic-with-custom-hooks).

When multiple consumers must coordinate one state, identify an explicit common owner
instead of synchronizing duplicated state with effects. In React, lifting that state
to the nearest suitable common parent is one established option; follow the equivalent
idiom in the actual framework. See [React's state-sharing guidance](https://react.dev/learn/sharing-state-between-components).

On extraction, inspect subscriptions, timers, requests, teardown, stale closures,
cancellation, cache keys, and SSR/browser boundaries where relevant. A visually identical
refactor can change effect lifetime or leak one account's state into another instance.
Do not add a global store merely to remove a few explicit parameters.

## Avoid abstractions that multiply change

Investigate components driven by unrelated booleans such as `isCheckout`, `isAdmin`,
`isCompact`, `isEditable`, and `isMarketing`. Identify valid combinations, then prefer
named variants for one cohesive axis or composition for independent responsibilities.
Do not replace a small clear component with a schema interpreter or plug-in framework.

Keep a component near its feature until actual consumers justify wider ownership.
Colocate related UI, behavior, and tests according to project conventions; do not create
one file per trivial expression or promote feature policy into a global component folder.
Split when responsibilities, dependency direction, or navigation become clearer, not
solely to reach a line-count quota.

For example, two forms may share a labeled error field but have different submission
rules. Extract the field's label/ID/error relationship and retain the distinct submission
owners. For a repeated pagination control, share its interaction contract while keeping
cursor semantics and data ownership explicit in callers. A shared component must not
silently choose a page size or reset state for every existing consumer.

## Prove the extraction through consumers

Inspect every call site of a changed shared contract. Exercise at least the materially
different consumers, including two simultaneous instances where state isolation matters.
Cover meaningful behavior such as keyboard selection, error recovery, cancellation,
form submission, or route changes. Keep validation near the consumer-visible seam;
do not test that a particular private helper was called or that a wrapper exists.
This follows [Testing Library's user-oriented principles](https://testing-library.com/docs/guiding-principles/)
without requiring that library or prescribing a particular test architecture.

Report the before/after ownership and the demonstrated maintenance gain. Defer an
extraction when its contract remains speculative or its added configuration would be
harder to understand than the existing duplication. In authorized refactor mode, perform
the justified extraction, update all affected consumers, remove obsolete paths, and
validate the behavior rather than leaving a generic recommendation.

Sources were consulted on 2026-10-27. React examples apply only to React; verify the
installed framework's APIs before translating the same design concerns to another stack.
