/* Keep this small script on the app page that will be installed. */
(() => {
  'use strict';
  const script=document.currentScript, teacher=script?.dataset.app==='teacher';
  if(window.__museumHomeScreen) return;
  window.__museumHomeScreen=true;
  const root=new URL('.',script.src), title=teacher?'Teacher Desk':'School Museum';
  const icon=new URL((teacher?'desk-app':'student-app')+'-192.png',root).href;
  const home=new URL(teacher?'teacher':'index.html',root);
  let offer=null, modal=null, requesting=false, added=false, invokingButton=null;
  const installed=()=>added||navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;
  const ua=navigator.userAgent, ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1), android=/Android/i.test(ua);
  const safari=/Safari/i.test(ua)&&!/CriOS|FxiOS|EdgiOS|Chrome|Chromium|Android/i.test(ua);
  const desktopSafari=safari&&!ios&&/Mac/i.test(ua);
  const edge=/Edg\//.test(ua), chrome=/Chrome|Chromium/.test(ua)&&!edge&&!/OPR|SamsungBrowser/.test(ua);
  const guideForDevice=()=>{
    if(ios && (safari||/CriOS/.test(ua))) return {label:'Add to Home Screen',where:/CriOS/.test(ua)?'Chrome on iPhone or iPad':'Safari on iPhone or iPad',steps:[
      /CriOS/.test(ua)?'Tap <strong>Share</strong> (the square with an up arrow) beside the address.':'Tap <strong>Share</strong> (the square with an up arrow). If it’s hidden, open the page menu, then tap <strong>Share</strong>.',
      'Scroll down and tap <strong>Add to Home Screen</strong>.','If you see <strong>Open as Web App</strong>, leave it on. Tap <strong>Add</strong>.']};
    if(android && chrome) return {label:'Add to Home Screen',where:'Chrome on Android',steps:['Tap the <strong>three dots ⋮</strong> at the top right.','Tap <strong>Install and create shortcut</strong>. Some phones call it <strong>Add to Home screen</strong>.','Tap <strong>Install</strong> or <strong>Add</strong> to finish.']};
    if(desktopSafari) return {label:'Add to Dock',where:'Safari on Mac',steps:['Click <strong>Share</strong> (the square with an up arrow) in the Safari toolbar.','Click <strong>Add to Dock</strong>.','Click <strong>Add</strong>. Look for the icon in your Dock.'],tip:'You can also click File at the top of your screen, then Add to Dock. This option needs macOS Sonoma 14 or later.'};
    if(!ios&&!android&&chrome) return {label:'Install on this computer',where:'Chrome on your computer',steps:['Click the <strong>three dots ⋮</strong> at the top right of Chrome.','Open <strong>Cast, save, and share</strong>. Click <strong>Install page as app…</strong>.','Click <strong>Install</strong> in the little window that opens.'],tip:'Look at the right end of the address bar. If there’s an Install icon, you can click it, then Install.'};
    if(!ios&&!android&&edge) return {label:'Install on this computer',where:'Microsoft Edge on your computer',steps:['Click the <strong>three dots …</strong> at the top right.','Open <strong>More tools</strong>, then <strong>Apps</strong>. If Apps is already in the menu, click it there.','Click <strong>Install this site as an app</strong>, then <strong>Install</strong>.']};
    return {label:ios||android?'Add to Home Screen':'Add an app shortcut',where:'Use a browser that can add this icon',steps:[ios?'Open this page in <strong>Safari</strong>.':android?'Open this page in <strong>Chrome</strong>.':'Open this page in <strong>Chrome</strong> or, on a Mac, <strong>Safari</strong>.','Click or tap the museum’s shortcut button there to see the steps.']};
  };
  const instructions=guideForDevice();
  function refresh(){
    for(const b of document.querySelectorAll('[data-home-install]')){
      const label=b.querySelector('[data-install-label]');const text=installed()?'App installed':instructions.label;
      if(label && label.textContent!==text)label.textContent=text;
      b.disabled=installed()||requesting;
    }
    if(modal){modal.querySelector('[data-native]').hidden=!offer||installed();modal.querySelector('.install-instructions').hidden=!!offer&&!installed();modal.querySelector('[data-ready]').hidden=!offer||installed();}
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();offer=event;refresh()});
  window.addEventListener('appinstalled',()=>{added=true;offer=null;modal?.close();refresh()});
  if(window.isSecureContext && 'serviceWorker' in navigator) navigator.serviceWorker.register(new URL(teacher?'desk-install-worker.js':'sw.js',root),teacher?{scope:home.pathname}:{}).catch(()=>{});
  function guide(){
    if(modal?.open)return;
    if(!teacher && ![root.pathname,home.pathname].includes(location.pathname) && !offer){
      home.searchParams.set('install','1');location.assign(home.href);return;
    }
    const d=document.createElement('dialog'); modal=d;d.className='home-install-dialog';d.setAttribute('aria-labelledby','home-install-title');
    d.innerHTML='<img class="install-icon" alt="" width="62" height="62"><p class="install-eyebrow">CENTRAL REGIONAL MUSEUM</p><h2 id="home-install-title">'+title+' shortcut</h2><div class="install-instructions"><p><strong>'+instructions.where+'</strong></p><ol>'+instructions.steps.map(step=>'<li>'+step+'</li>').join('')+'</ol>'+(instructions.tip?'<details><summary>My menu looks different</summary><p>'+instructions.tip+'</p></details>':'')+'</div><p data-ready hidden>Your browser can add this icon. Choose Install in the next window.</p><button type="button" data-native hidden>Install '+title+'</button><button type="button" data-close>Close directions</button>';
    d.querySelector('img').src=icon;
    d.querySelector('[data-close]').onclick=()=>d.close();d.querySelector('[data-native]').onclick=native;
    d.addEventListener('close',()=>{d.remove();if(modal===d)modal=null;invokingButton?.focus({preventScroll:true});});
    document.body.append(d);refresh();d.showModal();
  }
  async function native(){
    if(requesting||installed())return;
    if(!offer){guide();return}
    const event=offer;offer=null;requesting=true;
    try{
      // Call from the actual tap; even a timer can lose the browser's required user gesture.
      await event.prompt();const choice=await event.userChoice;
      if(choice?.outcome==='accepted')added=true;
      if(modal?.open)modal.close();
    }catch{if(!modal?.open)guide();else modal.querySelector('.install-instructions').hidden=false;}
    finally{requesting=false;refresh()}
  }
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-home-install]');if(!b)return;e.preventDefault();invokingButton=b;native();});
  function start(){
    if(!teacher){
      const b=document.createElement('button');b.type='button';b.className='home-install-button';b.dataset.homeInstall='';
      b.innerHTML='<img width="30" height="30" alt=""><span data-install-label>Add to Home Screen</span>';b.querySelector('img').src=icon;
      const bar=document.getElementById('shortcut-bar');
      if(bar)bar.replaceChildren(b);else {const footer=document.createElement('div');footer.className='home-install-foot';footer.append(b);document.body.append(footer)}
    }
    refresh();const u=new URL(location.href);if(u.searchParams.get('install')==='1'){
      u.searchParams.delete('install');history.replaceState(history.state,'',u.href);
      if(!installed())guide();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
