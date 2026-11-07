(()=>{'use strict';const safeImage=url=>{try{const u=new URL(url);return u.protocol==='https:'&&['upload.wikimedia.org','thumb.wikimedia.org'].includes(u.hostname)}catch{return false}};const plain=s=>{const d=new DOMParser().parseFromString(String(s||''),'text/html');return (d.body.textContent||'').trim().slice(0,700)};function article(e){const candidate=e.wikipediaImageArticle||e.wikipedia?.url||(e.sources||[]).find(s=>/^https:\/\/en\.wikipedia\.org\/wiki\//.test(s.url||''))?.url;try{const u=new URL(candidate);return u.protocol==='https:'&&u.hostname==='en.wikipedia.org'&&u.pathname.startsWith('/wiki/')?u:null}catch{return null}}
async function lookup(url){const u=article({wikipediaImageArticle:url});if(!u)throw Error('Choose an English Wikipedia article URL.');const title=decodeURIComponent(u.pathname.slice(6));const endpoint=new URL('https://en.wikipedia.org/w/api.php');endpoint.search=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'pageimages',piprop:'name|original',pilicense:'free',redirects:'1',titles:title});let response=await fetch(endpoint,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Wikipedia photo lookup is unavailable. Try again later.');let data=await response.json(),page=Object.values(data.query?.pages||{})[0];if(!page?.pageimage)throw Error('This article has no eligible lead image. Upload a photo before publishing.');endpoint.search=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1000',titles:'File:'+page.pageimage});response=await fetch(endpoint,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Could not verify the image credit.');data=await response.json();const info=Object.values(data.query?.pages||{})[0]?.imageinfo?.[0],m=info?.extmetadata||{},license=plain(m.LicenseShortName?.value||m.UsageTerms?.value);if(!/^cc(?:0| by(?:-sa)?)(?:\s|-)|public domain|^cc0$/i.test(license))throw Error('No supported reuse license was found for this lead image. Add a teacher photo or choose another article.');const image=info.thumburl||info.url;if(!safeImage(image))throw Error('No trusted Wikimedia image URL was returned.');return {url:image,article:u.href,title:page.title,file:page.pageimage,author:plain(m.Artist?.value||m.Credit?.value||'Wikimedia contributors'),license,licenseUrl:m.LicenseUrl?.value||'',descriptionUrl:info.descriptionurl||u.href,checkedAt:new Date().toISOString(),alt:'Wikipedia reference image for '+page.title+'; not the school’s actual artifact.'}}
function apply(entry) {
  const image = entry.referenceImage;
  if (entry.image || entry.wikipediaImageAuto === false || !safeImage(image?.url)) return;
  const cached = /^assets\/references\/\d{4}-[a-f0-9]{10}\.webp$/.test(image.localPath || '');
  entry.image = cached ? image.localPath : image.url;
  entry.imageAlt = image.alt || 'Reference image for ' + entry.object;
  entry.imageCredit = 'Reference image · ' + image.title + ' · ' + image.author + ' · ' + image.license + ' · Wikimedia Commons';
  entry.photoIsReference = true;
  entry.sources = [...(entry.sources || []).filter(s => !s.title.startsWith('Reference image · ')), {
    title: 'Reference image · ' + image.file + ' · ' + image.license,
    url: image.descriptionUrl
  }];
  if (image.licenseUrl && /^https:\/\/creativecommons\.org\//.test(image.licenseUrl)) {
    entry.sources.push({title: 'Image license · ' + image.license, url: image.licenseUrl});
  }
}
async function fill(e){if(e.image||e.wikipediaImageAuto===false)return null;const url=article(e);if(!url)return null;e.referenceImage=await lookup(url.href);return e.referenceImage}
function cropPoint(value){return Number.isFinite(value)?Math.max(0,Math.min(100,value)):50}
function position(entry){return cropPoint(entry?.photoCropX)+'% '+cropPoint(entry?.photoCropY)+'%'}
window.MuseumWikiPhotos={position,lookup,fill,apply,article,safeImage};for(const e of window.EXHIBITS||[])apply(e);
})();
