# Changelog

## Unreleased

- Preserve approved feature framing in CODE task excerpts and carry linked UML, schemas
  and UX/UI decisions into worker assignments. Verify context access before coding and
  conformance during task validation and the existing integrated review.

- Replace the blanket `useEffect` ban with documentation-driven selection: use suitable
  framework/query/action APIs for their responsibilities and Effects for appropriate
  external synchronization, including a guarded fetching fallback when needed.

- Require English Conventional Commit messages and type-prefixed branch names in both
  development workflows; document the common types and preserve explicit user names.
- Merge build-feature technical and implementation approval into Gate B, with logic/UML,
  concise requirements and the task DAG rendered in one document. Remove Gate C from
  new execution records and preserve legacy records with an explicit migration boundary.
- Dispatch dependency-ready CODE tasks with disjoint write ownership in parallel; run
  simplification, specialist review and accepted corrections once on the integrated feature,
  then deliver one small checkpoint or authorized draft PR/MR per task. Bound review to
  two feature rounds and keep task patches separate from cumulative review snapshots.
- Clarify TDD's test-value gate: reuse sufficient behavioral coverage and avoid forced
  new tests for trivial changes, getters/setters and behavior-preserving refactors.

- Route standalone quality, SOLID, web and security specialists through `build-feature`
  design, simplification and review checkpoints; apply accepted refactors with fresh
  snapshot validation inside the existing two-round review loop, without new dependencies
  or reviewer schemas.

- Apply clear decisions, cohesive SOLID boundaries, behavior-focused testing, and semantic
  web delivery during `software-developer` implementation; keep its bundled `build-feature`
  mirror aligned and preserve optional standalone specialist reviews.

- Add standalone code-quality, SOLID/architecture and web review skills with primary-source
  references, scoped refactoring workflows and behavior-focused validation.
- Vendor Cloudflare's complete `security-audit` skill at revision
  `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`, preserving its MIT license, attribution and
  source files; verify import integrity and run its bundled tests in validation CI.
- Use an advisory 80/15/5 unit/integration/end-to-end test target with deviation alerts
  and evidence-based removal candidates, without discarding useful behavioral coverage.

- Pin validation CI to Python 3.12.16, including the SSL and tarfile security fixes.

- Keep validated internal contracts concrete, confine `unknown` to legitimate boundaries,
  and review assertions and parser generics by their evidence instead of textual bans.

- Route security-relevant reviews to Cloudflare's optional `security-audit` skill with
  explicit mode selection, sandbox requirements and unranked validation gaps; preserve
  source-only fallback and the existing review protocol when the companion is absent.

- Strengthen development and review guidance for shared validation, precise naming,
  cohesive orchestration and evidence-based maintainability findings, with behavioral
  safeguards for refactoring and examples that distinguish useful guards from complexity.

- Add portable `draft-pr` with a bundled PR template, local preparation helpers and
  publication checks, without connected tracker dependencies.
- Bundle `PR.md` and include relevant technical diagrams and proactively captured visual
  evidence in draft PRs when available.

- Replace whole-document PNG copying with a copy button for each compiled SVG diagram.
- Check diagram runtime prerequisites before rendering, reuse persistent installations,
  and disclose source-only fallbacks alongside document links.
- Explain locked dependency setup when SVG compilation cannot load `playwright-core`,
  preserving any previously rendered HTML.

- Update Mermaid and its vulnerable transitive dependencies, rebuild the offline bundle
  and refresh third-party notices. Verify SVG diagrams, formulas and PNG copying through
  a portable optional browser test; document the Node 22.12+ diagram-runtime requirement.

## 0.2.0 — 2026-09-27

- Publish portable AGENTS.md instructions alongside repository conventions.
- Add PNG clipboard copying with a download fallback (replaced by per-diagram copying in the next update).
- Render inline and display LaTeX formulas offline using KaTeX and native MathML.

## 0.1.1 — 2026-09-27

- Translate React/TypeScript guidance, skill metadata and planning examples into English.
- Document Conventional Commits and repository maintenance rules.

## 0.1.0 — 2026-09-27

- Publish `software-developer` and `build-feature` with their references, scripts and assets.
- Document installation and updates using `npx skills`.
- Add automated validation and run the existing document and review-helper tests.
