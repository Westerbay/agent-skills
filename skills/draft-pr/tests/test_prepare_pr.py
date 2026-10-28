import importlib.util
import sys
from unittest.mock import patch
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('prepare_pr', Path(__file__).parents[1] / 'scripts/prepare_pr.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class PreparePRTests(unittest.TestCase):
    def test_stacked_diff_and_planning_guard_preserve_worktree(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            def git(*args):
                return subprocess.run(['git', '-C', directory, *args], check=True, capture_output=True, text=True).stdout
            git('init', '-b', 'main')
            git('config', 'user.email', 'fixture@example.invalid')
            git('config', 'user.name', 'Test fixture')
            (repo / 'base.txt').write_text('base')
            git('add', '.')
            git('commit', '-m', 'base fixture')
            git('checkout', '-b', 'first')
            (repo / 'first.txt').write_text('first')
            git('add', '.')
            git('commit', '-m', 'first fixture')
            git('checkout', '-b', 'second')
            (repo / 'view with spaces.tsx').write_text('export const View = () => null;')
            (repo / 'local.prd.json').write_text('{}')
            git('add', '.')
            git('commit', '-m', 'second fixture')
            (repo / 'unrelated.txt').write_text('user work')
            before = git('status', '--porcelain')
            context, diff = helper.collect(repo, 'first')
            self.assertNotIn('first.txt', context['files'])
            self.assertEqual(context['planningFiles'], ['local.prd.json'])
            self.assertTrue(context['ui'])
            self.assertIn('view with spaces.tsx', diff)
            self.assertEqual(before, git('status', '--porcelain'))

    def test_bundled_template_works_without_personal_files(self):
        with patch.object(Path, 'home', side_effect=AssertionError('No home lookup')):
            template = helper.template_path(None)
            body = helper.render_body(
                {'title': 'Add portable drafts', 'description': 'Prepare drafts locally.'},
                template.read_text(), {'ui': False, 'base': 'main'})
        self.assertIn('Prepare drafts locally.', body)
        self.assertNotIn('Related Issues', body)
        self.assertNotIn('Screenshots', body)

    def test_technical_diagrams_render_without_ui_changes(self):
        diagram = 'Committed data flow\n\n```mermaid\nflowchart LR\n  Browser --> API\n```'
        content = {'title': 'Explain data flow', 'description': 'Show the delivered data path.',
                   'diagrams': [diagram]}
        body = helper.render_body(content, helper.template_path(None).read_text(),
                                  {'ui': False, 'base': 'main'})
        self.assertIn('## Technical Diagrams\n\n' + diagram, body)
        self.assertNotIn('## Screenshots / Demo', body)
        with self.assertRaisesRegex(ValueError, 'Technical Diagrams'):
            helper.render_body(content, '## Description\n', {'ui': False, 'base': 'main'})

    def test_captured_screenshot_replaces_upload_placeholder(self):
        screenshot = 'Updated view\n\n![Updated view](https://example.invalid/render.png)'
        content = {'title': 'Update view', 'description': 'Show the new visual result.',
                   'screenshots': [screenshot]}
        body = helper.render_body(content, helper.template_path(None).read_text(),
                                  {'ui': True, 'base': 'main'})
        self.assertIn('## Screenshots / Demo\n\n' + screenshot, body)
        self.assertNotIn('Please add screenshots', body)
        self.assertNotIn('## Technical Diagrams', body)

    def test_explicit_template_overrides_default_and_missing_path_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            template = Path(directory) / 'custom.md'
            template.write_text('## Testing\n\n## Description\n')
            content = {'title': 'Custom draft', 'description': 'Use the selected template.',
                       'testing': [{'text': 'Manual check', 'status': 'not-run'}]}
            body = helper.render_body(content, helper.template_path(template).read_text(),
                                      {'ui': False, 'base': 'main'})
            self.assertLess(body.index('## Testing'), body.index('## Description'))
            with self.assertRaisesRegex(ValueError, 'template not found'):
                helper.template_path(Path(directory) / 'missing.md')

    def test_structured_render_does_not_discard_custom_template_content(self):
        content = {'title': 'Fix export', 'description': 'Preserve export formatting.'}
        for template in ['## Summary\n\n## Test plan\n',
                         '## Description\n\nKeep this reviewer instruction.\n',
                         '## Description\n\n## Checklist\n\n- [ ] Confirm compatibility\n']:
            with self.subTest(template=template), self.assertRaisesRegex(ValueError, '--body-file'):
                helper.render_body(content, template, {'ui': False})

    def test_cli_utf8_and_authored_template_preserve_content_without_utf8_mode(self):
        script = Path(helper.__file__).resolve()
        with tempfile.TemporaryDirectory() as directory:
            scratch = Path(directory)
            repo = scratch / 'repo'
            repo.mkdir()
            def git(*args):
                return subprocess.run(['git', '-C', str(repo), *args], check=True, capture_output=True).stdout
            env = {**os.environ, 'PYTHONUTF8': '0', 'PYTHONIOENCODING': 'cp1252'}
            def cli(*args):
                return subprocess.run([sys.executable, str(script), *map(str, args)],
                                      capture_output=True, encoding='utf-8', env=env, cwd=scratch)
            git('init', '-b', 'main')
            git('config', 'user.email', 'fixture@example.invalid')
            git('config', 'user.name', 'Test fixture')
            (repo / 'source.txt').write_bytes(b'base\n')
            git('add', '.')
            git('commit', '-m', 'base fixture')
            git('checkout', '-b', 'feature')
            (repo / 'source.txt').write_bytes('Café → 🙂\n'.encode('utf-8') + b'legacy byte: \xff\n')
            git('add', '.')
            git('commit', '-m', 'unicode fixture')
            context_dir = scratch / 'context'
            result = cli('collect', '--repo', repo, '--base', 'main', '--out', context_dir)
            self.assertEqual(result.returncode, 0, result.stderr)
            expected_patch = git('diff', '--no-ext-diff', '--no-textconv', 'main...HEAD')
            self.assertEqual((context_dir / 'diff.patch').read_bytes(), expected_patch)
            context = context_dir / 'context.json'
            content = scratch / 'content.json'
            content.write_text(json.dumps({'title': 'Fix Unicode → 🙂', 'description': 'Préserver → 🙂.'},
                                          ensure_ascii=False), encoding='utf-8')
            body = scratch / 'résultat-🙂.md'
            result = cli('render', '--context', context, '--content', content, '--out', body)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('Préserver → 🙂.', body.read_text(encoding='utf-8'))
            self.assertIn(str(body), result.stdout)
            authored = scratch / 'authored.md'
            authored_bytes = ('## Summary\r\n\r\nPréserver → 🙂.\r\n\r\n'
                              '<!-- Keep the repository reviewer instructions. -->\r\n'
                              '## Test plan\r\n\r\n- [ ] Confirm compatibility\r\n').encode('utf-8')
            authored.write_bytes(authored_bytes)
            result = cli('render', '--context', context, '--body-file', authored, '--out', body)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(body.read_bytes(), authored_bytes)
            result = cli('preflight', '--context', context)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(json.loads(result.stdout)['ready'])

    def test_planning_guard_distinguishes_deletion_from_head_or_index_content(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            def git(*args):
                return subprocess.run(['git', '-C', directory, *args], check=True,
                                      capture_output=True, encoding='utf-8').stdout
            git('init', '-b', 'main')
            git('config', 'user.email', 'fixture@example.invalid')
            git('config', 'user.name', 'Test fixture')
            (repo / 'removed.prd.json').write_text('{}', encoding='utf-8')
            (repo / 'state.json').write_text('{"kind":"tech-plan"}', encoding='utf-8')
            (repo / 'retained.prd.json').write_text('{}', encoding='utf-8')
            git('add', '.')
            git('commit', '-m', 'base fixture')
            git('checkout', '-b', 'feature')
            git('rm', '--', 'removed.prd.json', 'state.json')
            (repo / 'retained.prd.json').write_text('{"changed":true}', encoding='utf-8')
            git('add', '.')
            git('commit', '-m', 'remove obsolete plans')
            context, _ = helper.collect(repo, 'main')
            self.assertEqual(context['planningFiles'], ['retained.prd.json'])
            (repo / 'removed.prd.json').write_text('', encoding='utf-8')
            git('add', 'removed.prd.json')
            git('rm', '--', 'retained.prd.json')
            context, _ = helper.collect(repo, 'main')
            self.assertEqual(context['planningFiles'], ['removed.prd.json', 'retained.prd.json'])
            # A staged removal cannot hide a planning file still present in committed HEAD.
            git('commit', '-m', 'replace plan fixture')
            context, _ = helper.collect(repo, 'main')
            self.assertEqual(context['planningFiles'], ['removed.prd.json'])

    def test_cli_preparation_and_preflight_are_local_and_preserve_user_work(self):
        script = Path(helper.__file__).resolve()
        with tempfile.TemporaryDirectory() as directory:
            scratch = Path(directory)
            repo = scratch / 'repo'
            repo.mkdir()
            def git(*args):
                return subprocess.run(['git', '-C', str(repo), *args], check=True,
                                      capture_output=True, text=True).stdout
            def cli(*args):
                return subprocess.run([sys.executable, str(script), *map(str, args)],
                                      capture_output=True, text=True, cwd=scratch)
            git('init', '-b', 'main')
            git('config', 'user.email', 'fixture@example.invalid')
            git('config', 'user.name', 'Test fixture')
            (repo / 'base.txt').write_text('base')
            git('add', '.')
            git('commit', '-m', 'base fixture')
            git('checkout', '-b', 'feature')
            (repo / 'change.txt').write_text('change')
            git('add', '.')
            git('commit', '-m', 'change fixture')
            (repo / 'user.txt').write_text('unrelated work')
            before = git('status', '--porcelain')
            context_dir = scratch / 'context'
            result = cli('collect', '--repo', repo, '--base', 'main', '--out', context_dir)
            self.assertEqual(result.returncode, 0, result.stderr)
            context = context_dir / 'context.json'
            content = scratch / 'content.json'
            content.write_text(json.dumps({'title': 'Add change', 'description': 'Deliver change.'}))
            body = scratch / 'body.md'
            result = cli('render', '--context', context, '--content', content, '--out', body)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('Deliver change.', body.read_text())
            result = cli('preflight', '--context', context)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(json.loads(result.stdout)['ready'])
            self.assertEqual(before, git('status', '--porcelain'))
            (repo / 'local.prd.json').write_text('{}')
            git('add', 'local.prd.json')
            result = cli('preflight', '--context', context)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('Planning documents would be published', result.stderr)
            result = cli('preflight', '--context', context, '--allow-planning-file', 'local.prd.json')
            self.assertEqual(result.returncode, 0, result.stderr)
            result = cli('preflight', '--context', context, '--allow-planning-file', '*.prd.json')
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('exact detected paths', result.stderr)
            (repo / 'other.prd.json').write_text('{}')
            git('add', 'other.prd.json')
            result = cli('preflight', '--context', context, '--allow-planning-file', 'local.prd.json')
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('other.prd.json', result.stderr)
            git('commit', '-m', 'planning fixture')
            result = cli('preflight', '--context', context)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('context changed', result.stderr)

    def test_body_preserves_template_order_and_only_asserts_evidenced_checks(self):
        template = '# Pull Request: [Title]\n\n## Description\n\n## Changes\n\n## Related Issues / Tickets\n\n## Screenshots / Demo\n\n## Testing\n\n## Checklist\n\n## Notes\n'
        content = {'title': 'Fix offline reading', 'description': 'The document opens without a server.',
                   'changes': {'Fixed': ['Offline navigation']}, 'testing': [{'text': 'Offline exercise', 'status': 'passed', 'evidence': 'Passed on fixture HTML'}]}
        body = helper.render_body(content, template, {'ui': True, 'base': 'first'})
        self.assertIn('Please add screenshots directly on GitHub', body)
        self.assertNotIn('### Added', body)
        self.assertNotIn('Related Issues', body)
        content['testing'][0].pop('evidence')
        with self.assertRaisesRegex(ValueError, 'evidence'):
            helper.render_body(content, template, {'ui': True, 'base': 'first'})
        content['testing'] = []
        content['related'] = ['Closes #12']
        with self.assertRaisesRegex(ValueError, 'auto-closing'):
            helper.render_body(content, template, {'ui': False, 'base': 'first'})


if __name__ == '__main__':
    unittest.main()
