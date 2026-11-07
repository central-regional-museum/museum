// Optional compass lesson. Turning the bezel doesn't move the magnetic needle.
(() => {
  'use strict';
  let artwork;
  function loadDrawing() {
    return artwork ||= fetch('wandering-compass.svg').then(async response => {
      if (!response.ok) throw Error('Compass image unavailable');
      const svg = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
      if (svg.localName !== 'svg' || !svg.querySelector('[data-turn-dial]')) throw Error('Missing compass dial');
      return svg;
    }).catch(error => { artwork = null; throw error; });
  }
  function mount(host) {
    host.className = 'dial-lesson';
    host.innerHTML = '<div class="dial-stage"><img src="wandering-compass.svg" class="compass-detail" alt="Brass compass with a red-orange north needle"></div><div class="dial-controls" hidden><button type="button" data-step="-1">↶ Turn left</button><button type="button" data-step="1">Turn right ↷</button></div><p class="dial-feedback" role="status" aria-live="polite">Opening the compass…</p><button type="button" class="dial-again" hidden>Try again</button>';
    const stage = host.querySelector('.dial-stage'), controls = host.querySelector('.dial-controls'),
      feedback = host.querySelector('.dial-feedback'), again = host.querySelector('.dial-again');
    loadDrawing().then(source => {
      if (!host.isConnected) return;
      const svg = document.importNode(source, true), ring = svg.querySelector('[data-turn-dial]');
      svg.removeAttribute('role');svg.removeAttribute('aria-labelledby');svg.setAttribute('aria-hidden','true');
      svg.querySelectorAll('title,desc').forEach(n=>n.remove());stage.replaceChildren(svg);
      stage.tabIndex=0;stage.setAttribute('role','slider');stage.setAttribute('aria-label','Turn the compass dial');
      stage.setAttribute('aria-valuemin','0');stage.setAttribute('aria-valuemax','330');
      controls.hidden=false;
      const starts=[60,270,120,300,180];let round=0,angle=starts[0],drag=null;
      const normalize=v=>(v%360+360)%360, snap=v=>normalize(Math.round(v/30)*30);
      function render(value,settled=true) {
        angle=normalize(value);const step=snap(angle);
        ring.setAttribute('transform','rotate('+angle+' 160 165)');
        stage.setAttribute('aria-valuenow',String(step));stage.setAttribute('aria-valuetext',step===0?'North aligned':step+' degrees clockwise from north');
        if(!settled)return;
        const solved=step===0;host.classList.toggle('aligned',solved);again.hidden=!solved;
        feedback.textContent=solved?'North found! The N and the needle now point the same way.':step===180?'N is at the bottom. Turn the dial either way.':step<180?'N is to the right of the needle. Try turning left.':'N is to the left of the needle. Try turning right.';
      }
      for(const b of controls.querySelectorAll('button'))b.onclick=()=>render(snap(angle)+Number(b.dataset.step)*30);
      again.onclick=()=>{round=(round+1)%starts.length;render(starts[round]);stage.focus({preventScroll:true})};
      stage.onkeydown=e=>{
        const sign={ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1}[e.key];
        if(sign){e.preventDefault();render(snap(angle)+sign*30)}
      };
      function bearing(e) {
        // Convert client coordinates to the drawing's viewBox (including its suspension loop).
        const m=svg.getScreenCTM();if(!m)return null;
        const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());
        if(Math.hypot(p.x-160,p.y-165)<18)return null;
        return Math.atan2(p.y-165,p.x-160)*180/Math.PI;
      }
      stage.onpointerdown=e=>{
        if(drag||e.button!==0)return;const b=bearing(e);if(b===null)return;
        drag={id:e.pointerId,start:b,angle};stage.setPointerCapture(e.pointerId);
      };
      stage.onpointermove=e=>{if(drag?.id!==e.pointerId)return;const b=bearing(e);if(b!==null)render(drag.angle+b-drag.start,false)};
      function release(e){if(drag?.id!==e.pointerId)return;drag=null;render(snap(angle))}
      stage.onpointerup=stage.onpointercancel=stage.onlostpointercapture=release;
      render(angle);
    }).catch(()=>{
      feedback.textContent='The turning dial could not load. On the picture, look for the red-orange tip next to N.';
    });
  }
  window.MuseumCompassDial = {mount};
})();
