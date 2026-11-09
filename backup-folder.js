// Store only the folder the user explicitly chooses. Each backup gets a new filename.
(() => {
  'use strict';
  const mobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const supported = !mobile && typeof window.showDirectoryPicker === 'function';
  if (!supported) return;

  let folder = null;
  let loaded = false;
  let activeSave = null;
  let database = null;

  async function storage(action, value) {
    if (!database) {
      database = await new Promise((resolve, reject) => {
        const request = indexedDB.open('museum-backup-folder', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('preferences');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Folder settings are busy.'));
      });
      database.onversionchange = () => { database.close(); database = null; };
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('preferences', action === 'get' ? 'readonly' : 'readwrite');
      const preferences = transaction.objectStore('preferences');
      let request;
      if (action === 'get') request = preferences.get('folder');
      else if (action === 'put') request = preferences.put(value, 'folder');
      else request = preferences.delete('folder');
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Folder settings could not be saved.'));
    });
  }
  const ready = storage('get').then(handle => {
    if (handle?.kind === 'directory') folder = handle;
  }).catch(() => {}).finally(() => { loaded = true; });

  function changed() {
    window.dispatchEvent(new Event('museum-backup-folder'));
  }
  async function choose() {
    const selected = await window.showDirectoryPicker({id:'museum-backups', mode:'readwrite'});
    folder = selected;
    let remembered = true;
    try { await storage('put', selected); } catch { remembered = false; }
    changed();
    return remembered;
  }
  async function writeBackup(name, makeBlob) {
    const destination = folder;
    const permission = await destination.requestPermission({mode:'readwrite'});
    if (permission !== 'granted') throw new Error('Folder permission is needed. Choose the folder again or save a download.');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const suffix = crypto.randomUUID().slice(0, 8);
    const ending = name.match(/\.(?:json|txt)$/i)?.[0] || '.json';
    const stem = name.toLowerCase().endsWith(ending.toLowerCase()) ? name.slice(0, -ending.length) : name;
    const filename = stem + '-' + timestamp + '-' + suffix + ending.toLowerCase();
    const blob = await makeBlob();
    const file = await destination.getFileHandle(filename, {create:true});
    const stream = await file.createWritable();
    try {
      await stream.write(blob);
      await stream.close();
    } catch (error) {
      await stream.abort().catch(() => {});
      throw error;
    }
    saveMuseumFile.lastMessage = 'Backup saved in “' + destination.name + '”.';
    return true;
  }
  function options(name, makeBlob, initialMessage = '') {
    return new Promise(resolve => {
      const dialog = document.createElement('dialog');
      dialog.setAttribute('aria-labelledby', 'backup-folder-title');
      dialog.style.cssText = 'position:fixed;inset:0;margin:auto;height:fit-content;width:min(28rem,calc(100% - 32px));max-height:85dvh;overflow:auto;box-sizing:border-box;padding:24px;border:1px solid #b69a69;border-radius:18px;background:#fffaf2;color:#183f38;font:16px/1.55 system-ui';
      dialog.innerHTML = '<h2 id="backup-folder-title" style="margin-top:0">Choose a backup folder</h2><p>Choose or create a folder named Museum Backups. Select it, then allow saving if Chrome asks.</p><p>The museum will remember your choice for the next backup. Use this on your own computer.</p><p role="status"></p><div></div>';
      const status = dialog.querySelector('[role=status]');
      status.textContent = initialMessage;
      const actions = dialog.querySelector('div');
      let complete = false;
      let busy = false;
      const buttons = [];
      function button(label, action) {
        const element = document.createElement('button');
        element.type = 'button';
        element.textContent = label;
        element.style.cssText = 'display:block;width:100%;min-height:44px;margin-top:10px;border:1px solid #9d9e90;border-radius:10px;padding:10px;font:650 15px system-ui;background:#155b56;color:white';
        element.onclick = async () => {
          if (busy) return;
          busy = true;
          buttons.forEach(item => item.disabled = true);
          try { await action(); }
          catch (error) {
            if (error.name !== 'AbortError') status.textContent = error.message || 'That folder could not be used. Try another folder or save a download.';
          } finally {
            busy = false;
            buttons.forEach(item => item.disabled = false);
          }
        };
        buttons.push(element);
        actions.append(element);
      }
      button('Choose folder and save', async () => {
        const remembered = await choose();
        complete = await writeBackup(name, makeBlob);
        if (!remembered) saveMuseumFile.lastMessage += ' Your browser could remember this folder only for this visit.';
        dialog.close();
      });
      button('Save a download instead', async () => {
        complete = await saveMuseumFile(name, makeBlob, {backup:true, skipFolder:true, skipPicker:true});
        if (complete) dialog.close();
      });
      button('Cancel', () => dialog.close());
      dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
      dialog.addEventListener('close', () => { dialog.remove(); resolve(complete); });
      document.body.append(dialog);
      dialog.showModal();
    });
  }
  function save(name, makeBlob) {
    if (activeSave) return activeSave;
    // Start the permission request within the click, before any storage lookup or rendering.
    let operation;
    if (loaded && folder) {
      const destinationName = folder.name;
      operation = writeBackup(name, makeBlob).catch(error => {
        if (error.name === 'AbortError') return false;
        return options(name, makeBlob, 'The backup could not be saved in “' + destinationName + '”. Choose it again or save a download.');
      });
    } else {
      operation = ready.then(() => options(name, makeBlob));
    }
    activeSave = operation.finally(() => { activeSave = null; });
    return activeSave;
  }
  function mount(host) {
    const section = document.createElement('details');
    section.innerHTML = '<summary>Backup folder</summary><p data-folder></p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" data-choose>Choose folder</button><button type="button" data-forget>Forget folder</button></div><p role="status"></p>';
    const label = section.querySelector('[data-folder]');
    const pick = section.querySelector('[data-choose]');
    const forget = section.querySelector('[data-forget]');
    const status = section.querySelector('[role=status]');
    function refresh() {
      label.textContent = folder ? 'Backups go to “' + folder.name + '” on this computer.' : 'Choose a folder on your own computer to make backups easier.';
      pick.textContent = folder ? 'Change folder' : 'Choose folder';
      forget.hidden = !folder;
    }
    pick.onclick = async () => {
      pick.disabled = forget.disabled = true;
      try {
        const remembered = await choose();
        status.textContent = remembered ? 'Folder remembered. Use the backup button when you want a copy.' : 'Folder selected for this visit. Your browser could not remember it for later.';
      } catch (error) {
        status.textContent = error.name === 'AbortError' ? 'Folder choice canceled.' : 'Could not use that folder. Try another folder.';
      } finally { pick.disabled = forget.disabled = false; refresh(); }
    };
    forget.onclick = async () => {
      pick.disabled = forget.disabled = true;
      try { await storage('delete'); folder = null; changed(); status.textContent = 'Folder forgotten. Existing backup files stay in that folder.'; }
      catch { status.textContent = 'Could not forget the folder. Please try again.'; }
      finally { pick.disabled = forget.disabled = false; refresh(); }
    };
    const observer = new MutationObserver(() => {
      if (section.isConnected) return;
      window.removeEventListener('museum-backup-folder', refresh);
      observer.disconnect();
    });
    host.append(section);
    window.addEventListener('museum-backup-folder', refresh);
    observer.observe(document.body, {childList:true, subtree:true});
    ready.then(refresh);
  }
  window.MuseumBackupFolder = {save, mount};
  window.dispatchEvent(new Event('museum-folder-ready'));
})();
