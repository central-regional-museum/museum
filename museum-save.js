// Request a destination during the tap, before rendering a photo or issuing a passport.
async function saveMuseumFile(name, makeBlob, {backup=false}={}) {
  const supported = typeof window.showSaveFilePicker === 'function';
  let handle;
  if (supported) {
    try {
      handle = await window.showSaveFilePicker({id:backup?'museum-backups':'museum-files', suggestedName:name});
    } catch (error) {
      if (error.name === 'AbortError') return false;
      if (error.name !== 'SecurityError' && error.name !== 'NotAllowedError') throw error;
    }
  }
  const blob = await makeBlob();
  if (handle) {
    const stream = await handle.createWritable();
    try {
      await stream.write(blob);
      await stream.close();
    } catch (error) {
      await stream.abort().catch(()=>{});
      throw error;
    }
    return true;
  }
  const file = new File([blob], name, {type:blob.type.split(';')[0]});
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label','Save museum file');
    dialog.style.cssText = 'max-width:min(26rem,85vw);padding:1.5rem;border:2px solid #b69a69;border-radius:16px;color:#183f38';
    const heading = document.createElement('h2');
    heading.textContent = backup?'Where would you like to keep your backup?':'Save your file';
    const help = document.createElement('p');
    help.textContent = backup ? 'Pick a folder you can find again, like “Museum Backups.” If you download instead, look in your downloads and move the file there.' : name;
    dialog.append(heading, help);
    let completed = false;
    const addButton = (label, action) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.style.margin = '4px';
      button.onclick = action;
      dialog.append(button);
    };
    if (navigator.canShare?.({files:[file]})) {
      addButton(backup?(/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1?'Choose a folder in Save to Files':'Choose where to save'):'Choose app or Save to Files', async () => {
        try {
          await navigator.share({files:[file]});
          completed = true;
          dialog.close();
        } catch (error) {
          if (error.name !== 'AbortError') help.textContent = 'Sharing is unavailable. Choose Download below.';
        }
      });
    }
    addButton(backup?'Save in my downloads':'Use browser download folder', () => {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(()=>URL.revokeObjectURL(url), 30000);
      completed = true;
      dialog.close();
    });
    addButton('Cancel', () => dialog.close());
    dialog.onclose = () => { dialog.remove(); resolve(completed); };
    document.body.append(dialog);
    dialog.showModal();
  });
}
