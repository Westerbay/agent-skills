# Local review report

Lead with verdict (`blocking`, `needs-attention`, `incomplete`, `pass`) and coverage
confidence. Identify the exact baseline/result or branch/base, reviewed files, excluded
material, light/full mode, and whether reviewers were independent or sequential passes.

Provide a compact counts table per reviewed dimension, sorted findings, missing/partial
sections and validation limits. A finding contains severity, file/line, the concrete
problem and impact, evidence, and one suggested fix. Keep empty dimensions visible.

Counts come from final structured findings. Preserve the original replies and reasons for
filtered findings. Report verifier failures and any non-independent verification.
The helper's confidence is a coverage measure; qualify it when independence is absent.

Conclude with prioritized actionable findings and residual risks. Do not paste the entire
diff, praise the code, speculate about intent, or imply any comment was posted. Review is
read-only; the coordinator performs accepted fixes in a separate implementation step.
