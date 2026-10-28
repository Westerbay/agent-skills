---
name: draft-pr
description: Prepare and open a GitHub draft pull request from a verified committed branch diff, with a bundled or custom template and local pre-publication checks.
---

# Draft PR

Explain the concrete problem and resulting behavior, then validation and relevant limits.
Inspect applicable repository rules and user authority. Never discard or stage unrelated
work. Publication requires the user's authorization; preparation alone does not grant it.

Use the user's current conversation language for questions, handoffs and PR body prose
unless they explicitly request another output language. Honor an explicit repository
language requirement for the PR body when the user has not overridden it; English skill
source or examples alone do not establish one. Keep PR titles in English using
`type(scope): summary`, and preserve existing English commit and branch-name rules.
Keep exact identifiers, schema keys/enums, paths, commands and quoted evidence unchanged.

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

Follow the repository's PR template when one exists. Fill its headings, static
instructions and checklists directly in a UTF-8 Markdown file; keep the description
proportional to the change. The structured renderer is optional. To save an authored
body without rewriting its template:

```bash
python3 <draft-pr-skill>/scripts/prepare_pr.py render --context <context.json> --body-file <authored.md> --out <body.md>
```

This preserves the authored text exactly; it does not verify its claims or approve
publication. Inspect it against the committed diff and actual check evidence.

For localized headings and labels, translate the bundled template into the chosen
language and use this authored-body route. Preserve any required custom-template
headings, instructions and checklist structure; translate its editable prose where
permitted. The structured renderer's English labels are not a language preference.

For the bundled template, read [references/content.md](references/content.md), author
the content JSON, then run:

```bash
python3 <draft-pr-skill>/scripts/prepare_pr.py render --context <context.json> --content <content.json> --out <body.md>
```

The structured route uses [assets/PR.md](assets/PR.md) by default. `--template` accepts a
heading-only variant using the same section names. It preserves section order, strips
empty categories and adds UI screenshot placeholders. Other headings or static template
content use the authored-body route; do not discard them or build a template engine.
Inspect the rendered body: behavior first, no file-by-file noise, no unrun tests asserted.
Mention migrations, configuration, breaking changes and follow-up only when relevant.

### Include relevant diagrams and visual evidence

Inspect task context and existing technical artifacts for diagrams that explain this
change, including an approved technical plan produced by `build-feature` when available.
Attach only diagrams relevant to the implemented slice in Technical Diagrams, with a
short caption explaining the behavior or architecture. Reuse the existing rendered
SVG/PNG or include its Mermaid source in a fenced `mermaid` block that GitHub can render.
Check it against the final implementation; update or omit stale diagrams. Do not require
`build-feature` or create diagrams for changes that do not benefit from them.

For changed or added visuals, proactively capture the actual rendered result when the
existing app, preview, browser or screenshot tools make that straightforward. Use the
reviewed branch and existing safe test data; inspect the capture before attaching it.
Include concise captions and, when useful and readily available, before/after views in
Screenshots / Demo. Do not expose credentials, private user data or unrelated UI.

When PR publication is authorized, include these relevant diagrams and screenshots as
review evidence. Use GitHub-renderable Mermaid or supported attachment uploads/durable
URLs accessible to reviewers. Local paths and temporary/private preview links do not
work in a GitHub PR body. Do not commit entire PRDs, technical plans or execution records
just to attach a diagram. Diagram evidence does not authorize publishing those documents.

If capture, export or attachment is blocked, state the exact limitation and leave a
specific upload placeholder in the PR, requesting uploads directly on GitHub if needed.
Do not stop at a placeholder when the available tools can capture and attach the result;
never invent a screenshot URL or claim a source-only diagram was rendered.

## 3. Verify and open when authorized

```bash
python3 <draft-pr-skill>/scripts/prepare_pr.py preflight --context <context.json>
```

This rejects a changed branch/base/HEAD and changed planning artifacts still present in
committed HEAD or the index. Pure deletions are not treated as publication; a staged
deletion does not hide a planning file still present in the commit being published.
Preserve local copies when excluding PRDs, technical plans and run records.
For an explicitly authorized document or a verified source fixture included in the
requested change, use `--allow-planning-file <exact-repo-path>` once per approved file.
No glob or automatic fixture exemption is allowed. `--allow-planning-documents` is only
for explicit authorization covering every detected document; prefer exact exceptions.
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
branches, validation results and any remaining diagram or screenshot placeholder.
