import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
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
 for(const file of ['puzzle.html','puzzle.js','journey-games.js','journey-theme.css','site-fun.js','index.html','style.css','app.js','passport-rules.js','teacher-check.js','teacher-check.html','polish.js','vault.js','discoveries.js','stamp-system.js','stamp-designs.js','exchange.js','curiosity.js','boot.js','journey.html','collection-core.js','placards.html','placards.css','placards.js','explorer.html','explorer.css','explorer.js','explorer-options.js','CHARACTER_CREDITS.txt','.nojekyll'])await fs.copyFile(path.join(root,file),path.join(dist,file));
 const serialize=v=>JSON.stringify(v,null,2).replace(/</g,'\\u003c');
 await fs.writeFile(path.join(dist,'settings.js'),'window.MUSEUM_SETTINGS = '+serialize(settings)+';\n');
 await fs.writeFile(path.join(dist,'exhibits.js'),'window.EXHIBITS = '+serialize(items.filter(e=>e.published!==false))+';\n');
 await fs.mkdir(path.join(dist,'tools'),{recursive:true});
 await fs.copyFile(path.join(root,'tools/qrcode.min.js'),path.join(dist,'tools/qrcode.min.js'));
 // Copy only media referenced by published exhibits. Unused/draft assets stay out.
 for(const e of items.filter(e=>e.published!==false))for(const key of ['image','audio'])if(e[key]){const dest=path.join(dist,e[key]);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(path.join(root,e[key]),dest);}
 console.log('READY: '+items.filter(e=>e.published!==false).length+' published exhibits. Upload only the contents of dist/ to GitHub Pages.');
}
