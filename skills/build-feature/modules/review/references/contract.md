# Reviewer output contract (v2)

Every selected reviewer returns one JSON object, including on failure. Read only the
assigned concerns from [dimensions](dimensions.md). The general reviewer covers quality,
conventions, regression and logic; architecture, web and security are independently
selected specialists. These skills remain usable outside this feature protocol.

## Reply shape

```json
{
  "agent": "general-reviewer",
  "version": "2.0.0",
  "scope": {
    "mode": "local",
    "base": "<exact manifest base>",
    "branch": "<exact manifest branch>",
    "patchDigest": "<exact lowercase SHA-256 from manifest>",
    "files": ["<reviewed repository-relative file>"]
  },
  "status": "ok",
  "coverage": "complete",
  "summary": {"critical": 0, "warning": 0, "nit": 0},
  "findings": [],
  "notes": [],
  "errors": []
}
```

- `agent`: `<reviewer>-reviewer`, matching the manifest selection (`general`,
  `architecture`, `web`, `security`). Save one `<reviewer>.json` per selected reviewer.
- `version`: `2.x.y`. Version 1 replies are rejected; do not invent a digest for an old
  review. Read the current saved patch and return a fresh reply.
- `scope`: exact manifest `mode`, `base`, `branch`, and `patchDigest`. The digest is required
  even when branch names and files are unchanged. It binds the reply to this snapshot.
- `files`: complete manifest file coverage for `ok`; a subset is allowed for `partial`.
  Each reviewer assesses its concerns across the manifest, not only files with a familiar
  extension. Record an unavailable binary or missing context as a coverage limit.
- `status` / `coverage`: `ok` / `complete`, `partial` / `partial`, or `error` / `not-run`.
  Zero findings means complete only when assigned checks finished without blockers.
- `summary`: exact counts of findings by severity. `notes` and `errors` are string arrays;
  errors are nonempty for partial/error and empty for ok.

Each finding has this shape (omit optional line fields for a file-level finding):

```json
{
  "id": "logic.state-transition.missing-guard",
  "section": "logic",
  "severity": "warning",
  "category": "state-transition",
  "title": "<specific defect>",
  "file": "<manifest file>",
  "line": 1,
  "end_line": 1,
  "related_files": [],
  "evidence": "<concrete observation and plausible impact>",
  "confidence": "high",
  "recommendation": "<smallest effective fix and validation>"
}
```

IDs must be unique within the reply. Line numbers are positive integers, with end not
before start. `confidence` is `high`, `medium` or `low`; uncertainty alone does not make
a speculative claim a finding. Related files may support a finding anchored in the diff.

| Reviewer | Allowed finding sections |
| --- | --- |
| `general` | `quality`, `conventions`, `regression`, `logic` |
| `architecture` | `architecture` |
| `web` | `web` |
| `security` | `security` |

Severity is `critical`, `warning` or `nit`, tied to real impact. Security never uses nit:
follow [security evidence](security-audit-integration.md), keeping `needs_validation`
unranked in notes, with partial coverage/errors when a decisive check is unavailable.

## Validation and concise output

The helper checks manifest/reply version, reviewer identity, exact patch digest and
scope, allowed sections, file coverage, required fields and summary counts. Missing,
malformed or stale replies cannot produce a clean complete report. Recollect evidence
on a new snapshot after edits rather than modifying the old reply's digest.

Keep replies focused on actionable findings; consolidate low-value style notes. Do not
truncate a consequential finding to fit a fixed token quota. If a host output limit
prevents complete coverage, report partial/error with the exact missing scope. The
coordinator may retry once or narrow the assignment explicitly; it must not claim the
omitted material was reviewed.
