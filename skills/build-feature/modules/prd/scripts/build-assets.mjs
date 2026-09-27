import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import Ajv from 'ajv';
import standaloneCode from 'ajv/dist/standalone/index.js';
import {build} from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(`${root}assets`, {recursive: true});
const schema = JSON.parse(await readFile(`${root}schemas/document.schema.json`, 'utf8'));
const ajv = new Ajv({allErrors: true, strictRequired: false, code: {source: true}});
await build({stdin: {contents: standaloneCode(ajv, ajv.compile(schema)), resolveDir: root},
  bundle: true, minify: true, platform: 'neutral', format: 'cjs', outfile: `${root}assets/validate.cjs`});
if (!process.argv.includes('--schema-only')) {
  await build({stdin: {contents: "module.exports = require('katex');", resolveDir: root},
    bundle: true, minify: true, platform: 'neutral', format: 'cjs', outfile: `${root}assets/math.cjs`});
  await build({entryPoints: [`${root}scripts/reader.mjs`], bundle: true, minify: true,
    platform: 'browser', format: 'iife', outfile: `${root}assets/reader.js`});
  await build({stdin: {contents: "import mermaid from 'mermaid'; window.featureMermaid = mermaid;", resolveDir: root},
    bundle: true, minify: true, platform: 'browser', format: 'iife', outfile: `${root}assets/mermaid.js`});
}
console.log('Document assets built.');
