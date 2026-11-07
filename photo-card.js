(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  let settings = window.MUSEUM_SETTINGS, entries = window.EXHIBITS;
  try {
    const work = JSON.parse(sessionStorage.getItem('museum-print-work'));
    if (!params.has('item') && work?.settings && Array.isArray(work.exhibits)) {
      settings = work.settings; entries = work.exhibits;
    }
  } catch {}
  const items = (entries || []).filter(e => e.published !== false)
    .sort((a,b) => String(a.inventoryId || a.id).localeCompare(String(b.inventoryId || b.id)));
  const sizes = {'4x6':['4 × 6',1800,1200], '5x7':['5 × 7',2100,1500], '8x10':['8 × 10',3000,2400], instagram:['Instagram',1080,1350]};
  let current = null, ticket = 0, busy = false;
  const selected = () => items.find(e => e.id === $('artifact').value);
  function platform() {
    if (/Android/i.test(navigator.userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    return 'desktop';
  }
  $('device').value = platform();
  function updateSelection() {
    const e = selected();
    $('cvs').disabled = $('ig').disabled = busy || !e;
    $('identity').hidden = !e;
    if (e) {
      const flag = MuseumLabels.flagURL(e); $('flag').hidden = !flag;
      if (flag) $('flag').src = flag;
      $('identity-text').textContent = [e.origin,e.caseId && e.caseId+' case','No. '+(e.inventoryId || e.id)].filter(Boolean).join(' · ');
    }
    $('paper-link').href = 'placards-tools.html' + (e ? '?item='+encodeURIComponent(e.id) : '');
  }
  function clearResult() {
    if (current) URL.revokeObjectURL(current.url);
    current = null; $('picture').removeAttribute('src'); $('download').removeAttribute('href'); $('save-message').textContent = '';
  }
  function canShareFile(file) {
    try {return !!navigator.share && !!navigator.canShare?.({files:[file]});} catch {return false;}
  }
  function guide() {
    if (!current) return;
    const device = $('device').value, file = current.file, share = device === 'ios' && canShareFile(file);
    $('share').hidden = !share;
    $('download').hidden = device === 'ios';
    $('download').download = file.name;
    $('download').href = current.url;
    $('download').textContent = device === 'desktop' ? 'Download picture' : 'Download to my phone';
    $('how-title').textContent = device === 'ios' ? 'Save to Photos' : device === 'android' ? 'Save to your phone' : 'Save to your computer';
    const lines = device === 'ios' ? (share ? ['Tap Save to Photos below.','In the menu, tap Save Image. Scroll down if you don’t see it.','Open Photos to find your new card.']
      : ['Touch and hold the card picture on this page.','Tap Save to Photos or Save Image in the menu.','Open Photos to find your new card.'])
      : device === 'android' ? ['Tap Download to my phone. If Chrome asks, tap Download.','Open Files → Downloads to find your card.']
      : ['Click Download picture.','Look in Downloads, or the folder you choose.'];
    $('steps').replaceChildren(...lines.map(s => {const li=document.createElement('li');li.textContent=s;return li;}));
    $('fallback').textContent = device === 'ios' ? 'If the save option is missing, open this page in Safari and touch and hold the picture. Or download a copy to Files below; open the file, tap Share, then Save Image.'
      : device === 'android' ? 'You can also touch and hold the picture and choose Download image. Look in Files → Downloads.'
      : 'To save directly to a phone, open Print or save a card in your phone’s browser and choose the same artifact.';
    $('file-backup').hidden = device !== 'ios'; $('file-backup').href = current.url; $('file-backup').download = file.name;
    const format = current.size;
    $('next-use').textContent = format === 'instagram'
      ? 'Open Instagram, start a new post and choose this card. Keep the full portrait so the flag and QR code stay in view.'
      : 'In CVS Photo, choose Photo Prints and upload the saved card. Select '+sizes[format][0]+' inches and check that all four edges are in the print preview.';
    $('save-message').textContent = '';
  }
  async function prepare(format) {
    const e = selected();
    if (!e || !sizes[format]) return;
    const run = ++ticket, fromResult = !$('result').hidden;
    const message = $(fromResult ? 'save-message' : 'choice-message');
    busy = true; updateSelection(); $('artifact').disabled = true; $('photo-size').disabled = true;
    $('save-actions').inert = true; $('file-backup').inert = true;
    message.textContent = 'Preparing your picture…';
    try {
      const problems = MuseumLabels.check(e,items);
      if (problems.length) throw Error(problems.join(' '));
      const base = new URL(settings.publicBaseUrl);
      if (base.protocol !== 'https:' || base.search || base.hash) throw Error('The museum link needs to be updated in the Teacher Desk.');
      const box=document.createElement('div');
      new QRCode(box,{text:base.href+'#exhibit/'+encodeURIComponent(e.id),width:512,height:512,correctLevel:QRCode.CorrectLevel.M});
      const ig=format==='instagram', mime=ig?'image/png':'image/jpeg';
      const blob=await MuseumPNG.card(e,{size:format,base:base.href,qr:box.querySelector('canvas'),settings,mime});
      if (run !== ticket) return;
      const name=(e.inventoryId||e.id)+'-'+e.object.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')+'-'+(ig?'Instagram.png':'CVS-'+format+'.jpg');
      const file=new File([blob],name,{type:mime});
      const url=URL.createObjectURL(blob);
      clearResult(); current={file,url,size:format};
      $('picture').src=url; $('picture').alt='Finished '+(ig?'Instagram':'CVS')+' card for '+e.object+', museum number '+(e.inventoryId||e.id);
      $('result-item').textContent=e.object+' · No. '+(e.inventoryId||e.id);
      $('destination').textContent=ig?'Instagram post':'CVS photo print';
      $('preview-title').textContent=ig?'Instagram portrait':sizes[format][0]+' inch photo print';
      $('dimensions').textContent=sizes[format][1]+' × '+sizes[format][2]+' pixels · '+(ig?'PNG':'JPG');
      $('cvs-link').hidden=ig; $('size-options').hidden=ig;
      if (!ig) $('photo-size').value=format;
      guide(); $('choose').hidden=true; $('result').hidden=false; $('choice-message').textContent='';
      if (!fromResult) {$('result-title').focus({preventScroll:true}); window.scrollTo(0,0);}
      else message.textContent='Updated to '+sizes[format][0]+' inches.';
    } catch(error) {
      if (run===ticket) {
        const failure='Could not make this picture. '+(error?.message||'Please try again.');
        if(fromResult && current){$('photo-size').value=current.size;message.textContent=failure+' Your previous picture is still shown.';}
        else message.textContent=failure;
      }
    } finally {
      if (run===ticket) {busy=false; $('artifact').disabled=false; $('photo-size').disabled=false; $('save-actions').inert=false; $('file-backup').inert=false; updateSelection();}
    }
  }
  $('share').onclick = async () => {
    if (!current || busy) return;
    const ready=current;
    try {
      await navigator.share({files:[ready.file]});
      if (ready===current) $('save-message').textContent='If you chose Save Image, your card is in Photos.';
    } catch(err) {
      if(ready!==current) return;
      $('save-message').textContent=err.name==='AbortError'?'The menu closed. Tap Save to Photos to try again.':'Touch and hold the picture, then tap Save to Photos or Save Image.';
    }
  };
  $('download').onclick=() => {if(!busy) $('save-message').textContent='Look for '+current.file.name+' in your downloads.';};
  $('change').onclick=()=>{
    ticket++;busy=false;clearResult();$('result').hidden=true;$('choose').hidden=false;
    $('artifact').disabled=false;$('photo-size').disabled=false;$('save-actions').inert=false;$('file-backup').inert=false;
    $('device-help').open=false;$('size-options').open=false;$('choice-message').textContent='';
    updateSelection();$('artifact').focus();window.scrollTo(0,0);
  };
  $('device').onchange=guide;
  $('artifact').onchange=()=>{$('choice-message').textContent='';updateSelection();};
  $('photo-size').onchange=()=>prepare($('photo-size').value);
  $('cvs').onclick=()=>prepare('4x6');
  $('ig').onclick=()=>prepare('instagram');
  for (const e of items) $('artifact').append(new Option((e.inventoryId||e.id)+' · '+e.object,e.id));
  const wanted=params.get('item');
  if(wanted && items.some(e=>e.id===wanted)) $('artifact').value=wanted;
  else if (!items.length) { $('choice-message').textContent='There are no published artifacts to print yet.'; $('artifact').disabled=true; }
  else if(wanted) $('choice-message').textContent='That artifact is not available. Please choose another from the list.';
  updateSelection();
  if (selected() && params.get('format')==='instagram') prepare('instagram');
})();
