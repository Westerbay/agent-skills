# Delivery modes and provider boundaries

Choose the delivery mode with the feature scope at Gate A. Default recommendation: local.
Keep this choice and each permitted action explicit; an approval to implement is not
permission to publish. Existing explicit authorization remains valid within its scope.

## Local

Initialize the run with `--delivery local` (also the default). Each code task finishes at
`delivered-local`, after `ready-to-open`. Preserve a task-specific before/after checkpoint,
review report and validation evidence. Dependent tasks can then start without any commit,
remote, hosting account, issue tracker, or messaging service.

Snapshots must cover added/deleted/binary files when relevant and distinguish pre-existing
work. Keep them local in the task scratch area; never stage user work to obtain a patch.
The accumulated local feature is the integrated result. No PR URL should be invented.

## Review request

Initialize with `--delivery review-request`. Record branch, commit, push and review-request
creation authority separately as applicable. The existing CLI token `draft-pr` means draft
PR **or** draft MR; `--pr` accepts the actual HTTPS review URL for either provider.
These historical names do not imply a GitHub dependency.

Each code task ends with its own draft PR/MR. Choose the provider from the user's request
and repository remote. Use its available CLI, API or connector; do not install a provider
or switch hosts automatically. If draft requests are unsupported, prepare the local handoff
and ask about the delivery change instead of silently opening a normal request.

Before publication, inspect the exact branch/base diff and exclude local PRD/plan/run
artifacts unless publication of those documents was explicitly requested. Preserve local
copies. Follow the repository's PR/MR template if present. Otherwise describe the problem,
resulting behavior, task/acceptance IDs, dependencies and base, validation, seed/manual QA,
and material limitations. Do not copy planning documents into the description unnecessarily.

Check for an existing request for the same branch before creating another. Verify the
returned URL, target base, head revision and draft state before recording `published`.
Missing authority or unavailable provider access leaves the task at `ready-to-open` with
a concrete title/body and exact blocker. Never merge or deploy in this workflow.

## Changing modes

Do not change the execution JSON's mode to bypass a blocked task. Explain the change,
obtain an explicit Gate A delivery decision, and initialize a new run file. Re-record only
still-valid approvals and actual evidence. The tool checks the mode against Gate A.

Issue tracking and messaging are optional user-requested actions. Keep output in local
files/chat by default. No ticket or message is sent merely because a feature was built.
