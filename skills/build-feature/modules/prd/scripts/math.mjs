import katex from '../assets/math.cjs';

const escapeText=value=>String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// Explicit delimiters avoid interpreting ordinary currency amounts as mathematics.
export function renderText(value) {
  const source=String(value ?? '');
  const expressions=/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g;
  let html='',offset=0;
  for(const match of source.matchAll(expressions)) {
    html+=escapeText(source.slice(offset,match.index)).replace(/\n/g,'<br>');
    const tex=match[1] ?? match[2] ?? match[3];
    html+=katex.renderToString(tex,{displayMode:match[1]===undefined,output:'mathml',
      trust:false,throwOnError:false,strict:'ignore',maxExpand:1000,maxSize:20,macros:{}});
    offset=match.index+match[0].length;
  }
  return html+escapeText(source.slice(offset)).replace(/\n/g,'<br>');
}
