# Repository conventions

- Maintain this checkout as the source of truth for distributed skills.
- Write instructions, metadata, examples, documentation and commit messages in English.
  Preserve runtime localization and follow the user's language in conversation.
- Use Conventional Commits: `type(scope): summary`. Keep the summary concise and
  describe the resulting change. Follow the existing skill names for scopes when useful.
- Preserve each skill's bundled resources and relative paths. Keep mirrored
  development guidance consistent when changing a shared rule.
- Validate changes with `node scripts/validate-skills.mjs`, the existing Node document
  tests, and the Python review-helper tests documented in README.md.
- Preserve published Git history. A commit convention does not authorize rewriting
  previous commits or force-pushing.
