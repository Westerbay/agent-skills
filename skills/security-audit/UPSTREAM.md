# Cloudflare security-audit attribution

This skill is copied from [Cloudflare's security-audit-skill](https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit).

- Upstream revision: `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`.
- Retrieved: 2026-10-27.
- Copyright (c) 2025-2026 Cloudflare, Inc.
- License: MIT; the complete upstream copyright and permission notice is in [LICENSE](LICENSE).

All 20 files in the upstream skill directory are preserved without content changes,
including its companions, JSON schema, validators and tests. The original `SKILL.md`
is stored byte-for-byte as [UPSTREAM-SKILL.md](UPSTREAM-SKILL.md); all other upstream
filenames are unchanged. The repository-root upstream license is copied into this
directory so individual installations carry it. [UPSTREAM.json](UPSTREAM.json) keeps
the original upstream paths and Git blob SHA-1 values. The vendor validator maps only
its `SKILL.md` entry to `UPSTREAM-SKILL.md` and checks the same pinned bytes.

The local [SKILL.md](SKILL.md) entrypoint requires reading the upstream workflow and
adds the user's conversation language for narrative output and delegated reports.
It preserves machine-readable contracts, quoted evidence and every upstream safety,
scope and completion requirement. This entrypoint and the two provenance files are
local packaging additions. No endorsement by Cloudflare is implied.

The upstream audit reports vulnerabilities and recommended fixes; it does not modify
the audited source. Its guidance/full-audit distinction, execution isolation and
independent verification requirements remain intact. Full runtime validation needs
the sandbox capabilities described in [UPSTREAM-SKILL.md](UPSTREAM-SKILL.md).

The imported CLI validators require OS no-follow and nonblocking file-open protections.
Native Windows Node does not provide those flags: the validators refuse to read input,
and some upstream CLI tests fail rather than skip. This is an upstream platform limit,
not a reason to remove the protections. Run the complete validator suite in a compatible
POSIX environment; this repository's validation CI uses Linux. Source review remains
available, subject to the upstream evidence and coverage rules.

To update this copy, resolve an explicit upstream commit, review its changes and
license, copy the complete skill directory and root license, and refresh the manifest.
Store upstream `SKILL.md` as `UPSTREAM-SKILL.md`, preserving the local language entrypoint.
Run `node scripts/validate-security-audit-vendor.mjs` from this repository root, then
the bundled validator tests and repository checks. Do not edit imported files silently;
record deliberate downstream changes and stop describing the copy as unmodified.
