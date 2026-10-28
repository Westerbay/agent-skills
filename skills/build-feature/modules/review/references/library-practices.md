# Library checks for the installed stack

General and selected specialists apply only the sections relevant to the actual change.
The preparation manifest supplies detected dependencies; inspect local configuration and
source when detection is incomplete. Version-specific APIs require the installed version's
official documentation or source before a finding. A preference or deprecated spelling
alone is not a behavioral defect. Rank concrete impact, not checklist nonconformance.

## Validation libraries (including Zod)

- Parse untrusted input at the real boundary and preserve useful validation errors.
  `parse` is valid when its thrown error is intentionally handled; `safeParse` is useful
  for explicit result handling. Do not flag one merely for differing from the other.
- Check coercion/normalization against actual incoming values and the API contract.
  Query strings may need conversion; a framework may already supply parsed values.
- Reuse the schema owned by the contract when semantics match. Deriving a checked
  subset/extension can avoid drift; unrelated domains need not share identical shapes.
- Keep trusted internal values typed without redundant parsing. Validate external data
  even when a TypeScript declaration claims a shape.
- Check supported syntax and migration requirements against the installed major version.
  Prefer clear existing conventions over mechanical API-style rewrites.

## Query and cache libraries (including TanStack Query)

- Include inputs that change returned data or access scope in cache identity. Do not
  require every closed-over callable or constant to appear in the query key.
- After mutations, verify affected visible/cached data stays correct through the project's
  invalidation, direct update, reload or documented lifecycle mechanism.
- Follow the framework's hook rules and documented conditional-fetch API; inspect a
  sentinel/default for accidental requests or shared cache entries.
- Avoid duplicating key-driven fetching with an Effect and `refetch()`. Effects remain
  valid for genuine external synchronization not already owned by the query mechanism.
- Derive values from query data when possible; separate intentional editable drafts from
  accidental copies that lose synchronization. Preserve cancellation and error recovery.

## Persistence libraries (including Drizzle and Prisma)

- Use a transaction when several writes must be atomic, not for every loop by shape.
  Inspect rollback behavior, transaction ownership and external side effects.
- Investigate N+1, unbounded reads and wide hot-path queries using actual consumers and
  expected data volumes. A join is not automatically clearer or cheaper than alternatives.
- Handle absent rows and preserve provider errors needed by callers. Use the repository's
  established relational/query API without preferring one syntax universally.
- Follow repository migration generation, review and replay conventions. Account for
  required schema snapshots/journals; intentional supported manual migrations are valid.
- Never silently rewrite a migration already applied to shared data. Identify actual
  compatibility/data risk and use a forward migration under the authorized scope.

## Typed clients (including Eden Treaty and tRPC)

- Preserve actionable error status, payload and cancellation through wrappers.
- Prefer the existing typed client for a supported route when it preserves the needed
  contract. A direct request is not intrinsically wrong; verify the concrete reason,
  serialization, validation and error behavior before flagging it.

## Forms (including React Hook Form)

- Reuse the owning validation rules through the documented resolver or existing field
  mechanism; avoid divergent copies of one rule.
- Use documented controlled-input adapters where appropriate. Inspect feedback, focus,
  validation and state synchronization rather than banning `watch` or `setValue` by name.
- Short field adapters can remain local. Extract coordinated behavior when a coherent
  responsibility or reuse benefit makes it easier to understand and verify.

Add a rule only for a demonstrated recurring defect, stating the relevant version or
contract. Keep uncommon API details in official documentation rather than growing a
second manual inside the skill.
