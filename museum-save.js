// Self-contained because downloaded passports embed this function for offline saving.
async function saveMuseumFile(name, makeBlob, {backup=false, skipFolder=false, skipPicker=false}={}) {
  saveMuseumFile.lastMessage = '';
  if (backup && !skipFolder && window.MuseumBackupFolder) {
    return window.MuseumBackupFolder.save(name, makeBlob);
  }
  const userAgent = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(userAgent);
  const mac = !ios && /Mac/.test(navigator.platform);
  let handle;
  if (!skipPicker && typeof window.showSaveFilePicker === 'function') {
    try {
      handle = await window.showSaveFilePicker({id:backup?'museum-backups':'museum-files', suggestedName:name});
    } catch (error) {
      if (error.name === 'AbortError') return false;
      if (!['SecurityError','NotAllowedError'].includes(error.name)) throw error;
    }
  }
  const blob = await makeBlob();
  if (handle) {
    const stream = await handle.createWritable();
    try { await stream.write(blob); await stream.close(); }
    catch (error) { await stream.abort().catch(() => {}); throw error; }
    saveMuseumFile.lastMessage = 'Saved “' + name + '” in the folder you chose.';
    return true;
  }
  const file = new File([blob], name, {type:blob.type.split(';')[0]});
  const picture = file.type.startsWith('image/');
  let canShare = false;
  try { canShare = !!navigator.share && !!navigator.canShare?.({files:[file]}); } catch {}
  return new Promise(resolve => {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', 'Save museum file');
    dialog.style.cssText = 'width:min(29rem,calc(100% - 32px));max-height:85dvh;overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #b69a69;border-radius:18px;color:#183f38;background:#fffaf2;font:16px/1.55 system-ui';
    const heading = document.createElement('h2');
    heading.style.marginTop = '0';
    heading.textContent = backup ? 'Save your backup' : picture ? 'Save your picture' : 'Save your file';
    const filename = document.createElement('p');
    filename.textContent = name;
    filename.style.overflowWrap = 'anywhere';
    const help = document.createElement('p');
    let downloadHelp;
    if (ios) {
      downloadHelp = 'Tap Download to Files. If asked, tap Download. Open the Files app and look in Downloads. Check iCloud Drive or On My iPhone / iPad if needed.';
      help.textContent = canShare ? (picture ? 'Tap Open save menu, then Save Image. Your picture will appear in Photos.' : 'Tap Open save menu. Scroll down and tap Save to Files. Choose a folder, then tap Save.') : downloadHelp;
    } else if (android) {
      downloadHelp = 'Tap Download to my phone. If asked, tap Download. Open Files or My Files, then Downloads.';
      help.textContent = downloadHelp;
    } else {
      downloadHelp = mac ? 'Click Download file. Open Finder, then Downloads, or the folder you chose.' : 'Click Download file. Open your Downloads folder, or the folder you chose.';
      help.textContent = downloadHelp;
    }
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    dialog.append(heading, filename, help);
    let completed = false;
    let busy = false;
    const buttons = [];
    const addButton = (label, action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.style.cssText = 'display:block;width:100%;min-height:44px;margin-top:10px;border:1px solid #9d9e90;border-radius:10px;padding:10px;font:650 15px system-ui;background:#155b56;color:white';
      button.onclick = action;
      buttons.push(button);
      dialog.append(button);
    };
    if (canShare && ios) {
      addButton('Open save menu', async () => {
        if (busy) return;
        busy = true;
        buttons.forEach(button => button.disabled = true);
        try {
          await navigator.share({files:[file]});
          completed = true;
          saveMuseumFile.lastMessage = picture ? 'Check Photos for your picture.' : 'Check the folder you chose in Files for your saved copy.';
          dialog.close();
        } catch (error) {
          if (error.name !== 'AbortError') { help.textContent = downloadHelp; status.textContent = 'The save menu was unavailable. Use the download button below.'; }
        } finally { busy = false; buttons.forEach(button => button.disabled = false); }
      });
      const other = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Need the download option?';
      const instruction = document.createElement('p');
      instruction.textContent = downloadHelp;
      other.append(summary, instruction);
      dialog.append(other);
      addButton('Download to Files', download);
    } else {
      addButton(ios ? 'Download to Files' : android ? 'Download to my phone' : 'Download file', download);
    }
    function download() {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      saveMuseumFile.lastMessage = ios ? 'Download started. Open Files and look in Downloads.' : android ? 'Download started. Open Files or My Files, then Downloads.' : 'Download started. Look in Downloads or the folder you chose.';
      completed = true;
      dialog.close();
    }
    addButton('Cancel', () => dialog.close());
    dialog.append(status);
    dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
    dialog.onclose = () => { dialog.remove(); resolve(completed); };
    document.body.append(dialog);
    dialog.showModal();
  });
}
