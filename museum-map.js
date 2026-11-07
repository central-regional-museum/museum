// Shared geography for the student home map and the Journey galleries.
(function () {
  'use strict';
  const names = {
    africa: 'Africa', asia: 'Asia', europe: 'Europe', oceania: 'Australia &amp; Oceania',
    'north-america': 'North America', 'south-america': 'South America', 'new-jersey': 'New Jersey'
  };
var W=1000,H=378;
function proj(p,noWrap){ var lon=p[0],lat=p[1]; if(!noWrap && lon<-170) lon+=360; return [ (lon+170)/360*W, (80-lat)/136*H ]; }
function f(p){return p[0].toFixed(1)+" "+p[1].toFixed(1);}
function closedPath(pts){
  var P=pts.map(function(p){return proj(p);}),n=P.length,d="M"+f(P[0]);
  for(var i=0;i<n;i++){var p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
    d+=" C"+f([p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6])+" "+f([p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6])+" "+f(p2);}
  return d+"Z";
}
function openPath(pts,noWrap){
  var P=pts.map(function(p){return proj(p,noWrap);}),d="M"+f(P[0]);
  for(var i=0;i<P.length-1;i++){var p0=P[i-1]||P[i],p1=P[i],p2=P[i+1],p3=P[i+2]||p2;
    d+=" C"+f([p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6])+" "+f([p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6])+" "+f(p2);}
  return d;
}
var LAND={
 "africa":[[[-17,21],[-16,28],[-10,31],[-6,36],[10,37],[11,33],[20,31],[32,31],[34,28],[39,16],[43,12],[51,12],[48,4],[40,-3],[40,-11],[35,-20],[33,-27],[27,-34],[20,-35],[17,-29],[12,-17],[13,-6],[9,-1],[9,4],[4,6],[-4,5],[-8,4],[-13,8],[-17,14]],
   [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]]],
 "europe":[[[-9,37],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[8,57],[10,59],[5,62],[14,68],[25,71],[31,70],[40,67],[44,68],[60,69],[60,55],[55,50],[50,47],[48,42],[40,41],[29,41],[26,40],[23,37],[21,40],[19,42],[16,38],[12,44],[13,45],[9,44],[3,43],[-1,37],[-5,36]],
   [[-5,50],[1,51],[2,53],[-2,56],[-2,58],[-5,58],[-5,55],[-3,54],[-5,52]],[[-10,52],[-6,52],[-6,55],[-8,55]],[[-24,65],[-14,64],[-14,66],[-22,66]]],
 "asia":[[[60,69],[70,73],[80,73],[100,77],[115,74],[130,72],[140,72],[160,70],[180,69],[180,65],[170,60],[163,57],[156,51],[160,61],[150,59],[140,55],[135,44],[129,35],[126,37],[122,40],[121,31],[117,24],[108,21],[106,10],[100,14],[103,1],[98,8],[98,16],[94,17],[90,22],[86,20],[80,15],[77,8],[73,17],[70,22],[67,25],[62,25],[57,25],[59,22],[52,16],[43,13],[39,20],[35,28],[34,31],[36,36],[30,37],[26,39],[29,41],[40,41],[48,42],[50,47],[55,50],[60,55]],
   [[130,31],[136,34],[140,36],[142,40],[141,45],[143,44],[140,41],[136,37],[131,34]],
   [[95,5],[98,4],[106,-6],[104,-6],[96,2]],[[109,1],[113,-3],[117,-4],[118,1],[117,7],[111,2]],[[106,-6],[114,-7],[114,-8],[106,-7]],[[120,18],[122,14],[126,7],[122,7],[120,14]],[[80,10],[82,7],[80,6]]],
 "oceania":[[[114,-22],[122,-18],[126,-14],[132,-11],[136,-12],[137,-16],[141,-12],[143,-14],[146,-19],[153,-25],[153,-30],[150,-37],[146,-39],[140,-38],[135,-35],[131,-31],[124,-34],[115,-34],[113,-26]],
   [[131,-1],[141,-3],[150,-10],[143,-9],[138,-8],[132,-4]],[[172,-34],[178,-38],[175,-41],[172,-41]],[[172,-41],[174,-41],[171,-44],[167,-46],[168,-44]],[[145,-41],[148,-41],[147,-43]]],
 "north-america":[[[-168,66],[-162,70],[-150,71],[-140,70],[-128,70],[-115,68],[-100,68],[-95,72],[-85,70],[-80,63],[-90,57],[-93,60],[-95,58],[-82,55],[-78,52],[-79,58],[-74,60],[-65,60],[-60,55],[-56,52],[-66,45],[-70,43],[-70,41],[-74,40],[-76,35],[-81,31],[-80,26],[-82,27],[-85,30],[-89,30],[-94,29],[-97,26],[-98,21],[-96,19],[-90,21],[-87,21],[-88,16],[-83,15],[-83,10],[-78,9],[-80,7],[-86,11],[-92,14],[-96,16],[-105,20],[-110,24],[-112,30],[-115,30],[-110,23],[-117,32],[-121,35],[-124,40],[-124,46],[-123,49],[-130,55],[-135,58],[-145,60],[-152,59],[-158,57],[-163,55],[-158,59],[-164,60],[-166,62],[-163,64]],
   [[-73,78],[-60,82],[-30,83],[-20,80],[-20,73],[-25,70],[-40,65],[-43,60],[-50,64],[-55,70],[-67,76]],[[-85,22],[-80,23],[-75,20],[-78,20],[-84,21]]],
 "south-america":[[[-77,8],[-72,12],[-63,10],[-60,8],[-52,5],[-50,0],[-44,-2],[-35,-5],[-35,-9],[-39,-14],[-40,-22],[-48,-26],[-53,-33],[-58,-35],[-57,-38],[-62,-40],[-65,-45],[-68,-50],[-69,-53],[-68,-55],[-72,-53],[-75,-48],[-73,-40],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,-2],[-80,1],[-78,4]]]
};
var ROUTES=[
 {pts:[[36,5],[42,11],[47,15],[55,20],[60,24]]},
 {pts:[[60,24],[68,24],[76,12],[88,20],[98,12],[104,2],[115,-6],[125,-9],[132,-14],[138,-22]]},
 {pts:[[34,10],[32,22],[33,29],[35,33],[34,38],[28,40],[20,44],[10,47],[2,48]]},
 {pts:[[98,12],[106,22],[114,32],[120,38]]},
 {pts:[[120,38],[128,46],[140,54],[158,62],[176,65],[192,65]]},
 {pts:[[-172,65],[-160,62],[-150,60],[-136,55],[-125,46],[-117,37],[-106,33]],noWrap:true},
 {pts:[[-106,33],[-98,20],[-88,13],[-78,6],[-76,-5],[-72,-20],[-73,-41]],noWrap:true}
];
var DATES=[
 {at:[60,25],text:"70,000–60,000",dx:6,dy:-8},
 {at:[138,-22],text:"65,000–50,000",dx:-40,dy:24},
 {at:[2,48],text:"45,000",dx:-58,dy:-4},
 {at:[120,38],text:"40,000",dx:8,dy:16},
 {at:[-106,33],text:"21,000+",dx:-74,dy:2,noWrap:true},
 {at:[-73,-41],text:"14,500",dx:10,dy:4,noWrap:true}
];
var SITES=[
 {at:[-8,32],name:"Jebel Irhoud · 300,000",dx:-6,dy:-12,anchor:"middle"},
 {at:[36,5],name:"Omo Kibish · 230,000",dx:12,dy:18,anchor:"start"}
];
var LABELS={"africa":[18,6],"asia":[95,52],"europe":[18,54],"oceania":[133,-28],"north-america":[-103,52],"south-america":[-60,-14]};
function mapSVG(opts){
  opts=opts||{}; var target=opts.fromHome ? "journey.html" : ""; var hi=opts.highlight, out=[];
  out.push('<svg class="museum-map-svg" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Map of human migration out of Africa to every continent"><title>How people spread from Africa across the world</title>');
  Object.keys(LAND).forEach(function(gid){
    var shapes=LAND[gid].map(function(s){return '<path class="map-land'+(gid===hi?' hi':'')+'" d="'+closedPath(s)+'"/>';}).join("");
    out.push('<a class="map-link" href="'+target+'#'+gid+'" aria-label="'+names[gid]+' gallery">'+shapes+'</a>');
  });
  var travel=!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !opts.still;
  ROUTES.forEach(function(r,i){var d=openPath(r.pts,r.noWrap); out.push('<path class="route" d="'+d+'"/>');
    if(travel) out.push('<circle class="traveler" r="4.5"><animateMotion dur="'+(5+i%3)+'s" begin="'+(i*0.7)+'s" repeatCount="indefinite" path="'+d+'"/></circle>');});
  if(!opts.small){
    Object.keys(LABELS).forEach(function(gid){var p=proj(LABELS[gid]); out.push('<text class="mlabel place" x="'+p[0].toFixed(0)+'" y="'+p[1].toFixed(0)+'" text-anchor="middle">'+names[gid]+'</text>');});
    DATES.forEach(function(d){var p=proj(d.at,d.noWrap); out.push('<text class="mlabel date" x="'+(p[0]+d.dx).toFixed(0)+'" y="'+(p[1]+d.dy).toFixed(0)+'">'+d.text+'</text>');});
  }
  SITES.forEach(function(s){var p=proj(s.at); out.push('<circle class="site" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="6"/>');
    if(!opts.small) out.push('<text class="mlabel" x="'+(p[0]+s.dx).toFixed(0)+'" y="'+(p[1]+s.dy).toFixed(0)+'" text-anchor="'+s.anchor+'">'+s.name+'</text>');});
  var nj=proj([-74.4,40.1]);
  out.push('<a class="map-link" href="'+target+'#new-jersey" aria-label="New Jersey gallery"><circle cx="'+nj[0].toFixed(1)+'" cy="'+nj[1].toFixed(1)+'" r="9" fill="var(--ink)"/><circle cx="'+nj[0].toFixed(1)+'" cy="'+nj[1].toFixed(1)+'" r="3.5" fill="var(--sea)"/>'+(opts.small?'':'<text class="mlabel" x="'+(nj[0]+14).toFixed(0)+'" y="'+(nj[1]+5).toFixed(0)+'" style="font-weight:500">New Jersey · our wing</text>')+'</a>');
  out.push('</svg>');
  return out.join("");
}

  window.MuseumMap = { render: mapSVG, land: LAND, project: proj, point: f, names };
})();
