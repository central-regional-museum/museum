// Read a field map with a fixed north, then walk between the landmarks.
(() => {
  'use strict';
  const stops = {
    camp:   {name:'Camp',   x:58,  y:146},
    bridge: {name:'Bridge', x:172, y:146},
    tower:  {name:'Tower',  x:172, y:62},
    gate:   {name:'Gate',   x:284, y:62},
  };
  const routes = [
    ['camp','bridge','tower','gate'],
    ['gate','tower','bridge','camp'],
  ];
  const directions = {North:'↑', East:'→', South:'↓', West:'←'};
  const hints = {North:'above you', East:'to your right', South:'below you', West:'to your left'};
  const drawings = {
    camp:'<path d="m-13 0 12-15L12 0Z" fill="#b8744e"/><path d="m-4 0 4-7 4 7" fill="#fff4d8"/>',
    bridge:'<path d="M-14-1q14-17 28 0M-14 2V-6m28 8V-6m-21 4v-6m14 6v-6" fill="none" stroke="#946839" stroke-width="2.5"/>',
    tower:'<path d="M-8 1v-17h4v4h3v-4h4v4h3v-4h3V1Z" fill="#867189"/><path d="M-2 0v-5q2-3 4 0v5" fill="#fff4d8"/>',
    gate:'<path d="M-11 1v-10a11 11 0 0 1 22 0v10h-5v-9a6 6 0 1 0-12 0v9z" fill="#78917c"/>',
  };
  let nextRoute = 0;
  function direction(from,to) {
    if (to.y !== from.y) return to.y < from.y ? 'North' : 'South';
    return to.x > from.x ? 'East' : 'West';
  }
  function fieldMap() {
    const landmarks = Object.entries(stops).map(([key,{name,x,y}]) =>
      '<g transform="translate('+x+' '+y+')">'+drawings[key]+
      '<text y="17" text-anchor="middle" fill="#3e483f" font-family="Georgia,serif" font-size="13">'+name+'</text></g>').join('');
    return '<svg class="route-map" viewBox="0 0 344 182" role="img" aria-labelledby="route-map-desc">'+
      '<desc id="route-map-desc">North is up. The bottom row has Camp on the left and Bridge in the middle. The upper row has Tower above Bridge, and Gate to the right of Tower.</desc>'+
      '<defs><pattern id="field-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="#d6caad" stroke-width=".8"/></pattern></defs>'+
      '<rect x="1" y="1" width="342" height="180" rx="13" fill="#f4eedc" stroke="#c4b48c"/>'+
      '<rect x="3" y="3" width="338" height="176" rx="12" fill="url(#field-grid)"/>'+
      '<path d="M32 0q42 29 38 55t50 54 75 44 38 29" fill="none" stroke="#93c6be" stroke-width="10" opacity=".72"/>'+
      '<path d="M24 76q15-17 31-11t24 2m-54 18q19-17 32-12t30 2m162 64q22-25 43-17t33 4m-73 22q23-23 43-17t31 4" fill="none" stroke="#b1b899" opacity=".75"/>'+
      '<g transform="translate(26 24)"><path d="M0 2-4 13l4-2 4 2Z" fill="#ba6345"/><text x="0" y="0" text-anchor="middle" font-size="11" font-weight="bold" fill="#624463">N</text></g>'+
      '<path d="M58 137H172V53H284" fill="none" stroke="#9b8b72" stroke-dasharray="3 4"/>'+
      '<polyline class="route-line" fill="none" stroke="#70506d" stroke-width="3" stroke-linejoin="round"/>'+
      '<circle class="route-here" r="17" fill="#e5f1e7" stroke="#216f67" stroke-width="2.5"/>'+
      '<path class="route-next" d="m0-22 20 20-20 20-20-20Z" fill="#f8e4b7" stroke="#a27535" stroke-width="2" stroke-dasharray="4 2"/>'+
      landmarks+'</svg>';
  }
  function openRoute(trigger) {
    const dialog = document.createElement('dialog');
    dialog.className = 'route-dialog';
    dialog.setAttribute('aria-labelledby','route-title');
    dialog.innerHTML = '<div class="route-title"><h2 id="route-title">Read the field map</h2><button type="button" class="route-close">Close</button></div>'+
      fieldMap()+'<p class="route-progress"></p><p class="route-question" id="route-question"></p>'+
      '<div class="route-directions" role="group" aria-labelledby="route-question"></div>'+
      '<button type="button" class="route-replay" hidden>Try another route</button><p class="route-feedback" role="status"></p>';
    const choices = dialog.querySelector('.route-directions');
    const replay = dialog.querySelector('.route-replay');
    const feedback = dialog.querySelector('.route-feedback');
    let route, step;
    function render() {
      const current = route[step], next = route[step+1];
      const goal = dialog.querySelector('.route-next');
      dialog.querySelector('.route-here').setAttribute('cx',current.x);
      dialog.querySelector('.route-here').setAttribute('cy',current.y-8);
      dialog.querySelector('.route-line').setAttribute('points', route.slice(0,step+1).map(p=>p.x+','+(p.y-9)).join(' '));
      goal.style.display = next ? '' : 'none';
      if (next) goal.setAttribute('transform','translate('+next.x+' '+(next.y-6)+')');
      dialog.querySelector('.route-progress').textContent = next ? 'Leg '+(step+1)+' of '+(route.length-1) : 'Route complete';
      dialog.querySelector('.route-question').textContent = next ? 'At '+current.name+'. Which way to '+next.name+'?' : 'You reached '+current.name+'!';
      choices.hidden = !next;
      replay.hidden = Boolean(next);
    }
    function start() {
      route = routes[nextRoute].map(key=>stops[key]);
      nextRoute = (nextRoute+1)%routes.length;
      step = 0;
      render();
      feedback.textContent = 'North is up. The ring shows where you are.';
    }
    for (const [name,arrow] of Object.entries(directions)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = '<span aria-hidden="true">'+arrow+'</span> '+name;
      button.onclick = () => {
        const target = route[step+1];
        if (!target) return;
        const expected = direction(route[step],target);
        if (name !== expected) {
          feedback.textContent = 'Look for '+target.name+' '+hints[expected]+'. Try again.';
          return;
        }
        step++;
        render();
        const following = route[step+1];
        feedback.textContent = 'You went '+name.toLowerCase()+' to '+target.name+'. '+(following?'Now find '+following.name+'.':'All three directions found.');
        if (!following) replay.focus();
      };
      choices.append(button);
    }
    replay.onclick = () => { start(); choices.querySelector('button').focus(); };
    dialog.querySelector('.route-close').onclick = () => dialog.close();
    dialog.addEventListener('close',() => { dialog.remove(); if(trigger.isConnected) trigger.focus({preventScroll:true}); },{once:true});
    start();
    document.body.append(dialog);
    dialog.showModal();
  }
  // The Journey page replaces its header and hero when a student comes back from a gallery.
  document.addEventListener('click',event=>{
    const trigger = event.target.closest('#journey-compass');
    if (trigger) openRoute(trigger);
  });
})();
