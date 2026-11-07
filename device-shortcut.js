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
  function refresh(){
    for(const b of document.querySelectorAll('[data-home-install]')){
      const label=b.querySelector('[data-install-label]');const text=installed()?'Added to Home Screen':'Add to Home Screen';
      if(label && label.textContent!==text)label.textContent=text;
      b.disabled=installed()||requesting;
    }
    if(modal){modal.querySelector('[data-native]').hidden=!offer||installed();modal.querySelector('.install-instructions').hidden=!!offer&&!installed();}
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
    const lead=ios?(safari?'In Safari:':'Open this page in Safari, then:'):android?'In Chrome on your phone:':/Edg\//.test(ua)?'In Microsoft Edge:':safari?'In Safari on your Mac:':/Chrome|Chromium/.test(ua)?'In Chrome on your computer:':'Open this page in Safari on iPhone, or Chrome on Android or computer.';
    let steps=ios?['Tap Share (the square with an up arrow). If it’s hidden, tap the page menu, then Share.','Tap Add to Home Screen, then Add.']
      :android?['Tap the three dots in Chrome.','Choose Add to Home screen or Install and create shortcut, then confirm.']
      :safari?['Open File → Add to Dock.','Click Add.']
      :/Edg\//.test(ua)?['Open the three-dot menu.','Choose Apps → Install this site as an app, then confirm.']
      :/Chrome|Chromium/.test(ua)?['Open the three-dot menu.','Choose Cast, save, and share → Install page as app. Confirm Install.']:[];
    d.innerHTML='<img class="install-icon" alt="" width="62" height="62"><p class="install-eyebrow">CENTRAL REGIONAL MUSEUM</p><h2 id="home-install-title">Add '+title+'</h2><div class="install-instructions"><p></p><ol></ol></div><button type="button" data-native hidden>Add to Home Screen</button><button type="button" data-close>Done</button>';
    d.querySelector('img').src=icon;d.querySelector('.install-instructions p').textContent=lead;const ol=d.querySelector('ol');for(const text of steps){const li=document.createElement('li');li.textContent=text;ol.append(li)}
    d.querySelector('[data-close]').onclick=()=>d.close();d.querySelector('[data-native]').onclick=native;
    const describe=()=>{d.querySelector('.install-instructions').hidden=!!offer;};
    d.addEventListener('close',()=>{d.remove();if(modal===d)modal=null;invokingButton?.focus({preventScroll:true});});
    document.body.append(d);refresh();describe();d.showModal();
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
