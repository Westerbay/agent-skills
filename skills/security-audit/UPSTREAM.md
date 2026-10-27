# Cloudflare security-audit attribution

This skill is copied from [Cloudflare's security-audit-skill](https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit).

- Upstream revision: `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`.
- Retrieved: 2026-10-27.
- Copyright (c) 2025-2026 Cloudflare, Inc.
- License: MIT; the complete upstream copyright and permission notice is in [LICENSE](LICENSE).

All 20 files in the upstream skill directory are preserved without content changes,
including its companions, JSON schema, validators and tests. The repository-root
upstream license is copied into this directory so individual installations carry it.
[UPSTREAM.json](UPSTREAM.json) records the upstream Git blob SHA-1 for every copied
file. These two provenance files are local packaging additions. No endorsement by
Cloudflare is implied.

The upstream audit reports vulnerabilities and recommended fixes; it does not modify
the audited source. Its guidance/full-audit distinction, execution isolation and
independent verification requirements remain intact. Full runtime validation needs
the sandbox capabilities described in [SKILL.md](SKILL.md).

The imported CLI validators require OS no-follow and nonblocking file-open protections.
Native Windows Node does not provide those flags: the validators refuse to read input,
and some upstream CLI tests fail rather than skip. This is an upstream platform limit,
not a reason to remove the protections. Run the complete validator suite in a compatible
POSIX environment; this repository's validation CI uses Linux. Source review remains
available, subject to the upstream evidence and coverage rules.

To update this copy, resolve an explicit upstream commit, review its changes and
license, copy the complete skill directory and root license, and refresh the manifest.
Run `node scripts/validate-security-audit-vendor.mjs` from this repository root, then
the bundled validator tests and repository checks. Do not edit imported files silently;
record deliberate downstream changes and stop describing the copy as unmodified.
