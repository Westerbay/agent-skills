import hashlib
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('argus_tools', Path(__file__).parents[1] / 'scripts/argus_tools.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class ArgusToolsTests(unittest.TestCase):
    def test_local_snapshot_aggregation_rejects_a_reply_for_another_checkpoint(self):
        manifest = {'reviewers': ['quality'], 'files': ['new.py'], 'mode': 'local',
                    'base': 'CODE-1-before', 'branch': 'CODE-1-after', 'patchDigest': 'fixture'}
        reply = {'agent': 'quality-reviewer', 'version': '1.0.0',
                 'scope': {key: manifest[key] for key in ['mode', 'base', 'branch', 'files']},
                 'status': 'ok', 'coverage': 'complete',
                 'summary': {'critical': 0, 'warning': 0, 'nit': 0},
                 'findings': [], 'notes': ['Sequential, non-independent review'], 'errors': []}
        self.assertEqual(helper.aggregate(manifest, {'quality': reply})['verdict'], 'pass')
        reply['scope']['base'] = 'another-task-before'
        report = helper.aggregate(manifest, {'quality': reply})
        self.assertEqual(report['verdict'], 'incomplete')
        self.assertIn('snapshot', report['failures'][0]['error'])

    def test_missing_reply_never_looks_like_clean_pass(self):
        manifest = {'reviewers': ['quality', 'logic'], 'files': ['view.ts'], 'mode': 'branch', 'base': 'main', 'branch': 'HEAD', 'patchDigest': 'fixture'}
        reply = {'agent': 'quality-reviewer', 'version': '1.0.0', 'scope': {key: manifest[key] for key in ['mode', 'base', 'branch', 'files']}, 'status': 'ok', 'coverage': 'complete',
                 'summary': {'critical': 0, 'warning': 0, 'nit': 0}, 'findings': [], 'notes': [], 'errors': []}
        report = helper.aggregate(manifest, {'quality': reply})
        self.assertEqual(report['verdict'], 'incomplete')
        self.assertEqual(report['failures'][0]['section'], 'logic')
        reply['summary']['nit'] = 1
        self.assertEqual(len(helper.aggregate(manifest, {'quality': reply})['failures']), 2)

    def test_anchor_ranges_and_exact_duplicates_are_classified_without_posting(self):
        patch = 'diff --git a/view file.ts b/view file.ts\n--- a/view file.ts\n+++ b/view file.ts\n@@ -1,2 +1,3 @@\n context\n-old\n+new\n+more\n'
        digest = hashlib.sha256(patch.encode()).hexdigest()
        manifest = {'files': ['view file.ts'], 'patchDigest': digest}
        findings = [{'id': 'a', 'file': 'view file.ts', 'line': 2, 'severity': 'warning'},
                    {'id': 'b', 'file': 'view file.ts', 'line': 3, 'end_line': 40, 'severity': 'nit'}]
        report = {'patchDigest': digest, 'findings': findings, 'failures': []}
        result = helper.anchors(manifest, patch, report, [{'path': 'view file.ts', 'line': 2}])
        self.assertEqual(result['classifications'][0]['kind'], 'file')
        self.assertEqual(result['skipped'][0]['id'], 'a')
        self.assertEqual(result['suggestedEvent'], 'COMMENT')
        self.assertEqual(result['counts']['warning'], 0)
        with self.assertRaisesRegex(ValueError, 'mismatch'):
            helper.anchors(manifest, patch+'changed', report, [])

    def test_preparation_filters_generated_files_but_retains_raw_migration_inventory(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            def git(*args):
                return subprocess.run(['git', '-C', directory, *args], check=True, capture_output=True, text=True).stdout
            git('init', '-b', 'main')
            git('config', 'user.email', 'fixture@example.invalid')
            git('config', 'user.name', 'Test fixture')
            (repo/'view.tsx').write_text('export const View = () => null;')
            git('add', '.')
            git('commit', '-m', 'base fixture')
            git('checkout', '-b', 'feature')
            (repo/'view.tsx').write_text('export const View = () => "changed";')
            (repo/'package-lock.json').write_text('{}')
            (repo/'migrations').mkdir()
            (repo/'migrations/snapshot.json').write_text('{}')
            (repo/'migrations/update.sql').write_text('SELECT 1;')
            git('add', '.')
            git('commit', '-m', 'feature fixture')
            out = repo/'review-output'
            helper.prepare(repo, 'main', 'HEAD', False, False, out)
            patch = (out/'diff.patch').read_text()
            self.assertNotIn('package-lock.json', patch)
            self.assertNotIn('snapshot.json', patch)
            self.assertIn('migrations/update.sql', patch)
            self.assertIn('snapshot.json', (out/'name-status.txt').read_text())


if __name__ == '__main__':
    unittest.main()
