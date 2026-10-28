---
name: web-review
description: Review web changes in a Git diff for SEO, semantic HTML, accessibility, and reusable components and behavior. Use for a focused web review or to review and refactor an implemented web change; skip unrelated backend-only changes.
---

# Web Review

Review the page a user or crawler receives, the interactions it supports, and the
boundaries that keep those behaviors maintainable. Follow dependencies beyond changed
lines when necessary to understand the resulting web behavior. Produce actionable
findings and, when authorized, implement the smallest effective refactors.

This skill is standalone. Use available local Git, project commands, and browser tools;
it requires no other skill, hosting account, tracker, or external audit service. Resolve
reference links relative to this directory. Follow repository and framework conventions.

## Scope and authority

- For a review-only request, inspect and report without modifying source. Include
  concrete refactor recommendations, not only observations.
- For review and refactor, review and fix, or review during already authorized
  implementation, carry out in-scope local corrections and behavior-preserving
  refactors. Do not stop at advice or ask again for permission already granted.
- Preserve unrelated changes, public URLs, event and analytics contracts, state
  ownership, and intentional access/indexing policies. Ask before material scope or
  architecture expansion, public-contract changes, or auth/data changes not already
  authorized. Do not commit, publish, deploy, or mutate external services without that
  action's authorization.

## 1. Establish the actual web impact

Read repository instructions, Git status, the requested base/head or working-tree diff,
nearby tests, routing, and shared-component conventions. State the exact comparison;
inspect staged, unstaged, and untracked files only as relevant to the requested scope.
Do not silently substitute the default branch for an ambiguous requested base.

Trace changed templates, components, styles, handlers, route loaders, metadata builders,
HTTP headers, redirects, and shared dependencies to affected pages. File extensions are
discovery hints: a server-only change can alter rendered HTML or indexability, while a
`.tsx` test fixture may have no shipped web impact. If none exists, report that the web
review is not applicable and why; do not invent SEO findings.

For each relevant surface, identify its audience, public/indexable versus private or
intentionally excluded status, rendering mode, and affected journeys. Inspect existing
evidence before asking about indexing intent. Unresolved product intent is a question,
not proof of a defect.

When an approved UI/UX plan or design exists, read its exact referenced revision and
compare the affected flow, states and rendered result with it. Ask the coordinator for
missing references instead of assuming chat attachments are available or inventing a
replacement design. Record inaccessible visuals as a coverage limit. This checks the
existing contract; it does not introduce another design phase or approval gate.

## 2. Review the affected contracts

Read only the references relevant to the change:

- [SEO and delivery](references/seo-and-delivery.md): public routes, metadata, content
  discovery, rendering, canonical URLs, robots rules, redirects, and structured data.
  Private applications still need correct exclusion and delivery behavior.
- [Semantic HTML and interaction](references/semantics-and-interaction.md): changed
  markup, navigation, forms, controls, dynamic content, focus, and accessibility.
- [Components and reusable behavior](references/component-boundaries.md): shared or
  duplicated presentation, state, events, data loading, and useful extraction seams.

Inspect both the changed implementation and its callers. Prefer a smaller native
element or an existing component over adding a second implementation of its behavior.
Distinguish an observed bug, a maintainability risk supported by concrete consumers,
and an optional preference. A count of `div` elements or an absent abstraction alone
does not establish a finding.

## 3. Refactor and validate the observable result

When edits are authorized, correct the highest-impact issue in a focused slice. Name
the behavior that must remain stable, change its owner, update affected consumers, and
remove superseded code. Preserve native browser semantics when replacing markup:
button type, form submission, link destinations, focus, accessible names, and event
propagation can change even if the screen looks identical.

Use existing safe checks proportionally:

- Run relevant type, lint, build, and behavior tests. Add a regression test only for a
  meaningful defect or contract, such as keyboard activation, route metadata isolation,
  error recovery, or independent state across component instances.
- For changed interaction, exercise the actual journey and inspect DOM/accessibility
  output with available browser tools. Include keyboard operation and relevant loading,
  empty, error, disabled, and narrow-viewport states.
- For changed delivery or SEO, inspect response status/headers and initial HTML as well
  as the rendered document on representative routes. Client navigation alone can hide
  direct-load or server metadata regressions.
- Test through visible behavior, roles, names, and destinations. Avoid tests that lock
  in private component methods, wrapper counts, CSS class strings, or incidental styling.
  An automated accessibility scan supplements manual interaction checks; it does not
  certify accessibility or indexing.
- Use selected visual regressions when they protect an approved layout or meaningful
  rendering behavior. Keep fixtures and rendering conditions stable, inspect baseline
  changes, and avoid snapshots added solely to increase coverage.

Use safe local fixtures and existing project tooling. If a check is unavailable, state
which claim remains unverified. Do not invent screenshots, browser results, SEO scores,
search visibility, or production indexing outcomes. Inspect the final diff after edits.

## 4. Report evidence and remaining work

Lead with consequential findings or completed fixes. For each, give a precise file and
line, affected route/consumer, triggering state, observable impact, and the narrowest
repair or refactor. Explain the validation actually performed and any remaining gap.
Group duplicate symptoms under their shared cause; separate pre-existing adjacent debt
from problems introduced or worsened by the reviewed diff. Do not create findings to
fill a quota. A clean review states its scope and limits rather than claiming certainty.
