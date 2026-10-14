# PR content JSON

Required `title` (one line) and `description` (concrete resulting behavior). Optional:
- `changes`: Added/Changed/Removed/Fixed string arrays.
- `related`: informational Markdown links or `Related to #123`; no auto-closing keywords.
- `testing`: `{text,status,evidence}` array; status passed/failed/not-run. Actual runs need
  evidence. Never present planned checks as successful.
- `checklist`: `{text,checked}` array, checked only when honestly verified.
- `notes`, `screenshots`: string arrays, durable URLs or necessary reviewer context.

Template resolution: explicit `--template`, otherwise bundled `assets/MR.md`.
Use `--template` for a repository PR template or another user-selected template.
No personal home-directory template or connected tracker is required.
Use `related` only for GitHub issues explicitly supplied by the user or referenced in the diff;
do not search external trackers or add unrelated tickets.
Section order follows the template; empty sections/categories disappear. Unsupported
custom headings raise an error so their handling can be consciously added. The renderer
adds the GitHub screenshot placeholder for detected UI work. Add the section explicitly
when UI work escaped the file-extension heuristic. No request for screenshots in chat.

Example:
```json
{"title":"Preserve the selected filter on return","description":"Returning from an item restores the previous list filter.","changes":{"Fixed":["Preserve the selected filter during detail navigation."]},"testing":[{"text":"Navigate to an item and return","status":"passed","evidence":"Manual local exercise retained the filter."}]}
```
This is a shape example, not evidence that those checks ran on the current task.
