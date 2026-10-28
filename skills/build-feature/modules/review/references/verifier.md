# Verify consequential findings

Use a second opinion for consequential or contested warnings/criticals when it adds
confidence. Security retains its companion's required independent verification. Do not
launch a verifier for nits, a clean reply or every reviewer by default. Without an
independent agent, disclose a sequential verification pass and its limits.

The verifier reads the cited behavior, actual consumers, approved intent and relevant
library contract from the same frozen snapshot. It actively looks for a concrete reason
the claim is wrong; it does not assume every warning is real or dismiss one merely because
confirmation is inconvenient. Generic uncertainty is not evidence of intentional behavior.

## Assignment and result

Pass the manifest and saved patch paths, exact patch digest, original finding IDs and
verbatim findings. Include inspected intent sources and approved design references;
unavailable documents remain unavailable, not imagined approval. No source edits or
new Git diff collection are permitted. Verification can proceed as reviewer replies
arrive; aggregate after the selected coverage and needed verification are complete.

Return one JSON object:

```json
{
  "agent": "verifier",
  "version": "2.0.0",
  "patchDigest": "<exact manifest digest>",
  "reviewer": "<reviewer under verification>",
  "verdicts": [
    {"id": "<original finding ID>", "verdict": "real", "reason": "<concrete evidence>"}
  ],
  "errors": []
}
```

One verdict per supplied ID; no invented IDs. Allowed verdicts:

- `real`: the demonstrated defect and plausible consequence survive examination.
- `intentional`: inspected approved intent explains the change, with no unhandled
  consumer or consequence. Drop it from findings while preserving evidence and reason.
- `unsourced`: the claim rests on speculation or an unsupported library/deployment fact.
  Keep an unranked note and any unresolved coverage gap; do not present it as a defect.

Verify third-party behavior against the installed version's source or official docs.
Seed/mock data is not a defect by itself, but inspect genuine production leakage before
calling it intentional. A deliberate contract change can still break an overlooked caller.

## Validation and failure handling

The coordinator validates JSON, v2 version, exact patch digest, reviewer, IDs and verdicts
before applying results. The aggregation helper does not ingest verifier replies directly.
Retry invalid replies once on the unchanged snapshot. Reject stale replies rather than
rewriting their digest. Preserve raw review and verification evidence separately, then
recompute counts in the adjudicated reviewer reply.

Outside security, a verifier error or missing verdict must not delete a supported finding:
retain it as **unverified**, with the reason, rather than pretending verification succeeded.
The coordinator still judges its evidence and impact before delivery.

### Security evidence exception

Follow [security-audit integration](security-audit-integration.md). A verifier failure,
missing verdict or inaccessible decisive fact cannot establish security confirmation.
Preserve the candidate, but keep it as an unranked investigation note with partial
coverage/errors until required verification succeeds. Never default it to `real`, demote
it to nit or convert the missing check into a clean report.

Report accepted, refuted and unverified findings with concise reasons. Missing verification
is a visible limit, not permission to publish comments or weaken delivery requirements.
