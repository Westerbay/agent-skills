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

When several dimensions or skills report one root cause, keep one supported finding at
its owning dimension with combined evidence and related files. Preserve originals and
the consolidation reason; the helper deduplicates exact entries only, not cross-dimension
meaning. Keep distinct defects with different impacts separate. Code size, a test-mix
deviation, a SOLID label, or a generic SEO score alone cannot establish a warning.

For accepted maintainability findings, name the concrete refactor, affected consumers,
and behavior to preserve. Route it to the implementation coordinator's correction pass;
do not leave a verified in-scope defect as advice merely because tests currently pass.
In `build-feature`, assign each correction to its CODE owner and eventual task patch/PR.
Give shared-file changes one writer and recheck affected consumers across task boundaries.
The frozen review covers the integrated feature; do not send each owner through a separate
review loop. Complete corrections and affected/integrated validation before taking the
next cumulative snapshot, within the two-round feature limit.
When repair exceeds the approved contract, retain the finding and required scope decision
rather than presenting an unperformed redesign as a completed fix.

For full review, apply the verifier reference to warnings/criticals. Preserve raw replies,
accepted corrections and reasons separately. A failed verifier retains findings as
unverified; it cannot turn the result into a clean pass. For security, apply the
[verifier evidence exception](verifier.md#security-evidence-exception): preserve the raw
candidate and report the unresolved check as unranked with partial coverage, until the
required verification succeeds. Reaggregate final counts.
