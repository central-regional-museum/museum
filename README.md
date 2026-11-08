# Central Regional High School Museum

The public museum contains 13 donated objects transcribed from owner-supplied label photographs. Museum inventory numbers, origin flags, donors, subtitles and display-case assignments are kept separately from permanent exhibit URLs. Label descriptions have not been independently fact-checked.

Build: `node tools/build.mjs --import collection.json`

`passport-help.html` gives students illustrated Google Drive and Google Docs directions for computers, iPhone/iPad and Android. My Passport links to it and to a separate blank `.docx` passport; the build generates that document from the current published collection, including the eleven special stamp spaces. Existing browser-based HTML passport exports remain available. `device-shortcut.js` shows labeled illustrations for the detected browser, lets students change the device selection, and keeps native installation behind a deliberate Install button. The editable illustration source is `tools/make-guide-images.mjs`; run it after changing the diagrams. The help pages link to official Google, Apple and Microsoft instructions. Illustrations are not screenshots; managed school-device restrictions may vary.

Country and territory flag PNGs are stored in the self-contained `flag-images-*.js` atlases; the catalog contains 249 ISO entries plus Bali, England, Hawaii and New Jersey. Source and license notices are retained with the assets.

`placards.html` makes a single photo card: choose an artifact, then CVS (4×6 JPG, with 5×7 and 8×10 options) or Instagram (1080×1350 PNG). Device-specific directions explain how to save the picture. Item links and Instagram shortcuts open the matching card. Paper/PDF layouts, PNG batches and QR-only labels remain under `placards-tools.html`. `install.html` opens the student museum with its Home Screen helper. The on-page button uses the browser install prompt when available; Safari shows the short Share → Add to Home Screen instructions. The Teacher Desk is a separately authenticated site and is omitted from student navigation.
