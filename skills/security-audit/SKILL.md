---
name: security-audit
description: Security guidance and vulnerability review for codebases, APIs, services, CLI tools, libraries, and daemons. Use for security questions, focused reviews, vulnerability research, security audits, or pen tests. Run the complete workflow only for explicit codebase audit or pen-test requests, full/comprehensive/end-to-end reviews, or requested report artifacts.
---

# Security Audit

Before providing security guidance or starting a review or audit, read
[Cloudflare's upstream workflow](UPSTREAM-SKILL.md). Its mode selection, read-only
source policy, execution isolation, evidence rules, independent verification and
completion requirements apply unchanged. This entrypoint only adds output-language
guidance; it grants no additional authority and does not expand the requested scope.

Use the user's current conversation language for questions, findings, explanations,
report prose and natural-language fields in structured results, unless the user
explicitly requests another output language. Do not infer that language from English
skill instructions, examples or repository source. Pass the chosen output language
to every delegated agent, including hunters, verifiers and report writers.

Preserve schema keys, enum values, severity identifiers, filenames, code identifiers,
commands and quoted evidence exactly. Translate the surrounding explanation, not the
underlying evidence or machine-readable contract.

Where upstream companions refer to `SKILL.md`, read the matching section of
`UPSTREAM-SKILL.md`. Both files share the same directory, so bundled resource paths
remain unchanged. See [upstream attribution and packaging](UPSTREAM.md).
