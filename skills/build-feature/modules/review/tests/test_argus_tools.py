import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('argus_tools', Path(__file__).parents[1] / 'scripts/argus_tools.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class ArgusToolsTests(unittest.TestCase):
    def manifest(self, reviewers=None):
        return {'schemaVersion': 2, 'reviewers': reviewers or ['general'], 'files': ['view.ts'],
                'mode': 'local', 'base': 'before', 'branch': 'after',
                'patchDigest': hashlib.sha256(b'current patch').hexdigest()}

    def reply(self, manifest, reviewer='general'):
        return {'agent': f'{reviewer}-reviewer', 'version': '2.0.0',
                'scope': {key: manifest[key] for key in ['mode', 'base', 'branch', 'files', 'patchDigest']},
                'status': 'ok', 'coverage': 'complete',
                'summary': {'critical': 0, 'warning': 0, 'nit': 0},
                'findings': [], 'notes': [], 'errors': []}

    def test_local_snapshot_aggregation_rejects_a_reply_for_another_checkpoint(self):
        manifest = self.manifest()
        reply = self.reply(manifest)
        self.assertEqual(helper.aggregate(manifest, {'general': reply})['verdict'], 'pass')
        reply['scope']['base'] = 'another-task-before'
        report = helper.aggregate(manifest, {'general': reply})
        self.assertEqual(report['verdict'], 'incomplete')
        self.assertIn('snapshot', report['failures'][0]['error'])

    def test_missing_reply_never_looks_like_clean_pass(self):
        manifest = self.manifest(['general', 'architecture'])
        reply = self.reply(manifest)
        report = helper.aggregate(manifest, {'general': reply})
        self.assertEqual(report['verdict'], 'incomplete')
        self.assertEqual(report['failures'][0]['section'], 'architecture')
        reply['summary']['nit'] = 1
        self.assertEqual(len(helper.aggregate(manifest, {'general': reply})['failures']), 2)

    def test_same_labels_and_files_cannot_reuse_a_reply_for_different_patch_bytes(self):
        manifest = self.manifest()
        reply = self.reply(manifest)
        reply['scope']['patchDigest'] = hashlib.sha256(b'previous patch').hexdigest()
        report = helper.aggregate(manifest, {'general': reply})
        self.assertEqual(report['verdict'], 'incomplete')
        self.assertIn('patchDigest', report['failures'][0]['error'])
        del reply['scope']['patchDigest']
        self.assertEqual(helper.aggregate(manifest, {'general': reply})['verdict'], 'incomplete')
        reply = self.reply(manifest)
        reply['version'] = '1.0.0'
        self.assertIn('v2 replies', helper.aggregate(manifest, {'general': reply})['failures'][0]['error'])

    def test_general_review_retains_four_concerns_without_claiming_specialist_coverage(self):
        manifest = self.manifest()
        reply = self.reply(manifest)
        for section in ['quality', 'conventions', 'regression', 'logic']:
            reply['findings'].append({'id': f'{section}.behavior.example', 'section': section,
                'severity': 'warning', 'category': 'behavior', 'title': section, 'file': 'view.ts',
                'related_files': [], 'evidence': 'A concrete fixture defect.', 'confidence': 'high',
                'recommendation': 'Fix the demonstrated behavior.'})
        reply['summary']['warning'] = 4
        report = helper.aggregate(manifest, {'general': reply})
        self.assertEqual(report['verdict'], 'needs-attention')
        self.assertEqual({item['section'] for item in report['findings']}, {'quality', 'conventions', 'regression', 'logic'})
        reply['findings'][0]['section'] = 'security'
        self.assertEqual(helper.aggregate(manifest, {'general': reply})['verdict'], 'incomplete')

    def test_selected_architecture_review_does_not_require_unselected_security(self):
        manifest = self.manifest(['general', 'architecture'])
        replies = {name: self.reply(manifest, name) for name in manifest['reviewers']}
        report = helper.aggregate(manifest, replies)
        self.assertEqual(report['verdict'], 'pass')
        self.assertEqual([item['section'] for item in report['reviewers']], ['general', 'architecture'])

    def test_empty_legacy_or_unknown_review_selections_cannot_produce_a_clean_report(self):
        for reviewers in [[], ['architecture'], ['general', 'general'], ['general', 'missing']]:
            manifest = self.manifest()
            manifest['reviewers'] = reviewers
            with self.subTest(reviewers=reviewers), self.assertRaises(ValueError):
                helper.aggregate(manifest, {})
        manifest = self.manifest()
        manifest['schemaVersion'] = 1
        with self.assertRaisesRegex(ValueError, 'v2'):
            helper.aggregate(manifest, {})
        manifest = self.manifest()
        manifest['patchDigest'] = 'not a SHA-256'
        with self.assertRaisesRegex(ValueError, 'SHA-256'):
            helper.aggregate(manifest, {})

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
            (repo/'view.tsx').write_text('export const View = () => "changed → ✓";', encoding='utf-8')
            (repo/'package-lock.json').write_text('{}')
            (repo/'migrations').mkdir()
            (repo/'migrations/snapshot.json').write_text('{}')
            (repo/'migrations/update.sql').write_text('SELECT 1;')
            git('add', '.')
            git('commit', '-m', 'feature fixture')
            out = repo/'review-output'
            helper.prepare(repo, 'main', 'HEAD', False, False, out)
            patch = (out/'diff.patch').read_text(encoding='utf-8')
            self.assertNotIn('package-lock.json', patch)
            self.assertNotIn('snapshot.json', patch)
            self.assertIn('migrations/update.sql', patch)
            self.assertIn('snapshot.json', (out/'name-status.txt').read_text())
            manifest = json.loads((out/'manifest.json').read_text(encoding='utf-8'))
            self.assertEqual(manifest['reviewers'], ['general'])
            self.assertEqual(manifest['patchDigest'], hashlib.sha256((out/'diff.patch').read_bytes()).hexdigest())
            self.assertIn('changed → ✓', patch)
            selected_out = repo/'selected-review'
            subprocess.run([sys.executable, str(Path(helper.__file__)), 'prepare', '--repo', str(repo),
                            '--base', 'main', '--reviewers', 'general,architecture', '--out', str(selected_out)],
                           check=True, capture_output=True)
            selected = json.loads((selected_out/'manifest.json').read_text(encoding='utf-8'))
            self.assertEqual(selected['reviewers'], ['general', 'architecture'])


if __name__ == '__main__':
    unittest.main()
