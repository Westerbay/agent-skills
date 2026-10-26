# Changelog

## Unreleased

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
