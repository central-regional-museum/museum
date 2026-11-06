(() => {
  'use strict';
  const finds = [
    {id:'moth', field:'accessory', name:'Luna moth pin', host:'article.detail details', clue:'Inspect the tiny wings in the margin'},
    {id:'palette', field:'graphic', name:'Painter’s palette patch', host:'.color-studio', clue:'Look under the paint tray'},
    {id:'letterman', field:'outfit', name:'Museum varsity jacket', host:'details.stamp-rulebook', clue:'Unfold the stitched corner'}
  ];
  const id=window.MUSEUM_SETTINGS.collectionId;
  const key=(id==='object-stories-demo'?'museum:':'museum:'+id+':')+'wardrobe';
  function owned(){
    try{const ids=JSON.parse(localStorage.getItem(key));return Array.isArray(ids)?ids:[]}catch{return []}
  }
  function populate(){
    const ids=owned();
    for(const find of finds){
      const select=document.getElementById(find.field);
      if(!select||!ids.includes(find.id)||Array.from(select.options).some(o=>o.value===find.id))continue;
      select.add(new Option(find.name+' · museum find',find.id));
    }
  }
  window.MuseumWardrobe={populate,unlocked:(field,value)=>finds.some(f=>f.field===field&&f.id===value)&&owned().includes(value)};
  function mount(){
    for(const find of finds){
      const host=document.querySelector(find.host);
      if(!host||host.querySelector('[data-wardrobe-find]'))continue;
      const box=document.createElement('div');
      box.dataset.wardrobeFind=find.id;
      const hint=document.createElement('button');
      hint.type='button';hint.className='secondary';hint.textContent=find.clue;
      const result=document.createElement('span');result.setAttribute('role','status');
      function reveal(){
        hint.hidden=true;result.textContent=find.name+' found! ';
        const link=document.createElement('a');link.href='explorer.html';link.textContent='Open My Explorer';result.append(link);
      }
      hint.onclick=()=>{
        try{localStorage.setItem(key,JSON.stringify([...new Set([...owned(),find.id])]));}
        catch{result.textContent='Your browser could not keep this find. Allow browser storage and try again.';return}
        window.MuseumVault?.checkpoint(true);reveal();
      };
      box.append(hint,result);host.append(box);if(owned().includes(find.id))reveal();
    }
  }
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',populate);window.addEventListener('storage',populate);
  populate();mount();
})();
