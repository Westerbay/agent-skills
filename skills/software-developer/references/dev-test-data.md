# Non-production test data

Read this reference when a new or changed feature cannot be meaningfully tested because
the local or isolated test database lacks a required scenario.

## Safety gate

Before any database write:

1. Resolve the actual database target from repository configuration and connection
   details. Do not trust only an environment label such as `NODE_ENV=development`.
2. Confirm the target is local, ephemeral, development, or isolated test infrastructure.
3. Never seed production, production replicas, shared staging, or another remote shared
   database.
4. If the target remains ambiguous, do not execute the seed. Ask for confirmation or add
   a reusable seed/fixture without running it.
5. Never modify secrets, credentials, `.env` files, or production configuration to make
   seeding work.

## Reuse the project's data path

- Search for existing seed commands, factories, fixtures, builders, scenario helpers, and
  cleanup/reset workflows.
- Prefer the established ORM and application APIs over ad hoc SQL.
- Do not add a dependency only to generate seed data.
- Keep required static bootstrap/reference data separate from demo or scenario data.
  Use migrations for static data only when that is the repository convention; keep
  temporary developer scenarios out of migrations.

## Build the smallest realistic scenario

- Create synthetic but realistic records with every required relationship, role,
  permission, status, and boundary state.
- Cover the happy path and the most important edge or failure state when both are needed
  to exercise the feature.
- Use deterministic identifiers, namespaced labels, and reserved values such as
  `example.test` email domains.
- Never copy personal or confidential production data.
- Make the seed idempotent with upsert, find-or-create, stable keys, or the repository's
  equivalent.
- Avoid broad deletes and database resets. Add a scoped cleanup path when practical.
- Prevent emails, payments, webhooks, push notifications, or other real external side
  effects. Use existing local fakes/sandboxes.

## Execute and verify

1. Apply required migrations through the repository workflow.
2. Run the narrowest seed command against the confirmed non-production target.
3. Verify the records and relationships through the application or a narrow read-only
   query.
4. Run the intended automated check, smoke test, or manual user flow.
5. Re-run the seed when practical to verify idempotency.

If infrastructure is unavailable, still validate the seed's syntax/types and report that
its database effects were not executed.

## Developer handoff

Give the developer:

- the exact command to create or refresh the scenario;
- the local route, API call, or screen to open;
- stable record IDs, slugs, emails, access codes, or local-only credentials;
- the actions to perform and expected visible/database result;
- the scoped cleanup or reset command;
- the environment actually used;
- checks that ran, checks that remain blocked, and residual risk.

Treat seed-backed manual validation as evidence that the scenario works, not as a
substitute for a durable regression test when a meaningful automated seam exists.
