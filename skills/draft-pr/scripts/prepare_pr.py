#!/usr/bin/env python3
"""Prepare a PR context and template body locally. Never commits, pushes or publishes."""
import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path


def git(repo, *args, optional=False):
    result = subprocess.run(['git', '-C', str(repo), *args], capture_output=True)
    if result.returncode:
        if optional:
            return None
        raise ValueError(result.stderr.decode().strip())
    return result.stdout.decode('utf-8', errors='surrogateescape')


def resolve_base(repo, branch, explicit):
    if explicit:
        if explicit.startswith('-') or git(repo, 'rev-parse', '--verify', f'{explicit}^{{commit}}', optional=True) is None:
            raise ValueError('Invalid explicit base')
        return explicit
    remote_head = git(repo, 'symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD', optional=True)
    if remote_head:
        return remote_head.strip().removeprefix('refs/remotes/')
    upstream = git(repo, 'rev-parse', '--abbrev-ref', f'{branch}@{{upstream}}', optional=True)
    if upstream and upstream.strip().split('/', 1)[-1] != branch:
        return upstream.strip()
    candidates = [name for name in ['origin/main', 'origin/master', 'origin/develop', 'origin/dev', 'main', 'master', 'develop', 'dev']
                  if name.split('/', 1)[-1] != branch and git(repo, 'rev-parse', '--verify', f'{name}^{{commit}}', optional=True)]
    by_commit = {}
    for name in candidates:
        by_commit.setdefault(git(repo, 'rev-parse', name).strip(), name)
    if len(by_commit) != 1:
        raise ValueError(f'Base is ambiguous; pass --base explicitly. Candidates: {candidates}')
    return next(iter(by_commit.values()))


def planning_paths(repo, base, head):
    names = set(filter(None, git(repo, 'diff', '--name-only', '-z', f'{base}...{head}').split('\0')))
    names.update(filter(None, git(repo, 'diff', '--cached', '--name-only', '-z').split('\0')))
    found = set()
    for name in names:
        if re.search(r'(?:\.prd\.(?:md|json|html)|\.tech-plan\.(?:json|html)|\.run\.json|(?:^|/)(?:PRD|TECHNICAL_PLAN)\.(?:md|json|html))$', name, re.I):
            found.add(name)
            continue
        if not name.endswith(('.json', '.html')):
            continue
        for ref in [f'{head}:{name}', f':{name}']:
            content = git(repo, 'show', ref, optional=True)
            if not content:
                continue
            if name.endswith('.html'):
                if 'id="document-data"' in content and 'Feature documents' in content:
                    found.add(name)
                continue
            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                continue
            if isinstance(data, dict) and (data.get('kind') in ['prd', 'tech-plan'] or {'documentId', 'specDigest', 'approvals'} <= data.keys()):
                found.add(name)
    return sorted(found)


def collect(repo, base=None):
    repo = Path(git(repo, 'rev-parse', '--show-toplevel').strip())
    branch = git(repo, 'branch', '--show-current').strip()
    if not branch:
        raise ValueError('Detached HEAD; select an exact branch first')
    base = resolve_base(repo, branch, base)
    head = git(repo, 'rev-parse', 'HEAD').strip()
    base_sha = git(repo, 'rev-parse', base).strip()
    merge_base = git(repo, 'merge-base', base_sha, head).strip()
    diff = git(repo, 'diff', '--no-ext-diff', '--no-textconv', f'{merge_base}...{head}')
    files = list(filter(None, git(repo, 'diff', '--name-only', '-z', f'{merge_base}...{head}').split('\0')))
    return {'schemaVersion': 1, 'repository': str(repo), 'branch': branch, 'base': base,
            'baseSha': base_sha, 'headSha': head, 'mergeBase': merge_base,
            'diffDigest': hashlib.sha256(diff.encode('utf-8', errors='surrogateescape')).hexdigest(),
            'status': git(repo, 'status', '--short'), 'files': files,
            'stat': git(repo, 'diff', '--stat', f'{merge_base}...{head}'),
            'commits': git(repo, 'log', '--format=%h %s', f'{merge_base}..{head}').splitlines(),
            'ui': any(re.search(r'\.(tsx|jsx|vue|svelte|html|css|scss|svg|png|jpe?g|webp)$', name, re.I) for name in files),
            'planningFiles': planning_paths(repo, merge_base, head)}, diff


def template_path(explicit):
    candidates = [Path(explicit)] if explicit else [Path(__file__).resolve().parents[1] / 'assets/PR.md']
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    raise ValueError('PR.md template not found; pass --template')


def render_body(content, template, context):
    title = content.get('title', '').strip()
    description = content.get('description', '').strip()
    if not title or '\n' in title or not description:
        raise ValueError('Provide a single-line title and a concrete description')
    allowed = {'title', 'description', 'changes', 'related', 'testing', 'checklist', 'notes', 'screenshots', 'diagrams'}
    if set(content) - allowed:
        raise ValueError(f'Unknown content fields: {sorted(set(content) - allowed)}')
    body = {'Description': description}
    changes = content.get('changes', {})
    if set(changes) - {'Added', 'Changed', 'Removed', 'Fixed'}:
        raise ValueError('Unknown Changes category')
    body['Changes'] = '\n\n'.join(f'### {key}\n' + '\n'.join(f'- {item}' for item in changes[key])
                                     for key in ['Added', 'Changed', 'Removed', 'Fixed'] if changes.get(key))
    related = content.get('related', [])
    if any(re.search(r'\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:#\d|https?://)', item, re.I) for item in related):
        raise ValueError('Use informational Related to links; auto-closing requires a separate explicit user decision')
    body['Related Issues / Tickets'] = '\n'.join(f'- {item}' for item in related)
    tests = []
    for check in content.get('testing', []):
        if check.get('status') not in ['passed', 'failed', 'not-run'] or not check.get('text'):
            raise ValueError('Testing entries need text and status: passed/failed/not-run')
        if check['status'] != 'not-run' and not check.get('evidence'):
            raise ValueError('Executed checks require actual evidence')
        mark = 'x' if check['status'] == 'passed' else ' '
        tests.append(f"- [{mark}] {check['text']} ({check['status']})" + (f". {check['evidence']}" if check.get('evidence') else ''))
    body['Testing'] = '\n'.join(tests)
    body['Checklist'] = '\n'.join(f"- [{'x' if item.get('checked') is True else ' '}] {item['text']}" for item in content.get('checklist', []))
    body['Technical Diagrams'] = '\n\n'.join(content.get('diagrams', []))
    screenshots = content.get('screenshots', [])
    body['Screenshots / Demo'] = '\n'.join(screenshots)
    if context['ui'] and not screenshots:
        body['Screenshots / Demo'] = 'Please add screenshots directly on GitHub (PR comment or PR body edit).'
    notes = list(content.get('notes', []))
    body['Notes'] = '\n\n'.join(notes)
    headings = re.findall(r'^## (.+)$', template, flags=re.M)
    sections = []
    used = set()
    for heading in headings:
        matches = [key for key in body if heading.endswith(key)]
        if not matches:
            raise ValueError(f'Unsupported custom PR.md section: {heading}. Adapt the mapping explicitly.')
        key = matches[0]
        if body[key]:
            sections.append(f'## {heading}\n\n{body[key]}')
            used.add(key)
    missing = [key for key in body if body[key] and key not in used]
    if missing:
        raise ValueError(f'PR.md has no heading for populated sections: {missing}')
    result = f'# Pull Request: {title}\n\n' + '\n\n'.join(sections) + '\n'
    if '<!--' in result or '[Title]' in result:
        raise ValueError('Unresolved template placeholder or comment')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    command = sub.add_parser('collect')
    command.add_argument('--repo', default='.')
    command.add_argument('--base')
    command.add_argument('--out', required=True, type=Path, help='New directory for context.json and diff.patch')
    command = sub.add_parser('render')
    command.add_argument('--context', required=True, type=Path)
    command.add_argument('--content', required=True, type=Path)
    command.add_argument('--template')
    command.add_argument('--out', required=True, type=Path)
    command = sub.add_parser('preflight')
    command.add_argument('--context', required=True, type=Path)
    command.add_argument('--allow-planning-documents', action='store_true', help='Only after explicit permission to publish these documents')
    args = parser.parse_args()
    if args.command == 'collect':
        context, diff = collect(args.repo, args.base)
        args.out.mkdir(parents=True, exist_ok=False)
        (args.out / 'context.json').write_text(json.dumps(context, indent=2) + '\n')
        (args.out / 'diff.patch').write_text(diff, errors='surrogateescape')
        print(json.dumps({'context': str((args.out / 'context.json').resolve()), 'stat': context['stat'], 'planningFiles': context['planningFiles']}))
    else:
        context = json.loads(args.context.read_text())
        if args.command == 'render':
            body = render_body(json.loads(args.content.read_text()), template_path(args.template).read_text(), context)
            args.out.parent.mkdir(parents=True, exist_ok=True)
            args.out.write_text(body)
            print(args.out.resolve())
        else:
            current, _ = collect(context['repository'], context['base'])
            for key in ['branch', 'baseSha', 'headSha', 'diffDigest']:
                if current[key] != context[key]:
                    raise ValueError(f'PR context changed ({key}); collect and review it again')
            if current['planningFiles'] and not args.allow_planning_documents:
                raise ValueError(f"Planning documents would be published: {current['planningFiles']}. Preserve local copies and exclude them unless explicitly authorized.")
            if not current['files']:
                raise ValueError('No committed changes to publish')
            print(json.dumps({'ready': True, 'branch': current['branch'], 'base': current['base'], 'uncommitted': current['status'], 'publication': 'Requires existing user authority; this command performed no external writes.'}))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(f'error: {error}', file=sys.stderr)
        sys.exit(1)
