import importlib.util
import sys
from unittest.mock import patch
import json
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
