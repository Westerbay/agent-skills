# Optional structured PR content

Use this JSON format for the bundled template or a heading-only variant with supported
sections. For another repository template, author UTF-8 Markdown directly, preserving
its static instructions and checklists, then use `render --body-file <authored.md>`.
That route preserves text without structural rewriting or checking its claims; inspect
the body against the captured diff and actual evidence before publication.

Required `title` (one line) and `description` (concrete resulting behavior). Optional:
- `changes`: Added/Changed/Removed/Fixed string arrays.
- `related`: informational Markdown links or `Related to #123`; no auto-closing keywords.
- `testing`: `{text,status,evidence}` array; status passed/failed/not-run. Actual runs need
  evidence. Never present planned checks as successful.
- `checklist`: `{text,checked}` array, checked only when honestly verified.
- `notes`: string array of necessary reviewer context.
- `diagrams`: string array of captioned Markdown image embeds with durable URLs or fenced
  `mermaid` blocks, for Technical Diagrams. Reuse relevant technical-plan diagrams and
  verify they match the delivered slice; full planning documents remain local.
- `screenshots`: string array of captioned Markdown image embeds with durable URLs, for
  Screenshots / Demo. Proactively capture changed/added visuals when straightforward;
  include before/after views when useful. Inspect captures and omit private data.

Template resolution: explicit `--template`, otherwise bundled `assets/PR.md`.
Use `--template` only for a supported heading-only template with the structured route.
No personal home-directory template or connected tracker is required.
Use `related` only for GitHub issues explicitly supplied by the user or referenced in the diff;
do not search external trackers or add unrelated tickets.
Section order follows the template; empty sections/categories disappear. Unsupported
headings or static content produce an error directing you to the authored-body route;
the renderer never silently removes repository instructions or checklist text. It
adds the GitHub screenshot placeholder for detected UI work. Add the section explicitly
when UI work escaped the file-extension heuristic. Attempt straightforward capture and
attachment before falling back to a placeholder. Describe any capture/upload blocker in
`notes`; request uploads directly on GitHub, not in chat. Images must be accessible to PR
reviewers; local filesystem paths are not valid attachments. GitHub-renderable Mermaid
can provide diagram evidence without an external upload service.

Example:
```json
{"title":"Preserve the selected filter on return","description":"Returning from an item restores the previous list filter.","changes":{"Fixed":["Preserve the selected filter during detail navigation."]},"testing":[{"text":"Navigate to an item and return","status":"passed","evidence":"Manual local exercise retained the filter."}]}
```
This is a shape example, not evidence that those checks ran on the current task.
