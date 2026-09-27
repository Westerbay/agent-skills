import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderDocument} from '../scripts/document-view.mjs';
import {validateDocument} from '../scripts/document-model.mjs';
import {readFile} from 'node:fs/promises';
const sample=JSON.parse(await readFile(new URL('../examples/reader.prd.json',import.meta.url),'utf8'));
const fixture=()=>structuredClone(sample);

test('document prose renders inline and display LaTeX without treating surrounding HTML as markup',()=>{
  const doc=fixture();
  doc.requirements[0].description=String.raw`Cost <script>bad()</script> and \(\frac{a}{b}\), then $$\sum_{i=1}^{n} i$$.`;
  const html=renderDocument({document:validateDocument(doc)});
  assert.ok(html.includes('<math'));
  assert.ok(html.includes('<mfrac>'));
  assert.ok(html.includes('display="block"'));
  assert.ok(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));
  assert.ok(!html.includes('<script>bad()'));
});

test('invalid LaTeX remains visible and unsafe math commands cannot inject links or images',()=>{
  const doc=fixture();
  doc.requirements[0].description=String.raw`\(\notACommand{x}\) and \(\href{javascript:alert(1)}{click}\)`;
  const html=renderDocument({document:validateDocument(doc)});
  assert.ok(html.includes('katex-error') || html.includes('mathcolor'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(!html.includes('<img'));
});
