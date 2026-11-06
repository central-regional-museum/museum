(function(root){
'use strict';
const text=v=>typeof v==='string'&&v.trim().length>0;
const localAsset=v=>typeof v==='string'&&/^assets\/[a-zA-Z0-9_./-]+$/.test(v)&&!v.split('/').includes('..');
const https=v=>{try{return new URL(v).protocol==='https:'}catch{return false}};
function validate(settings,items,{classroom=false}={}){
 const errors=[],warnings=[],ids=new Set(),museumIds=new Set();
 if(!settings||typeof settings!=='object')return{errors:['Missing museum settings.'],warnings};
 if(!Array.isArray(items))return{errors:['Exhibits must be a list.'],warnings};
 if(!/^[a-z0-9-]+$/.test(settings.collectionId||''))errors.push('Collection ID must use lower-case letters, numbers and hyphens.');
 if(settings.gameRounds!==undefined&&(!Number.isInteger(settings.gameRounds)||settings.gameRounds<1||settings.gameRounds>20))errors.push('Game rounds must be a whole number between 1 and 20.');
 if(!text(settings.title))errors.push('Museum title is required.');
 for(const key of ['passportTemplateUrl','publicBaseUrl'])if(settings[key]&&!https(settings[key]))errors.push(key+' must be an HTTPS URL.');
 if(settings.passportReady&&!settings.passportTemplateUrl)errors.push('Passport is marked ready but its link is missing.');
 if(classroom&&settings.demoMode)errors.push('Turn off demo mode before a classroom release.');
 if(items.some(e=>!e||typeof e!=='object'||Array.isArray(e)))return{errors:['Every exhibit must be an object.'],warnings};
 const published=items.filter(e=>e.published!==false);
 if(!published.length)errors.push('Publish at least one exhibit.');
 for(const e of items){const p='Exhibit '+(e.id||'(no ID)')+': ';
  if(!/^[a-zA-Z0-9_-]{1,40}$/.test(e.id||''))errors.push(p+'use a stable ID with letters, numbers, hyphens or underscores.');
  if(ids.has(e.id))errors.push(p+'duplicate ID.');ids.add(e.id);
  if(e.photoPhrase!==undefined&&(typeof e.photoPhrase!=='string'||e.photoPhrase.length>140))errors.push(p+'character phrase must be text of at most 140 characters.');
  if(e.photoBoothEnabled!==undefined&&typeof e.photoBoothEnabled!=='boolean')errors.push(p+'photo booth setting must be true or false.');
  if(e.inventoryId){if(!/^\d{4}$/.test(e.inventoryId))errors.push(p+'museum ID must have four digits.');if(museumIds.has(e.inventoryId))errors.push(p+'duplicate museum ID.');museumIds.add(e.inventoryId);}
  if(e.published===false)continue;
  for(const key of ['title','object','category','period','material','summary','story','look','connection','question','explanation','prompt'])if(!text(e[key]))errors.push(p+key+' is required.');
  if(!Array.isArray(e.choices)||e.choices.length!==3||!e.choices.every(text)||new Set(e.choices).size!==3)errors.push(p+'provide three different, nonempty answer choices.');
  if(!Number.isInteger(e.answer)||e.answer<0||e.answer>2)errors.push(p+'answer must be 0, 1 or 2.');
  if(!/^#[0-9a-fA-F]{6}$/.test(e.color||''))errors.push(p+'color must be a six-digit hex color.');
  if(!['type','compass','shuttle','generic'].includes(e.shape))errors.push(p+'choose a supported placeholder motif.');
  if(e.image&&!localAsset(e.image))errors.push(p+'photo must be a local path inside assets/.');
  if(e.image&&!text(e.imageAlt))errors.push(p+'photo alt text is required.');
  if(e.audio&&!localAsset(e.audio))errors.push(p+'audio must be a local path inside assets/.');
  if(!Array.isArray(e.sources))errors.push(p+'sources must be a list.');else for(const source of e.sources)if(!text(source.title)||!https(source.url))errors.push(p+'every source needs a title and HTTPS link.');
  if(!e.demo&&!e.sources?.length)(classroom?errors:warnings).push(p+'add a verified reference.');
  if(e.demo)(classroom?errors:warnings).push(p+'contains demonstration content.');
  if(!e.image)warnings.push(p+'no real artifact photograph yet.');
  if(e.audio&&!text(e.transcript))warnings.push(p+'audio needs a transcript for accessibility.');
 }
 const required=settings.requiredExhibitIds||[];
 if(!Array.isArray(required))errors.push('Required exhibit IDs must be a list.');else {if(new Set(required).size!==required.length)errors.push('Required exhibit IDs contain duplicates.');for(const id of required)if(!published.some(e=>e.id===id))errors.push('Required exhibit '+id+' is missing or not published.');}
 return{errors,warnings};
}
root.MuseumCore={validate,localAsset,https};
})(typeof window==='undefined'?globalThis:window);
