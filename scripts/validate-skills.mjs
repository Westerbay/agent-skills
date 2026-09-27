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

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${names.size} skills and their relative Markdown links.`);
}
