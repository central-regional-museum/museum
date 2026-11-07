(()=>{'use strict';const css=document.createElement('style');css.textContent='header a.brand,a.brand{display:inline-flex!important;align-items:center;gap:12px;text-decoration:none;letter-spacing:0!important;color:var(--hh-teal)!important;font-family:var(--hh-title-font)!important;line-height:1.15!important;min-width:0}.brand-symbol{display:block;width:58px;height:64px;flex:none}.brand-words{display:block;font:600 28px/1.15 Georgia,serif;letter-spacing:.2px;text-transform:none}.brand-school{display:block!important;font:650 9px/1.6 system-ui,sans-serif!important;letter-spacing:1.8px!important;margin:6px 0 0!important;max-width:330px;color:var(--hh-caption);text-transform:uppercase}@media(max-width:760px){.brand-symbol{width:44px;height:50px}header a.brand,a.brand{gap:9px}.brand-words{font-size:23px}.brand-school{font-size:8px!important;letter-spacing:1.1px!important;max-width:215px}}';document.head.append(css);
css.textContent+='header{grid-template-columns:minmax(0,1fr) auto auto!important;align-items:center!important;column-gap:18px!important}header nav{grid-column:1/-1;grid-row:2}header .brand{grid-column:1;grid-row:1}header .museum-sound{position:static!important;grid-column:3;grid-row:1;justify-self:end}.color-break-launch{grid-column:2;grid-row:1;display:flex;align-items:center;gap:10px;padding:10px 15px;border:1px solid #b99bc0;border-radius:25px 12px 25px 12px;background:#eee5e9;text-decoration:none;color:#623f65;font:650 13px/1.4 system-ui;box-shadow:3px 3px 0 #ddc7a555}.color-break-launch small{display:block;font:11px/1.4 system-ui;letter-spacing:.2px}.color-break-launch svg{width:34px;height:34px;flex:none}@media(max-width:760px){header{grid-template-columns:minmax(0,1fr) auto!important;gap:12px!important}header .brand-words{font-size:22px}header .brand-school{max-width:175px}header .museum-sound{grid-column:2;grid-row:1;font-size:11px;padding:8px 10px}.color-break-launch{grid-column:1/-1;grid-row:2;justify-self:start;padding:8px 13px}header nav{grid-row:3}header::after{display:none}}@media print{.color-break-launch{display:none!important}}';
const mark='<img class="brand-symbol" src="header-compass-mark.svg" width="58" height="64" alt="">';
const phoneLayout = matchMedia('(max-width:760px), (max-width:940px) and (hover:none) and (pointer:coarse)');

function setMenu(header, open) {
  const button = header.querySelector('.phone-menu-toggle');
  if (!button) return;
  const wasOpen = header.classList.contains('menu-open');
  if (open === wasOpen) return;
  header.classList.toggle('menu-open',open);
  button.setAttribute('aria-expanded',String(open));
  button.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
  button.setAttribute('aria-label',open ? 'Close menu' : 'Menu');
}

function addPhoneMenu(header) {
  const nav = header?.querySelector(':scope > nav[aria-label="Main"]');
  if (!nav) return;
  let button = header.querySelector('.phone-menu-toggle');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'phone-menu-toggle';
    button.setAttribute('aria-expanded','false');
    button.innerHTML = '<span class="menu-glyph" aria-hidden="true"></span><span class="menu-label">Menu</span>';
    button.addEventListener('click',()=>setMenu(header,!header.classList.contains('menu-open')));
    header.querySelector('.brand').after(button);
    header.classList.add('has-phone-menu');
  }
  if (!nav.id) nav.id = 'museum-main-navigation';
  const ids = [nav.id];
  for (const [selector,id] of [['.color-break-launch','museum-color-link'],['.museum-sound','museum-sound-toggle']]) {
    const control = header.querySelector(selector);
    if (control) { if (!control.id) control.id = id; ids.push(control.id); }
  }
  button.setAttribute('aria-controls',ids.join(' '));
}

function closePhoneMenu(restoreFocus=false) {
  const header = document.querySelector('header.has-phone-menu.menu-open');
  if (!header) return;
  setMenu(header,false);
  if (restoreFocus) header.querySelector('.phone-menu-toggle').focus({preventScroll:true});
}
document.addEventListener('click',event=>{
  const header = document.querySelector('header.has-phone-menu.menu-open');
  if (!header || !(event.target instanceof Element)) return;
  if (!header.contains(event.target) || event.target.closest('a[href]')) closePhoneMenu();
});
document.addEventListener('keydown',event=>{
  if (event.key === 'Escape' && document.querySelector('header.has-phone-menu.menu-open')) {
    event.preventDefault();
    closePhoneMenu(true);
  }
});
window.addEventListener('hashchange',()=>closePhoneMenu());
window.addEventListener('pageshow',()=>closePhoneMenu());
phoneLayout.addEventListener('change',()=>closePhoneMenu());

let busy=false;function apply(){if(busy)return;busy=true;try{const title=window.MUSEUM_SETTINGS?.title||'Hidden Histories',school=window.MUSEUM_SETTINGS?.schoolName||'Central Regional High School';for(const link of document.querySelectorAll('a.brand')){if(link.querySelector('.brand-words')?.textContent===title&&link.querySelector('.brand-school')?.textContent===school)continue;link.replaceChildren();link.insertAdjacentHTML('beforeend',mark);const words=document.createElement('span'),name=document.createElement('span'),sub=document.createElement('small');words.className='brand-lockup';name.className='brand-words';name.textContent=title;sub.className='brand-school';sub.textContent=school;words.append(name,sub);link.append(words);link.setAttribute('aria-label',title+' · '+school)}const header=document.querySelector('header');if(header&&!header.querySelector('.color-break-launch')&&!location.pathname.endsWith('color-break.html')){const launch=document.createElement('a');launch.className='color-break-launch';launch.href='color-break.html';launch.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="5" width="14" height="14" rx="5" fill="#155b56"/><rect x="21" y="5" width="14" height="14" rx="5" fill="#bd7395"/><rect x="4" y="22" width="14" height="14" rx="5" fill="#dfb34e"/><path d="M28 21l3 6 7 2-7 2-3 7-2-7-6-2 6-2z" fill="#623f65"/></svg><span>Take a Color Break<small>No points. No pressure.</small></span>';header.append(launch)}addPhoneMenu(header)}finally{busy=false}}new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});apply();})();
