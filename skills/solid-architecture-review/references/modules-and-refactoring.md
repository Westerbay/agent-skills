# Modules, file organization, and safe structural change

## Choose boundaries by hidden decisions

Parnas compares decompositions and argues for boundaries that hide design decisions
likely to vary. A directory split matching execution steps is not automatically a good
module decomposition. Identify what each module hides and what its callers must know.
[Primary technical report](https://prl.khoury.northeastern.edu/img/p-tr-1971.pdf)

Create a small map of affected modules and their directed dependencies. Name the public
entry points, owned data, hidden implementation choices, and legitimate external
consumers. Include less visible edges: shared mutable state, table access, event schemas,
deep imports, global service lookups, generated registrations, and startup side effects.
File moves alone do not remove these dependencies.

Favor repository-shaped modules around cohesive capabilities. Within a large capability,
separate policies, orchestration, and adapters where that reduces independent change.
Retain established framework routing and discovery conventions. A modular monolith can
provide strong boundaries; a new service or package is not the default repair.

## Make navigation reveal ownership

A directory should help a reader locate an operation, its contract, tests, and adapters.
When reviewing a crowded folder, identify the actual search ambiguity before changing
it: unrelated domains with similar names, hidden ownership, or repeated cross-directory
jumps for one coherent behavior. A hundred generated files can be harmless; a dozen
unrelated `manager`, `helper`, or `utils` files can be confusing.

Possible organization for a feature that already needs these seams:

```text
reports/
  report.ts                 # the report contract and policy
  generate-report.ts        # application orchestration
  render-html.ts            # one presentation adapter
  render-csv.ts             # another presentation adapter
  sql-report-source.ts      # persistence adapter
  generate-report.test.ts   # behavior of the operation
```

This is an example, not a required layout or a reason to create empty layers. Keep small
related helpers together when they are understood and changed together. Introduce
subdirectories as distinct concerns or existing conventions warrant them. Avoid a deep
chain of folders containing only one forwarding file.

Expose a deliberate public module surface. An index or barrel may express it, but
re-exporting every internal symbol defeats encapsulation and can introduce cycles or
runtime imports. Follow the language's visibility and package-export mechanisms when
available. Keep tests near the owning behavior or in the established test layout.

Move a shared helper only after locating its real consumers and semantic owner. A
`shared` folder must not become the owner of unrelated product rules. Identical shapes
can have different meanings in different domains; sharing their representation can
couple independent evolution. Translate at the boundary when needed.
[Fowler on bounded contexts](https://martinfowler.com/bliki/BoundedContext.html)

## Read structural signals in context

Use existing analyzers or direct source inspection. State scope, exclusions, tool, and
measurement method. Exclude generated code, vendored code, and unrelated fixtures from
handwritten-code comparisons. Do not install tools or invent precision to obtain a score.

| Signal | Useful question | Misleading interpretation to avoid |
| --- | --- | --- |
| Dependency cycle | Which edge obscures ownership or prevents independent initialization or testing? | Every mutual reference proves a production defect. |
| Outgoing dependencies | Does this module mix policies, adapters, and unrelated domains? | A composition root is bad because it wires many dependencies. |
| Incoming dependencies | What stability and compatibility burden does this shared contract carry? | Popularity alone means the contract should be split. |
| Change coupling in local history | Do unrelated modules repeatedly change for one rule? | Generated updates or bulk formatting reveal domain coupling. |
| Change spread for a scenario | Which unnecessary modules must be understood or edited? | One new feature must always touch exactly one file. |
| Public surface and deep imports | Are consumers relying on internal representation? | More exports always mean a better reusable library. |
| File size, folder breadth, depth | Can a reader find one coherent operation and its owner? | A universal LOC or files-per-folder cap determines architecture. |

Use risk and history together: a frequently changed, highly coupled rule deserves more
attention than a stable large table. Count by module when the question is modularity;
counting raw imports can overstate coupling through multiple symbols from one provider.
Do not hide dependencies by merging files just to improve a metric.

Fowler's modular refactoring discussion emphasizes local comprehension and grouping code
that changes together. This skill's review signals translate that idea into evidence
collection; they are not thresholds prescribed by Fowler.
[Refactoring Module Dependencies](https://martinfowler.com/articles/refactoring-dependencies.html)

## Select a proportional refactor

Compare the current structure with the smallest candidate change using the same scenario:

- Does one module now own the rule rather than two coordinated copies?
- Does the caller depend on a meaningful stable capability rather than an implementation?
- Can a supported variant be added without modifying unrelated policies?
- Can the behavior be exercised without booting unrelated infrastructure?
- Is navigation clearer after accounting for new files, contracts, and wiring?

Prefer move function, extract cohesive module, introduce parameter, narrow contract, or
compose existing behavior before a new framework. A small amount of duplication may
be cheaper than an abstraction full of flags for unrelated cases. Conversely, do not
avoid a justified boundary solely because it adds a file.

Do not build capabilities for speculative futures. Keeping code easy to change is
compatible with delaying unsupported variation until evidence exists.
[Fowler on YAGNI](https://martinfowler.com/bliki/Yagni.html)

## Execute and validate authorized changes

1. Capture observable behavior at the existing seam. Use current tests where adequate;
   add characterization only for a meaningful invariant or failure path at risk.
2. Write down the intended dependency direction and the responsibility being moved.
   Check that this falls within the user's authority before a structural migration.
3. Move one coherent responsibility and update all imports, callers, exports, wiring,
   and fixtures. Preserve existing public import paths when they are a compatibility
   contract. Avoid temporary duplicate implementations with diverging rules.
4. Check non-obvious discovery: route conventions, filesystem globbing, code generation,
   serialization registrations, test discovery, asset paths, build packaging, and
   case-sensitive filesystem behavior when relevant.
5. Exercise the meaningful behavior at the old external seam and the changed boundary.
   Compare success, invalid inputs, and relevant failure semantics; preserve transaction
   scope, async ordering, side-effect counts, cleanup, cancellation, and identity.
6. Run relevant type, import, lint, build, and integration checks from the repository.
   An import-only rearrangement may need packaging or startup validation more than a
   new unit test. Do not add tests that merely assert the new folder structure.
7. Inspect the final diff, search for stale callers and obsolete exports, and replay the
   change scenario. Remove scaffolding introduced by this refactor when no longer used.

Do not run destructive migrations or production operations as validation. If a needed
environment is unavailable, report exactly which contract remains unverified. Do not
replace a real integration check with mocks and describe the integration as tested.

## Stop at a clear boundary

A scoped refactor is complete when its stated responsibility or dependency problem is
resolved, all intended consumers use the new seam, and the relevant checks pass or have
an explicit blocker. Record larger adjacent debt separately. If solving a finding needs
a public API migration, new service, datastore redesign, or other material expansion,
present the concrete option and compatibility plan before taking that step.
