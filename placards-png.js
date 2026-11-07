(function(root){
'use strict';
const enc=new TextEncoder();
function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function u32(n){const b=new Uint8Array(4);new DataView(b.buffer).setUint32(0,n);return b}
function concat(...parts){const out=new Uint8Array(parts.reduce((n,a)=>n+a.length,0));let p=0;for(const a of parts){out.set(a,p);p+=a.length}return out}
async function dpi(blob){const b=new Uint8Array(await blob.arrayBuffer()),body=new Uint8Array(9),v=new DataView(body.buffer);v.setUint32(0,11811);v.setUint32(4,11811);body[8]=1;const chunk=concat(enc.encode('pHYs'),body);return new Blob([b.slice(0,33),u32(9),chunk,u32(crc(chunk)),b.slice(33)],{type:'image/png'})}
function lines(ctx,text,width){const result=[];for(const para of String(text||'').split('\n')){let line='';for(const word of para.split(/\s+/)){if(ctx.measureText(word).width>width)throw Error('A word or link is too long for this card. Shorten the card text.');if(line&&ctx.measureText(line+' '+word).width>width){result.push(line);line=word}else line+=(line?' ':'')+word}result.push(line)}return result}
async function loadFlag(e){const url=MuseumLabels.flagURL(e);if(!url)throw Error(e.object+': select a location flag before exporting.');const response=await fetch(url);if(!response.ok)throw Error('The flag for '+e.origin+' could not load. Try again when connected.');const blob=await response.blob(),src=URL.createObjectURL(blob),img=new Image();img.src=src;try{await img.decode();return img}finally{URL.revokeObjectURL(src)}}
async function card(e,{size='4x6',base,qr,settings,mime='image/png'}={}){
 const [w,h]=({'4x6':[1800,1200],'5x7':[2100,1500],'8x10':[3000,2400],'instagram':[1080,1350]})[size]||[1800,1200];
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),scale=w/900,H=h/scale;ctx.scale(scale,scale);const m=45,bodyWidth=810;ctx.fillStyle='#fbf5ec';ctx.fillRect(0,0,900,H);ctx.strokeStyle='#b58a43';ctx.lineWidth=2;ctx.strokeRect(10,10,880,H-20);
 ctx.fillStyle='#623f65';ctx.font='bold 13px Arial';ctx.fillText('CENTRAL REGIONAL  /  OBJECT STORIES',m,35);
 ctx.fillStyle='#155b56';ctx.font='bold 17px Arial';ctx.fillText(String(e.origin||'').toUpperCase(),m,70);
 const flag=await loadFlag(e);const fw=96,fh=66,factor=Math.min(fw/flag.width,fh/flag.height),iw=flag.width*factor,ih=flag.height*factor;ctx.drawImage(flag,900-m-fw+(fw-iw)/2,62+(fh-ih)/2,iw,ih);ctx.strokeStyle='#c9b898';ctx.strokeRect(900-m-fw,62,fw,fh);
 let titleLines,titleSize=44;do{ctx.font='bold '+titleSize+'px Georgia';titleLines=lines(ctx,e.object,680);if(titleLines.length<=2)break;titleSize-=2}while(titleSize>=26);if(titleLines.length>2)throw Error(e.object+': shorten the object name for the card.');ctx.fillStyle='#155b56';let y=108;for(const line of titleLines){ctx.fillText(line,m,y);y+=titleSize*1.12}
 if(e.subtitle){ctx.fillStyle='#623f65';ctx.font='italic 21px Georgia';for(const line of lines(ctx,e.subtitle,bodyWidth)){ctx.fillText(line,m,y+1);y+=25}}
 const top=y+17,bottom=H-155;ctx.strokeStyle='#b58a43';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(m,top-10);ctx.lineTo(855,top-10);ctx.stroke();let bodyLines,fontSize=size==='instagram'?32:23;do{ctx.font=fontSize+'px Arial';bodyLines=lines(ctx,e.printText||e.story||e.summary,bodyWidth);if(bodyLines.length*fontSize*1.36<=bottom-top)break;fontSize--}while(fontSize>=13);if(fontSize<13)throw Error(e.object+': card text is too long. Shorten it or choose a larger size.');ctx.fillStyle='#254742';for(const line of bodyLines){ctx.fillText(line,m,top+fontSize);y=top;ctx.translate(0,fontSize*1.36)}ctx.setTransform(scale,0,0,scale,0,0);
 if(size==='instagram'){const panelY=top+bodyLines.length*fontSize*1.36+55,panelH=Math.min(230,H-195-panelY);if(panelH>130){ctx.fillStyle='#eee5e9';ctx.fillRect(m,panelY,810,panelH);ctx.strokeStyle='#b58a43';ctx.strokeRect(m,panelY,810,panelH);const logo=new Image();logo.src='museum-icon-192.png';await logo.decode();ctx.drawImage(logo,m+30,panelY+(panelH-120)/2,120,120);ctx.fillStyle='#155b56';ctx.font='bold 34px Georgia';ctx.fillText('Explore the collection',m+175,panelY+65);ctx.font='22px Arial';ctx.fillText(e.caseId+' · Central Regional Museum',m+175,panelY+105);ctx.font='16px Arial';ctx.fillText('central-regional-museum.github.io/museum/',m+175,panelY+145);}}
 const fy=H-125;ctx.fillStyle='#623f65';ctx.font='bold 11px Arial';ctx.fillText('DONATED BY',m,fy);ctx.fillStyle='#254742';ctx.font='italic 22px Georgia';const donor=e.donor||'Not recorded';if(ctx.measureText(donor).width>510)ctx.font='italic 17px Georgia';ctx.fillText(donor,m+105,fy);
 ctx.font='bold 11px Arial';ctx.fillStyle='#623f65';ctx.fillText('ID NO.',m,fy+32);ctx.fillText('CASE ID',m+150,fy+32);ctx.font='bold 29px Georgia';ctx.fillStyle='#155b56';ctx.fillText(e.inventoryId||e.id,m,fy+65);ctx.font='19px Arial';ctx.fillText(e.caseId||'',m+150,fy+65);
 if(!qr)throw Error('Generate a QR preview first.');ctx.fillStyle='white';ctx.fillRect(730,fy-11,125,125);ctx.imageSmoothingEnabled=false;ctx.drawImage(qr,741,fy,103,103);ctx.imageSmoothingEnabled=true;ctx.font='bold 9px Arial';ctx.fillStyle='#155b56';ctx.fillText('SCAN TO DISCOVER',735,H-13);
 ctx.font='9px Arial';ctx.fillStyle='#623f65';ctx.fillText('Central Regional High School Museum',m,H-19);
 if(e.wikipedia){ctx.font='8px Arial';ctx.fillText('Text adapted from Wikipedia · '+e.wikipedia.title+' · CC BY-SA 4.0 · source via QR',m,H-7)}
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('The picture could not be created. Please try again.')),mime,.96));
 if(mime==='image/jpeg'){
   if(blob.type!==mime)throw Error('This browser could not create a JPG. Try the PNG option in paper and batch tools.');
   // Make print density explicit even when the browser omits its JFIF header.
   const bytes=new Uint8Array(await blob.arrayBuffer());
   if(bytes[0]!==255||bytes[1]!==216)throw Error('The JPG could not be prepared.');
   if(bytes[2]===255&&bytes[3]===224&&String.fromCharCode(...bytes.slice(6,11))==='JFIF\0'){
     bytes.set([1,1,44,1,44],13);return new Blob([bytes],{type:mime});
   }
   return new Blob([bytes.slice(0,2),Uint8Array.of(255,224,0,16,74,70,73,70,0,1,1,1,1,44,1,44,0,0),bytes.slice(2)],{type:mime});
 }
 return dpi(blob);
}
async function zip(files){const locals=[],central=[];let offset=0;for(const file of files){const name=enc.encode(file.name),bytes=new Uint8Array(await file.blob.arrayBuffer()),c=crc(bytes),local=new Uint8Array(30),v=new DataView(local.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,c,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);locals.push(local,name,bytes);const cd=new Uint8Array(46),d=new DataView(cd.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,c,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);central.push(cd,name);offset+=30+name.length+bytes.length}const size=central.reduce((n,a)=>n+a.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);return new Blob([...locals,...central,end],{type:'application/zip'})}
root.MuseumPNG={card,zip};
})(window);
