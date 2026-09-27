# Coordinator judgment

Verify the evidence before accepting, dismissing or ranking a finding. Inspect the cited
code, approved intent, relevant caller and version-appropriate library contract.

Only actionable defects should block. Drop disproven or explicitly intentional changes
with no unhandled consequence; keep the reason beside the original finding. Move
confirmation requests, stylistic preferences and unsourced speculation to nonblocking
notes or nits. Do not treat a severity label as proof. Security findings are never nits:
keep a supported vulnerability at its justified severity, or move an unverified concern
to an explicit investigation note without declaring the security review complete if the
evidence gap prevents it.

Static fixture data and test doubles are not automatically defects, but check for genuine
production leakage. A library may already handle an edge case; verify before requiring
extra guards. Equivalent short blocks do not automatically justify a shared abstraction.
Unavailable documents/visuals limit coverage and must not be silently assumed correct.

For full review, apply the verifier reference to warnings/criticals. Preserve raw replies,
accepted corrections and reasons separately. A failed verifier retains findings as
unverified; it cannot turn the result into a clean pass. Reaggregate final counts.
