# Git naming and delivery

Read before creating a branch or preparing an authorized commit. These naming rules
do not authorize branch creation, commits, history edits, pushing, or publication.
Preserve the user's explicit branch name and existing work. Inspect repository hooks
and naming constraints before choosing a name; explain a real conflict rather than
silently substituting another convention.

## Commit messages

Write commit subjects and explanatory prose in English. Use
`<type>(<scope>): <short imperative summary>` with a meaningful component, package, or
feature scope, for example `feat(reader): add CSV export` or
`fix(cache): include locale in cache keys`. A generic message such as `Update API`
does not satisfy this policy. Keep technical identifiers and required trailer tokens
unchanged. Use the repository's supported scope vocabulary when one exists.

Choose the type from the change's actual purpose:

| Type | Purpose |
| --- | --- |
| `feat` | New supported behavior |
| `fix` | Correct incorrect behavior |
| `refactor` | Restructure code while preserving behavior |
| `perf` | Improve performance |
| `test` | Add or change tests |
| `docs` | Change documentation |
| `style` | Formatting or style changes without behavior changes |
| `build` | Build tooling, packaging, or dependency changes |
| `ci` | Continuous integration configuration or scripts |
| `chore` | Maintenance outside the categories above |
| `revert` | Revert an earlier change |

Mark a breaking contract with `!` before the colon, a `BREAKING CHANGE:` footer, or both;
explain the incompatibility and migration in English. Review the staged diff before
choosing the type and summary. A feature branch may contain fix, test, or refactor commits;
the branch prefix does not dictate every commit's type. Do not amend or rewrite existing
history just to apply these names without authorization.

## Branch names

For agent-chosen names, use `<type>/<short-kebab-case-description>` with the same type
vocabulary and an English description: `feat/reader-export`, `fix/cache-key`,
`docs/install-guide`, or `chore/dependency-refresh`. Do not prepend `codex/` or another
agent identifier. Use an explicit user-selected name when provided; do not rename an
existing branch merely to normalize it. Check the intended base and validate the exact
proposed name with `git check-ref-format --branch <name>` before authorized creation.

## Basis

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
defines the commit structure and allows additional types; its scope is optional.
This workflow deliberately requires a meaningful scope and English prose. The common
type list comes from [commitlint's conventional configuration](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional).
[Git's reference-name rules](https://git-scm.com/docs/git-check-ref-format)
define valid syntax, not a universal list of semantic branch prefixes. The branch
pattern above is this workflow's policy, not a Git requirement.
