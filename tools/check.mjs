// Focused regression checks for content validation and collection scaling.
import fs from 'node:fs/promises';import vm from 'node:vm';import assert from 'node:assert/strict';
const ctx={window:{},URL};vm.createContext(ctx);for(const f of ['settings.js','exhibits.js','collection-core.js'])vm.runInContext(await fs.readFile(new URL('../'+f,import.meta.url),'utf8'),ctx);
const {validate}=ctx.window.MuseumCore,settings=JSON.parse(JSON.stringify(ctx.window.MUSEUM_SETTINGS)),base=JSON.parse(JSON.stringify(ctx.window.EXHIBITS));
assert.equal(validate(settings,base).errors.length,0);
const many=Array.from({length:100},(_,i)=>({...base[i%3],id:String(i+1).padStart(3,'0')}));assert.equal(validate(settings,many).errors.length,0);
assert(validate(settings,[...base,base[0]]).errors.some(e=>e.includes('duplicate ID')));
assert(validate(settings,[{...base[0],answer:9}]).errors.some(e=>e.includes('answer must')));
assert(validate(settings,[{...base[0],image:'assets/../secret.jpg'}]).errors.some(e=>e.includes('local path')));
assert(validate({...settings,requiredExhibitIds:['missing']},base).errors.some(e=>e.includes('not published')));
assert(validate(settings,base,{classroom:true}).errors.length>0);
assert.equal(validate(settings,[...base,{id:'004',published:false}]).errors.length,0);
assert(validate(settings,[{...base[0],sources:[{title:'Bad',url:'javascript:alert(1)'}]}]).errors.length>0);
console.log('PASS: valid sample and 100 objects; duplicate IDs, broken answers, unsafe paths/URLs, missing trail objects and demo classroom release rejected; unfinished drafts allowed.');
