import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const names = new Set();

async function checkLinks(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '__pycache__'].includes(entry.name)) await checkLinks(file);
    } else if (entry.name.endsWith('.md')) {
      const source = await readFile(file, 'utf8');
      for (const match of source.matchAll(/\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
        const target = match[1];
        if (/^(?:[a-z]+:|#)/i.test(target) || /[<>]/.test(target)) continue;
        const localPath = decodeURIComponent(target.split('#')[0]);
        if (!localPath) continue;
        try { await access(path.resolve(path.dirname(file), localPath)); }
        catch { errors.push(`${path.relative(root, file)}: missing link ${target}`); }
      }
    }
  }
}

for (const entry of await readdir(path.join(root, 'skills'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(root, 'skills', entry.name);
  const source = await readFile(path.join(directory, 'SKILL.md'), 'utf8');
  const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  const name = frontMatter?.match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
  const description = frontMatter?.match(/^description:\s*(\S.*)$/m)?.[1];
  if (!name || name !== entry.name || names.has(name)) errors.push(`${entry.name}: invalid, mismatched or duplicate name`);
  if (!description) errors.push(`${entry.name}: missing description`);
  names.add(name);
  await checkLinks(directory);
}

// The portable feature pack must ship the same maintained development guidance.
const development = path.join(root, 'skills/software-developer');
const bundled = path.join(root, 'skills/build-feature/modules/development');
const normalize = text => text.replaceAll('\r\n', '\n').trim();
const main = await readFile(path.join(development, 'SKILL.md'), 'utf8');
const body = main.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
if (normalize(body) !== normalize(await readFile(path.join(bundled, 'GUIDE.md'), 'utf8'))) {
  errors.push('build-feature: development guide differs from software-developer');
}
const originalFiles = (await readdir(path.join(development, 'references'))).sort();
const bundledFiles = (await readdir(path.join(bundled, 'references'))).sort();
if (JSON.stringify(originalFiles) !== JSON.stringify(bundledFiles)) errors.push('build-feature: development reference file sets differ');
for (const name of originalFiles.filter(name => bundledFiles.includes(name))) {
  const original = await readFile(path.join(development, 'references', name), 'utf8');
  const mirror = await readFile(path.join(bundled, 'references', name), 'utf8');
  if (normalize(original) !== normalize(mirror)) errors.push(`build-feature: development reference differs: ${name}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${names.size} skills, their relative Markdown links and development mirrors.`);
}
