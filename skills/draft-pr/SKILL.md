---
name: draft-pr
description: Prepare and open a GitHub draft pull request from a verified committed branch diff, with a bundled or custom template and local pre-publication checks.
---

# Draft PR

Explain the concrete problem and resulting behavior, then validation and relevant limits.
Inspect applicable repository rules and user authority. Never discard or stage unrelated
work. Publication requires the user's authorization; preparation alone does not grant it.

Preparation needs Python 3.10+ and Git, with no third-party Python packages. The skill
bundles its default PR template and does not require Notion, a connected tracker, another
skill, or a personal template. Publishing uses an authenticated GitHub CLI (`gh`) or an
available GitHub tool. If publication is unavailable, deliver the prepared title and body
and report the blocker. Resolve `<draft-pr-skill>` to this skill's installed directory.

## 1. Capture the committed change

```bash
python3 <draft-pr-skill>/scripts/prepare_pr.py collect --repo <repo> --base <exact-base> --out <new-scratch-directory>
```

The helper is read-only: it records branch/base/HEAD, merge-base, committed diff, status,
file list, UI hints and planning-file candidates. Explicit base wins. For stacked PRs use
the predecessor recorded for this task; a merely plausible merge-base is insufficient.
Without `--base`, use repository evidence and stop on ambiguity. Detached HEAD is rejected.
Inspect `context.json` and relevant `diff.patch` hunks. Uncommitted work is not part of the
PR unless actually committed; do not describe it as delivered. If the requested change
is uncommitted, commit only its reviewed files when that action is authorized, then collect.
Keep scratch outputs outside the repository or in an ignored directory.

## 2. Write from the diff and actual evidence

Focus on the requested change, its observable behavior and checks actually run. Do not
search Notion or other external trackers. Include GitHub issue links only when explicitly
supplied by the user or directly referenced by this change. Omit Related Issues / Tickets
when none are relevant. Reference issues informationally, never auto-close unless the user
explicitly asks to close that exact issue.

Read [references/content.md](references/content.md), then author the content JSON:

```bash
python3 <draft-pr-skill>/scripts/prepare_pr.py render --context <context.json> --content <content.json> --out <body.md>
```

The script uses [assets/MR.md](assets/MR.md) by default. For an applicable repository or
user-selected template, pass `--template <template-path>`. It preserves section order,
strips empty categories and adds UI screenshot placeholders. Unsupported custom headings
produce a visible error; adapt their mapping or agree on a supported template.
Inspect the rendered body: behavior first, no file-by-file noise, no unrun tests asserted.
Mention migrations, configuration, breaking changes and follow-up only when relevant.
UI changes require Screenshots / Demo; use durable URLs or a placeholder requesting uploads
directly in GitHub, never ask for screenshots in chat.

## 3. Verify and open when authorized

```bash
python3 <draft-pr-skill>/scripts/prepare_pr.py preflight --context <context.json>
```

This rejects a changed branch/base/HEAD and planning artifacts in the branch/index.
Preserve local copies when excluding PRDs, technical plans and run records.
`--allow-planning-documents` requires explicit authorization to publish those exact docs.
Recollect after a new commit. These checks do not establish delivery authority.

Verify the exact target repository, remote and existing PRs for this head branch before
publishing. Use the available GitHub tool or, after verifying existing push/PR authority,
push an unpublished branch to the verified remote without force, then run:

```bash
gh pr create --draft --repo <owner/repo> --base <base-branch> --head <current-branch> --title <title> --body-file <body.md>
```

For a fork, use `<fork-owner>:<current-branch>` as the PR head. Reuse an existing PR rather
than opening a duplicate. No force-push, merge or deployment. If publication is not
authorized, stop at a concrete ready-to-open body. Report the actual PR URL, base/head
branches, validation results and any remaining screenshot placeholder.
