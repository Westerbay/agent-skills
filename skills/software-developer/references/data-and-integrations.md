# Data and integrations

Read this reference when changing repositories, database-backed workflows, transactions,
migrations, background work, or external providers.

## Persistence and orchestration

- Keep repositories as persistence adapters. Return explicit data or outcomes; do not
  pass application callbacks into repositories.
- Open transactions in the application service when atomic work spans repositories or
  modules, then instantiate transaction-scoped dependencies.
- Keep external side effects outside the database transaction when appropriate, while
  defining post-commit behavior, idempotency, retry, ordering, and failure visibility.
- Reuse a single domain predicate or status set across queries, services, and UI instead
  of duplicating similar conditions.
- Enforce invariants on every write path. If create, update, import, retry, admin, or
  background paths differ intentionally, name and test the difference.
- Make externally visible side effects idempotent where retries or repeated state
  transitions are possible.
- Distinguish domain concepts even when their values currently match.

## Correctness and efficiency

- Check null, mixed, partial, concurrent, retry, stale-state, and rollback behavior—not
  only the happy path.
- Check how existing rows behave when a new column, default, locale, permission, status,
  or configuration source becomes authoritative; add a backfill when required.
- Check authorization and ownership inside the actual data access path.
- Look for redundant queries, unbounded reads, N+1 or fan-out calls, repeated provider
  lookups, missing cache reuse, and indexes that do not match filtered access paths.
- Bound concurrency and surface partial failures for external calls.

## Schema and provider workflows

- Generate migrations with repository tooling. Inspect SQL, constraints, indexes,
  snapshots, and delete/update behavior.
- Document intentional hand edits and protect schema drift when the schema tool cannot
  express them.
- Keep temporary developer scenarios out of migrations; use the seed workflow instead.
- Validate external configuration against the actual provider only when safe and
  authorized. Do not present an interactive default or unverified assumption as a
  guarantee.
- Verify provider/runtime names, units, limits, redirect behavior, and shutdown/retry
  semantics against the real contract rather than a plausible local name.
- For infrastructure-as-code, inspect the deployed identity and replacement semantics of
  renamed resources. Use the repository's alias/import/migration mechanism when a rename
  would otherwise create-before-delete or replace stateful infrastructure.
