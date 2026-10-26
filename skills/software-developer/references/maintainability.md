# Maintainability at the change boundary

Use this guide when repeated rules, unclear names, or control flow make the changed code
hard to follow. Keep the repository's conventions and the authorized behavior as the
contract. A clean-code pass should make ownership and execution easier to verify.

## Repeated validation and literals

1. Search the entire relevant source tree for the repeated value or regex fragment,
   including CLIs, background consumers and sibling adapters. Inspect an existing schema
   before adding another helper. Separate source definitions from generated occurrences.
2. Identify the rule's semantic owner. Equal-looking patterns can describe different
   domains; identifier, UUID and provider-reference validation need not share a contract.
3. Compare accepted values and failure behavior before substituting validators: whole
   string matching, anchors, flags, Unicode, newlines, bounds, optional values, coercion,
   normalization, and errors where relevant. A cleanup must not silently change acceptance.
4. Reuse the owning schema or predicate per runtime. Keep boundary validation at each
   untrusted entry point while sharing its definition. Preserve local error translation.
   Across languages, prefer an existing generated contract or shared compatibility vectors;
   do not introduce a runtime dependency just to remove repeated syntax.

For example, when several callers validate the same opaque key-version identifier:

```ts
// Before: each caller owns a copy of the same rule.
if (!/^[A-Za-z0-9_-]{1,256}$/.test(keyVersionId)) {
  throw new InvalidPayloadError()
}

// After: import the existing schema from the module that owns this contract.
if (!keyVersionIdSchema.safeParse(keyVersionId).success) {
  throw new InvalidPayloadError()
}
```

The second form is justified by shared semantics and real consumers. It is not a reason
to create a generic `isValidId` for unrelated identifiers. Verify parity through existing
consumer tests and a focused regression case when the substitution has a plausible risk.

## Types after validation

Trace where an untrusted value acquires a domain meaning. Keep `unknown` at that real
boundary until a schema or sound type guard establishes the contract, then propagate the
owned domain type through internal consumers. Caught errors and genuinely heterogeneous
containers can also need narrowing; their use of `unknown` is not itself a defect.

```ts
// Unsafe: the assertion promises an AnalysisJob without checking the input.
const job = JSON.parse(text) as AnalysisJob

// Validated: the existing schema establishes the domain contract.
const input: unknown = JSON.parse(text)
const job = analysisJobSchema.parse(input)
```

Do not replace the assertion with `parse<T>(text): T` unless the output is actually linked
to and established by runtime validation. Replacing `unknown` with `any`, `{}` or `object`
also loses useful guarantees. Review the actual producer, validation and consumers before
flagging an annotation. Literal `as const`, `satisfies` and import aliases are not equivalent
to asserting an unvalidated domain object; apply any explicit repository restrictions.

## Names and control flow

- Use domain terms and language conventions. An operation named `upload` should make
  clear whether it reserves an upload, transfers bytes, or publishes the result. A
  callback runner that owns cancellation might be `withRequestCancellation`; a boolean
  might be `hasMatchingSelection`. Avoid vague `check`, `handle`, `data` or `id` when the
  surrounding scope does not disambiguate them.
- Prefer early guards for invalid states and name compound domain decisions. Keep the
  obvious single comparison inline. Do not merge distinct errors, reorder effectful
  expressions, or hide important branching behind a generic helper merely to shorten it.
- A sequence of guards is often readable. Inspect the decisions and their dependencies,
  not just the count of `if` statements. Follow the repository's brace and formatting rules.
- Split a long orchestration function along coherent operations, such as loading and
  validating a job, publishing its preview, and publishing its result. Keep lifecycle
  ownership visible in the caller. Avoid a helper per line or a generic framework whose
  switches reproduce the original complexity.
- Before moving code, record the relevant execution guarantees: authorization before
  protected access, lock and transaction lifetime, separately committed reservations,
  conditional state transitions, retries, cancellation, external side-effect order and
  cleanup after both success and failure. Exercise these seams after extraction.

## Review and calibration

A maintainability finding should identify the exact sites, the duplicated rule or mixed
responsibilities, the concrete change/verification burden, and the smallest useful fix.
Verify the proposed owner and all affected consumers. Give a short before/after example
when the improvement is otherwise hard to assess; label it as a proposal.

Respect existing review scope and severity. Separate a documented convention violation
from a supported maintainability concern and a personal preference. Repetition counts,
function lengths, and lint scores alone do not establish impact. Generated schemas,
necessary cross-language implementations and distinct boundary checks are not automatic
extraction candidates. Small similar blocks can remain separate when sharing would add
options, coupling, or obscure their different behavior.

## Sources and scope

These are references for judgment, not replacement repository policies:

- [TypeScript handbook: unknown and generic functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)
  for boundary narrowing and the relationship between input and output types.

- [Google TypeScript style guide](https://google.github.io/styleguide/tsguide.html) and
  [PEP 8](https://peps.python.org/pep-0008/) for language-specific naming and consistency.
- [Martin Fowler: guard clauses](https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html)
  for reducing nested control flow while retaining explicit guards.
- [Sandi Metz: the wrong abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
  for evaluating the cost of sharing superficially similar code.
- [ESLint complexity](https://eslint.org/docs/latest/rules/complexity) and
  [Ruff C901](https://docs.astral.sh/ruff/rules/complex-structure/) for configurable signals.
