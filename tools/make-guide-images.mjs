// Editable illustrations, not screenshots. Each highlighted row matches the guide text.
import fs from 'node:fs/promises';
const dir=new URL('../assets/guides/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=19,color='#254742')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${color}">${esc(s)}</text>`;
const highlight=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#e2ede6" stroke="#b64c39" stroke-width="3"/>`;
const share=(x,y)=>`<g transform="translate(${x} ${y})" stroke="#155b56" stroke-width="3" fill="none"><path d="M0 9v16h24V9M12 18V-5M4 3l8-8 8 8"/></g>`;
function context(name){let art='<rect x="22" y="68" width="516" height="208" rx="12" fill="white" stroke="#b7bdba"/><path d="M22 108h516" stroke="#b7bdba"/>';
 if(name==='drive-upload'||name==='phone-drive')return art+text(40,95,'Google Drive',18)+highlight(38,123,115,40)+text(51,150,'+ New',20)+'<rect x="52" y="173" width="310" height="78" rx="7" fill="#fffaf2" stroke="#b7bdba"/>'+highlight(63,184,285,44)+text(78,212,name==='drive-upload'?'File upload':'Upload / File upload',19);
 if(name==='phone-docs')return art+text(40,93,'My Museum Passport    /    Edit',18)+highlight(40,116,91,32)+text(50,139,'+ Insert',18)+'<rect x="40" y="157" width="390" height="105" rx="6" fill="#fffaf2" stroke="#b7bdba"/>'+highlight(53,167,361,36)+text(67,192,'Image  >',19)+text(67,237,'From photos',18);
 if(name==='docs-stamp')return art+text(40,93,'My Museum Passport',18)+text(40,133,'File   Edit   View',16)+highlight(166,114,79,28)+text(178,134,name==='phone-docs'?'+ Insert':'Insert',16)+'<rect x="166" y="148" width="300" height="116" rx="6" fill="#fffaf2" stroke="#b7bdba"/>'+highlight(177,156,278,36)+text(190,181,'Image  >',18)+text(190,218,name==='phone-docs'?'From photos':'Upload from computer',18)+text(190,246,'Drive & Photos',17);
 if(name==='browser-passport')return art+text(40,94,'blank-museum-passport.html',18)+text(40,137,'Abacus / Suanpan',21)+text(40,170,'Add earned stamp (image file)',18)+highlight(38,181,185,32)+text(51,204,'Choose File',18)+highlight(38,227,340,32)+text(51,250,'Download completed passport',18);
 if(name==='drive-open')return art+text(40,94,'Google Drive  /  My files',18)+text(40,137,'W   blank-museum-passport…',17)+'<rect x="168" y="147" width="345" height="110" rx="6" fill="#fffaf2" stroke="#b7bdba"/>'+text(183,178,'Open with  >',18)+highlight(181,191,317,44)+text(195,219,'Google Docs',20);
 if(name==='shortcut-ios')return art+text(40,94,'Safari',18)+text(40,142,'Hidden Histories',25)+'<path d="M23 228h514" stroke="#b7bdba"/>'+text(40,258,'‹    ›       museum website',17)+highlight(458,233,59,34)+share(475,242)+'<rect x="258" y="115" width="259" height="104" rx="10" fill="#fffaf2" stroke="#b7bdba"/>'+text(271,142,'Share menu',17)+highlight(269,154,234,46)+text(280,183,'+  Add to Home Screen',18);
 if(name.startsWith('shortcut-')){const mac=name==='shortcut-mac';art+=(mac?text(38,94,'Safari',17)+text(160,94,'Edit   View',17):text(38,94,'‹  ›    central-regional-museum…',17))+highlight(mac?98:488,77,mac?42:34,28)+text(mac?103:498,98,mac?'File':'⋮',20)+'<rect x="150" y="117" width="370" height="142" rx="8" fill="#fffaf2" stroke="#b7bdba"/>';
  const menus=name==='shortcut-android'?['Chrome menu','Install and create shortcut','Install']:name==='shortcut-chrome'?['Chrome menu','Cast, save, and share  >','Install page as app…']:name==='shortcut-edge'?['Edge menu > More tools > Apps','Install this site as an app','Install']:name==='shortcut-mac'?['File menu','Add to Dock','Add']:['Open in Safari or Chrome','Choose your browser','Follow the matching picture'];return art+text(165,144,menus[0],16)+highlight(161,155,346,40)+text(176,181,menus[1],18)+text(176,231,menus[2],18);
 }
 if(name==='docs-saved')return art+text(40,94,'My Museum Passport   ☁  Saved',18)+text(40,139,'My observation',18)+text(40,177,'I noticed…',19)+highlight(301,79,217,26)+text(315,98,'Saved to Drive',17);
 if(name==='phone-photo'||name==='stamp-save')return art+text(40,94,'My Passport',18)+'<circle cx="85" cy="158" r="31" fill="#eee5ed" stroke="#623f65"/>'+text(73,166,'★',25,'#623f65')+text(145,150,'Abacus / Suanpan',20)+highlight(143,165,305,42)+text(159,193,'Save artifact stamp',20)+text(40,249,'museum-stamp-ART-002.png',17);
 return art+text(40,94,'Hidden Histories  /  My Passport',18)+text(40,145,'Your discovery passport',25)+highlight(37,171,484,53)+text(48,204,'Download blank for Google Docs',19)+text(40,253,'blank-museum-passport-google-docs.docx',16);
}
function picture(name,title,rows,footer){const height=360+rows.length*62;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 ${height}" role="img"><title>${esc(title)}</title><desc>${esc(rows.join(' then '))}</desc><rect x="1" y="1" width="558" height="${height-2}" rx="20" fill="#fffaf2" stroke="#c8b99f"/>${text(24,34,title,21)}<path d="M24 53h512" stroke="#d9cebc"/>${context(name)}${rows.map((s,i)=>{const y=292+i*62;return `<rect x="60" y="${y}" width="472" height="46" rx="9" fill="${i%2?'#eee5ed':'#e2ede6'}" stroke="#155b56" stroke-width="2"/><circle cx="28" cy="${y+23}" r="17" fill="#155b56"/>${text(23,y+30,String(i+1),20,'white')}${text(78,y+30,s,s.length>37?16:19)}<path d="M510 ${y+14}l8 9-8 9" fill="none" stroke="#975c46" stroke-width="3"/>`}).join('')}${text(24,height-18,footer||'Illustration — look for the outlined buttons.',14,'#5e675f')}</svg>`}
const images={
 'passport-download':['My Passport on the museum website',['Open My Passport','Download blank for Google Docs','Save the .docx file in Downloads']],
 'drive-upload':['Google Drive on a computer',['+ New','File upload','Choose blank-museum-passport-google-docs.docx']],
 'drive-open':['Open your passport in Google Docs',['Right-click the uploaded passport','Open with > Google Docs','Rename it: My Museum Passport']],
 'docs-stamp':['Add an earned PNG stamp in Google Docs',['Select ADD STAMP HERE in the matching box','Insert > Image','Upload from computer — choose your stamp']],
 'docs-saved':['Keep your passport safe',['Write your observation below the picture','Check the saved status beside the title','Follow your teacher’s turn-in directions']],
 'phone-drive':['Google Drive app on your phone or tablet',['+ New','Upload (or File upload)','Browse — select the downloaded .docx']],
 'phone-docs':['Google Docs app on your phone or tablet',['Open your passport, then tap Edit (pencil)','Select ADD STAMP HERE in the matching box','+ Insert > Image > From photos']],
 'phone-photo':['Keep an earned stamp picture',['My Passport > Save artifact stamp / Save stamp','iPhone: Open save menu > Save Image','Android: download the PNG to Downloads']],
 'browser-passport':['Your downloaded browser passport',['Open blank-museum-passport.html in a browser','Add earned stamp (image file) > Choose File','Download completed passport to keep changes']],
 'stamp-save':['Save your earned stamp picture',['My Passport > find an earned stamp','Save artifact stamp (or Save stamp)','Save museum-stamp-[ID].png in Downloads']],
 'shortcut-ios':['iPhone / iPad — Safari',['Share: square with an up arrow','Scroll to Add to Home Screen','Tap Add to finish'],'Share may be inside More (…) in Safari.' ],
 'shortcut-android':['Android — Chrome',['More: the three dots at the top right','Install and create shortcut','Install (or Add to Home screen > Add)']],
 'shortcut-chrome':['Chromebook / Windows / Mac — Chrome',['More: the three dots at the top right','Cast, save, and share','Install page as app… > Install']],
 'shortcut-mac':['Mac — Safari',['File in the menu bar (or Share)','Add to Dock','Add — find the museum icon in your Dock']],
 'shortcut-edge':['Windows / Mac — Microsoft Edge',['Settings and more: the three dots (…)','More tools > Apps','Install this site as an app > Install']],
 'shortcut-fallback':['Choose a supported browser',['iPhone / iPad: open the museum in Safari','Android / Chromebook / Windows: Chrome','Mac: Safari or Chrome']]
};
for(const [name,[title,rows,footer]]of Object.entries(images))await fs.writeFile(new URL(name+'.svg',dir),picture(name,title,rows,footer));
console.log('Created '+Object.keys(images).length+' labeled guide illustrations.');
