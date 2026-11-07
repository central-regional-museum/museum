// A new stamp or find is a reason to back up. Reading, revisiting, or waiting is not.
(() => {
  const vault=window.MuseumVault;
  if(!vault)return;
  const id=window.MUSEUM_SETTINGS.collectionId,key=(id==='object-stories-demo'?'museum:':'museum:'+id+':')+'backup-seen';
  let fallback=[],scheduled=false;
  const seen=()=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
  const remember=list=>{fallback=list;try{localStorage.setItem(key,JSON.stringify(list))}catch{}};
  function refresh(){
    const main=document.querySelector('main');if(!main)return;
    const before=new Set(seen()),now=vault.milestones();let box=document.getElementById('recovery-reminder');
    if(!now.some(id=>!before.has(id))){box?.remove();return}
    if(box)return;
    box=document.createElement('aside');box.id='recovery-reminder';box.className='backup-reminder';box.setAttribute('aria-label','Save your museum progress');
    box.innerHTML='<span><strong>You have new museum progress.</strong> Keep a copy in a folder you can find again, like “Museum Backups.”</span><button type="button" data-save>Back up my progress</button><button type="button" class="remind-later">Not now</button>';
    const save=box.querySelector('[data-save]');save.onclick=async()=>{save.disabled=true;try{await vault.download()}finally{save.disabled=false}};
    box.querySelector('.remind-later').onclick=()=>{remember(vault.milestones());box.remove()};main.append(box);
  }
  function schedule(){if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;refresh()})}}
  window.addEventListener('museum-backup',event=>{remember(event.detail||[]);schedule()});
  for(const name of ['museum-find-changed','storage','pageshow','hashchange','focus'])window.addEventListener(name,schedule);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  // The student router also rebuilds the same route after a quiz or passport action.
  new MutationObserver(records=>{if(records.some(r=>Array.from(r.removedNodes).some(n=>n.id==='recovery-reminder'||n.querySelector?.('#recovery-reminder'))))schedule()}).observe(document.body,{childList:true,subtree:true});
  schedule();
})();
