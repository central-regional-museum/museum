// Device-specific directions only; no student data is collected or uploaded here.
(()=>{'use strict';
 const picker=document.getElementById('passport-device');if(!picker)return;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const android=/Android/i.test(navigator.userAgent);const current=location.hash.slice(1);
 picker.value=['computer','ios','android'].includes(current)?current:ios?'ios':android?'android':'computer';
 function show(){for(const panel of document.querySelectorAll('[data-passport-device]'))panel.hidden=panel.dataset.passportDevice!==picker.value;document.getElementById('device-status').textContent='Showing '+picker.options[picker.selectedIndex].text+' directions.'}
 function revealBrowser(){const guide=document.getElementById('browser');if(location.hash==='#browser'&&guide)guide.open=true}
 window.addEventListener('hashchange',revealBrowser);
 picker.addEventListener('change',()=>{show();history.replaceState(null,'','#'+picker.value)});show();revealBrowser();
})();
