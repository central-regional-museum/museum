/* Keep this small script on the app page that will be installed. */
(() => {
  'use strict';
  const script=document.currentScript, teacher=script?.dataset.app==='teacher';
  if(window.__museumHomeScreen) return;
  window.__museumHomeScreen=true;
  const root=new URL('.',script.src), title=teacher?'Teacher Desk':'Hidden Histories';
  const icon=new URL((teacher?'desk-app':'student-app')+'-192.png',root).href;
  const home=new URL(teacher?'teacher':'index.html',root);
  let offer=null, modal=null, requesting=false, added=false, invokingButton=null;
  const installed=()=>added||navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;
  const ua=navigator.userAgent, ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1), android=/Android/i.test(ua);
  const safari=/Safari/i.test(ua)&&!/CriOS|FxiOS|EdgiOS|Chrome|Chromium|Android/i.test(ua);
  const desktopSafari=safari&&!ios&&/Mac/i.test(ua);
  const edge=/Edg\//.test(ua), chrome=/Chrome|Chromium/.test(ua)&&!edge&&!/OPR|SamsungBrowser/.test(ua);
  const deviceChoices={ios:'iPhone / iPad · Safari',android:'Android · Chrome',chrome:'Chromebook / computer · Chrome',mac:'Mac · Safari',edge:'Computer · Microsoft Edge',fallback:'Another browser'};
  const defaultDevice=ios?'ios':android&&chrome?'android':desktopSafari?'mac':!android&&chrome?'chrome':!android&&edge?'edge':'fallback';
  let selectedDevice=defaultDevice;
  const guideForDevice=(choice=defaultDevice)=>{
    if(choice==='ios')return {label:'Add to Home Screen',where:'Safari on iPhone or iPad',image:'shortcut-ios.svg',source:'https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios',steps:[
      'Open the museum in <strong>Safari</strong>. Tap <strong>Share</strong> (the square with an up arrow). If it’s hidden, tap <strong>More (…)</strong> or the page menu, then <strong>Share</strong>.',
      'Scroll down and tap <strong>Add to Home Screen</strong>.','If you see <strong>Open as Web App</strong>, leave it on. Tap <strong>Add</strong>.'],tip:'If Add to Home Screen is missing, scroll to Edit Actions in the Share menu. Your school may also limit installation. You can keep using the website or QR cards.'};
    if(choice==='android')return {label:'Add to Home Screen',where:'Chrome on Android',image:'shortcut-android.svg',source:'https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid',steps:['Tap the <strong>three dots ⋮</strong> beside the address bar.','Tap <strong>Install and create shortcut</strong>, then <strong>Install</strong>. Some phones show <strong>Add to Home screen</strong> instead.','Follow the next window: tap <strong>Install</strong> or <strong>Add</strong>.'],tip:'If a school device blocks installation, use the museum link or scan its QR card instead.'};
    if(choice==='mac')return {label:'Add to Dock',where:'Safari on Mac',image:'shortcut-mac.svg',source:'https://support.apple.com/104996',steps:['Click <strong>File</strong> in the menu bar, or <strong>Share</strong> in Safari.','Click <strong>Add to Dock</strong>.','Click <strong>Add</strong>. Look for the icon in your Dock.'],tip:'Add to Dock requires macOS Sonoma 14 or later. On an older Mac, bookmark the museum instead.'};
    if(choice==='chrome')return {label:'Install on this computer',where:'Chrome on a Chromebook or computer',image:'shortcut-chrome.svg',source:'https://support.google.com/chrome/answer/9658361',steps:['Click the <strong>three dots ⋮</strong> at the top right of Chrome.','Open <strong>Cast, save, and share</strong>. Click <strong>Install page as app…</strong>.','Click <strong>Install</strong> in the window that opens.'],tip:'You can also use the Install icon at the right end of the address bar, if shown. School Chromebooks may block installation; the museum still works as a website.'};
    if(choice==='edge')return {label:'Install on this computer',where:'Microsoft Edge on a computer',image:'shortcut-edge.svg',source:'https://support.microsoft.com/en-us/edge/install-manage-or-uninstall-apps-in-microsoft-edge',steps:['Click the <strong>three dots …</strong> at the top right.','Open <strong>More tools → Apps</strong>. If Apps is already in the menu, click it there.','Click <strong>Install this site as an app</strong>, then <strong>Install</strong>.']};
    return {label:ios||android?'Add to Home Screen':'Add an app shortcut',where:'Choose a browser that can add the museum icon',image:'shortcut-fallback.svg',steps:['On an iPhone or iPad, open the museum in <strong>Safari</strong>. On Android, use <strong>Chrome</strong>.','On a Chromebook or computer, use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Safari on a Mac</strong>.','Choose your browser in the menu above to see its picture directions.']};
  };
  const instructions=guideForDevice();
  function refresh(){
    for(const b of document.querySelectorAll('[data-home-install]')){
      const label=b.querySelector('[data-install-label]');const text=installed()?'App installed':instructions.label;
      if(label && label.textContent!==text)label.textContent=text;
      b.disabled=installed()||requesting;
    }
    if(modal){modal.querySelector('[data-native]').hidden=!offer||installed()||selectedDevice!==defaultDevice;modal.querySelector('[data-ready]').hidden=!offer||installed()||selectedDevice!==defaultDevice;}
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
    selectedDevice=defaultDevice;
    d.innerHTML='<img class="install-icon" alt="" width="62" height="62"><p class="install-eyebrow">CENTRAL REGIONAL MUSEUM</p><h2 id="home-install-title">'+title+' shortcut</h2><label for="shortcut-device">Choose your device and browser</label><select id="shortcut-device">'+Object.entries(deviceChoices).map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('')+'</select><div class="install-instructions" aria-live="polite"></div><p data-ready hidden>Want to add it now? Use the Install button below, then confirm in your browser.</p><button type="button" data-native hidden>Install '+title+'</button><button type="button" data-close>Close directions</button>';
    const picker=d.querySelector('#shortcut-device');picker.value=defaultDevice;
    function draw(){const info=guideForDevice(selectedDevice);d.querySelector('.install-instructions').innerHTML='<p><strong>'+info.where+'</strong></p><img class="install-picture" src="'+new URL('assets/guides/'+info.image,root).href+'" alt="Illustration: '+info.steps.join(' ').replace(/<[^>]+>/g,'')+'" width="560" height="546"><p class="guide-caption">Illustrated steps. Your menu may look a little different.</p><ol>'+info.steps.map(step=>'<li>'+step+'</li>').join('')+'</ol>'+(info.tip?'<details><summary>My menu looks different</summary><p>'+info.tip+'</p></details>':'')+(info.source?'<p><a href="'+info.source+'" target="_blank" rel="noopener">Official browser help ↗</a></p>':'');refresh()}
    picker.onchange=()=>{selectedDevice=picker.value;draw()};draw();
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
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-home-install]');if(!b)return;e.preventDefault();invokingButton=b;guide();});
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
