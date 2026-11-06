import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),classroom=args.includes('--classroom');
const context={window:{},URL};vm.createContext(context);
for(const file of ['settings.js','exhibits.js','collection-core.js'])vm.runInContext(await fs.readFile(path.join(root,file),'utf8'),context,{timeout:2000});
let settings=context.window.MUSEUM_SETTINGS,items=context.window.EXHIBITS;
const importIndex=args.indexOf('--import');
if(importIndex>=0){const f=args[importIndex+1];if(!f)throw Error('Provide a backup JSON path after --import.');const data=JSON.parse(await fs.readFile(f,'utf8'));if(data.format!=='object-stories-collection'||data.version!==1)throw Error('Not a collection backup.');settings=data.settings;items=data.exhibits;}
const report=context.window.MuseumCore.validate(settings,items,{classroom});
for(const e of (Array.isArray(items)?items:[]))if(e&&typeof e==='object'&&e.published!==false)for(const field of ['image','audio'])if(e[field]&&context.window.MuseumCore.localAsset(e[field])){try{await fs.access(path.join(root,e[field]))}catch{report.errors.push('Exhibit '+e.id+': missing '+e[field]);}}
if(classroom&&!settings.passportReady)report.errors.push('Teacher must verify the school-owned passport template link and mark it ready.');
for(const w of report.warnings)console.log('REVIEW: '+w);
if(report.errors.length){console.error(report.errors.map(e=>'ERROR: '+e).join('\n'));process.exitCode=1;}else{
 const registryFile=path.join(root,'stamp-designs.js');
 const registryContext={window:{}};vm.createContext(registryContext);vm.runInContext(await fs.readFile(registryFile,'utf8'),registryContext);
 const registry=registryContext.window.STAMP_DESIGNS;const used=new Set(Object.values(registry));
 for(const e of items)if(registry[e.id]===undefined){let slot=0;while(used.has(slot))slot++;if(slot>=200)throw Error('All 200 stamp designs are assigned; archive intentionally before adding more.');registry[e.id]=slot;used.add(slot);}
 await fs.writeFile(registryFile,'window.STAMP_DESIGNS = '+JSON.stringify(registry,null,2)+';\n');
 const dist=path.join(root,'dist');await fs.mkdir(dist,{recursive:true});
 // Only remove the known build destination, never the source project or user folders.
 for(const f of await fs.readdir(dist))await fs.rm(path.join(dist,f),{recursive:true,force:true});
 for(const file of ['flag-images-1.js','flag-images-2.js','flag-images-3.js','flag-images-4.js','install.html','flag-catalog.json','museum-labels.js','placards-png.js','wardrobe.js','museum-save.js','museum-mark.svg','museum-icon-192.png','museum-icon-512.png','device-shortcut.js','sw.js','offline.html','color-break.html','color-break.js','color-break.css','wiki-photos.js','trophy-client.js','brand.js','progress-notices.js','puzzle.html','puzzle.js','journey-games.js','journey-theme.css','site-fun.js','index.html','style.css','app.js','passport-rules.js','teacher-check.js','teacher-check.html','polish.js','vault.js','discoveries.js','stamp-system.js','stamp-designs.js','exchange.js','curiosity.js','boot.js','journey.html','collection-core.js','placards.html','placards.css','placards.js','explorer.html','explorer.css','explorer.js','explorer-options.js','CHARACTER_CREDITS.txt','.nojekyll'])await fs.copyFile(path.join(root,file),path.join(dist,file));
 const published=items.filter(e=>e.published!==false);
 const revision=createHash('sha256').update(JSON.stringify({settings,items:published,specials:11})).digest('hex').slice(0,20);
 settings={...settings,collectionRevision:revision};
 await fs.writeFile(path.join(dist,'collection-status.json'),JSON.stringify({collectionId:settings.collectionId,revision,items:published.map(e=>({id:e.id,object:e.object,fingerprint:createHash('sha256').update(JSON.stringify(e)).digest('hex')})),availableStamps:published.length+11,requiredExhibitIds:(settings.requiredExhibitIds||[]).filter(id=>published.some(e=>e.id===id))}));
 for(const file of ['index.html','journey.html','explorer.html','teacher-check.html','puzzle.html','placards.html']){
   const dest=path.join(dist,file);let html=await fs.readFile(dest,'utf8');
   html=html.replace(/src="(settings|exhibits)\.js"/g,(_,name)=>'src="'+name+'.js?v='+revision+'"');await fs.writeFile(dest,html);
 }
 await fs.writeFile(path.join(dist,'manifest.webmanifest'),JSON.stringify({name:settings.title,short_name:'Museum',id:'./',start_url:'./index.html?source=installed',scope:'./',display:'standalone',background_color:'#fbf5ec',theme_color:'#155b56',icons:[{src:'museum-icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'museum-icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]}));
 const serialize=v=>JSON.stringify(v,null,2).replace(/</g,'\\u003c');
 await fs.writeFile(path.join(dist,'settings.js'),'window.MUSEUM_SETTINGS = '+serialize(settings)+';\n');
 await fs.writeFile(path.join(dist,'exhibits.js'),'window.EXHIBITS = '+serialize(items.filter(e=>e.published!==false))+';\n');
 await fs.mkdir(path.join(dist,'tools'),{recursive:true});
 await fs.copyFile(path.join(root,'tools/qrcode.min.js'),path.join(dist,'tools/qrcode.min.js'));
 await fs.cp(path.join(root,'shortcuts'),path.join(dist,'shortcuts'),{recursive:true});
 await fs.mkdir(path.join(dist,'assets/flags'),{recursive:true});
 await fs.cp(path.join(root,'assets/flags'),path.join(dist,'assets/flags'),{recursive:true});
 // Copy only media referenced by published exhibits. Unused/draft assets stay out.
 for(const e of items.filter(e=>e.published!==false))for(const key of ['image','audio'])if(e[key]){const dest=path.join(dist,e[key]);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(path.join(root,e[key]),dest);}
 console.log('READY: '+items.filter(e=>e.published!==false).length+' published exhibits. Upload only the contents of dist/ to GitHub Pages.');
}
