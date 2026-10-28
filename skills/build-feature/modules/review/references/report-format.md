# Local review report

Lead with verdict (`blocking`, `needs-attention`, `incomplete`, `pass`) and coverage
confidence. Identify the exact baseline/result or branch/base, reviewed files, excluded
material, selected reviewers, and whether they were independent or sequential passes.
Identify selected specialist skills and the concerns they covered; distinguish bundled
fallback, not-applicable checks, and checks that failed or remained unavailable. Do not
claim a standalone skill was used merely because its criteria are summarized here.
For `build-feature`, identify the cumulative snapshot/digest and review round, including
explicit authorization if beyond the two autonomous rounds. Show which CODE tasks it
contains and report cross-task risks in this same review.

Provide a compact counts table per reviewed dimension, sorted findings, missing/partial
sections and validation limits. A finding contains severity, file/line, the concrete
problem and impact, evidence, and one suggested fix. Keep empty dimensions visible.

Counts come from final structured findings. Preserve the original replies and reasons for
filtered findings. Report verifier failures and any non-independent verification.
The helper's confidence is a coverage measure; qualify it when independence is absent.

Conclude with prioritized actionable findings and residual risks. Do not paste the entire
diff, praise the code, speculate about intent, or imply any comment was posted. Review is
read-only; the coordinator performs accepted fixes in a separate implementation step.
In the final feature handoff, link accepted finding IDs to their owning CODE tasks,
refactors, validation, and reviewed snapshot that resolved them. Keep deferred findings
and their reasons visible. Each later task patch/PR references this shared review and its
relevant findings; compare its content with the reviewed result before delivery. A new
source edit invalidates that evidence rather than inheriting a clean verdict. Do not
produce another review report per task merely to repeat the cumulative findings.
