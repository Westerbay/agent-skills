import {toBlob} from 'html-to-image';
import {renderDocument} from './document-view.mjs';

export async function documentImage(payload) {
  const host=document.createElement('div');
  const visible=document.getElementById('main');
  const width=Math.max(375,Math.min(1100,visible.getBoundingClientRect().width));
  host.style.cssText=`position:fixed;left:-20000px;top:0;width:${width}px;`;
  host.innerHTML=renderDocument(payload);
  const content=host.querySelector('main');
  host.replaceChildren(content);
  content.querySelectorAll('details').forEach(item=>{item.open=true;});
  content.querySelector('#reader-status').remove();
  content.querySelector('.document-footer').remove();
  document.body.append(host);
  try {
    const background=getComputedStyle(document.body).backgroundColor;
    const blob=await toBlob(content,{backgroundColor:background,pixelRatio:1,skipFonts:true,
      width,height:content.scrollHeight,style:{margin:'0',width:`${width}px`,boxSizing:'border-box'}});
    if(!blob)throw new Error('The browser could not produce a PNG image.');
    return blob;
  } finally {
    host.remove();
  }
}

export function downloadImage(blob,name) {
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=`${name}.png`;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
