# Review dimensions

Each reviewer reads the saved scope, the output contract, these shared rules, and only
its assigned dimension. Sequential single-agent passes use the same methodology.
The coordinator supplies exact paths; reviewers do not recollect a different Git diff.

## Shared rules

Find defects introduced by the change, backed by a concrete changed file/line and a
plausible user/caller impact. Read source outside the patch to verify consumers and
invariants. Do not infer intent from an unavailable document or screenshot. Record
missing context as a coverage limitation, not a finding.

Use the approved feature/task contract and actual repository instructions. Apply
language, library, architecture and style checks only when that stack or policy exists.
A stylistic preference alone is not a blocking defect. Do not flag intentional contract
changes without showing an unhandled consequence. Do not demand abstractions or tests
for trivial wiring. Confirm a suggested reusable utility actually exists before citing it.

Critical: concrete serious security, data-integrity, availability or core-behavior failure.
Warning: an actionable correctness, regression or maintainability defect with a real
consequence. Nit: a nonblocking improvement. Questions, speculation and unverifiable
library claims must not raise the verdict. Verify version-dependent claims against
available official documentation or local dependency source; report unavailable evidence.

Follow the JSON contract exactly, including coverage, counts and error reporting. Never
silently omit a file, failed check, or assigned dimension. Do not edit code or post comments.

## Quality

- For duplication, naming, dense control flow or mixed orchestration, apply the
  [maintainability guide](../../development/references/maintainability.md) as review
  criteria; it does not authorize implementation or change this review's scope/severity.
- Search repeated literals and regex fragments beyond the patch. Name the rule's owner,
  duplicated sites and affected consumers; compare acceptance and failure semantics before
  proposing reuse. Distinguish generated/cross-runtime repetition from drift-prone copies.
- For long functions, identify the mixed responsibilities and a cohesive split that
  preserves authorization, locks, transaction lifetime, side-effect order, cancellation,
  retries, errors and cleanup. A line count or number of guards alone is not a finding.
- Trace `unknown` from its producer to validation and consumers. Keep real untrusted,
  caught-error or heterogeneous boundaries; flag internal domain contracts widened without
  cause, unsafe assertions, or parser generics that promise an unvalidated caller-selected
  result. Recommend the owned type or actual validation, never `any` or an opaque substitute.
- Check accidental complexity, duplication of business rules, dead branches, swallowed
  errors, resource cleanup and needless abstraction introduced by the task.
- Trace null, zero, empty and failure behavior through real callers. Check useful error
  cause/status, bounded queries/provider concurrency, cache reuse and N+1 risks.
- On frontend changes, check state ownership, effect dependencies/cleanup where used,
  form validation, loading/error recovery, semantic controls, keyboard and focus behavior.
- Apply [library practices](library-practices.md) only for libraries actually present and
  the installed version. Repository contracts win over generic style preferences.

## Conventions

- Read the project's documented naming, file placement, type, formatting, generated-file,
  dependency, localization and error-handling conventions. Cite the applicable rule.
- Check that canonical schemas, types, constants, tokens, formatters and predicates are
  reused. Inspect all consumers before demanding a shared abstraction.
- Check assertion restrictions against the actual repository policy. Distinguish unsafe
  domain casts from literal `as const`, `satisfies` and import aliases; a textual match alone
  does not establish an unsafe conversion. Library-seam assertions need a verified invariant.
- Check that names describe actual operations, domain identifiers and boolean decisions
  at their current callers. Separate misleading semantics from personal naming taste.
- Verify locale/formatting behavior where localization exists or the feature requires it.
  Do not import another project's bans, TODO formats, component APIs or package choices.

## Regression

- Collect changed public symbols, defaults, schema shapes, cache keys and domain values.
  Search every caller, including omitted/default arguments, aliases and re-exports.
- Trace write/read paths, UI/export/background consumers, legacy records and migration
  effects. Check behavioral compatibility against the approved impact map.
- When validation is consolidated, check acceptance parity and local error behavior at
  the real entry points, including another runtime when it shares the contract.
- Confirm regression checks exercise the changed seam rather than only a new pure helper.
  Compare equivalent list/detail, create/update and sync/async paths where relevant.

## Logic

- Map each acceptance requirement to implementing behavior and evidence. Identify missing
  paths or contradictions, not features outside the approved scope.
- Check units, boundaries, rounding, ordering, eligibility, status transitions, mixed
  aggregates and ownership of each business rule.
- Examine concurrency, stale state, retries, duplicate delivery and idempotency where the
  actual workflow permits them. Use plausible domain inputs, not hypothetical extremes.
- Use inspected design requirements for functional UI coverage; unavailable visuals remain
  unverified. Template decoration is not automatically a functional requirement.

## Architecture (full)

- Check module ownership, dependency direction, transaction/orchestration boundaries,
  public and persisted contracts against the approved technical plan.
- Flag concrete coupling, bypassed enforcement, shared-surface drift or costly failure
  semantics. Do not require a named pattern or redesign an accepted boundary on taste.
- Inspect migration/rollout compatibility and integration across tasks, including cache,
  provider and background paths. State where evidence cannot establish runtime safety.

## Security (full)

- Apply [security-audit integration](security-audit-integration.md) and the selected
  installed companion guidance. Preserve its execution controls and certainty states;
  unresolved security hypotheses belong in notes/coverage gaps, never ranked findings.

- Trace untrusted input, authentication, authorization, tenant/ownership scoping and
  secrets through the actual access path. Check every entry point that can bypass rules.
- Examine injection, unsafe deserialization, path traversal, request forgery, unsafe
  redirects, sensitive logging, data exposure and resource abuse when relevant.
- Check external side effects, payment/webhook verification and replay handling only
  where the feature touches them. Never test against live production or real payments.
- Security findings require concrete evidence and impact; they are never nits. Unverified
  concerns remain explicit notes requiring investigation, without claiming a proven flaw.
