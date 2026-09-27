#!/usr/bin/env python3
"""Local deterministic Argus preparation, aggregation and anchor classification. No posting."""
import argparse
import ast
from collections import Counter
import fnmatch
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys

SECTIONS = ['quality', 'conventions', 'regression', 'logic', 'architecture', 'security']
SEVERITIES = ['critical', 'warning', 'nit']
IGNORE = ['*.lock', 'bun.lock', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'snapshot.json', '*.snap', '*.gen.ts']
IGNORE_DIRS = {'paraglide', 'generated', 'dist', '.turbo', 'node_modules'}


def git(repo, *args):
    result = subprocess.run(['git', '-C', str(repo), '-c', 'core.quotepath=true', *args], capture_output=True)
    if result.returncode:
        raise ValueError(result.stderr.decode().strip())
    return result.stdout.decode('utf-8', errors='surrogateescape')


def ignored(path):
    p = PurePosixPath(path)
    return bool(set(p.parts) & IGNORE_DIRS) or any(fnmatch.fnmatch(p.name, pattern) for pattern in IGNORE)


def patch_path(raw):
    raw = raw.strip()
    if raw.startswith('"'):
        raw = ast.literal_eval(raw).encode('latin1').decode('utf-8', errors='surrogateescape')
    if raw == '/dev/null':
        return None
    return raw[2:]


def patch_index(patch):
    files, hunks = set(), {}
    path, line, current = None, None, None
    for text in patch.splitlines():
        if text.startswith('diff --git '):
            path, line, current = None, None, None
        elif text.startswith('+++ '):
            path = patch_path(text[4:])
            if path:
                files.add(path)
        elif text.startswith('@@ '):
            match = re.match(r'@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@', text)
            if not match or not path:
                line = None
                continue
            line = int(match[1])
            current = []
            hunks.setdefault(path, []).append(current)
        elif line is not None and text.startswith(('+', ' ')):
            current.append(line)
            line += 1
        elif line is not None and text.startswith(('-', '\\')):
            continue
        else:
            line = None
    return files, hunks


def prepare(repo, base, branch, staged, full, out):
    repo = Path(git(repo, 'rev-parse', '--show-toplevel').strip())
    if branch.startswith('-') or base and base.startswith('-'):
        raise ValueError('Invalid ref')
    head = git(repo, 'rev-parse', '--verify', f'{branch}^{{commit}}').strip()
    base_sha = git(repo, 'rev-parse', '--verify', f'{base}^{{commit}}').strip() if base else None
    if not staged and not base_sha:
        raise ValueError('Pass --base explicitly for branch review')
    diff_args = ['--cached'] if staged else [f'{base_sha}...{head}']
    files = list(filter(None, git(repo, 'diff', '--name-only', '-z', *diff_args).split('\0')))
    kept = [name for name in files if not ignored(name)]
    patch = ''
    if kept:
        patch = git(repo, 'diff', '--no-ext-diff', '--no-textconv', '--src-prefix=a/', '--dst-prefix=b/', *diff_args, '--', *[f':(literal){name}' for name in kept])
    tree_files = list(filter(None, git(repo, 'ls-files', '-z').split('\0'))) if staged else list(filter(None, git(repo, 'ls-tree', '-r', '--name-only', '-z', head).split('\0')))
    packages = [name for name in tree_files if PurePosixPath(name).name == 'package.json' and not set(PurePosixPath(name).parts) & IGNORE_DIRS]
    libs = {}
    package_errors = []
    for name in packages:
        try:
            data = json.loads(git(repo, 'show', f':{name}' if staged else f'{head}:{name}'))
            libs.update(data.get('dependencies', {}))
            libs.update(data.get('devDependencies', {}))
        except (ValueError, json.JSONDecodeError) as error:
            package_errors.append(f'{name}: {error}')
    capabilities = {
        'i18n': any(any(word in lib for word in ['i18next', 'next-intl', 'react-intl', 'paraglide', 'vue-i18n', '@formatjs', 'use-intl']) for lib in libs) or any(set(PurePosixPath(name).parts) & {'locales', 'messages'} for name in tree_files),
        'frontend': any(re.search(r'\.(tsx|jsx|vue|svelte|html)$', name) for name in tree_files),
        'react': 'react' in libs, 'payments': any('stripe' in lib or 'paypal' in lib for lib in libs),
        'monorepo': any(name in tree_files for name in ['turbo.json', 'turbo.jsonc', 'pnpm-workspace.yaml']) or len(packages) > 1,
    }
    counts = {}
    for name in kept:
        try:
            counts[name] = len(git(repo, 'show', f':{name}' if staged else f'{head}:{name}').splitlines())
        except ValueError:
            if name in tree_files:
                raise
    manifest = {'schemaVersion': 1, 'repo': str(repo), 'mode': 'staged' if staged else 'branch',
                'base': base or '', 'branch': branch, 'headSha': head, 'baseSha': base_sha,
                'patchDigest': hashlib.sha256(patch.encode('utf-8', errors='surrogateescape')).hexdigest(),
                'files': kept, 'excluded': [name for name in files if name not in kept],
                'reviewers': SECTIONS if full else SECTIONS[:4], 'capabilities': capabilities,
                'libraries': libs, 'manifestErrors': package_errors, 'lineCounts': counts,
                'patchBytes': len(patch.encode('utf-8', errors='surrogateescape'))}
    out.mkdir(parents=True, exist_ok=False)
    (out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    (out / 'diff.patch').write_text(patch, errors='surrogateescape')
    (out / 'name-status.txt').write_text(git(repo, 'diff', '--name-status', *diff_args))
    (out / 'numstat.txt').write_text(git(repo, 'diff', '--numstat', *diff_args))
    return {'manifest': str((out / 'manifest.json').resolve()), 'patch': str((out / 'diff.patch').resolve()), 'files': len(kept), 'excluded': manifest['excluded']}


def validate_reply(reply, section, manifest):
    required = {'agent', 'version', 'scope', 'status', 'coverage', 'summary', 'findings', 'notes', 'errors'}
    if not isinstance(reply, dict) or not required <= reply.keys():
        raise ValueError('Missing required reply fields')
    if reply['agent'] != f'{section}-reviewer' or not re.fullmatch(r'1\.\d+\.\d+', reply['version']):
        raise ValueError('Wrong agent or contract major version')
    combinations = {'ok': 'complete', 'partial': 'partial', 'error': 'not-run'}
    if reply['status'] not in combinations or reply['coverage'] != combinations[reply['status']]:
        raise ValueError('Invalid status/coverage combination')
    for key in ['notes', 'errors']:
        if not isinstance(reply[key], list) or any(not isinstance(item, str) for item in reply[key]):
            raise ValueError(f'{key} must be a string array')
    if bool(reply['errors']) != (reply['status'] != 'ok'):
        raise ValueError('Partial/error replies require errors; ok replies must have none')
    scope = reply['scope']
    if scope.get('mode') != manifest['mode'] or scope.get('base') != manifest['base'] or scope.get('branch') != manifest['branch']:
        raise ValueError('Reply scope differs from the prepared snapshot')
    if not isinstance(scope.get('files'), list) or not set(scope['files']) <= set(manifest['files']):
        raise ValueError('Reply lists files outside the review snapshot')
    if reply['status'] == 'ok' and set(scope['files']) != set(manifest['files']):
        raise ValueError('Complete coverage must include all assigned files')
    if not isinstance(reply['findings'], list):
        raise ValueError('findings must be an array')
    ids = set()
    for item in reply['findings']:
        for field in ['id', 'section', 'severity', 'category', 'title', 'file', 'evidence', 'confidence', 'recommendation']:
            if not isinstance(item.get(field), str) or not item[field].strip():
                raise ValueError(f'Finding requires {field}')
        if item['id'] in ids:
            raise ValueError('Duplicate finding ID')
        ids.add(item['id'])
        if item['section'] != section or item['severity'] not in SEVERITIES or item['confidence'] not in ['high', 'medium', 'low']:
            raise ValueError('Invalid finding classification')
        if section == 'security' and item['severity'] == 'nit':
            raise ValueError('Security finding cannot be a nit')
        if item['file'] not in manifest['files']:
            raise ValueError('Finding file is outside the assigned diff')
        if not isinstance(item.get('related_files'), list) or any(not isinstance(path, str) for path in item['related_files']):
            raise ValueError('related_files must be a string array')
        for key in ['line', 'end_line']:
            if key in item and (type(item[key]) is not int or item[key] < 1):
                raise ValueError('Line numbers must be positive integers')
        if 'end_line' in item and ('line' not in item or item['end_line'] < item['line']):
            raise ValueError('Invalid finding line range')
    counts = {key: sum(item['severity'] == key for item in reply['findings']) for key in SEVERITIES}
    if reply['summary'] != counts or any(type(value) is not int for value in reply['summary'].values()):
        raise ValueError('Summary counts do not match findings')
    return reply


def aggregate(manifest, replies):
    findings, failures, reviews, seen = [], [], [], set()
    for section in manifest['reviewers']:
        try:
            reply = validate_reply(replies[section], section, manifest)
        except (KeyError, ValueError, TypeError, AttributeError) as error:
            failures.append({'section': section, 'error': str(error)})
            continue
        reviews.append({'section': section, 'status': reply['status'], 'coverage': reply['coverage'], 'notes': reply['notes']})
        if reply['status'] != 'ok':
            failures.append({'section': section, 'error': '; '.join(reply['errors'])})
        for item in reply['findings']:
            key = (section, item['file'], item.get('line'), item['severity'], item['title'].strip().casefold())
            if section == 'security' or key not in seen:
                findings.append(item)
            seen.add(key)
    findings.sort(key=lambda item: (SEVERITIES.index(item['severity']), item['file'], item.get('line', 0)))
    counts = {key: sum(item['severity'] == key for item in findings) for key in SEVERITIES}
    verdict = 'blocking' if counts['critical'] else 'needs-attention' if counts['warning'] else 'incomplete' if failures else 'pass'
    return {'schemaVersion': 1, 'patchDigest': manifest['patchDigest'], 'verdict': verdict,
            'confidence': 'low' if len(failures) > 1 else 'medium' if failures else 'high',
            'counts': counts, 'findings': findings, 'reviewers': reviews, 'failures': failures}


def anchors(manifest, patch, report, existing):
    if hashlib.sha256(patch.encode('utf-8', errors='surrogateescape')).hexdigest() != manifest['patchDigest'] or report['patchDigest'] != manifest['patchDigest']:
        raise ValueError('Patch/report snapshot mismatch')
    files, hunks = patch_index(patch)
    files.update(manifest['files'])
    exact = {(item.get('path'), item.get('line')) for item in existing if item.get('path') and item.get('line') is not None}
    classified, skipped = [], []
    for finding in report['findings']:
        path, line = finding['file'], finding.get('line')
        if line and (path, line) in exact:
            skipped.append({'id': finding['id'], 'reason': 'Existing comment at exact path and line'})
            continue
        start = finding.get('line')
        end = finding.get('end_line', start)
        matching = next((hunk for hunk in hunks.get(path, []) if start in hunk and end in hunk), None)
        kind = 'inline' if matching else 'file' if path in files else 'body'
        classified.append({'kind': kind, 'finding': finding})
    counts = dict.fromkeys(SEVERITIES, 0)
    for item in classified:
        counts[item['finding']['severity']] += 1
    event = 'REQUEST_CHANGES' if counts['critical'] or counts['warning'] else 'COMMENT' if counts['nit'] or report['failures'] or skipped else 'APPROVE'
    return {'classifications': classified, 'skipped': skipped, 'counts': counts, 'suggestedEvent': event,
            'requiresHumanJudgment': 'Review semantic duplicates across all existing comments before posting. No comments were published.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    prep = sub.add_parser('prepare')
    prep.add_argument('--repo', default='.')
    prep.add_argument('--base')
    prep.add_argument('--branch', default='HEAD')
    prep.add_argument('--staged', action='store_true')
    prep.add_argument('--full', action='store_true')
    prep.add_argument('--out', required=True, type=Path)
    agg = sub.add_parser('aggregate')
    agg.add_argument('--manifest', required=True, type=Path)
    agg.add_argument('--replies', required=True, type=Path, help='Directory with <section>.json files')
    agg.add_argument('--out', required=True, type=Path)
    anchor = sub.add_parser('anchors')
    anchor.add_argument('--manifest', required=True, type=Path)
    anchor.add_argument('--patch', required=True, type=Path)
    anchor.add_argument('--report', required=True, type=Path)
    anchor.add_argument('--existing', required=True, type=Path, help='Array of existing comments from all authors')
    anchor.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    if args.command == 'prepare':
        print(json.dumps(prepare(args.repo, args.base, args.branch, args.staged, args.full, args.out)))
        return
    manifest = json.loads(args.manifest.read_text())
    if args.command == 'aggregate':
        replies = {}
        for section in manifest['reviewers']:
            path = args.replies / f'{section}.json'
            if path.exists():
                try:
                    replies[section] = json.loads(path.read_text())
                except json.JSONDecodeError:
                    replies[section] = None
        result = aggregate(manifest, replies)
    else:
        result = anchors(manifest, args.patch.read_text(errors='surrogateescape'), json.loads(args.report.read_text()), json.loads(args.existing.read_text()))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2) + '\n')
    print(args.out.resolve())


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(f'error: {error}', file=sys.stderr)
        sys.exit(1)
