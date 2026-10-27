# Readability, refactoring, and measurement

Use repository and language conventions as the baseline. A useful finding identifies a
reader's likely misunderstanding or the concrete cost of the next change. Personal
formatting preferences belong to the existing formatter, not a competing review policy.

## Names express the domain and the contract

- Name values by meaning and role: `remainingAttempts`, `invoiceTotalCents`,
  `expiresAtUtc`, `isEligibleForRenewal`. Avoid vague `data`, `result`, `item`, `flag`,
  numbered variables, or abbreviations when their scope makes the referent unclear.
  Conventional short local loop indices can be perfectly clear.
- Prefer a positive predicate to a double negative. Distinguish eligibility, permission,
  state, and a completed action: `canReserve` does not mean `hasReserved`.
- Expose meaningful units and lifecycle in names. A duration is not a timestamp; a
  user-supplied identifier is not a validated identity. Do not add a type suffix that
  merely repeats an obvious language type.
- A function name should set the right expectation about returned values, mutation,
  I/O, and failure. A `get...` operation that reserves capacity is misleading.
- Keep local terminology consistent with its domain owner. Check serialization,
  reflection, dependency injection, templates, and external callers before a rename;
  a source-level rename can change runtime contracts.

Google's [review guidance](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
supports assessing names, complexity, tests, and unnecessary generalization in context.
Apply those concerns to an actual caller or maintenance task, rather than scoring style.

## Name decisions instead of making readers parse logic

For a condition containing mixed operators or independent business concepts, identify
the actual decisions and give each a domain name. `reasonA` and `reasonB` only hide the
expression; `hasOutstandingBalance` and `isWithinGracePeriod` explain it. Keep a short,
obvious comparison inline when an extra name would add no meaning.

For pure, stable input values, this is clearer than a multi-clause `if`:

```javascript
const hasOutstandingBalance = balanceCents > 0;
const isWithinGracePeriod = daysOverdue <= gracePeriodDays;
const mayDeferCollection = hasOutstandingBalance && isWithinGracePeriod;

if (mayDeferCollection) {
  scheduleReminder();
}
```

Before extracting expressions, establish their evaluation semantics:

- Do not eagerly evaluate an operand previously protected by `&&`, `||`, an optional
  access, or a guard. An apparently simple property read can call a getter.
- Keep ordering and multiplicity of calls, mutations, exceptions, asynchronous work,
  expensive computations, and time-dependent reads. Use a lazy predicate or retain the
  guard when moving an expression would change those properties.
- Preserve operator precedence with explicit grouping. Bitwise `&`, `|`, and XOR are
  not interchangeable with logical operators; JavaScript bitwise operators also coerce
  values. Do not translate the user's pseudocode into a different truth table.
- When changing branch structure, enumerate meaningful combinations including null or
  absent values. Verify side effects as well as results where ordering is observable.

Useful refactorings from Martin Fowler's *Refactoring*, second edition, are
[Extract Variable](https://refactoring.com/catalog/extractVariable.html) and
[Decompose Conditional](https://refactoring.com/catalog/decomposeConditional.html).
Use them to reveal a decision, not to distribute one dense expression across arbitrary
temporary names. Guard clauses can clarify exceptional paths; preserve cleanup and
transaction boundaries when introducing early returns.

## Small functions with useful boundaries

Extract an operation when it has a meaningful name, a coherent responsibility, a useful
test seam, or an independently changing policy. Keep orchestration at one level of
abstraction: a function should not mix business decisions with parsing bytes, formatting
markup, and persisting records in one uninterrupted block.

Inspect the extracted function's inputs and outputs. Numerous parameters, mutable shared
state, a boolean mode flag, or a caller that immediately unpacks unrelated results may
mean the boundary is wrong. Prefer local/private extraction first; promote sharing only
when real consumers share the same rule. Do not export an implementation detail solely
to test it.

Fowler's [Extract Function](https://refactoring.com/catalog/extractFunction.html) gives a
way to name cohesive work. Its inverse is equally relevant: inline a forwarding wrapper
that conceals no decision and only makes navigation harder. Splitting every few lines
can make a small algorithm harder to understand than keeping it together.

## Constants and duplication carry ownership

Replace unexplained business literals, sentinels, limits, conversion factors, and time
units with an existing named contract or a constant at the owning boundary. Use language
or protocol constants when they express the same meaning. Obvious indices, increments,
and empty values do not need named constants merely because they are literals.

Search by meaning as well as value. Two equal numbers with different policies must not
be coupled; one policy copied under different names still needs a single owner. Check
that all relevant consumers use the authoritative value and that changing it has the
intended runtime effect. Avoid a global constants file that crosses module boundaries.
This applies [Replace Magic Literal](https://refactoring.com/catalog/replaceMagicLiteral.html)
without turning every value into configuration.

## Metrics locate questions; evidence decides findings

Use tools already configured in the repository. Record the analyzer/version, scope,
exclusions, and definition, especially when comparing before/after values. Do not invent
precise complexity scores from a visual impression or install an analyzer just to score
a small diff. Label manual estimates and unavailable measurements explicitly.

| Signal | What to inspect | How to avoid a false conclusion |
| --- | --- | --- |
| Function and file LOC | Long changed functions; files mixing separately changing responsibilities | Distinguish physical lines from nonblank/noncomment source lines. Exclude generated/vendor code and compare like languages. A long declaration or table can be clearer intact. |
| Cyclomatic complexity | Independent control-flow paths and meaningful case coverage | Use the configured analyzer's rule and variant. It does not measure human comprehension or require a test per counted path. |
| Cognitive complexity | Nested control flow and interruptions that burden the reader | Review individual functions. A repository-wide total mostly follows repository size. |
| Maximum nesting | Decisions obscured by loops, conditionals, exception handling, or callbacks | A guard or named operation helps only if behavior and cleanup stay correct. |
| Duplication and change coupling | The same rule edited in several places; repeated failure-prone decisions | Textual resemblance alone is insufficient evidence that concepts share an owner. |
| Churn, when history is available | Complex code repeatedly changed or fixed | Use history as a prioritization signal; stable complex code can still matter and recent churn is not itself a defect. |

Honor established thresholds. Without them, report the largest relevant functions/files
and nesting hotspots with their concrete responsibilities; do not invent a universal
LOC maximum or split files just to lower it. For cognitive complexity, Sonar's documented
defaults of 15 for most languages and 25 for C/C++/Objective-C can be advisory starting
points. The [rule author's explanation](https://community.sonarsource.com/t/s3776-reason-for-the-current-default-value-of-15/127103)
describes empirically tuned, adjustable defaults, not scientific limits.

[ESLint's complexity rule](https://eslint.org/docs/latest/rules/complexity) illustrates
why tool configuration matters: the allowed maximum and counting variant are configurable.
A threshold breach is an investigation prompt. A finding still needs the confusing
decision, mixed responsibility, or change hazard and a better boundary. Lowering a
score by hiding control flow in tiny helpers is not sufficient improvement.

Sources were checked on 2026-10-27. Thresholds and rule behavior can change; consult the
installed analyzer's documentation when making version-specific claims.
