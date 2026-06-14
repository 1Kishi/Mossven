// Client-side behaviour: CZ/EN toggle, light/dark theme, the Mossline root
// drawing, the daylight-dust / firefly canvas, scroll reveals and the form.
import { translations } from "../i18n/translations";

const I18N: Record<string, Record<string, string>> = translations;

function setLang(lang){
  const dict=I18N[lang];
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(dict[k]!=null)el.textContent=dict[k];});
  document.querySelectorAll('.price.feat').forEach(el=>{
    if(el.closest('#ceny')&&dict['pkg.badge'])el.setAttribute('data-badge',dict['pkg.badge']);
    if(el.closest('#pece')&&dict['mc.badge'])el.setAttribute('data-badge',dict['mc.badge']);
  });
  document.querySelectorAll('#lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  try{localStorage.setItem('mv-lang',lang);}catch(e){}
}
document.querySelectorAll('#lang button').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));

const sunSVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>';
const moonSVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const themeBtn=document.getElementById('theme');
function setTheme(t){document.documentElement.setAttribute('data-theme',t);themeBtn.innerHTML=(t==='dark')?sunSVG:moonSVG;try{localStorage.setItem('mv-theme',t);}catch(e){}}
themeBtn.addEventListener('click',()=>{setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');drawRoots();});

(function(){let lang='cs',theme='light';try{lang=localStorage.getItem('mv-lang')||'cs';theme=localStorage.getItem('mv-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');}catch(e){}setLang(lang);setTheme(theme);})();
document.getElementById('yr').textContent=new Date().getFullYear();

const head=document.getElementById('head');
addEventListener('scroll',()=>head.classList.toggle('scrolled',scrollY>20));
document.getElementById('menu').addEventListener('click',()=>{location.hash='#kontakt';});

const svg=document.getElementById('root-svg'),mossline=document.getElementById('mossline');
function drawRoots(){
  if(!svg||!mossline)return;
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const r=mossline.getBoundingClientRect(),W=r.width,H=r.height;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const nodes=[...mossline.querySelectorAll('.node')];
  const pts=nodes.map(n=>{const b=n.getBoundingClientRect();return{x:b.left-r.left+b.width/2,y:b.top-r.top+b.height/2};});
  let d='';
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const mx=(a.x+b.x)/2,cy=(a.y+b.y)/2+(i%2?34:-30);d+=`<path class="root-path${i%2?' bright':''}" d="M${a.x} ${a.y} Q ${mx} ${cy} ${b.x} ${b.y}"/>`;}
  if(pts.length>2){const t=pts[1];d+=`<path class="root-path" d="M${t.x} ${t.y} q -40 30 -70 24"/>`;const t2=pts[pts.length-2];d+=`<path class="root-path bright" d="M${t2.x} ${t2.y} q 40 26 72 18"/>`;}
  svg.innerHTML=d;
  svg.querySelectorAll('.root-path').forEach(p=>{const len=p.getTotalLength();p.style.setProperty('--len',len);if(reduce)p.style.strokeDashoffset=0;});
  requestAnimationFrame(()=>mossline.classList.add('revealed'));
}
addEventListener('load',drawRoots);
let rt;addEventListener('resize',()=>{clearTimeout(rt);mossline.classList.remove('revealed');rt=setTimeout(drawRoots,180);});

const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

document.getElementById('cform').addEventListener('submit',e=>{
  e.preventDefault();const f=e.target;if(!f.checkValidity()){f.reportValidity();return;}
  const ok=document.getElementById('ok');ok.classList.add('show');ok.scrollIntoView({behavior:'smooth',block:'center'});
  f.querySelectorAll('input,textarea,select').forEach(el=>{if(el.type!=='radio'&&el.type!=='checkbox')el.value='';});
});

(function(){
  const c=document.getElementById('fly'),x=c.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let flies=[],W,H,raf;
  function size(){W=c.width=innerWidth;H=c.height=innerHeight;}
  function make(){const n=Math.min(26,Math.round(innerWidth/56));flies=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.7,a:Math.random()*Math.PI*2,sp:Math.random()*.18+.05,ph:Math.random()*Math.PI*2,ps:Math.random()*.018+.006}));}
  function tick(){x.clearRect(0,0,W,H);const dark=document.documentElement.getAttribute('data-theme')==='dark';for(const f of flies){f.a+=(Math.random()-.5)*.25;f.ph+=f.ps;const sp=dark?f.sp:f.sp*.55;f.x+=Math.cos(f.a)*sp;f.y+=Math.sin(f.a)*sp*.7;if(f.x<-10)f.x=W+10;if(f.x>W+10)f.x=-10;if(f.y<-10)f.y=H+10;if(f.y>H+10)f.y=-10;const tw=(Math.sin(f.ph)+1)/2;if(dark){const al=.12+tw*.5,R=f.r*6;const g=x.createRadialGradient(f.x,f.y,0,f.x,f.y,R);g.addColorStop(0,`rgba(246,217,138,${al})`);g.addColorStop(1,'rgba(246,217,138,0)');x.fillStyle=g;x.beginPath();x.arc(f.x,f.y,R,0,Math.PI*2);x.fill();x.fillStyle=`rgba(255,240,200,${al})`;x.beginPath();x.arc(f.x,f.y,f.r,0,Math.PI*2);x.fill();}else{const al=.05+tw*.15,R=f.r*4.6;const g=x.createRadialGradient(f.x,f.y,0,f.x,f.y,R);g.addColorStop(0,`rgba(150,170,108,${al})`);g.addColorStop(1,'rgba(150,170,108,0)');x.fillStyle=g;x.beginPath();x.arc(f.x,f.y,R,0,Math.PI*2);x.fill();x.fillStyle=`rgba(250,252,244,${al*1.1})`;x.beginPath();x.arc(f.x,f.y,f.r*.8,0,Math.PI*2);x.fill();}}raf=requestAnimationFrame(tick);}
  function start(){if(reduce)return;size();make();cancelAnimationFrame(raf);tick();}
  addEventListener('resize',()=>{size();make();});start();
})();
