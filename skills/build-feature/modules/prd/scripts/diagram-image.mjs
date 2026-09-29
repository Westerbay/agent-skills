export async function diagramImage(svg) {
  const bounds=svg.viewBox.baseVal;
  if(!bounds.width || !bounds.height)throw new Error('The diagram has no SVG dimensions.');
  const scale=Math.min(2,4096/Math.max(bounds.width,bounds.height));
  const source=new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'});
  const url=URL.createObjectURL(source);
  try {
    const image=new Image();
    image.src=url;
    await image.decode();
    const canvas=document.createElement('canvas');
    canvas.width=Math.ceil(bounds.width*scale);
    canvas.height=Math.ceil(bounds.height*scale);
    const context=canvas.getContext('2d');
    if(!context)throw new Error('The browser could not create a canvas.');
    context.fillStyle='#fff';
    context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!png)throw new Error('The browser could not produce a PNG image.');
    return png;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadImage(blob,name) {
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=`${name}.png`;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
