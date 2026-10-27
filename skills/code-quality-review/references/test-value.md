# Behavioral test value and portfolio review

The preferred portfolio for this skill is **80% unit / 15% integration / 5% end-to-end**.
It is the user's target for the distribution of tests, not an 80% code-coverage goal.
Keep a visible alert for deviation, then investigate value and missing coverage before
recommending changes. A ratio alone never justifies deleting a test or adding filler.

## Classify actual boundaries

Inspect test setup, execution, assertions, and dependencies instead of trusting folder
names or framework labels:

- **Unit:** a narrow behavior exercised through a stable callable/component boundary,
  with external systems controlled. Several collaborating in-process objects can form
  one unit. A rendered component test is not automatically E2E.
- **Integration:** a real collaboration boundary is exercised, such as application plus
  database, request routing plus serialization, a provider adapter, or a verified
  consumer/provider contract. Identify which boundary adds confidence.
- **E2E:** a representative user or system journey crosses the assembled application
  through its external boundary. Browser automation with a fully stubbed backend does
  not automatically establish full-system behavior.
- **Other/unknown:** report benchmarks, static checks, manual checks, ambiguous suites,
  and unclassified tests separately. Map contract/component tests by actual scope;
  do not force labels just to improve the percentage.

Use existing runner inventory or reports when safe and available. Test discovery itself
may execute imports or hooks; inspect commands before running unfamiliar code. Count
unique executable cases, not files, assertions, CI retries, or browser-matrix repetitions.
State how parameterized cases are counted and use the same convention before and after.
For very large generated case sets, also show scenario counts to expose distortion.

Report counts `U`, `I`, `E`, the classified denominator `N = U + I + E`, and percentages
`100 * count / N`; show skipped and unknown counts separately. With `N = 0`, percentages
are unavailable, not zero. State the inspected scope: a changed subset is not a complete
repository inventory. If classification is incomplete, label the proportions provisional.
Keep the baseline portfolio and changed-test mix distinct when both are useful.

For a known mix different from 80/15/5, show a **portfolio deviation** alert with actual
percentages, percentage-point differences, and relevant context. Explain small-sample
rounding, service/component architecture, runtime cost, and missing boundaries. The
alert is advisory; high-impact gaps or redundant tests, not the numerical difference,
determine the severity of findings. If no evidence supports removal, say so.

Google's [2015 testing article](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
offers 70/20/10 as an initial guess and says the mix varies by team. *Software Engineering
at Google*, [chapter 12](https://abseil.io/resources/swe-book/html/ch12.html), gives a rule
of thumb of about 80% unit and 20% broader tests. Neither establishes 80/15/5 as a universal
requirement. Preserve a justified project-specific strategy and explain its tradeoff.

## A test must protect something that can meaningfully fail

For each questioned or proposed test, answer:

1. Which caller-visible behavior, invariant, regression, transformation, failure mode,
   or real integration contract does it protect?
2. What plausible defect would make it fail, and would that defect matter?
3. Does the assertion distinguish correct behavior from that defect?
4. Is this the cheapest reliable boundary that preserves the needed confidence?

Avoid tests that only echo an assigned value, inspect a constant, verify trivial
getters/setters, mirror an implementation's private call sequence, or retest a framework.
A getter or setter that enforces validation, normalization, state transitions, or another
invariant does have behavior; assess that behavior through a meaningful boundary instead
of banning all property access tests.

An equality assertion is useful when it proves a business result; it is tautological
when it compares a test-controlled value with itself. An interaction assertion is useful
when the interaction is the contract, such as issuing one payment after successful
authorization; it is brittle when it merely checks an incidental helper invocation.
Do not replace all collaboration tests with mocks that can agree with the same mistake.

Name tests by scenario and outcome. Keep causes close to assertions, avoid hidden shared
state and time dependencies, and prefer deterministic fixtures. One behavior may span
several methods; one method may contain several independently useful behaviors. This
follows Google's [Test Behaviors, Not Methods](https://testing.googleblog.com/2014/04/testing-on-toilet-test-behaviors-not.html).
Do not add a test for every extracted private helper.

## Identify safe cleanup candidates

For each candidate, give the test name/path, protected behavior, unique boundary, known
cost or brittleness, proposed keep/rewrite/move/delete action, and replacement coverage.
Mark costs unknown if no timing/flakiness evidence exists.

Typical candidates are a trivial value echo, an obsolete scenario after an authorized
behavior change, duplicate permutations already checked at a cheaper boundary, or an
assertion coupled only to a private implementation. A failing test is not redundant
merely because deleting it makes the suite pass.

Before removing or moving a case:

- Identify the remaining test that catches the same plausible defect, or explain why
  the removed test asserts no meaningful behavior. Add replacement protection first
  when needed, then run the relevant tests.
- Preserve the distinct integration seam: transaction semantics, actual serialization,
  permission enforcement, production query behavior, browser navigation, and wiring
  cannot be established just by testing pure helpers.
- Keep representative critical journeys. Move repetitive business-rule permutations
  down where justified, while retaining the assembly checks that those tests cannot
  provide.
- Re-run affected suites and inspect the final diff for lost negative/error cases.
  State unverified protection when the environment cannot exercise the boundary.

Ham Vocke's [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
explains lower-level coverage and avoiding duplication while preserving the additional
confidence supplied by higher-level tests. Apply that tradeoff per behavior, not as a
mandate to remove every slow test.

Coverage reports, targeted mutation checks when already available, and prior regressions
can reveal weak assertions. Coverage alone does not prove correct behavior. Do not add
getters/setters, snapshots of static styling, or constant checks to raise a number.

Sources were checked on 2026-10-27. These are original review instructions informed by
the linked sources, not copied book or article text.
