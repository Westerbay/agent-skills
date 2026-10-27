# Review SOLID through contracts and change

Apply these questions to functions, modules, records, protocols, and components as well
as classes. A language does not need inheritance or a dependency-injection container
to express good boundaries. The review probes below are practical applications, not
universal requirements to introduce each named pattern.

## SRP: locate the independent reasons for change

Robert C. Martin connects responsibility to the people and policies that cause change,
rather than to an arbitrary method count. Code that evolves for one concern should be
cohesive; unrelated concerns should not force each other to change.
[Primary explanation](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)

Inspect a suspected module by naming its rules and their owners. For example, document
eligibility, HTML presentation, and database serialization may change independently.
Trace the paths that currently enforce each rule. A large application operation that
coordinates focused collaborators can be cohesive; five tiny classes that all reach
into one mutable bag may not be.

Evidence worth reporting:

- A presentation change requires editing the same routine that decides eligibility,
  with interleaved branches and tests that cannot isolate either concern.
- The same policy is independently implemented by API, batch, and UI paths, so changing
  it requires synchronized edits that can drift.
- One module exports unrelated operations whose consumers use disjoint subsets and
  whose dependencies change for different reasons.

Prefer extracting or moving the policy to its owner and keeping orchestration explicit.
Do not split every step of an algorithm into a separate class or file. Before merging
similar code, confirm it represents the same business rule and evolves together.

## OCP: identify the variation that deserves an extension point

OCP concerns adding behavior through a stable boundary. It does not mean existing source
can never be modified. Protection against change must target a particular anticipated
variation; it is not achievable against every imaginable future requirement.
[Martin on OCP](https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html)
and [its limits](https://blog.cleancoder.com/uncle-bob/2013/03/08/AnOpenAndClosedCase.html).

Use a real supported variant or requested next feature as the probe. If another export
format requires editing repeated format switches in validation, rendering, scheduling,
and delivery, inspect whether these paths share a missing format contract. A small
strategy, function map, or adapter may localize the change. Show which edits it removes.

Accept an exhaustive local switch for a genuinely closed set of domain states; compile
errors at its consumers can be useful when the domain itself changes. Do not suppress
those errors with an untyped registry. Registration at one composition point, tests,
and feature-specific configuration remain legitimate edits in an extensible design.

Check extension failure modes: unknown variant, duplicate key, required capability,
ordering, default, and lifecycle. Avoid reflection, dynamic loading, inheritance trees,
or plugin frameworks unless the actual deployment or runtime extension requirement
justifies them. Do not implement the hypothetical variant merely to demonstrate OCP.

## LSP: validate the behavior promised to consumers

Liskov and Wing define subtyping in terms of preserved behavioral properties. Matching
method signatures alone is insufficient. Review accepted inputs, promised results,
invariants, observable state changes, and failure behavior at the caller's contract.
[Primary paper](https://www.cs.cmu.edu/Groups/venari/subtype-toplas.html)

Compare implementations using the same meaningful scenarios. A substitute must not
require a narrower input than the contract permits or return weaker guarantees. Also
inspect mutation, ownership, ordering, retries, cancellation, and error categories when
the shared contract exposes them. A read-only implementation that throws for a required
write operation is a capability mismatch, not interchangeable storage.

Test behavioral substitutions through the public seam, ideally with a shared contract
suite for real adapters and representative failures. A fake that silently accepts cases
the real adapter rejects can conceal a contract defect. Do not demand identical internal
algorithms or performance unless the contract includes that requirement.

If a substitute cannot honor the contract, narrow the advertised capability, adapt its
semantics explicitly, or separate the operation. Do not conceal incompatibility behind
default success, no-op methods, caller type checks, or swallowed exceptions.

## ISP: expose capabilities that clients actually need

Interface segregation prevents clients from depending on operations unrelated to their
use. Dependency inversion keeps policy separate from replaceable details. These are
design principles about dependencies, not quotas for interfaces.
[Martin, Design Principles and Design Patterns](https://staff.cs.utu.fi/~jounsmed/doos_06/material/DesignPrinciplesAndPatterns.pdf)

List consumers against operations before splitting a contract. Look for forced stubs,
unsupported-operation exceptions, unrelated deployment dependencies, and widespread
changes to clients that never use the edited operation. Split by coherent capability:
for example `ReportReader` and `ReportWriter` when real clients or providers differ.

Do not produce one interface per method automatically. Keep operations together when
they share a transaction, lifecycle, invariant, or naturally cohesive consumer need.
Preserve a combined contract where existing clients legitimately need both capabilities.
Do not make a required operation optional merely to satisfy a partial implementation.

## DIP: keep policy ownership independent of adapters

Trace dependency direction from domain or application policy into infrastructure. An
interface owned by a database package can still force consumers to import that package,
expose ORM entities, or accept vendor-specific exceptions. The useful seam belongs with
the consumer's required capability or an existing neutral contract boundary.

For example, a report operation may accept a function or port that retrieves its input.
An adapter can translate external rows into the owned contract. The composition point
selects the adapter; the report policy does not discover it from a global container.
Keep identifiers and units explicit across the seam.

Separate service construction from service use; simple parameter or constructor
injection often suffices. A container is optional and does not by itself establish DIP.
[Fowler, Dependency Injection](https://martinfowler.com/articles/injection.html)

Check all callers and defaults after introducing a dependency. Preserve lifetime,
transaction context, cancellation, resource cleanup, and error translation. A required
dependency must not become an optional parameter that silently disables behavior.
Do not wrap every standard-library function or stable local helper in an interface.

## A useful evidence pattern

Weak: "This service violates SOLID; add an interface."

Actionable: "The reporting policy imports `SqlReportStore` only to obtain its record
type. That type exposes database column names to both HTML and CSV consumers. A storage
rename therefore changes three delivery paths. Move the report input contract to the
reporting module, map it in the SQL adapter, and retain the public reporting signature.
Run both delivery-path tests and the adapter mapping test."

Use actual inspected symbols and locations in a real review. This example supplies a
reasoned structure, not evidence about the target repository.
