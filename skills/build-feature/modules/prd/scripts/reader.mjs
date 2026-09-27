import {validateDocument} from './document-model.mjs';
import {renderDocument, copy} from './document-view.mjs';
import {documentImage, downloadImage} from './image-export.mjs';

let payload=JSON.parse(document.getElementById('document-data').textContent);
let expanded=false;
function revealHash() {
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  target.hidden=false;
  if (target.matches('details')) target.open=true;
  for(let parent=target.parentElement;parent;parent=parent.parentElement) {
    parent.hidden=false;
    if(parent.matches('details'))parent.open=true;
  }
  target.scrollIntoView({block:'start'});
}
function bind() {
  const t=copy[payload.document.locale];
  document.getElementById('theme').setAttribute('aria-pressed',String(document.documentElement.dataset.theme==='dark'));
  document.getElementById('theme').onclick=()=>{
    const dark=document.documentElement.dataset.theme!=='dark';
    document.documentElement.dataset.theme=dark?'dark':'light';
    document.getElementById('theme').setAttribute('aria-pressed',String(dark));
  };
  document.getElementById('print').onclick=()=>window.print();
  document.getElementById('copy-image').onclick=async event=>{
    const button=event.currentTarget;
    const status=document.getElementById('reader-status');
    button.disabled=true;status.textContent=t.imagePending;
    // Start the clipboard write within the click gesture, before rasterization finishes.
    const image=documentImage(payload);
    try {
      if(!navigator.clipboard?.write || !window.ClipboardItem)throw new Error('Clipboard unavailable');
      await navigator.clipboard.write([new ClipboardItem({'image/png':image})]);
      status.textContent=t.imageCopied;
    } catch(error) {
      try {
        downloadImage(await image,payload.document.id);
        status.textContent=t.imageDownloaded;
      } catch(imageError) {
        status.textContent=`${t.imageFailed} ${imageError.message}`;
      }
    } finally {
      button.disabled=false;
    }
  };
  document.getElementById('expand').onclick=()=>{
    expanded=!expanded;
    document.querySelectorAll('main details').forEach(item=>{item.open=expanded;});
    document.getElementById('expand').textContent=expanded?t.collapse:t.expand;
  };
  document.getElementById('search').oninput=event=>{
    const query=event.target.value.trim().toLocaleLowerCase(payload.document.locale);
    let found=0;
    document.querySelectorAll('.searchable').forEach(item=>{
      const match=!query||item.textContent.toLocaleLowerCase(payload.document.locale).includes(query);
      item.hidden=!match;
      if(match)found++;
      if(item.matches('details')&&query&&match)item.open=true;
    });
    document.getElementById('reader-status').textContent=query?(found?`${found} ${t.found}`:t.noResults):'';
  };
  document.getElementById('export').onclick=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload.document,null,2)+'\n'],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`${payload.document.id}.${payload.document.kind}.json`;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  document.getElementById('import').onchange=async event=>{
    try {
      const file=event.target.files[0];if(!file)return;
      if(file.size>5_000_000)throw new Error('JSON exceeds 5 MB');
      const doc=validateDocument(JSON.parse(await file.text()));
      payload={document:doc};
      document.documentElement.lang=doc.locale;
      document.title=doc.title;
      document.getElementById('app').innerHTML=renderDocument(payload);
      expanded=false;bind();
      document.getElementById('reader-status').textContent=copy[doc.locale].imported;
      document.getElementById('main').focus();
    } catch(error) {
      document.getElementById('reader-status').textContent=error.message;
    }
  };
}
window.addEventListener('hashchange',revealHash);
let beforePrint=[];
window.addEventListener('beforeprint',()=>{
  beforePrint=[...document.querySelectorAll('main details,main [hidden]')].map(item=>({item,open:item.open,hidden:item.hidden}));
  beforePrint.forEach(({item})=>{item.hidden=false;if(item.matches('details'))item.open=true;});
});
window.addEventListener('afterprint',()=>beforePrint.forEach(({item,open,hidden})=>{item.hidden=hidden;if(item.matches('details'))item.open=open;}));
bind();revealHash();
