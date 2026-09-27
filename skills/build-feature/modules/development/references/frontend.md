# Frontend development

Read this reference when changing React, UI structure, forms, client state,
localization, accessibility, or interaction behavior.

## React and component boundaries

- Treat `useEffect` as banned. Prefer event handlers, derived state,
  router loaders/actions, server-state or query APIs, form APIs, component keys, refs,
  or `useSyncExternalStore`.
- If `useEffect` appears unavoidable for true external synchronization, stop before using
  it and explain why the alternatives do not fit. Keep dependencies and cleanup narrow.
- For inputs, changes, submits, and clicks, define named handlers before JSX and pass
  stable references.
- Compute non-trivial prop values before JSX and pass named variables. Keep inline props
  to direct values or short simple expressions; do not construct objects, arrays, mapped
  JSX trees, or multi-step callbacks inside a prop assignment.
- Keep trivial one-line adapters in the component instead of building noisy hooks.
- Follow the repository's form abstraction and validation path.
- Define reusable form default values above the hook or component that creates the form,
  then pass the named value to the form API.
- Keep views focused on composition. Move reusable behavior into the repository's
  established feature, hook, or library location.
- When no stronger local convention exists, keep one primary exported React component
  per TSX file and extract independently reusable components.
- Keep route files focused on the routing contract, page metadata, data loading, and
  page composition. Move substantial forms and feature views into named component files
  so they can be read and reused without importing a route module.
- When a form coordinates validation, async submission, server errors, navigation,
  cache invalidation, or several related handlers, place that behavior in a feature hook
  in the repository's established hooks location. Keep field markup and presentation in
  the form component. Leave short field adapters local rather than hiding every handler
  behind a hook.
- Do not split code into hooks or components that merely forward arguments without
  concentrating useful behavior.

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
- Give routed pages intentional titles and descriptions. Check canonical URLs, social
  metadata, indexing rules, and structured data when the page is public and discovery
  matters; keep private and authentication screens out of search indexes when suitable.
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

For material visual design, interaction design, responsive behavior, or UX polish,
follow the UI workflow in [standalone-workflows.md](standalone-workflows.md).
Use a compatible installed design skill when available and useful; it is optional.
