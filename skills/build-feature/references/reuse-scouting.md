# Reuse scouting

Before proposing a component, function, hook, type, schema, or module, search for existing
implementations by likely names, exported symbols, literal values, routes and data shapes.
Use ripgrep or an equivalent available tool. Search all relevant workspace packages,
including re-exports, shared contracts, fixtures and scripts.

Inspect likely matches and their consumers. Prefer direct reuse or a minimal compatible
extension. For a new API, inspect existing pagination, search, sort and identifier schemas
as well as endpoints. Report the concrete paths and why reuse fits or is insufficient.
Do not create a new abstraction simply because its proposed name was not found.
