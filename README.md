# Westerbay Agent Skills

Reusable workflows for software development, distributed as [Agent Skills](https://agentskills.io).

## Available skills

| Skill | Purpose |
| --- | --- |
| [software-developer](skills/software-developer/SKILL.md) | Implement, fix, refactor and validate software changes using the repository's conventions. |
| [build-feature](skills/build-feature/SKILL.md) | Guide a substantial feature from discovery and explicit approvals through implementation, review and delivery. Includes planning document tools and review helpers. |

## Install

Requires Node.js/npm and Git. The [skills CLI](https://github.com/vercel-labs/skills) installs directly from this GitHub repository; this repository is not an npm package.

```bash
# Browse available skills
npx skills add Westerbay/agent-skills --list

# Choose skills and agents interactively
npx skills add Westerbay/agent-skills

# Install both skills globally for Codex
npx skills add Westerbay/agent-skills --skill software-developer build-feature --agent codex --global

# Install one skill for the current project
npx skills add Westerbay/agent-skills --skill software-developer --agent codex

# Update global installations
npx skills update --global
```

Updates are explicit: a GitHub push does not automatically update installed copies.

These skills use the tools available to the agent and fall back to sequential work when independent agents are unavailable. `build-feature` requires Node.js 22+ for its document tools and Python 3.10+ and Git for its review helpers. Optional diagram compilation requires additional dependencies and Chrome/Chromium; see the [document guide](skills/build-feature/modules/prd/GUIDE.md).

## Maintain this repository

Treat `skills/` in this checkout as the source of truth. Edit the relevant `SKILL.md`, references or scripts here, validate the changes, update [CHANGELOG.md](CHANGELOG.md), and commit and push to GitHub. Do not edit an installed copy and expect those edits to reach this repository.

```bash
node scripts/validate-skills.mjs
node --test skills/build-feature/modules/prd/tests/*.test.mjs
python -m unittest discover -s skills/build-feature/modules/review/tests -p "test_*.py"
```

The validation workflow runs these checks on pushes and pull requests. Each new skill belongs in `skills/<name>/`, with a `SKILL.md` containing `name` and `description` in YAML front matter. Bundle its required references, scripts and assets and use relative paths.

For your own Codex installation, initially published skills already exist locally. Keep any local changes before replacing those copies with an installation from this repository.

## License

Original content is available under the [MIT license](LICENSE). Bundled third-party assets retain their own licenses; see [third-party notices](skills/build-feature/modules/prd/THIRD_PARTY_NOTICES.txt).
