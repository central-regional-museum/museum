# Central Regional High School Museum

The public museum contains 13 donated objects transcribed from owner-supplied label photographs. Museum inventory numbers, origin flags, donors, subtitles and display-case assignments are kept separately from permanent exhibit URLs. Label descriptions have not been independently fact-checked.

Build: `node tools/build.mjs --import collection.json`

Country and territory flag PNGs are stored in the self-contained `flag-images-*.js` atlases; the catalog contains 249 ISO entries plus Bali, England, Hawaii and New Jersey. Source and license notices are retained with the assets.

`placards.html` makes a single photo card: choose an artifact, then CVS (4×6 JPG, with 5×7 and 8×10 options) or Instagram (1080×1350 PNG). Device-specific directions explain how to save the picture. Item links and Instagram shortcuts open the matching card. Paper/PDF layouts, PNG batches and QR-only labels remain under `placards-tools.html`. `install.html` provides Apple-signed URL shortcuts and platform-specific branded-install instructions. The Teacher Desk is a separately authenticated site and is omitted from student navigation.
