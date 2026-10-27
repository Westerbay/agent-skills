# Modular design while implementing

Apply these decisions while adding or changing behavior, before coupling accumulates.
Use the existing architecture and language idioms; functions and modules can express
these principles without classes, interfaces, or a dependency-injection container.
Keep the work proportional to the feature. No separate review workflow is required.

## Design around the change being made

Name the rule owner and a concrete supported variation from the request or existing
consumers. Trace which modules must change and which should remain unaffected. Use
that scenario to choose a boundary; do not invent a future feature to justify one.
Preserve public APIs, import paths, wire formats, and persisted contracts unless their
change is authorized. Perform in-scope internal refactors directly; seek a scope
decision before a material architecture expansion or unrequested contract migration.

## Apply SOLID to real responsibilities

- **SRP — one coherent reason for change.** Keep rules that evolve together with their
  domain owner. Separate independently changing policy, presentation, and storage when
  they become interleaved. An application operation may coordinate several focused
  collaborators without owning all their rules. A tiny class per algorithm step does
  not improve responsibility; neither does moving unrelated rules into `utils`.
- **OCP — extend a demonstrated variation.** When another supported provider or behavior
  repeats branching across callers, introduce a small capability, strategy, or function
  map at the actual variation point. Keep registration in an explicit composition
  point. Preserve exhaustive switches for genuinely closed domain states; a new state
  may correctly require consumers to change. Avoid speculative plugin frameworks,
  untyped registries, and optional flags that hide missing required behavior.
- **LSP — preserve the caller's behavioral contract.** Interchangeable implementations
  must accept the contract's inputs and preserve promised results, invariants, mutation,
  failure categories, cancellation, and lifecycle semantics. Matching signatures is
  insufficient. Do not make a substitute silently succeed, ignore work, strengthen
  preconditions, or reject a required operation as unsupported. Adapt the semantics
  explicitly or expose a narrower capability when implementations genuinely differ.
- **ISP — expose the capability each consumer needs.** Derive contracts from actual
  callers. Separate reading from writing when consumers or adapters need that distinction;
  do not force unsupported methods or unrelated dependencies on them. Keep operations
  together when they share an invariant, transaction, or lifecycle. One interface per
  method or implementation is not a goal.
- **DIP — let policy own its requirements.** Put a replaceable boundary's contract with
  the consuming domain/application module or an established neutral contract package.
  Map vendor records and failures inside adapters instead of leaking their types through
  the policy. Construct and inject adapters at the composition point, using simple
  parameters or constructors where sufficient. Do not import an adapter just to obtain
  its interface/token, hide dependency discovery in globals, or wrap every stable helper.

## Make files reveal ownership

Organize code so a reader can find one operation, its contract, adapters, and tests
without understanding unrelated features. Keep cohesive code together; split a file
or folder when independent concerns or navigation justify it, not to hit a count.
Respect framework routing and discovery conventions. Avoid both a flat collection of
unrelated helpers and deep chains of folders containing only forwarding wrappers.

Hide implementation choices behind a deliberate module surface. Check deep imports,
re-export barrels, cycles, shared mutable state, and direct access to another module's
tables; folder separation alone does not create a boundary. Promote shared code only
when consumers share its meaning and expected evolution. Equal shapes in independent
domains can require translation rather than one global model.

## Use the scenario to implement and verify the seam

For example, when the request adds CSV output beside existing HTML reports, inspect
both the interactive report route and scheduled report job. Keep report eligibility
and data selection with the reporting owner; add format-specific rendering at the
existing presentation seam. Wire the new renderer where those consumers select their
format. Preserve existing HTML output and job error behavior. A new registry or export
framework is unnecessary if a small explicit composition already handles the variation.

Move one coherent responsibility at a time and update every affected consumer. Exercise
the changed path through the actual application boundary, not only the new helper.
Use existing meaningful tests; add focused contract protection when a plausible defect
otherwise escapes. Check input/output mapping and relevant error, cancellation, ordering,
transaction, and cleanup behavior across the seam. Mocks alone cannot verify a real
adapter's semantics. Run relevant type/import/build and integration checks, then search
for stale callers, obsolete exports, disconnected implementations, and duplicated rules.

Replay the original scenario against the finished code. The seam should reduce the
necessary change surface and still be used by real consumers. Remove scaffolding added
by the refactor when no longer needed. Report unverified boundaries instead of claiming
that a cleaner dependency graph proves correct runtime behavior.

## Source rationale

This is an original implementation guide informed by primary sources, checked on
2026-10-27. They support reasoning about change and contracts, not universal file limits.

- [Parnas, decomposition criteria](https://prl.khoury.northeastern.edu/img/p-tr-1971.pdf): hide design decisions that vary behind module boundaries.
- [Martin, SRP](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html) and [design principles](https://staff.cs.utu.fi/~jounsmed/doos_06/material/DesignPrinciplesAndPatterns.pdf): responsibility and dependency direction.
- [Liskov and Wing, behavioral subtyping](https://www.cs.cmu.edu/Groups/venari/subtype-toplas.html): compatibility is behavioral, not only structural.
- [Fowler, dependency injection](https://martinfowler.com/articles/injection.html) and [YAGNI](https://martinfowler.com/bliki/Yagni.html): separate construction from use while delaying speculative capability.
