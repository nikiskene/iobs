function checkDocx(buffer:ArrayBuffer) {
  const view=new DataView(buffer);let eocd=-1;
  for(let i=buffer.byteLength-22;i>=Math.max(0,buffer.byteLength-65557);i--)if(view.getUint32(i,true)===0x06054b50){eocd=i;break}
  if(eocd<0)throw new Error('This DOCX file could not be read.');
  const count=view.getUint16(eocd+10,true);let offset=view.getUint32(eocd+16,true),total=0;
  if(count>2000)throw new Error('This document contains too many embedded files.');
  for(let i=0;i<count;i++){
    if(offset+46>buffer.byteLength||view.getUint32(offset,true)!==0x02014b50)throw new Error('This DOCX file is incomplete.');
    const compressed=view.getUint32(offset+20,true),size=view.getUint32(offset+24,true);total+=size;
    if(total>20*1024*1024||size>Math.max(compressed*100,1024*1024))throw new Error('This document expands beyond the safe import limit.');
    offset+=46+view.getUint16(offset+28,true)+view.getUint16(offset+30,true)+view.getUint16(offset+32,true);
  }
}
export async function extractBeauDocument(file:File):Promise<string> {
  if(!file.size||file.size>5*1024*1024)throw new Error('Choose a document up to 5 MB.');
  const suffix=file.name.toLowerCase().split('.').pop();let text='';
  if(suffix==='txt'||suffix==='md')text=await file.text();
  else if(suffix==='docx'){
    const buffer=await file.arrayBuffer();checkDocx(buffer);
    const {unzipSync}=await import('fflate');
    const archive=unzipSync(new Uint8Array(buffer),{filter:entry=>entry.name==='word/document.xml'});
    const document=archive['word/document.xml'];
    if(!document||document.length>5*1024*1024)throw new Error('This DOCX document cannot be extracted safely.');
    const xml=new TextDecoder().decode(document);
    if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw new Error('This DOCX document contains unsupported XML.');
    const parsed=new DOMParser().parseFromString(xml,'application/xml');
    if(parsed.getElementsByTagName('parsererror').length)throw new Error('This DOCX document could not be read.');
    const read=(node:Element):string=>node.localName==='t'?(node.textContent||''):node.localName==='tab'?'\t':node.localName==='br'?'\n':Array.from(node.children).map(read).join('');
    text=Array.from(parsed.getElementsByTagNameNS('*','p')).map(read).join('\n');
  }else if(suffix==='pdf'){
    const pdfjs=await import('pdfjs-dist');
    const worker=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');pdfjs.GlobalWorkerOptions.workerSrc=worker.default;
    const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),disableFontFace:true});
    const document=await task.promise;
    try{
      if(document.numPages>50)throw new Error('Please split PDFs longer than 50 pages before importing.');
      for(let i=1;i<=document.numPages;i++){
        const page=await document.getPage(i),content=await page.getTextContent();
        text+=content.items.map(item=>'str' in item?item.str+('hasEOL' in item&&item.hasEOL?'\n':' '):'').join('')+'\n\n';
        if(text.length>60000)throw new Error('Please shorten this document to 60,000 characters before importing.');
      }
    }finally{await task.destroy()}
  }else throw new Error('Choose a text, Markdown, PDF or DOCX document.');
  text=text.replace(/\r\n/g,'\n').trim();
  if(!text)throw new Error('No readable text was found. Scanned PDFs need text recognition before import.');
  if(text.length>60000)throw new Error('Please shorten this document to 60,000 characters before importing.');
  return text;
}
