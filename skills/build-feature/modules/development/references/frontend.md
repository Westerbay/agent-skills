# Frontend development

Read this reference when changing React, UI structure, forms, client state,
localization, accessibility, interaction behavior, or web page delivery and metadata.

## React and component boundaries

- Choose `useEffect` by purpose, not by a ban. Before adding or replacing one, check
  React's guidance and the official documentation matching the project's installed
  framework, router, query, form, or integration library. Use its intended API when it
  already owns the behavior; no special approval is required for an appropriate Effect.
- Calculate derived values during rendering. Handle user-triggered work in event
  handlers or the tool's action/mutation API; avoid Effects that chain state updates.
- For server data, prefer the project's documented loading, server-fetching or query/cache
  mechanism when suitable. Do not duplicate query-key-driven fetching with an Effect and
  `refetch()`, or add a dependency solely to avoid an Effect.
- Use an Effect for synchronization with an external system over the component lifecycle:
  a connection, browser subscription, or imperative widget, for example. Prefer the
  library's React adapter or `useSyncExternalStore` for a supported store subscription.
- Fetching in an Effect remains a valid fallback when no suitable mechanism exists.
  Handle loading/errors, stale responses and cancellation or ignored obsolete results;
  Effects do not supply server-rendered data.
- Keep each Effect focused, declare its reactive dependencies, and mirror setup with
  cleanup where needed. Verify dependency changes, unmount and development setup/cleanup
  replay. Do not suppress dependency checks, hide lifecycle bugs with run-once refs,
  or move side effects into rendering just to remove an Effect.

Use React's [useEffect reference](https://react.dev/reference/react/useEffect),
[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect), and
[Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) alongside
the relevant tool's documentation; these examples are decision guidance, not a whitelist.

## Component organization

- Prefer named handlers for non-trivial behavior and pass an existing callable directly
  rather than wrapping it. Short inline callbacks or adapters are fine when clearer.
  A function declared during render is not stable merely because it has a name; stabilize
  its identity only when a consumer/lifecycle contract or measurement requires it.
- Name non-trivial prop calculations before JSX. Short inline objects, arrays or mapped
  content can remain inline when they are easy to read and do not break an existing
  identity-sensitive boundary. Extract substantial construction or multi-step logic.
- Keep trivial one-line adapters in the component instead of building noisy hooks.
- Follow the repository's form abstraction and validation path.
- Give reused form defaults a clear owner. Keep defaults that depend on props, identity
  or request context in that scope; follow the form library's initialization/reset rules.
- Keep views focused on composition. Move reusable behavior into the repository's
  established feature, hook, or library location.
- Extract a component for shared semantic interaction and presentation, a hook or
  equivalent for shared stateful behavior, and a domain function for a shared pure rule.
  Similar markup alone does not justify merging unrelated business policies. Keep a
  feature-owned abstraction local until actual consumers justify wider ownership.
- Give coordinated state an explicit common owner; sharing a hook shares logic, not
  one state instance. Preserve controlled/uncontrolled contracts, instance isolation,
  identity, cancellation, and cleanup when extracting behavior.
- Use named variants for one cohesive axis and composition for independent concerns.
  Avoid accumulating unrelated boolean props or building a generic schema interpreter
  to accommodate consumers with different responsibilities.
- When no stronger local convention exists, keep one primary exported React component
  per TSX file and extract independently reusable components.
- Keep route files focused on the routing contract, page metadata, data loading, and
  page composition. Move substantial forms and feature views into named component files
  so they can be read and reused without importing a route module.
- For forms coordinating validation, submission, errors, navigation or cache changes,
  extract a feature hook when it concentrates a cohesive responsibility, improves reuse
  or makes orchestration materially easier to follow. A readable local submit handler
  does not need a hook solely because it performs several related steps. Keep short
  field adapters local and follow the repository's form conventions.
- Do not split code into hooks or components that merely forward arguments without
  concentrating useful behavior.

React permits both [named and inline event handlers](https://react.dev/learn/responding-to-events).
[Callback memoization](https://react.dev/reference/react/useCallback) is a separate choice
about identity and dependencies, not a prerequisite for a readable handler.

## Semantic HTML and interaction contracts

- Choose native elements by purpose: links with real destinations for navigation,
  buttons with intentional types for actions, labeled controls for input, and lists or
  tables for actual collection relationships. Check the DOM emitted by shared components.
- Express page structure through meaningful landmarks and heading ranks. Keep neutral
  wrappers as `div`/`span` when appropriate; replacing every wrapper with `section`
  creates false structure. Assess headings in the composed page, not just one component.
- Prefer native behavior and established accessible primitives. ARIA does not implement
  keyboard interaction. For custom widgets, implement the relevant keyboard, focus, and
  state contract, including focus restoration and background interaction for overlays.
- Associate form labels and errors with stable, instance-specific field IDs; a
  placeholder is not a label. Preserve validation feedback and recovery after failure.
- When replacing markup, preserve form submission, disabled behavior, event propagation,
  accessible names, link destinations, and intended analytics. Exercise the interaction
  with keyboard and pointer; an automated accessibility scan alone is insufficient.

## Clarity and user behavior

- Name non-obvious conditions and constants. Replace nested or long ternaries with clear
  control flow.
- Reuse translation and formatting infrastructure. Do not hardcode user-facing language,
  locale, dates, currencies, or provider messages.
- Expose the default locale and supported locale list from the localization package or
  runtime, and reuse those values at application boundaries such as email rendering.
- For a reusable starter or a product expected to add locales, establish a message
  catalog and localization runtime before screens accumulate copy, even when the first
  release has one locale. Use the localization library's plural, select, number, and date
  rules instead of assembling grammatical variants in components.
- Use the repository's toast system for brief action outcomes that do not need to remain
  beside a field or control. Keep validation and recoverable contextual errors inline,
  and avoid showing the same failure both inline and as a toast.
- Reuse shared components, design tokens, query keys, mutations, and invalidation
  conventions before creating feature-local copies.
- Before changing shared component defaults, styling, callbacks, or prop semantics,
  inspect every consumer. Scope feature-specific behavior behind an explicit prop or
  variant so untouched screens do not change accidentally.
- Preserve referential stability across memoized seams. Do not introduce inline objects,
  parsing, or callbacks that invalidate an existing memo chain without reason.
- Preserve useful server errors instead of replacing them with generic messages.
- Keep equivalent list/detail/table/export views aligned on formatting and values by
  sharing the owning formatter or mapper.
- Verify keyboard access, focus behavior, validation feedback, pending/error/empty
  states, and responsive layout.
- Verify successful flows clean up transient UI and URL state, while failed flows remain
  recoverable and show the actionable cause.
- Check whether typing, focus changes, or renders trigger avoidable navigation, network
  calls, or state synchronization.

## Web delivery and discoverability

- Establish whether a route is public and intended for discovery or private/intentionally
  excluded. Preserve authentication and intentional `noindex`; robots directives are not
  access control, and `robots.txt` blocking does not guarantee exclusion from search.
- Give routed pages intentional titles and descriptions. For public discovery surfaces,
  keep canonical URLs, internal links, redirects, sitemap entries, and locale identity
  coherent. Do not canonicalize distinct content to one page merely to remove duplicates.
  Add social metadata and supported structured data when relevant; values must describe
  the actual visible content, not invented ratings or offers.
- When changing delivery, inspect direct-load status/headers and initial HTML as well as
  the hydrated document and client navigation. Check real error responses, crawlable
  links, and route-specific metadata; a shared generator must not leak another route's
  title or canonical. Use the project's rendering model without imposing an SSR rewrite.

For material visual design, interaction design, responsive behavior, or UX polish,
follow the UI workflow in [standalone-workflows.md](standalone-workflows.md).
Use a compatible installed design skill when available and useful; it is optional.
