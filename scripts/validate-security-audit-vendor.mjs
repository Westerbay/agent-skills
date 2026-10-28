import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../skills/security-audit/', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(directory, 'UPSTREAM.json'), 'utf8'));
const errors = [];

if (!/^[a-f0-9]{40}$/.test(manifest.revision)) errors.push('Invalid upstream revision.');
if (!manifest.files || !Object.hasOwn(manifest.files, 'SKILL.md') ||
    !Object.hasOwn(manifest.files, 'LICENSE')) {
  errors.push('The upstream manifest must include the skill and its license.');
}

for (const [file, expected] of Object.entries(manifest.files ?? {})) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(file) || !/^[a-f0-9]{40}$/.test(expected)) {
    errors.push(`Invalid upstream manifest entry: ${file}`);
    continue;
  }
  // The local entrypoint adds language guidance; the complete upstream source is retained.
  const localFile = file === 'SKILL.md' ? 'UPSTREAM-SKILL.md' : file;
  try {
    const contents = await readFile(path.join(directory, localFile));
    const actual = createHash('sha1')
      .update(`blob ${contents.length}\0`)
      .update(contents)
      .digest('hex');
    if (actual !== expected) errors.push(`${localFile}: differs from the pinned upstream blob for ${file}`);
  } catch (error) {
    errors.push(`${localFile}: ${error.message}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${Object.keys(manifest.files).length} upstream files at ${manifest.revision}.`);
}
