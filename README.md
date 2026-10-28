# Westerbay Agent Skills

Reusable workflows for software development, distributed as [Agent Skills](https://agentskills.io).

## Available skills

| Skill | Purpose |
| --- | --- |
| [software-developer](skills/software-developer/SKILL.md) | Implement, fix, refactor and validate software changes using the repository's conventions. |
| [draft-pr](skills/draft-pr/SKILL.md) | Prepare and open a GitHub draft PR from a verified committed diff, using a bundled or custom template. |
| [build-feature](skills/build-feature/SKILL.md) | Guide a substantial feature from discovery and explicit approvals through implementation, review and delivery. Includes planning document tools and review helpers. |
| [security-audit](skills/security-audit/SKILL.md) | Cloudflare's source-first security review and audit, copied unchanged with its MIT license and attribution. |
| [code-quality-review](skills/code-quality-review/SKILL.md) | Review and refactor naming, conditionals, cohesion, complexity and behavior-focused tests. |
| [solid-architecture-review](skills/solid-architecture-review/SKILL.md) | Review and refactor SOLID boundaries, dependency direction, extensibility and file organization. |
| [web-review](skills/web-review/SKILL.md) | Review web changes for SEO, semantic HTML, accessibility and reusable components and behaviors. |

`software-developer` applies readability, SOLID and module design, behavioral test value,
and semantic web delivery while implementing each change. Its bundled references keep it
usable without the review skills. The same development guidance ships inside `build-feature`;
the standalone review skills remain available for deeper, focused reviews.

`build-feature` uses two approvals: scope (A), then one concise implementation plan (B)
combining logic/UML, relevant reuse, acceptance and a task graph in one HTML. Independent
CODE tasks receive the linked approved UML, schemas and UX/UI references with their
acceptance criteria, then run in parallel with exclusive write scopes and targeted
conformance checks. Missing context is resolved before dependent work. After all
tasks validate, one integrated simplification/review cycle applies accepted refactors;
at most two review rounds cover the whole feature. Quality and web feed the quality
dimension; architecture and security select full review. A focused SOLID design critique
prepares Gate B without another approval or formal review round.
See [specialist routing](skills/build-feature/modules/review/references/specialist-reviews.md).
Skills remain independent and optional; missing companions use disclosed bundled criteria.

Delivery then produces one small local checkpoint or authorized draft PR/MR per CODE task,
with independent or explicit stacked bases. Each request contains its task's change, not
the cumulative feature diff. See [small task deliveries](skills/build-feature/references/delivery.md).
Execution records now use version 2; old three-gate records are preserved and require an
explicit combined-plan approval before starting a new run. Document schemas stay at version 1.

## Install

Requires Node.js/npm and Git. The [skills CLI](https://github.com/vercel-labs/skills) installs directly from this GitHub repository; this repository is not an npm package.

```bash
# Browse available skills
npx skills add Westerbay/agent-skills --list

# Choose skills and agents interactively
npx skills add Westerbay/agent-skills

# Install all seven skills globally for Codex
npx skills add Westerbay/agent-skills --skill software-developer build-feature draft-pr security-audit code-quality-review solid-architecture-review web-review --agent codex --global

# Install one skill for the current project
npx skills add Westerbay/agent-skills --skill software-developer --agent codex

# Update global installations
npx skills update --global
```

Updates are explicit: a GitHub push does not automatically update installed copies.

Installing the skill copies its files; it does not install the optional diagram runtime.
For automatic SVG diagrams, run `npm ci --ignore-scripts` once in the installed
`build-feature/modules/prd` directory and make Chrome available. Use a persistent
writable copy of that module when the skill directory is read-only, and repeat setup
after updates that replace it. Each compiled SVG has a button to copy that diagram
as a PNG. Plain document rendering uses bundled assets without the optional diagram
runtime. See the [document guide](skills/build-feature/modules/prd/GUIDE.md).

The locally authored workflows use available tools and can fall back to sequential
review when independent agents are unavailable, disclosing that limit. Cloudflare's
`security-audit` preserves its own independent-verification requirements described below.
`build-feature` requires Node.js 22+ for its document tools and Python 3.10+ and Git for
its review helpers. Optional diagram compilation requires additional dependencies and
Chrome/Chromium; see the [document guide](skills/build-feature/modules/prd/GUIDE.md).

`draft-pr` prepares context and PR bodies locally with Python 3.10+ and Git, without third-party Python packages or connected trackers. It includes a default `PR.md` template and guidance to attach relevant technical diagrams
and proactively capture changed visuals when straightforward; pass `--template` to use your own. Publishing requires an authenticated GitHub CLI (`gh`) or an available GitHub tool, plus user authorization.

Instructions, metadata and examples are written in English. Agents should still use the user's requested language in conversation; the document renderer supports English and French.

## Standalone review skills

The four review skills install and run independently of `build-feature`. The original
quality, SOLID/architecture and web skills contain their own workflow, focused reference
material and primary-source reading lists. Their default prompts request review and
local refactoring. A review-only request remains read-only; an authorized review-and-fix
request carries concrete findings through scoped refactoring and meaningful validation.
They do not commit or publish changes automatically.

Examples:

```text
Use $code-quality-review to review and refactor the current diff.
Use $solid-architecture-review to review and refactor the payment module for the next provider.
Use $web-review to review and refactor web changes in this diff.
Use $security-audit for a focused security review of this diff.
```

The test portfolio target is 80% unit, 15% integration and 5% end-to-end. It is a review
signal, not a code-coverage target or a reason to delete useful tests. Deviations should
produce an alert with context; removal requires evidence of redundant or trivial coverage.
Function size, complexity and folder size similarly guide investigation rather than
mechanical splitting or speculative abstractions.
TDD starts only for useful new/regressed behavior. Reuse sufficient existing tests;
behavior-preserving refactors keep them green without a forced new red/green cycle.
There is no one-test-per-method, trivial getter/setter or filler-test requirement.

### Cloudflare security audit

The complete `security-audit` directory is vendored from Cloudflare at the revision in
[its attribution record](skills/security-audit/UPSTREAM.md), with the original
[MIT license and copyright](skills/security-audit/LICENSE). Its upstream instructions,
companions, schema, validators and tests are unchanged. The audit describes fixes and
leaves audited source read-only. Full audit execution requires the sandbox and independent
verification capabilities specified upstream; missing capabilities must remain explicit.
The imported CLI validators also require POSIX file-open protections unavailable in
native Windows Node. Their full test suite runs in Linux CI; see the
[platform note](skills/security-audit/UPSTREAM.md) before running it on Windows.

`build-feature` routes security-relevant reviews to an installed
[security-audit skill](skills/security-audit/SKILL.md).
Focused reviews use its relevant guidance; explicit audit or full-review requests follow
its mode-selection rules. No companion is installed automatically. Without it, the
bundled review remains usable for source-based checks and reports the coverage limit.
See the [integration adapter](skills/build-feature/modules/review/references/security-audit-integration.md)
for sandbox requirements and handling of unconfirmed findings.

## Maintain this repository

Treat `skills/` in this checkout as the source of truth. Edit the relevant `SKILL.md`, references or scripts here, validate the changes, update [CHANGELOG.md](CHANGELOG.md), and commit and push to GitHub. Do not edit an installed copy and expect those edits to reach this repository.

```bash
node scripts/validate-skills.mjs
node scripts/validate-security-audit-vendor.mjs
node --test skills/security-audit/*.test.cjs
node --test skills/build-feature/modules/prd/tests/*.test.mjs
python -m unittest discover -s skills/build-feature/modules/review/tests -p "test_*.py"
python -m unittest discover -s skills/draft-pr/tests -p "test_*.py"
```

The validation workflow runs these checks on pushes and pull requests. Each new skill belongs in `skills/<name>/`, with a `SKILL.md` containing `name` and `description` in YAML front matter. Bundle its required references, scripts and assets and use relative paths.

Use English [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) in the form
`type(scope): summary`, for example `fix(build-feature): preserve task dependencies`.
Agent-created branches use `<type>/<short-kebab-case-description>`, such as `feat/csv-export`,
without an automatic `codex/` prefix. Types include `build`, `chore`, `ci`, `docs`, `feat`,
`fix`, `perf`, `refactor`, `revert`, `style` and `test`. Scope/English requirements and
branch prefixes are this repository's policy; Git does not prescribe a semantic branch
taxonomy. See [Git naming](skills/software-developer/references/git-conventions.md).
Preserve published history; conventions do not authorize commits or pushes.

For your own Codex installation, initially published skills already exist locally. Keep any local changes before replacing those copies with an installation from this repository.

The [AGENTS.md](AGENTS.md) file includes portable agent instructions and this repository's conventions. `build-feature` planning HTML supports offline LaTeX formulas and a per-diagram **Copy diagram as image** action, with a PNG download fallback when the clipboard is unavailable. See the [document guide](skills/build-feature/modules/prd/GUIDE.md).

## License

Original content is available under the [MIT license](LICENSE). Cloudflare's security-audit
skill retains its [upstream MIT license](skills/security-audit/LICENSE) and
[attribution](skills/security-audit/UPSTREAM.md). Other bundled third-party assets retain
their own licenses; see [third-party notices](skills/build-feature/modules/prd/THIRD_PARTY_NOTICES.txt).
