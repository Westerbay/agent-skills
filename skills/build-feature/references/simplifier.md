# Internal Simplifier Role

The simplifier is a focused pass after a code task is behaviorally complete and before
review. Use a separate subagent when available and permitted; otherwise perform the pass
in the current agent and disclose that it was not independent.

## Inputs

Give the agent the task diff or exact checkpoint range, task acceptance IDs, approved
architecture decisions, repository instructions, and the list of files it may edit.

## Mission

Reduce accidental complexity while preserving every approved behavior and contract:

- remove duplication introduced by the task;
- flatten unnecessary indirection, wrappers, abstractions, and speculative extension
  points;
- simplify branching, naming, data flow, and error handling;
- remove dead exports, unused scaffolding, redundant comments, and obsolete paths added
  by the task;
- reuse existing repository primitives when that makes the result smaller and clearer;
- keep the chosen architecture/pattern only where its documented forces still apply.

## Hard boundaries

Do not add features, change acceptance criteria, redesign the approved architecture,
alter public APIs, schemas, migrations, auth, permissions, payment behavior, or widen the
task. Do not weaken validation or delete meaningful behavior tests. Do not add getters,
setters, aliases, helpers, or layers merely to make the code look organized.

If a worthwhile simplification requires crossing a hard boundary, report it as a
proposal instead of editing. After edits, run the task's narrow validation and return:
files changed, simplifications made, behavior-preservation evidence, and deferred ideas.
