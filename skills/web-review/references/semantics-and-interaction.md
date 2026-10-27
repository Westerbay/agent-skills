# Semantic HTML and interaction

Inspect the resulting DOM, including the elements emitted by shared components.
A component called `Button` may render a `div`; a component called `Box` may correctly
render a native button. Diagnose the actual semantics and behavior.

## Choose elements by purpose

| Purpose | Prefer | Evidence of a problem |
| --- | --- | --- |
| Navigate to a resource | An anchor with a real destination | Click-only navigation loses keyboard or browser link behavior |
| Perform an action | A native button with intentional `type` | A clickable `div`, accidental form submit, or link used only as an action |
| Identify document structure | Appropriate landmarks and ranked headings | Visual headings with no structural meaning; repeated unlabeled navigation regions |
| Group thematic content | A meaningful section or article where appropriate | Every spacing wrapper becomes a landmark, or real structure exists only visually |
| Present a collection | Lists or data tables with their actual relationships | Relationship information disappears when styling is removed |
| Collect input | Native fields and associated labels | Placeholder-only identity; duplicated IDs; errors disconnected from the input |

Use `div` and `span` for neutral grouping when there is no stronger semantic meaning.
Do not mechanically replace them with `section` or `article`. Sectioning expresses
content organization; it is not a styling convention. Check [WHATWG's sections definitions](https://html.spec.whatwg.org/multipage/sections.html)
when deciding whether a block is a section, article, navigation region, or aside.

Headings should expose an understandable hierarchy and use CSS for visual size. Assess
the composed page, not each component in isolation; a reusable card may need an explicit
heading-level contract. Avoid treating a heading count as an automatic ranking or
accessibility verdict. Follow [WAI's heading guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/).

## Prefer native behavior and complete the interaction

ARIA describes semantics; adding `role="button"` does not implement button keyboard
behavior. Prefer a native control and add ARIA only for missing state or relationships.
If a custom pattern is necessary, inspect its current WAI-ARIA pattern and implement
its entire relevant keyboard/focus/state contract, rather than copying roles alone.
See [APG's foundational guidance](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/).

Walk changed interactions with keyboard as well as pointer input. Check reachable
controls, visible focus, activation, disabled behavior, Escape where expected, and
focus placement/restoration for overlays. A modal must not leave background interaction
available unintentionally; an expanding disclosure must expose its state. Use existing
well-tested primitives before rebuilding these behaviors. Consult the relevant
[APG widget pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) for the specific widget.

For forms, check accessible names, intentional button types, field grouping, helper
text, validation, and recovery after a failed submission. Associate the visible label
with its field and generate stable instance-specific IDs when a component repeats.
A placeholder is not a durable substitute for a label. See [WAI's labeling guidance](https://www.w3.org/WAI/tutorials/forms/labels/).

For dynamic content, inspect loading, error, empty, and success states and how users
discover them without moving focus arbitrarily. Use suitable announcement semantics
when needed; do not put every update in an assertive live region. Preserve descriptive
link names and text alternatives for informative images; avoid announcing decoration.

## Refactor without changing the contract accidentally

When replacing a clickable wrapper with a button, check ancestor forms, nested
interactive children, default styling, disabled behavior, and event propagation.
When replacing navigation code with an anchor, preserve the URL, meaningful query
parameters, expected browser navigation, and intended analytics semantics. Fixing
semantics must not double-submit a form or drop a navigation event.

Verify the rendered tree and the actual interaction. Static markup review, automated
scans, keyboard checks, and assistive-technology checks provide different evidence;
state which were performed. An axe/Lighthouse pass alone is not a complete accessibility
review. Native semantics reduce implementation burden but do not prove the entire
experience is accessible.

Sources were consulted on 2026-10-27. WAI tutorials and APG are implementation guidance;
do not present a partial review as formal conformance certification.
