(function(){
'use strict';
const $=id=>document.getElementById(id),parts=window.MUSEUM_EXPLORER_OPTIONS;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const base={v:1,hair:'ShortOne',hairColor:'#252535',skinColor:'#c89068',outfit:'hoodie',topColor:'#8478a8',pantsColor:'#3a4048',faceShape:'oval',faceDetail:'none',expression:'chill',frames:'round',graphic:'plain',accessory:'none',glasses:false,pose:'stand',bubble:true};
const key='museum-explorer:'+String(window.MUSEUM_SETTINGS?.collectionId||'default');
function normalize(value){const v=value&&typeof value==='object'?value:{};const out={...base};for(const field of ['hairColor','skinColor','topColor','pantsColor'])if(/^#[a-f\d]{6}$/i.test(v[field]||''))out[field]=v[field];if(Object.hasOwn(parts.hair,v.hair||''))out.hair=v.hair;if(['tee','hoodie','sweater','overalls','cardigan','dress'].includes(v.outfit))out.outfit=v.outfit;if(['stand','wave','peace','present'].includes(v.pose))out.pose=v.pose;for(const [f,values]of Object.entries({expression:['chill','smile','smirk','hyped','curious','wink'],faceShape:['oval','round','square','heart','oblong','diamond'],faceDetail:['none','freckles','blush'],frames:['round','square','cat-eye'],graphic:['plain','star','stripe','frog','cat','duck','artifact','moon','mountain'],accessory:['none','headphones','beanie','bow','sprout','duck','ufo','stars','daisies','band','antennae','frog','planet']}))if(values.includes(v[f]))out[f]=v[f];for(const f of ['glasses','bubble'])if(typeof v[f]==='boolean')out[f]=v[f];for(const field of ['accessory','graphic','outfit']){
 if(window.MuseumWardrobe?.unlocked(field,v[field]))out[field]=v[field];
}return out}
let explorer={...base};try{explorer=normalize(JSON.parse(localStorage.getItem(key)))}catch{}
let requestId;try{requestId=new URLSearchParams(location.search).get('exhibit')}catch{}
const entry=requestId?(window.EXHIBITS||[]).find(e=>e.id===requestId&&e.published!==false):null;
let photo='',imageState='none',currentSVG='',exporting=false,stored=true,shareFile=null,shareVersion=0,shareTimer;
const museumTitle=window.MUSEUM_SETTINGS?.title||'School Museum';
function remember(){window.MuseumVault?.checkpoint();window.MuseumVault?.recordExplorer(explorer);try{localStorage.setItem(key,JSON.stringify(explorer));stored=true}catch{stored=false}$('memory-status').textContent=stored?'Your explorer is remembered in this browser.':'Browser storage is unavailable. Your explorer will last only in this open page.'}
// One shared front-facing head and attachment point for every hairstyle.
function headSVG(layer='front',model=explorer){const {hair,hairColor:h,skinColor:skin,glasses}=model,ink='#28303b';
 const shape=(d,color=h)=>`<path d="${d}" fill="${color}" stroke="${ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
 const strand=d=>`<path d="${d}" fill="none" stroke="${ink}" stroke-width="2.5" opacity=".5" stroke-linecap="round"/>`;
 let back='',front='';
 const cap='M103 111 Q90 46 126 31 Q180 5 233 33 Q268 53 257 112 L244 99 Q243 73 229 62 Q194 94 124 79 L117 114 Z';

 const shortCap='M103 111Q92 62 122 38Q149 15 180 23Q218 15 242 43Q267 67 257 111L245 102Q241 77 227 69Q196 89 157 77Q129 70 115 105Z';
 const centerCap='M103 112Q91 62 124 38Q153 16 180 26Q207 16 236 38Q269 62 257 112L245 103Q232 73 180 51Q128 73 115 103Z';
 const longBack='M111 48Q180 4 249 48Q272 89 263 154L274 240Q239 260 210 244L180 236L150 244Q121 260 86 240L97 154Q88 89 111 48Z';
 if(hair==='ShortOne')front=shape(shortCap)+strand('M132 51Q173 39 215 50');
 if(hair==='ShortFour')front=shape('M103 111Q90 70 113 47Q126 22 150 30Q167 8 190 27Q215 12 234 34Q264 40 260 75L257 112L245 101L239 78Q220 94 201 77Q184 94 166 79Q145 95 125 80L115 107Z');
 if(hair==='ShavedThree')front=shape(shortCap)+strand('M115 73l13-12m-13 22 15-13m100-14 13 12m-12-1 13 12');
 if(hair==='CoilyCrop'){front=shape('M103 112L101 78Q93 66 105 55Q102 38 120 34Q127 16 146 24Q158 9 178 20Q197 9 212 23Q235 17 240 37Q260 42 257 60Q270 74 257 85L256 112L244 102L240 84Q219 91 202 82Q181 93 161 83Q141 93 121 84L115 104Z');for(const [x,y]of [[126,48],[157,39],[190,40],[221,49]])front+=strand(`M${x} ${y}q-7 6 1 10q8 1 8-6`);}
 if(hair==='TwinBraids'){
   back=shape('M108 92Q84 132 101 157Q86 178 103 193Q89 216 107 237L116 251L124 229Q137 210 123 192Q138 171 124 151L133 103ZM252 92Q276 132 259 157Q274 178 257 193Q271 216 253 237L244 251L236 229Q223 210 237 192Q222 171 236 151L227 103Z');
   back+=strand('M102 153l19 11-18 15 17 15-14 16 11 15M258 153l-19 11 18 15-17 15 14 16-11 15');front=shape(centerCap);
 }
 if(hair==='WolfCut'){
   back=shape('M108 60Q180 7 250 60L255 124L272 162L255 153L269 194L248 183L253 210L227 194L215 204H145L131 194L107 210L112 182L90 196L105 154L88 164L103 124Z');
   front=shape('M103 115Q88 55 131 32Q174 8 221 30Q264 40 257 115L236 91L228 75L206 91L210 72L184 90L187 69L159 88L162 69L136 91L134 79Z');
 }
 if(hair==='Buzz')front=shape('M103 107Q103 57 138 39Q180 19 222 39Q257 57 257 107L246 92Q223 64 180 64Q137 64 114 92Z');
 if(hair==='Pixie')front=shape('M103 111Q91 65 120 39Q150 16 179 24Q214 7 242 34Q265 55 258 101L241 88L230 65Q199 96 163 80L139 95L126 85L114 108Z')+strand('M142 48Q184 29 218 43');
 if(hair==='Bangs'||hair==='Bob'){back=shape('M108 47Q180 4 252 47Q277 87 266 147L264 205Q236 217 214 207L180 195L146 207Q124 217 96 205L94 147Q83 87 108 47Z');front=shape(hair==='Bangs'?'M103 112Q92 61 121 38Q180 6 239 38Q268 61 257 112L245 99L242 79H203L193 88L184 79H147L134 87L122 79L115 104Z':centerCap);if(hair==='Bob')front+=strand('M180 29V50');}
 if(hair==='LongHair'||hair==='CurtainBangs'){back=shape(longBack);front=shape(hair==='CurtainBangs'?'M103 112Q91 62 124 38Q153 16 180 26Q207 16 236 38Q269 62 257 112L245 103Q235 95 222 101Q197 89 180 57Q163 89 138 101Q125 95 115 103Z':centerCap)+strand('M180 29V50');back+=strand('M112 136L106 226M248 136L254 226');}
 if(hair==='WavyLong'){back=shape('M114 45Q180 0 246 45Q270 69 259 101Q281 123 263 151Q283 177 265 199Q283 224 264 249Q230 267 208 244L180 230L152 244Q130 267 96 249Q77 224 95 199Q77 177 97 151Q79 123 101 101Q90 69 114 45Z');front=shape(centerCap)+strand('M180 29V50');back+=strand('M110 124Q126 146 107 168Q91 188 111 215M250 124Q234 146 253 168Q269 188 249 215');}
 if(hair==='LongCurly'||hair==='CurlyBob'){const bottom=hair==='CurlyBob'?205:252;back=shape(`M108 44Q116 18 143 25Q160 2 180 21Q202 2 220 25Q247 18 252 44Q279 47 271 76Q292 91 275 114Q292 138 274 158Q292 180 274 199Q284 ${bottom} 255 ${bottom+7}Q235 ${bottom+27} 214 ${bottom+6}L180 ${bottom-7}L146 ${bottom+6}Q125 ${bottom+27} 105 ${bottom+7}Q76 ${bottom} 86 199Q68 180 86 158Q68 138 85 114Q68 91 89 76Q81 47 108 44Z`);front=shape('M103 113Q89 86 107 69Q95 47 120 37Q126 15 151 29Q168 10 186 29Q210 12 224 35Q253 27 254 52Q275 65 258 87L256 113L244 102Q239 87 224 78Q207 95 190 80Q174 96 157 81Q137 97 121 83L115 105Z');for(const [x,y]of [[108,128],[101,174],[252,132],[257,177]])back+=strand(`M${x} ${y}q-10 8 0 17q11 5 12-6`);}
 if(hair==='Afro'){back=shape('M98 52Q91 28 115 22Q119-1 144 8Q161-14 181 2Q203-15 220 7Q248-1 251 22Q279 23 273 50Q297 65 283 87Q301 110 280 129Q290 156 264 169Q246 190 225 174L180 164L135 174Q111 190 96 168Q69 156 80 129Q59 110 77 87Q62 65 98 52Z');front=shape('M103 112Q91 90 106 72Q95 52 118 43Q124 24 146 34Q163 17 182 32Q204 18 220 37Q245 28 251 52Q269 66 257 89L256 112L244 101Q239 83 222 78Q204 91 187 79Q168 93 150 80Q132 94 120 82L115 105Z');}
 if(hair==='HighPuff'){back=shape('M143-9Q139-30 158-36Q169-54 186-41Q209-49 217-29Q240-24 232-3Q245 15 225 29Q216 49 195 39Q176 53 161 37Q138 43 133 22Q114 8 129-8Z');front=shape(centerCap)+strand('M125 74Q151 56 175 49M235 74Q211 56 185 49');}
 if(hair==='Bun'||hair==='SpaceBuns'){back=hair==='Bun'?shape('M143 10Q138-20 166-31Q195-43 216-17Q234 7 213 27Q187 43 158 29Z'):shape('M75 34Q64 2 91-13Q123-27 141 2Q157 31 130 48Q97 64 75 34Z')+shape('M285 34Q296 2 269-13Q237-27 219 2Q203 31 230 48Q263 64 285 34Z');front=shape(centerCap)+strand('M180 29V50');}
 if(hair==='Ponytail'){back=shape('M233 57Q274 28 293 62Q312 92 291 129Q270 165 297 218Q264 224 246 197Q231 173 247 130Q259 94 231 91Z');front=shape(shortCap)+strand('M137 47Q180 30 229 54');}
 // Soft, narrow reflections keep the texture legible even with very dark swatches.
 const light=d=>`<path d="${d}" fill="none" stroke="#fff6e4" opacity=".32" stroke-width="3" stroke-linecap="round"/>`;
 if(hair==='Afro'||hair==='CoilyCrop'||hair==='HighPuff'){
   const coils=hair==='Afro'?[[99,49],[128,35],[161,24],[207,31],[244,44],[270,66],[84,100],[272,115]]:
     hair==='HighPuff'?[[147,0],[160,-17],[184,-25],[207,-14],[216,6]]:[[123,54],[153,39],[181,43],[208,38],[235,55]];
   const curls=coils.map(([x,y])=>light(`M${x} ${y}q0-9 9-9q6 0 7 5`)).join('');
   if(hair==='HighPuff')back+=curls;else front+=curls;
 }
 if(hair==='BantuKnots'){
   front=shape(shortCap);
   for(const [x,y,angle] of [[107,58,-28],[132,34,-15],[164,23,-5],[199,23,7],[231,35,18],[254,59,28]]){
     front+=`<g transform="translate(${x} ${y}) rotate(${angle})">`+
       shape('M-17 8Q-22 0-13-6Q-12-16-4-18Q-1-28 6-22Q14-20 12-12Q21-8 17 1Q20 12 4 14Q-10 16-17 8Z')+
       light('M-12 3Q-3 9 11 2M-8-8Q1-3 8-9')+'</g>';
   }
 }
 // Each hanging strand has its own bend and tip. Twists carry paired ridges,
 // box braids interlace, and locs have gently irregular uninterrupted lengths.
 if(['Twists','Locs','BoxBraids'].includes(hair)){
   const loc=hair==='Locs',braid=hair==='BoxBraids';
   const locks=[[107,66,222,-9],[121,55,243,-6],[136,48,231,-4],[222,48,234,5],[238,55,245,8],[252,65,217,12]];
   function lock(x,y,end,bend){
     const mid=(end-y)*.52,dy=end-y,w=braid?7:loc?8:9;
     let art=shape(`M${x-w} ${y}q-5 ${mid/2} ${bend/2} ${mid}t${bend/2} ${dy-mid-6}q${w} 12 ${w*1.6} 1q4 -16 1 -35q-5 -${mid/2} -${bend/2} -${mid}L${x+w} ${y}Z`);
     if(!loc){
       const pitch=braid?11:16, steps=Math.floor((dy-6)/pitch);
       const center=t=>x+bend*t/dy;
       let outline=`M${x} ${y-3}`;
       for(let j=0;j<steps;j++){
         const t=j*pitch;
         outline+=`Q${center(t)+w+3} ${y+t+3} ${center(t+pitch)+w*.48} ${y+t+pitch}`;
       }
       outline+=`Q${center(dy)+3} ${end+5} ${center(dy)-w*.55} ${end-2}`;
       for(let j=steps-1;j>=0;j--){
         const t=j*pitch;
         outline+=`Q${center(t)-w-4} ${y+t+pitch*.5} ${center(t)-w*.45} ${y+t}`;
       }
       art=shape(outline+'Z');
     }
     for(let offset=12;offset<dy-12;offset+=loc?37:14){
       const cx=x+bend*offset/dy,cy=y+offset;
       art+=light(loc?`M${cx-3} ${cy}q-2 6 0 12`:braid?`M${cx-5} ${cy-3}l6 5 4-5`:`M${cx-5} ${cy}q7-2 10-8`);
     }return art;
   }
   for(const args of locks)back+=lock(...args);
   front=shape(centerCap)+light('M135 59q16-18 34-20M190 39q18 4 29 17');
   if(braid)front+=strand('M178 28l1 22M156 33l6 12-10 12M206 35l-6 13 13 12M133 46l8 12-11 15M226 46l-6 14 11 13');
   if(loc)front+=shape('M198 31Q187 59 160 76Q142 86 137 79Q135 74 147 64Q171 43 177 31Z')+light('M181 42q-11 19-28 29');
   if(!loc&&!braid)front+=strand('M151 40q-14 8-20 23m32-25q-15 10-20 23m64-19q16 7 20 19');

   front+=lock(116,69,loc?158:190,-5)+lock(246,70,loc?178:205,6);
 }
 if(hair==='FeedIn'){
   front=shape(shortCap);
   const rows=['M112 94Q106 55 142 42','M122 82Q124 40 162 33','M141 72Q149 36 183 30','M163 71Q176 40 203 34','M185 74Q200 48 224 43','M208 76Q230 58 239 57','M231 85Q244 73 248 72'];
   for(const d of rows)front+=`<path d="${d}" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff6e4" opacity=".45" stroke-width="3" stroke-dasharray="3 4" stroke-linecap="round"/>`;
   back=shape('M240 84Q266 84 268 104Q266 143 279 180L274 198Q260 179 254 152Q242 125 240 84Z')+light('M258 110l7 6m-5 5 7 6m-4 5 7 6m-3 5 7 6');
 }
 if(hair==='QuiffFade'){
   front=shape('M103 112Q100 75 111 57Q96 48 94 31Q108 43 123 39Q110 28 116 11Q134 30 161 19Q196 1 222 14Q248 18 253 47Q265 65 256 112L244 99L238 67Q218 78 196 68Q154 87 124 70L115 103Z')+
     light('M119 43Q143 56 175 37Q204 20 225 29M137 58Q156 62 177 52')+strand('M238 65q11 0 16-7');
 }
 if(hair==='FlipBob'){
   back=shape('M102 87Q90 44 127 27Q180 3 228 28Q266 44 258 100Q247 161 275 166Q258 192 224 175Q183 198 133 176Q103 193 79 170Q110 165 102 87Z');
   front=shape('M103 113Q90 69 110 43Q143 9 192 22Q242 15 257 57Q265 81 254 111L244 100Q235 70 211 57Q182 99 133 93L147 81Q123 83 114 104Z')+
    light('M126 61Q149 33 186 34M150 72Q179 63 196 45');
 }
 // Keep the original option ID so previously saved explorers load the replacement cut.
 if(hair==='Cornrows'){
  back=shape('M110 49Q174 4 242 42Q272 63 260 121Q251 165 271 182Q248 203 218 189Q192 177 165 189Q119 216 89 187Q107 170 97 131Q82 77 110 49Z');
  front=shape('M103 112Q91 62 124 36Q158 10 205 25Q244 19 258 59Q266 82 257 112L245 103Q244 77 218 52Q188 84 143 86Q124 87 115 105Z')+strand('M215 31Q219 39 218 52M202 43Q182 64 152 71');
 }
 if(hair==='Bedhead')front=shape('M103 112Q91 78 105 60L99 41L124 43L136 19L156 31L181 11L195 29L224 18L230 40L253 44L250 65L265 79L257 112L245 103L237 83L220 90L200 77L179 89L156 77L136 91L120 83L115 105Z');
 if(hair==='Mullet'){back=shape('M105 70Q180 14 255 70L260 158L274 220L246 215L234 239L208 226L180 233L152 226L126 239L114 215L86 220L100 158Z');front=shape(shortCap);}
 if(hair==='SilkFringe'||hair==='MicroBob'){
  const micro=hair==='MicroBob', fringeY=micro?70:96;
  back=shape(micro?'M108 53Q175 0 247 45Q270 67 264 111L261 167Q242 182 217 172L147 175Q119 183 96 168L96 103Q92 73 108 53Z':longBack);
  front=shape(`M102 117Q90 60 125 36Q178 7 233 33Q267 54 258 117L245 104L238 ${fringeY}Q181 ${fringeY+2} 123 ${fringeY}L115 107Z`);
  front+=strand(`M155 45Q150 59 150 ${fringeY-4}M204 44Q210 62 210 ${fringeY-4}`);
 }
 if(hair==='Butterfly'){
  back=shape('M108 52Q145 10 181 25Q236 9 253 55Q268 80 257 111Q253 140 279 153Q270 169 247 166Q248 190 278 202Q265 221 244 215Q246 238 258 246Q216 259 195 232L158 238Q120 259 94 246Q114 225 111 211Q91 221 78 203Q108 187 110 166Q90 173 80 157Q105 140 99 121Q88 82 108 52Z');
  front=shape(centerCap)+strand('M180 31L180 51M169 49Q145 56 125 79M193 48Q218 58 236 80');
 }
 if(hair==='HalfUpRibbon'){
  back=shape('M103 66Q91 33 133 28Q165 5 185 24Q222 7 248 43Q275 71 255 115Q278 141 261 172Q248 192 270 223Q254 254 220 241L181 226L146 242Q114 255 89 230Q110 203 97 176Q78 146 103 115Z');
  front=shape(cap)+strand('M123 63Q150 32 187 36');
  front+=shape('M228 48Q211 24 211 37L210 53Q214 61 230 53Q248 66 251 58L252 42Q247 34 232 48Z','#ce7690');
 }
 if(hair==='CurlyFringe'){
  back=shape('M103 51Q107 24 134 30Q149 6 172 20Q191 3 211 20Q240 12 248 40Q277 41 267 72Q289 90 270 113Q288 136 270 152Q285 181 258 188Q250 215 226 200Q204 214 184 196Q156 219 137 201Q111 216 101 193Q72 191 85 166Q62 145 84 124Q67 102 88 83Q76 61 103 51Z');
  front=shape('M103 114Q88 88 103 71Q97 44 123 40Q132 19 153 30Q170 12 190 26Q216 15 228 36Q252 31 256 58Q275 71 257 92L252 113L240 102Q227 106 220 91Q206 110 192 94Q174 114 158 95Q143 109 132 92Q119 104 113 97Z')+strand('M137 56q-10 9 0 15q8 3 11-4M192 56q-8 11 3 15q8 2 10-5');
 }
 const scalpFill=hair==='Bald'?'':`<path data-part="hair-underlay" d="M103 81Q103 52 138 35Q180 15 222 35Q257 52 257 81L239 70Q180 51 121 70Z" fill="${h}"/>`;
 const ears=`<ellipse cx="103" cy="134" rx="12" ry="17" fill="${skin}" stroke="${ink}" stroke-width="3.5"/><ellipse cx="257" cy="134" rx="12" ry="17" fill="${skin}" stroke="${ink}" stroke-width="3.5"/>`;
 const {expression,frames}=model;
 const dot=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="8.5" ry="10" fill="${ink}"/><circle cx="${x+3}" cy="${y-4}" r="3" fill="#fffaf2"/>`;
 const line=(d,width=4)=>`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${width}" stroke-linecap="round"/>`;
 const eyes=expression==='smile'?line('M140 135q10-13 21 0m37 0q10-13 21 0'):
   expression==='wink'?dot(151,132)+line('M199 133q9-9 21 0'):dot(expression==='smirk'?155:151,132)+dot(expression==='curious'?212:209,132);
 const brows=expression==='curious'||expression==='wink'?'M140 111q10 1 18 1m42-8q10-6 18-2':
   expression==='smirk'?'M140 112l18-2m42-4q10-4 18 0':expression==='hyped'?'M140 107q9-8 18-4m42 0q9-5 18 4':'M140 111q8-2 18-1m42 0q10-1 18 1';
 const mouth=expression==='hyped'||expression==='smile'?shape('M161 172Q180 180 200 171Q198 193 182 194Q166 194 161 172Z','#fff6e5'):
   line(expression==='curious'?'M169 179q9-5 18-1':expression==='smirk'?'M165 179q19 6 34-8':expression==='wink'?'M162 175q17 19 35 0':'M165 176q15 11 30 0');
 const jaw={
   oval:'C257 143 251 168 237 186C222 204 201 217 180 217C159 217 138 204 123 186C109 168 103 143 103 107Z',
   round:'C258 145 253 171 237 188C223 203 201 212 180 212C159 212 137 203 123 188C107 171 102 145 103 107Z',
   square:'C256 137 255 162 248 179C242 193 221 204 203 211C193 215 167 215 157 211C139 204 118 193 112 179C105 162 104 137 103 107Z',
   heart:'C257 141 248 164 235 179C216 199 199 217 184 219Q180 220 176 219C161 217 144 199 125 179C112 164 103 141 103 107Z',
   oblong:'C255 140 249 169 238 188C223 209 200 226 180 226C160 226 137 209 122 188C111 169 105 140 103 107Z',
   diamond:'C256 124 260 139 253 153C247 169 234 184 216 199C203 210 191 218 180 218C169 218 157 210 144 199C126 184 113 169 107 153C100 139 104 124 103 107Z'
 }[model.faceShape]||'L254 158Q245 218 180 218Q115 218 106 158Z';
 const cheeks=model.faceDetail==='freckles'?
   '<g fill="#704b37" opacity=".78"><circle cx="129" cy="151" r="2"/><circle cx="137" cy="147" r="2"/><circle cx="143" cy="153" r="1.8"/><circle cx="216" cy="151" r="2"/><circle cx="222" cy="146" r="1.8"/><circle cx="230" cy="152" r="2"/></g>':
   model.faceDetail==='blush'?'<g fill="#cd7380" opacity=".58"><ellipse cx="133" cy="153" rx="12" ry="5"/><ellipse cx="227" cy="153" rx="12" ry="5"/></g>':'';
 const face=`<path d="M103 107 Q102 57 138 39 Q180 19 222 39 Q258 57 257 107 ${jaw}" fill="${skin}" stroke="${ink}" stroke-width="3.5"/><path d="${brows}" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>${eyes}${cheeks}<path d="M177 143q10-2 11 7q0 8-10 8q-4 0-6-3" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>${mouth}`;
 const accessory=model.accessory;
 const star='<path d="m0-12 3.8 8 9 1.4-6.6 6.4 1.6 9L0 8.4l-8 4.4 1.6-9L-13-2.6l9.2-1.4Z" fill="#ffd67a"/>';
 const flower='<g fill="#fff6db">'+[0,72,144,216,288].map(angle=>`<ellipse transform="rotate(${angle})" cy="-6" rx="4.2" ry="6.5"/>`).join('')+'<circle r="4.3" fill="#f1b454"/></g>';
 const ornaments={
   moth:'<g transform="translate(231 72) rotate(18)" stroke-width="2"><path d="M0 1Q-13-15-22-11Q-20 1-11 4Q-17 9-13 19Q-8 10-3 8L0 4L3 8Q8 10 13 19Q17 9 11 4Q20 1 22-11Q13-15 0 1Z" fill="#abe3c2"/><path d="M0-2V8m-1-10-3-4m5 4 3-4" fill="none"/><g fill="#dcb871"><circle cx="-11" cy="-3" r="3"/><circle cx="11" cy="-3" r="3"/></g></g>',
   stars:'<g transform="translate(225 66) rotate(12)">'+star+'</g><g transform="translate(242 85) rotate(-10) scale(.68)">'+star+'</g>',
   daisies:'<g transform="translate(124 72)">'+flower+'</g><g transform="translate(109 90) scale(.72)">'+flower+'</g>',
   band:'<path d="M99 93Q106 32 177 26Q231 23 256 77L252 88Q220 42 178 43Q123 48 105 101Z" fill="#bf6260"/><path d="M130 45Q102 40 99 16Q121 15 135 36Q132 13 150 5Q156 27 140 45Z" fill="#e78d7e"/><circle cx="136" cy="42" r="7" fill="#fff0cb"/>',
   antennae:'<path d="M146 42Q135 21 125 1M213 40Q224 16 240 3" fill="none" stroke-width="5"/><circle cx="121" cy="-4" r="12" fill="#a7dcc7"/><circle cx="245" cy="-2" r="12" fill="#b7a5dd"/><path d="m117-9 4-2m120 3 4-2" stroke="white" fill="none"/>',
   frog:'<path d="M154 22Q145 15 153 6Q147-11 162-14Q171-16 176-6Q185-9 192-6Q198-18 208-13Q220-8 214 5Q222 15 213 22Q187 34 154 22Z" fill="#97c78b"/><g fill="#28303b" stroke="none"><circle cx="163" cy="-4" r="3"/><circle cx="204" cy="-4" r="3"/></g><path d="M175 12q9 7 18-1" fill="none"/>',
   planet:'<g transform="translate(232 75) rotate(-22)"><ellipse rx="23" ry="7" fill="none" stroke="#493b68" stroke-width="6"/><circle r="13" fill="#c3a9df"/><path d="M-22 0C-20 10 19 10 22 0" fill="none" stroke="#f5cf85" stroke-width="5"/></g>'
 };
 const extras=ornaments[accessory]?`<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${ornaments[accessory]}</g>`:accessory==='headphones'?`<path d="M96 127Q86 29 180 24Q274 29 264 127" fill="none" stroke="${ink}" stroke-width="12"/><path d="M96 127Q86 29 180 24Q274 29 264 127" fill="none" stroke="#9384bb" stroke-width="6"/><rect x="84" y="113" width="26" height="48" rx="12" fill="#9384bb" stroke="${ink}" stroke-width="3.5"/><rect x="250" y="113" width="26" height="48" rx="12" fill="#9384bb" stroke="${ink}" stroke-width="3.5"/>`:accessory==='beanie'?`<path d="M98 88Q90 10 180 7Q270 10 262 88Z" fill="${model.topColor}" stroke="${ink}" stroke-width="3.5"/><rect x="96" y="70" width="168" height="30" rx="11" fill="${model.topColor}" stroke="${ink}" stroke-width="3.5"/><rect x="169" y="76" width="22" height="18" rx="4" fill="#fffaf2"/>`:accessory==='bow'?`<path d="M237 77Q210 43 208 68Q205 91 237 82Q263 106 267 82Q272 58 237 77Z" fill="#d97895" stroke="${ink}" stroke-width="3"/><circle cx="237" cy="80" r="7" fill="#e9a9bf" stroke="${ink}" stroke-width="3"/>`:accessory==='sprout'?`<path d="M180 30V-4" fill="none" stroke="${ink}" stroke-width="4"/><path d="M180 6Q145 9 145-16Q171-22 180 6ZM180-1Q213 0 217-27Q187-29 180-1Z" fill="#a7c685" stroke="${ink}" stroke-width="3"/>`:accessory==='duck'?`<ellipse cx="180" cy="12" rx="28" ry="19" fill="#f3cc58" stroke="${ink}" stroke-width="3"/><circle cx="195" cy="-9" r="18" fill="#f3cc58" stroke="${ink}" stroke-width="3"/><path d="M209-9l16 4-16 6" fill="#d98348" stroke="${ink}" stroke-width="2.5"/><circle cx="198" cy="-12" r="2.8" fill="${ink}"/><path d="M160 11q10 12 23 0" fill="none" stroke="#d8a636" stroke-width="3"/>`:accessory==='ufo'?`<path d="M161 2Q180-33 199 2" fill="#a7d9ce" stroke="${ink}" stroke-width="3"/><ellipse cx="180" cy="6" rx="43" ry="12" fill="#b6a8db" stroke="${ink}" stroke-width="3"/><path d="M161 17l-7 13m26-10v13m19-16 7 13" stroke="#bf9651" stroke-width="3" stroke-linecap="round"/>`:'';
 const specs=glasses?`<g stroke="${ink}" stroke-width="3.5" fill="#fffaf2" fill-opacity=".1">${frames==='cat-eye'?'<path d="M122 115L171 121Q178 151 150 149Q132 148 122 115ZM238 115L189 121Q182 151 210 149Q228 148 238 115Z"/>':frames==='square'?'<rect x="129" y="118" width="44" height="29" rx="8"/><rect x="187" y="118" width="44" height="29" rx="8"/>':'<circle cx="151" cy="132" r="21"/><circle cx="209" cy="132" r="21"/>'}<path d="M173 128q7-4 14 0 M129 128L103 132 M231 128L257 132" fill="none"/></g>`:'';
 return `<g data-part="${layer==='back'?'back-hair':'head'}" transform="translate(180 236) scale(.9) translate(-180 -218)" stroke-linejoin="round">${layer==='back'?(model.accessory==='beanie'?'<defs><clipPath id="hair-hat-'+avatarSerial+'"><rect x="40" y="74" width="290" height="240"/></clipPath></defs><g clip-path="url(#hair-hat-'+avatarSerial+')">'+back+'</g>':back):ears+face+scalpFill+front+specs+extras}</g>`;
}
let avatarSerial=0;
function avatarSVG(){const a=explorer,ink='#28303b',skin=a.skinColor,top=a.topColor,pants=a.pantsColor;
 const cardigan=a.outfit==='cardigan',dress=a.outfit==='dress';
 const longSleeves=['hoodie','sweater','cardigan','letterman'].includes(a.outfit),loose=['hoodie','tee'].includes(a.outfit);
 const clipId='explorer-top-'+(++avatarSerial);
 const torsoD=cardigan?'M153 247Q180 238 207 247Q226 250 236 266L225 295L235 345Q180 355 125 345L135 295L124 266Q134 250 153 247Z':dress?'M153 247Q180 238 207 247Q226 250 236 266L225 295L217 331L257 433Q180 451 103 433L143 331L135 295L124 266Q134 250 153 247Z':'M153 247Q180 238 207 247Q226 250 236 266L225 295L239 385Q180 393 121 385L135 295L124 266Q134 250 153 247Z';
 let foregroundHands='',foregroundCuffs='';
 const joints={left:{s:[139,271],e:[114,316],w:[118,363]},right:{s:[221,271],e:[247,316],w:[244,363]}};
 if(['wave','peace'].includes(a.pose))joints.right={s:[221,271],e:[265,290],w:[287,233]};
 if(a.pose==='present')joints.left={s:[139,271],e:[98,313],w:[55,300]};
 function limb(side){const {s,e,w}=joints[side],lenSE=Math.hypot(s[0]-e[0],s[1]-e[1]),lenEW=Math.hypot(w[0]-e[0],w[1]-e[1]),bend=12,before=[e[0]+(s[0]-e[0])/lenSE*bend,e[1]+(s[1]-e[1])/lenSE*bend],after=[e[0]+(w[0]-e[0])/lenEW*bend,e[1]+(w[1]-e[1])/lenEW*bend],path=`M${s}L${before}Q${e} ${after}L${w}`;
  const sleeveEnd=longSleeves?w:[s[0]+(e[0]-s[0])*.52,s[1]+(e[1]-s[1])*.52];
  const sleevePath=longSleeves?path:`M${s}L${sleeveEnd}`;
  const tangent=longSleeves?[w[0]-e[0],w[1]-e[1]]:[e[0]-s[0],e[1]-s[1]],len=Math.hypot(...tangent),half=longSleeves?(loose?14:12):12,nx=-tangent[1]/len*half,ny=tangent[0]/len*half;
  const cuff=`M${sleeveEnd[0]+nx} ${sleeveEnd[1]+ny}L${sleeveEnd[0]-nx} ${sleeveEnd[1]-ny}`;
  let hand,angle;
  if(side==='right'&&['wave','peace'].includes(a.pose)){
   angle=Math.atan2(w[0]-e[0],e[1]-w[1])*180/Math.PI;hand=a.pose==='peace'?'<path data-part="peace-hand" d="M-12.25 12L-9 7C-16 2-19-2-18-7Q-16-12-11-8L-7-4L-12-31C-13-38-6-40-4-33L2-13L10-35C12-42 19-39 17-32L11-10Q20-15 23-9Q25-5 20-1Q25 4 19 10L10 15L12.25 12"/><path d="M10-8q-7 0-8 7m1 2q7 5 13 1" fill="none"/>':'<path d="M-12.25 12L-9 8C-10 2-14-2-19-7C-24-13-24-17-21-19C-17-22-14-18-9-13V-29C-9-35-2-35-2-29L-1-17L0-35C0-42 8-42 8-35V-17L10-32C11-38 18-36 17-30L15-14L19-25C22-30 28-27 25-22L20-7C20 1 15 8 10 10L12.25 12"/>';
  }else if(side==='left'&&a.pose==='present'){
   angle=Math.atan2(e[1]-w[1],e[0]-w[0])*180/Math.PI;hand='<path data-part="present-hand" d="M0-12.25Q-6-12-12-17Q-18-22-22-18Q-25-14-19-10L-12-6L-31-7Q-40-8-41-2Q-42 4-33 6L-15 10Q-7 13 0 12.25"/>';
  }else{
   angle=-Math.atan2(w[0]-e[0],w[1]-e[1])*180/Math.PI;hand='<path d="M-10-4L-10 9C-10 17-6 22 0 22C7 22 11 17 11 10L10-4"/>';
  }
  foregroundHands+=`<g data-part="${side}-hand" transform="translate(${w}) rotate(${angle})" fill="${skin}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${side==='right'&&['wave','peace'].includes(a.pose)?'<g transform="translate(0 -12)">'+hand+'</g>':hand}</g>`;
  if(longSleeves){const ux=(w[0]-e[0])/lenEW,uy=(w[1]-e[1])/lenEW,halfWidth=loose?15:12.5,normal=[-uy*halfWidth,ux*halfWidth],back=[w[0]-ux*4,w[1]-uy*4],tip=[w[0]+ux*5,w[1]+uy*5];foregroundCuffs+=`<path data-part="${side}-sleeve-cuff" d="M${back[0]+normal[0]} ${back[1]+normal[1]}L${tip[0]+normal[0]} ${tip[1]+normal[1]}L${tip[0]-normal[0]} ${tip[1]-normal[1]}L${back[0]-normal[0]} ${back[1]-normal[1]}Z" fill="${top}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`;}
  return `<g data-part="${side}-arm" stroke-linejoin="round"><path d="${path}" fill="none" stroke="${ink}" stroke-width="27" stroke-linecap="${((side==='right'&&['wave','peace'].includes(a.pose))||(side==='left'&&a.pose==='present'))?'butt':'round'}"/><path d="${path}" fill="none" stroke="${skin}" stroke-width="20" stroke-linecap="${((side==='right'&&['wave','peace'].includes(a.pose))||(side==='left'&&a.pose==='present'))?'butt':'round'}"/><path d="${sleevePath}" fill="none" stroke="${ink}" stroke-width="${loose?37:32}" stroke-linecap="butt"/><path d="${sleevePath}" fill="none" stroke="${top}" stroke-width="${loose?30:25}" stroke-linecap="butt"/><path d="${cuff}" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/></g>`;
 }
 function graphicSVG(){const white='#fffaf2';const badge=explorer.graphic;
 if(badge==='star')return `<path d="M180 286l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" fill="${white}"/>`;
 if(badge==='stripe')return `<path d="M70 295H290M70 307H290" stroke="${white}" stroke-width="5" opacity=".85" clip-path="url(#${clipId})"/>`;
 if(badge==='frog')return `<g transform="translate(180 302)"><circle cx="-12" cy="-8" r="9" fill="#a7c685"/><circle cx="12" cy="-8" r="9" fill="#a7c685"/><ellipse rx="24" ry="15" fill="#a7c685"/><circle cx="-12" cy="-8" r="3" fill="${ink}"/><circle cx="12" cy="-8" r="3" fill="${ink}"/><path d="M-8 4q8 7 16 0" fill="none" stroke="${ink}" stroke-width="2"/></g>`;
 if(badge==='cat')return `<path d="M160 312V286L173 294Q180 291 187 294L200 286V312Q180 327 160 312Z" fill="${white}"/><path d="M170 306h3m14 0h3m-12 6h4" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
 if(badge==='duck')return `<ellipse cx="177" cy="308" rx="20" ry="12" fill="#f3cc58"/><circle cx="190" cy="294" r="12" fill="#f3cc58"/><path d="M200 294l11 4-11 3" fill="#d98348"/><circle cx="193" cy="292" r="2" fill="${ink}"/>`;
 if(badge==='palette')return '<g transform="translate(180 306) rotate(-16)" stroke="#28303b" stroke-width="2"><path d="M-19 3C-24-13-4-24 12-17Q27-10 19 0Q15 4 9 2Q3 1 5 8Q11 18-2 19Q-15 18-19 3Z" fill="#f4d7ac"/><circle cx="-11" cy="-4" r="3.5" fill="#cf6c79"/><circle cx="-3" cy="-12" r="3.5" fill="#efb64d"/><circle cx="7" cy="-12" r="3.5" fill="#66a99b"/></g>';
 if(badge==='moon')return '<g fill="#ffde91"><path d="M187 283a20 20 0 1 0 14 28 18 18 0 0 1-14-28Z"/><path d="m200 283 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></g>';
 if(badge==='mountain')return '<g stroke="#28303b" stroke-width="2" stroke-linejoin="round"><path d="m154 321 20-34 9 14 8-11 17 31Z" fill="#94b8aa"/><path d="m166 301 8-14 9 14-8-4Z" fill="#fffaf2"/></g>';
 if(badge==='artifact')return `<g data-part="amphora-graphic" transform="translate(180 304) scale(.9)"><path d="M-10-12C-34-23-34 9-12 10M10-12C34-23 34 9 12 10" fill="none" stroke="${white}" stroke-width="4"/><path d="M-8-19H8L7-10Q20-4 17 9Q15 18 5 22V25H12V29H-12V25H-5V22Q-15 18-17 9Q-20-4-7-10Z" fill="#e6ba82" stroke="${ink}" stroke-width="2"/><path d="M-11-21H11M-15 4H15M-12 11l6-4 6 4 6-4 6 4" fill="none" stroke="${ink}" stroke-width="2"/></g>`;
 return '';
 }
 const shirt=`<path data-part="top" d="${torsoD}" fill="${top}" stroke="${ink}" stroke-width="3.5"/>`;
 const neck=`<path data-part="neck" d="M164 204V244Q180 259 196 244V204" fill="${skin}" stroke="${ink}" stroke-width="3.5"/>`;
 const hoodBack=a.outfit==='hoodie'?`<path data-part="hood-back" d="M137 255Q126 228 151 222H209Q234 228 223 255L209 272H151Z" fill="${top}" stroke="${ink}" stroke-width="3.5"/>`:'';
 let details;
 if(a.outfit==='hoodie')details=`<path d="M155 248Q180 273 205 248" fill="none" stroke="${ink}" stroke-width="3"/><path d="M155 260v22M205 260v22" fill="none" stroke="#fffaf2" stroke-width="3" stroke-linecap="round"/><path d="M158 331H202L214 356Q180 366 146 356Z" fill="none" stroke="${ink}" stroke-width="2.4"/><path d="M124 377Q180 384 236 377" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
 else if(a.outfit==='letterman')details=`<g stroke="${ink}" stroke-width="2.8" stroke-linejoin="round"><path d="m153 247 27 20 27-20-9-3-18 12-18-12Z" fill="#f6e7c7"/><path d="M180 267v109m-47-34 20-13m74 13-20-13" fill="none"/><path d="M124 369q56 7 112 0v10q-56 8-112 0Z" fill="#f6e7c7"/><path d="m201 281 5 7 6-7v17h-4v-8l-2 4-3-4v8h-4v-17Z" fill="#ffe2a1"/><g fill="#fff3ce"><circle cx="180" cy="281" r="2"/><circle cx="180" cy="302" r="2"/><circle cx="180" cy="323" r="2"/><circle cx="180" cy="344" r="2"/></g></g>`;
 else if(a.outfit==='sweater')details=`<path d="M157 249Q180 269 202 249M125 377Q180 384 235 377" fill="none" stroke="${ink}" stroke-width="3"/>`;
 else if(a.outfit==='overalls')details=`<path d="M157 250Q180 270 202 250" fill="none" stroke="${ink}" stroke-width="3"/><path d="M146 248L157 310M214 248L203 310" fill="none" stroke="${ink}" stroke-width="17"/><path d="M146 248L157 310M214 248L203 310" fill="none" stroke="${pants}" stroke-width="11"/><path d="M149 301H211L217 350L239 385Q180 395 121 385L143 350Z" fill="${pants}" stroke="${ink}" stroke-width="3.5"/><circle cx="157" cy="310" r="4.5" fill="#dfb34e"/><circle cx="203" cy="310" r="4.5" fill="#dfb34e"/><path d="M163 326H197V347Q180 358 163 347Z" fill="none" stroke="#fffaf2" stroke-width="2.5"/>`;
 else if(cardigan)details=`<path d="M164 248L180 271L196 248" fill="#fffaf2" stroke="${ink}" stroke-width="2.5"/><path d="M180 272V347" fill="none" stroke="${ink}" stroke-width="2.5"/><g fill="#fffaf2"><circle cx="185" cy="285" r="3"/><circle cx="185" cy="310" r="3"/><circle cx="185" cy="335" r="3"/></g><path d="M128 337Q180 346 232 337" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
 else if(dress)details=`<path d="M157 250Q180 267 202 250M110 426Q180 440 250 426" fill="none" stroke="${ink}" stroke-width="2.5"/><path d="M143 332H217" fill="none" stroke="${pants}" stroke-width="6"/>`;
 else details=`<path d="M157 250Q180 270 202 250M124 377Q180 384 236 377" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
 const legs=cardigan?`<path d="M141 405H164L171 486H139ZM196 405H219L221 486H189Z" fill="${skin}" stroke="${ink}" stroke-width="3.5"/><path data-part="skirt" d="M140 337H220L241 424Q180 440 119 424Z" fill="${pants}" stroke="${ink}" stroke-width="3.5"/><path d="M151 349L142 425M170 349L165 431M190 349L195 431M209 349L218 425" fill="none" stroke="${ink}" stroke-width="2.3" opacity=".7"/>`:dress?`<path d="M141 407H166L172 486H137ZM194 407H219L223 486H188Z" fill="${pants}" stroke="${ink}" stroke-width="3.5"/>`:`<path data-part="trousers" d="${a.outfit==='overalls'?'M121 356H239L235 486H187L180 421L173 486H125Z':'M132 376H228L235 486H187L180 421L173 486H125Z'}" fill="${pants}" stroke="${ink}" stroke-width="3.5"/>`;
 const shoes=`<g data-part="shoes"><path d="M130 482H174V510H112Q108 491 130 482ZM186 482H231Q252 491 248 510H186Z" fill="#fffaf2" stroke="${ink}" stroke-width="3.5"/><path d="M114 502H171M189 502H246" fill="none" stroke="${ink}" stroke-width="2"/></g>`;
 return `<g stroke-linejoin="round"><defs><clipPath id="${clipId}"><path d="${torsoD}"/></clipPath></defs>${headSVG('back')}<ellipse cx="180" cy="510" rx="95" ry="12" fill="#254742" opacity=".08"/>${legs}${shoes}${limb('left')}${limb('right')}${shirt}${hoodBack}${neck}${details}${graphicSVG()}${headSVG()}${foregroundHands}${foregroundCuffs}</g>`;
}

const measure=document.createElement('canvas').getContext('2d');
function lines(text,maxWidth,font,maxLines=5){if(!measure)return[String(text).slice(0,100)];measure.font=font;const words=String(text||'').trim().split(/\s+/);const out=[];let line='';for(const word of words){if(measure.measureText((line?line+' ':'')+word).width<=maxWidth){line+=(line?' ':'')+word;continue}if(line){out.push(line);line=''}let rest=word;while(measure.measureText(rest).width>maxWidth&&rest.length>1){let cut=rest.length-1;while(cut>1&&measure.measureText(rest.slice(0,cut)).width>maxWidth)cut--;out.push(rest.slice(0,cut));rest=rest.slice(cut)}line=rest}if(line)out.push(line);if(out.length>maxLines){out.length=maxLines;let last=out[maxLines-1];while(last.length&&measure.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);out[maxLines-1]=last+'…'}return out}
function textBlock(text,x,y,width,size,fill,font='Arial',maxLines=5,lineHeight=size*1.25){const wrapped=lines(text,width,`${size}px ${font}`,maxLines);return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" fill="${fill}">${wrapped.map((s,i)=>`<tspan x="${x}" dy="${i?lineHeight:0}">${esc(s)}</tspan>`).join('')}</text>`}
function sceneSVG(){const svgOpen='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840" role="img" aria-label="Museum explorer photo card">';if(!entry){return `<svg xmlns="http://www.w3.org/2000/svg" width="650" height="650" viewBox="0 0 650 650" role="img" aria-label="Your customized museum explorer"><rect width="650" height="650" fill="#fbf5ec"/><path d="M119 550V287a206 206 0 0 1 412 0v263" fill="#e3e8d6"/><circle cx="517" cy="150" r="34" fill="#f1dfc8"/><path d="M94 367q26-34 49-17m370 132q24-30 49-17" stroke="#879173" stroke-width="7" fill="none" stroke-linecap="round"/><g transform="translate(145 43) scale(1.05)">${avatarSVG()}</g><text x="325" y="614" text-anchor="middle" font-family="Arial" font-size="16" letter-spacing="3" fill="#155b56">READY TO EXPLORE</text></svg>`}
 const phrase=String(entry.photoPhrase||'A little object. A big story.').trim().slice(0,140);
 let speechSize=23;while(speechSize>12&&lines(phrase,338,speechSize+'px Arial',150).length>Math.floor(100/(speechSize*1.1)))speechSize--;
 const bubble=explorer.bubble?`<path d="M770 126q0-20 20-20h348q20 0 20 20v105q0 20-20 20H950l-40 35 8-35H790q-20 0-20-20z" fill="#fffdf6" stroke="#d1c9b6" stroke-width="3"/><rect x="788" y="89" width="117" height="33" rx="16" fill="#bf9651"/><text x="846" y="111" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="#254742">EXPLORER</text>${textBlock(phrase,792,145,338,speechSize,'#254742','Arial',Math.floor(100/(speechSize*1.1)),speechSize*1.1)}`:'';
 const art=photo?`<image href="${photo}" x="89" y="236" width="600" height="370" preserveAspectRatio="xMidYMid meet"/>`:`<circle cx="389" cy="420" r="90" fill="#e3e8d6"/><path d="M389 349l21 50 52 21-52 21-21 50-21-50-52-21 52-21z" fill="#155b56"/><text x="389" y="560" font-family="Arial" font-size="18" text-anchor="middle" fill="#623f65">${imageState==='loading'?'Loading artifact photo…':'ILLUSTRATION PREVIEW · NO ARTIFACT PHOTO'}</text>`;
 return svgOpen+`<rect width="1200" height="840" fill="#fbf5ec"/><rect x="22" y="22" width="1156" height="796" rx="28" fill="none" stroke="#d6c9b7" stroke-width="2"/>${textBlock(museumTitle,64,66,650,18,'#155b56','Arial',2,22)}<text x="64" y="122" font-family="Arial" font-size="13" letter-spacing="3" fill="#623f65">A MOMENT IN THE MUSEUM</text>${textBlock(entry.object,64,171,655,37,'#254742','Georgia',2,41)}<rect x="64" y="220" width="650" height="410" rx="18" fill="#fffaf2" stroke="#d6c9b7" stroke-width="2"/>${art}<path d="M98 651h580" stroke="#d6c9b7" stroke-width="3"/><rect x="289" y="655" width="202" height="37" rx="9" fill="#e3e8d6"/><text x="390" y="680" text-anchor="middle" font-family="Arial" font-size="17" fill="#155b56">EXHIBIT ${esc(entry.id)}</text>${bubble}<g transform="translate(819 269) scale(.94)">${avatarSVG()}</g>${textBlock(entry.photoIsReference?'Reference photo: '+entry.referenceImage.author+' · '+entry.referenceImage.license+' · Wikimedia Commons':entry.imageCredit?'Artifact photo: '+entry.imageCredit:photo?'Artifact photograph supplied by the museum.':'Prototype keepsake · illustrative placeholder, not an artifact photograph.',64,733,670,14,'#5b6f64','Arial',3,18)}<text x="64" y="797" font-family="Arial" font-size="15" letter-spacing="2" fill="#623f65">LOOK CLOSER. KEEP WONDERING.</text><text x="1090" y="797" font-family="Arial" font-size="28" fill="#bf9651">✦</text></svg>`;
}
function draw(){renderHairChoices();currentSVG=sceneSVG();$('scene').innerHTML=currentSVG;for(const b of document.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed',String(explorer.pose===b.dataset.pose));for(const b of document.querySelectorAll('[data-skin]'))b.setAttribute('aria-pressed',String(explorer.skinColor.toLowerCase()===b.dataset.skin));for(const b of document.querySelectorAll('[data-hair-color]'))b.setAttribute('aria-pressed',String(explorer.hairColor.toLowerCase()===b.dataset.hairColor));$('save-photo').disabled=exporting||imageState==='loading'||!!(requestId&&!entry)||entry?.photoBoothEnabled===false;$('save-photo').textContent=entry?'Save photo…':'Save explorer…';scheduleShare()}
function setControls(){for(const [id,k]of [['hair-style','hair'],['hair-color','hairColor'],['skin-color','skinColor'],['outfit','outfit'],['top-color','topColor'],['pants-color','pantsColor'],['expression','expression'],['face-shape','faceShape'],['face-detail','faceDetail'],['frames','frames'],['graphic','graphic'],['accessory','accessory']])$(id).value=explorer[k];$('glasses').checked=explorer.glasses;$('frames').disabled=!explorer.glasses;$('show-bubble').checked=explorer.bubble}
for(const [value,part]of Object.entries(parts.hair)){const o=document.createElement('option');o.value=value;o.textContent=part.label;$('hair-style').append(o)}
const skinTones=[['#fff0e6','Very light warm'],['#f1dcd2','Very light cool'],['#f2d3b5','Light golden'],['#e8c2ab','Light neutral'],['#e4b495','Light warm'],['#d8ae94','Light medium neutral'],['#d09a75','Medium golden'],['#c89068','Medium warm'],['#b78972','Medium cool'],['#ac7455','Medium deep warm'],['#976d57','Medium deep neutral'],['#855940','Deep golden'],['#754b3d','Deep warm'],['#62463b','Deep neutral'],['#50362e','Very deep warm'],['#392b28','Very deep neutral']];
const funTones=[['#b8a4e0','Lavender'],['#88bfe8','Sky blue'],['#99d3bb','Mint'],['#edabc7','Bubblegum pink'],['#f2d76d','Lemon yellow'],['#a8dc68','Bright green'],['#9275cb','Violet'],['#a5aebe','Cool gray']];
const hairTones=[['#18191d','Black'],['#352821','Deep brown'],['#654632','Brown'],['#945d38','Chestnut'],['#ba7144','Copper'],['#df9c5d','Ginger'],['#d6b272','Golden blond'],['#ead6a7','Light blond'],['#ddd4cc','Platinum'],['#8b8e95','Gray'],['#f4f0e9','White'],['#631c2e','Burgundy'],['#b34882','Magenta'],['#8760bb','Violet'],['#2b85bc','Blue'],['#347d70','Teal'],['#6c9650','Green'],['#e89ac2','Pink'],['#f0cd49','Yellow'],['#bd3d3f','Red']];
for(const [mount,colors,field,dataKey,label]of [['skin-swatches',[...skinTones,...funTones],'skinColor','skin','skin color'],['hair-swatches',hairTones,'hairColor','hairColor','hair color']])for(const [color,name]of colors){const b=document.createElement('button');b.type='button';b.dataset[dataKey]=color;b.style.setProperty('--skin',color);b.title=name;b.setAttribute('aria-label',name+' '+label);b.onclick=()=>{explorer[field]=color;$(field==='skinColor'?'skin-color':'hair-color').value=color;remember();draw()};$(mount).append(b)}

for(const [id,k]of [['hair-style','hair'],['hair-color','hairColor'],['skin-color','skinColor'],['outfit','outfit'],['top-color','topColor'],['pants-color','pantsColor'],['expression','expression'],['face-shape','faceShape'],['face-detail','faceDetail'],['frames','frames'],['graphic','graphic'],['accessory','accessory']])$(id).oninput=()=>{explorer=normalize({...explorer,[k]:$(id).value});remember();draw()};for(const [id,k]of [['glasses','glasses'],['show-bubble','bubble']])$(id).onchange=()=>{explorer[k]=$(id).checked;setControls();remember();draw()};document.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{explorer.pose=b.dataset.pose;remember();draw()});
document.querySelectorAll('[data-palette]').forEach(b=>b.onclick=()=>{const palettes={midnight:['#30333e','#555862'],lilac:['#9384bb','#3a4048'],moss:['#68775d','#d3c2a5'],clay:['#a85f4d','#30333e'],cherry:['#9b324d','#eed6d0'],ballet:['#dfabc6','#554664']};[explorer.topColor,explorer.pantsColor]=palettes[b.dataset.palette];setControls();remember();draw()});
$('forget-explorer').onclick=()=>{if(!confirm('Forget your explorer on this browser? Your museum passport and saved photo files will stay.'))return;try{localStorage.removeItem(key)}catch{}explorer={...base};setControls();draw();$('memory-status').textContent='Explorer forgotten. New choices will be remembered when you customize again.'};
function imageFromURL(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Image could not be opened.'));img.src=url})}
async function rasterPhoto(){
 if(!entry?.image)return;
 imageState='loading';draw();
 try{
  const isLocal=/^assets\/[a-zA-Z0-9_./-]+$/.test(entry.image)&&!entry.image.split('/').includes('..');
  const isReference=entry.photoIsReference&&entry.referenceImage?.url===entry.image&&window.MuseumWikiPhotos?.safeImage(entry.image);
  if(!isLocal&&!isReference)throw Error('Unsupported photo path.');
  const response=await fetch(entry.image,{credentials:'omit',signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('Photo unavailable.');
  const blob=await response.blob();
  if(blob.size>15000000)throw Error('Photo too large.');
  const url=URL.createObjectURL(blob);
  try{
   const img=await imageFromURL(url),w=img.naturalWidth,h=img.naturalHeight;
   if(!w||!h||w*h>60000000)throw Error('Unsupported photo dimensions.');
   const cropW=Math.min(w,h*4/3),cropH=cropW*3/4;
   const fraction=value=>Number.isFinite(value)?Math.max(0,Math.min(100,value))/100:.5;
   const canvas=document.createElement('canvas');canvas.width=960;canvas.height=720;
   canvas.getContext('2d').drawImage(img,(w-cropW)*fraction(entry.photoCropX),(h-cropH)*fraction(entry.photoCropY),cropW,cropH,0,0,960,720);
   photo=canvas.toDataURL('image/png');
  }finally{URL.revokeObjectURL(url)}
  imageState='ready';$('photo-note').textContent=isReference?'Your keepsake includes the credited Wikipedia reference photo.':'Your explorer poses beside the museum’s artifact photograph. Save the card or take a screenshot.';
 }catch{
  imageState='error';$('photo-note').textContent='The photo could not load. Reload to try again, or save the illustrated keepsake.';
 }
 draw();
}
function photoFilename(){return entry?'museum-photo-'+entry.id+'.png':'my-museum-explorer.png'}
async function photoBlob(svg){const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));try{const img=await imageFromURL(url);const canvas=document.createElement('canvas');canvas.width=entry?1600:1000;canvas.height=entry?1120:1000;canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Image export unavailable.');return blob}finally{URL.revokeObjectURL(url)}}
// Prepare files before the tap so native sharing retains the browser's user gesture.
function scheduleShare(){const version=++shareVersion;shareFile=null;clearTimeout(shareTimer);const button=$('share-photo');button.disabled=true;if(!window.isSecureContext||typeof navigator.share!=='function'||typeof navigator.canShare!=='function'){button.hidden=true;return}button.hidden=false;if($('save-photo').disabled)return;const svg=currentSVG;shareTimer=setTimeout(async()=>{try{const blob=await photoBlob(svg);if(version!==shareVersion)return;const file=new File([blob],photoFilename(),{type:'image/png'});if(!navigator.canShare({files:[file]})){button.hidden=true;return}shareFile=file;button.disabled=false}catch{if(version===shareVersion)button.hidden=true}},150)}
$('share-photo').onclick=async()=>{if(!shareFile||$('share-photo').disabled)return;const file=shareFile;$('share-photo').disabled=true;try{await navigator.share({files:[file],title:entry?entry.object+' · '+museumTitle:'My museum explorer'});$('export-status').textContent='Photo shared using your device’s sharing options.'}catch(error){$('export-status').textContent=error.name==='AbortError'?'Sharing canceled. Your photo is still here.':'Sharing is unavailable here. Use Download instead.'}finally{$('share-photo').disabled=!shareFile}};
$('save-photo').onclick=async()=>{if(exporting||$('save-photo').disabled)return;exporting=true;draw();$('export-status').textContent='Preparing your keepsake…';try{const svg=currentSVG;const saved=await saveMuseumFile(photoFilename(),()=>photoBlob(svg));$('export-status').textContent=saved?'Your image is ready.':'Save canceled.'}catch{$('export-status').textContent='The photo could not be downloaded here. You can still take a screenshot of the preview.'}finally{exporting=false;draw()}};

// Native disclosure sections shorten the editor without replacing standard form controls.
(function organizeControls(){const host=document.querySelector('.explorer-controls'),firstColors=$('hair-color').closest('.color-fields'),secondColors=$('top-color').closest('.color-fields');const groups=[['Hair & skin',[$('hair-style').closest('label'),firstColors,...host.querySelectorAll('.swatch-group')]],['Outfit',[$('outfit').closest('label'),secondColors,$('graphic').closest('label'),host.querySelector('.palette-presets')]],['Face & extras',[$('face-shape').closest('label'),$('expression').closest('label'),$('face-detail').closest('label'),$('accessory').closest('label'),$('glasses').closest('label'),$('frames').closest('label')]]];const before=host.querySelector('fieldset'),mobile=matchMedia('(max-width:760px)').matches;groups.forEach(([title,nodes],index)=>{const details=document.createElement('details');details.className='explorer-control-group';details.open=!mobile||index===0;const summary=document.createElement('summary');summary.textContent=title;const body=document.createElement('div');nodes.forEach(n=>body.append(n));details.append(summary,body);host.insertBefore(details,before)})})();
$('expand-preview').onclick=()=>{const large=document.body.classList.toggle('large-explorer-preview');$('expand-preview').setAttribute('aria-pressed',String(large));$('expand-preview').textContent=large?'Compact preview':'Larger preview'};
if(entry){document.title='Pose with '+entry.object+' · '+museumTitle;$('back-link').href='index.html#exhibit/'+encodeURIComponent(entry.id);$('back-link').textContent='← Back to '+entry.object;$('explorer-eyebrow').textContent='Museum photo booth';$('explorer-heading').textContent='You. This object. A story.';$('explorer-lede').textContent='Pose beside '+entry.object+', choose a bubble, and keep a little piece of your visit.';$('preview-label').textContent='Your museum keepsake';$('browse-artifacts').hidden=true;$('photo-note').textContent=entry.image?'Preparing the artifact photo…':'No artifact photo has been added yet. This labeled illustration lets you try the photo booth.';$('bubble-note').textContent=entry.photoPhrase?'This exhibit’s phrase was chosen by your teacher.':'A museum greeting appears until your teacher adds an exhibit phrase.';if(entry.photoBoothEnabled===false){$('scene').hidden=true;$('photo-note').textContent='The photo booth is not enabled for this exhibit.';$('bubble-control').hidden=true}}else{$('scene').classList.add('dressing-room');$('bubble-control').hidden=true;$('bubble-note').hidden=true;$('photo-note').textContent=requestId?'That exhibit is unavailable. Return to the collection and choose an available object.':'Your explorer is ready for every artifact. Open an exhibit and select “Pose with this artifact.”';if(requestId)$('preview-label').textContent='Exhibit unavailable'}
// Thumbnail choices use the same layered artwork as the exported explorer.
const hairBrowser=document.createElement('details');
hairBrowser.className='hair-browser';
hairBrowser.innerHTML='<summary>Browse hairstyles by picture</summary><div class="hair-grid"></div>';
$('hair-style').closest('label').after(hairBrowser);
let hairSignature='';
function renderHairChoices(){
  if(!hairBrowser.open)return;
  const signature=[explorer.hairColor,explorer.skinColor,explorer.faceShape,explorer.faceDetail].join('/');
  const grid=hairBrowser.querySelector('.hair-grid');
  if(signature!==hairSignature){
    hairSignature=signature;
    grid.replaceChildren();
    for(const [hair,{label}] of Object.entries(parts.hair)){
      const model={...explorer,hair,accessory:'none',glasses:false,expression:'chill'};
      const button=document.createElement('button');
      button.type='button';
      button.dataset.style=hair;
      button.innerHTML='<svg aria-hidden="true" viewBox="35 -28 290 318">'+headSVG('back',model)+headSVG('front',model)+'</svg>';
      button.append(document.createTextNode(label));
      button.onclick=()=>{explorer.hair=hair;setControls();remember();draw()};
      grid.append(button);
    }
  }
  for(const button of grid.children)button.setAttribute('aria-pressed',String(button.dataset.style===explorer.hair));
}
hairBrowser.ontoggle=renderHairChoices;

setControls();draw();try{const testKey=key+':check';localStorage.setItem(testKey,'1');localStorage.removeItem(testKey);$('memory-status').textContent='Your explorer is remembered here when you make a choice.'}catch{$('memory-status').textContent='Browser storage is unavailable. Your explorer will last only in this open page.'}if(entry&&entry.photoBoothEnabled!==false)rasterPhoto();
window.MuseumExplorer={normalize,avatarSVG,sceneSVG};
})();
