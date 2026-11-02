(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const BPS={d:{n:'데스크톱',w:1920,h:1080},t:{n:'태블릿',w:768,h:1024},m:{n:'모바일',w:375,h:812}};
const FONTS=[['Noto Sans KR','Noto+Sans+KR:wght@400;500;700'],['Noto Serif KR','Noto+Serif+KR:wght@400;700'],['Gowun Dodum','Gowun+Dodum'],['Jua','Jua'],['Do Hyeon','Do+Hyeon'],['Black Han Sans','Black+Han+Sans'],['Nanum Pen Script','Nanum+Pen+Script'],['Gaegu','Gaegu:wght@400;700'],['Inter','Inter:wght@400;600;800'],['Playfair Display','Playfair+Display:wght@400;700'],['Space Grotesk','Space+Grotesk:wght@400;700'],['JetBrains Mono','JetBrains+Mono:wght@400;700'],['Great Vibes','Great+Vibes'],['Cormorant Garamond','Cormorant+Garamond:wght@400;600'],['Italiana','Italiana']];
const FAM=n=>"'"+n+"',"+(/Serif|Playfair|Cormorant|Italiana/.test(n)?'serif':/Mono/.test(n)?'monospace':/Vibes/.test(n)?'cursive':'sans-serif');
const PH='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e5e7eb"/><path d="M110 220l65-78 45 50 30-34 55 62z" fill="#c9ced8"/><circle cx="160" cy="105" r="24" fill="#c9ced8"/></svg>');
const LOOPS=new Set(['float','pulse','rotate','blink']);
const FXL=[['lift','떠오르기','translate:0 -6px;box-shadow:0 12px 28px rgba(0,0,0,.2)'],['grow','커지기','scale:1.06'],['shrink','작아지기','scale:.95'],['tilt','기울이기','rotate:-3deg'],['bright','밝게','filter:brightness(1.15)'],['fade','흐리게','opacity:.6'],['glow','글로우','box-shadow:0 0 0 4px rgba(91,91,240,.25),0 8px 30px rgba(91,91,240,.5)'],['invert','색 반전','filter:invert(1)'],['wiggle','흔들기','animation:wig .6s']];
const ANL=[['fade','페이드 인'],['up','아래에서'],['down','위에서'],['left','왼쪽에서'],['right','오른쪽에서'],['zoom','줌 인'],['spin','회전 등장'],['float','둥둥'],['pulse','맥박'],['rotate','회전'],['blink','깜빡']];

/* ---------- element types ---------- */
const T={
 root:{label:'페이지',ic:'📄',cont:true,tag:'div',d:{'font-family':FAM('Noto Sans KR'),color:'#1c1c22','background-color':'#ffffff','font-size':'16px','line-height':'1.6'}},
 section:{label:'섹션',ic:'▭',cont:true,tag:'section',d:{display:'flex','flex-direction':'column','align-items':'center',padding:'64px 24px',width:'100%'},m:{padding:'40px 16px'}},
 container:{label:'컨테이너',ic:'⬚',cont:true,tag:'div',d:{display:'flex','flex-direction':'column',gap:'16px',width:'100%','max-width':'960px'}},
 box:{label:'박스',ic:'☐',cont:true,tag:'div',d:{display:'flex','flex-direction':'column',gap:'12px',padding:'16px'}},
 stack:{label:'퀵 스택',ic:'▥',cont:true,tag:'div',d:{display:'grid','grid-template-columns':'repeat(2,1fr)',gap:'16px'},m:{'grid-template-columns':'1fr'}},
 heading:{label:'제목',ic:'H',text:true,tag:'h2',d:{margin:'0','font-size':'40px','font-weight':'700','line-height':'1.2'},m:{'font-size':'30px'}},
 text:{label:'문단',ic:'¶',text:true,tag:'p',d:{margin:'0','font-size':'17px','line-height':'1.7'}},
 link:{label:'텍스트 링크',ic:'🔗',text:true,tag:'a',d:{color:'#4f46e5','text-decoration':'underline',width:'fit-content'}},
 button:{label:'버튼',ic:'▣',text:true,tag:'a',d:{display:'inline-block',width:'fit-content',padding:'12px 24px','background-color':'#111111',color:'#ffffff','border-radius':'10px','text-decoration':'none','font-weight':'600','text-align':'center'}},
 image:{label:'이미지',ic:'🖼',tag:'img',d:{display:'block',width:'100%',height:'auto','max-width':'100%'}},
 divider:{label:'구분선',ic:'―',tag:'hr',d:{width:'100%',margin:'0','border-style':'solid','border-width':'1px 0 0 0','border-color':'#d9d9e0'}},
 spacer:{label:'여백',ic:'↕',tag:'div',d:{height:'40px',width:'100%'}},
 youtube:{label:'유튜브',ic:'▶',tag:'div',d:{width:'100%','aspect-ratio':'16/9',overflow:'hidden','border-radius':'12px'}},
 video:{label:'비디오',ic:'🎬',tag:'video',d:{width:'100%','border-radius':'12px',display:'block'}},
 embed:{label:'코드 임베드',ic:'</>',tag:'div',d:{width:'100%'}},
 board:{label:'게시판',ic:'📋',cont:true,tag:'section',d:{width:'100%','max-width':'720px'}},
 form:{label:'폼',ic:'✉',tag:'form',d:{display:'flex','flex-direction':'column',gap:'10px',width:'100%','max-width':'480px'}}
};
T.image.d['border-width']='0';
T.slot={label:'슬롯',ic:'⬒',cont:true,tag:'div',d:{display:'flex','flex-direction':'column',gap:'12px','min-height':'60px'}};
T.inst={label:'컴포넌트',ic:'◆',tag:'div',d:{}};
const TXT=new Set(['heading','text','link','button']);

/* ---------- state ---------- */
let doc=null,hist=[],hp=-1,drag=null,ASSETS={},X=null;
const S={sel:null,bp:'d',st:'b',zm:0,z:1,lp:'add',rp:'style',pv:false,tabs:{},col:new Set(),sheet:null,sec:{layout:1,size:1,space:1,pos:1,typo:1,bg:0,bd:0,vis:0}};
const uid=()=>'n'+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
let RC=null,GH=null;
const SAMPLEP=[{title:'첫 번째 글 제목',date:'2026. 11. 2.',body:'글 내용이 여기에 보여요.\n줄바꿈도 그대로예요.',num:'3',cat:'공지'},{title:'두 번째 글',date:'2026. 11. 1.',body:'다른 글의 내용이에요.',num:'2',cat:'일상'},{title:'세 번째 글',date:'2026. 10. 30.',body:'세 번째 글 내용이에요.',num:'1',cat:'공지'}];
function bv(n,ex){const g=GH||(!ex&&doc.pages&&doc.pages[doc.cur]&&doc.pages[doc.cur].kind==='post'?SAMPLEP[0]:null);if(g&&!n.bind&&n.text&&n.text.indexOf('{{')>=0){const M={'제목':g.title,'날짜':g.date,'본문':g.body,'번호':g.num,'카테고리':g.cat};return n.text.replace(/\{\{\s*([^}]+?)\s*\}\}/g,(m,k)=>M[k]!=null?M[k]:m)}return g&&n.bind&&g[n.bind]!=null?g[n.bind]:n.text}
function boardOf(id){let r=null;const w=(n,b)=>{if(n.id===id){r=b;return true}const nb=n.t==='board'?n:b;for(const c of n.c)if(w(c,nb))return true;return false};w(doc.root,null);return r}
function hasSlot(n){const c=doc.comps&&doc.comps[n.comp];let f=false;if(c)walk(c.node,x=>{if(x.t==='slot')f=true});return f}
const isCont=n=>n.t==='inst'?hasSlot(n):!!T[n.t].cont;
const pageRoot=()=>doc.main||doc.root;
function syncComp(){if(doc.main&&doc.comps&&doc.comps[doc.compEditing])doc.comps[doc.compEditing].node=doc.root.c[0]}
const narrow=()=>matchMedia('(max-width:860px)').matches;

function expand(o){const r={};for(const k in o){const v=o[k];if((k==='padding'||k==='margin')&&typeof v==='string'){const a=v.trim().split(/\s+/);const t=a[0],rr=a[1]||t,b=a[2]||t,l=a[3]||rr;r[k+'-top']=t;r[k+'-right']=rr;r[k+'-bottom']=b;r[k+'-left']=l}else if(k==='border-width'&&typeof v==='string'&&/\s/.test(v)){const a=v.trim().split(/\s+/);const t=a[0],rr=a[1]||t,b=a[2]||t,l=a[3]||rr;r['border-top-width']=t;r['border-right-width']=rr;r['border-bottom-width']=b;r['border-left-width']=l}else r[k]=v}return r}
const PROPS=['hs','tr','trd','ck','comp','text','href','src','alt','code','url','fx','an','cls','eid','name','free','blank','fields','btn','action','ad','ads','autoplay','loop','muted','controls','board','bview','blimit','bsrc','bnotion','bdp','bdk','bind','blay','bgap','bdetail'];
function mk(t,o,c){o=o||{};const D=T[t];doc.cnt[t]=(doc.cnt[t]||0)+1;
 const n={id:uid(),k:t+'-'+doc.cnt[t],t:t,tag:o.tag||D.tag,s:{d:expand(Object.assign({},D.d,o.d||{})),t:expand(Object.assign({},D.t||{},o.t||{})),m:expand(Object.assign({},D.m||{},o.m||{})),o:expand(Object.assign({},D.o||{},o.o||{}))},c:c||[]};
 PROPS.forEach(k=>{if(o[k]!=null)n[k]=o[k]});
 if(t==='form'){if(n.fields==null)n.fields='이름|text\n이메일|email\n메시지|textarea';if(n.btn==null)n.btn='보내기'}
 if(t==='video'&&n.controls==null)n.controls=true;
 if(t==='board'){if(n.board==null)n.board='notice';if(n.bview==null)n.bview='box';if(n.blimit==null)n.blimit=10}
 return n}
function adopt(){const p=doc.pages[doc.cur];p.root=doc.main||doc.root}
function ser(){const p=doc.pages&&doc.pages[doc.cur];if(!p)return JSON.stringify(doc);const r=p.root;p.root=null;try{return JSON.stringify(doc)}finally{p.root=r}}
function allRoots(){return doc.pages.map((p,i)=>i===doc.cur?pageRoot():p.root)}
function normDoc(){
 if(!doc.pages||!doc.pages.length){doc.pages=[{id:uid(),name:'홈',slug:'index',title:'',desc:'',root:null}];doc.cur=0}
 if(!(doc.cur>=0&&doc.cur<doc.pages.length))doc.cur=0;
 doc.pages[0].slug='index';adopt();
 const f=n=>{if(!n.s.o)n.s.o={}};doc.pages.forEach(p=>walk(p.root,f));walk(doc.root,f);if(doc.main)walk(doc.main,f);Object.keys(doc.comps||{}).forEach(c=>walk(doc.comps[c].node,f))}
function parentAny(id){let r=null;const f=n=>{n.c.forEach(c=>{if(c.id===id)r=n;f(c)})};[doc.root].concat(doc.main?[doc.main]:[]).concat(doc.pages.map(p=>p.root).filter(Boolean)).concat(Object.keys(doc.comps||{}).map(c=>doc.comps[c].node)).forEach(f);return r}
function activeIdx(par,ex){return (!ex&&S.tabs[par.id]!=null)?S.tabs[par.id]:(parseInt(par.tab,10)||0)}
function isActivePanel(tg,pp,ex){return !!(pp&&pp.tabs&&pp.c.indexOf(tg)===activeIdx(pp,ex))}
function revealPath(id){let ch=false;const path=[];(function w(n,a){if(n.id===id){path.push.apply(path,a);return true}for(const c of n.c){if(w(c,a.concat([[n,c]])))return true}return false})(doc.root,[]);
 path.forEach(pr=>{const par=pr[0];if(par.tabs){const i=par.c.indexOf(pr[1]);if(activeIdx(par)!==i){S.tabs[par.id]=i;ch=true}}});return ch}
function hrefOf(h,ex){h=h||'#';if(h.indexOf('page:')!==0)return h;const i=doc.pages.findIndex(p=>p.id===h.slice(5));if(i<0)return '#';return ex?(i===0?'index.html':doc.pages[i].slug+'.html'):'#'}
function findAny(id){const f=find(id);if(f)return f.n;let r=null;Object.keys(doc.comps||{}).forEach(c=>walk(doc.comps[c].node,x=>{if(x.id===id)r=x}));if(!r&&doc.main)walk(doc.main,x=>{if(x.id===id)r=x});if(!r&&doc.pages)doc.pages.forEach(p=>{if(p.root&&!r)walk(p.root,x=>{if(x.id===id)r=x})});return r}
function blank(title){doc={title:title||'내 홈페이지',css:'',cnt:{},comps:{}};doc.root=mk('root');doc.pages=[{id:uid(),name:'홈',slug:'index',title:'',desc:'',root:doc.root}];doc.cur=0;return doc}
function walk(n,f,p){f(n,p||null);n.c.forEach(c=>walk(c,f,n))}
function find(id,n,p){n=n||doc.root;if(n.id===id)return{n:n,p:p||null};for(const c of n.c){const r=find(id,c,n);if(r)return r}return null}
function cloneNode(n){const c=JSON.parse(JSON.stringify(n));(function re(x){x.id=uid();doc.cnt[x.t]=(doc.cnt[x.t]||0)+1;x.k=x.t+'-'+doc.cnt[x.t];x.c.forEach(re)})(c);return c}
const nodeEl=id=>$('#sc [data-id="'+id+'"]');
const lab=n=>n.name||T[n.t].label;
const cleanCls=s=>String(s||'').replace(/[^\w\- 가-힣]/g,'').replace(/\s+/g,' ').trim();
const cleanId=s=>String(s||'').replace(/[^\w\-가-힣]/g,'');
const rs=src=>!src?'':src.indexOf('asset:')===0?(ASSETS[src.slice(6)]||''):src;
const txt=s=>E(s).replace(/\n/g,'<br>');
const ytId=u=>{const m=/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(u||'');return m?m[1]:''};

/* ---------- html rendering ---------- */
function instHTML(n,ex,pn){const c=doc.comps&&doc.comps[n.comp];
 if(!c)return '<div class="'+n.k+(ex?'':' cn ec')+'"'+(ex?'':' data-id="'+n.id+'"')+'></div>';
 const sv=RC;RC={inst:n,master:c.node};const h=nodeHTML(c.node,ex,pn);RC=sv;return h}
function nodeHTML(n,ex,pn){
 if(n.t==='inst')return instHTML(n,ex,pn);
 const D=T[n.t];const cls=[n.k];if(RC&&n===RC.master)cls.push(RC.inst.k);if(n.cls)cls.push(n.cls);
 if(n.fx)cls.push('fx','fx-'+n.fx);
 if(n.an){cls.push('an','an-'+n.an);if(!LOOPS.has(n.an))cls.push('ae')}
 const cont=isCont(n);
 if(!ex){if(cont){cls.push('cn');if(n.t==='slot'&&!RC)cls.push('slt');if(n.t==='slot'&&RC?!(RC.inst.c.length||n.c.length):(!n.c.length&&n.t!=='board'))cls.push('ec');if(n.free)cls.push('free')}}
 const stl=n.an&&(n.ad||n.ads)?' style="'+(n.ad?'--ad:'+n.ad+'s;':'')+(n.ads?'--ads:'+n.ads+'s;':'')+'"':'';
 const tag0=n.tag||D.tag;let ck='';
 if(n.ck&&n.ck.a){const tg=n.ck.to&&n.ck.to!=='self'?(findAny(n.ck.to)||n):n;const anc=tag0==='a'||tag0==='button'||n.t==='link'||n.t==='button';
  if(n.ck.a==='show'){const pp=parentAny(tg.id);ck=' data-ck="show" data-to=".'+tg.k+'"'+(pp?' data-grp=".'+pp.k+'"':'')+' role="tab" aria-selected="'+(isActivePanel(tg,pp,ex)?'true':'false')+'"'+(anc?'':' tabindex="0"');if(isActivePanel(tg,pp,ex))cls.push('open')}
  else ck=' data-ck="'+n.ck.a+'" data-to=".'+tg.k+'"'+(anc?'':' role="button" tabindex="0"')}
 const hpg=n.href&&n.href.indexOf('page:')===0?(ex?(X&&X.cur===n.href.slice(5)?' aria-current="page"':''):' data-page="'+E(n.href.slice(5))+'"'):'';
 const at=' class="'+E(cls.join(' '))+'"'+(n.eid?' id="'+E(n.eid)+'"':'')+(ex||GH?'':(RC?(n===RC.master?' data-id="'+RC.inst.id+'"':''):' data-id="'+n.id+'"'))+(n.bind?' data-bind="'+E(n.bind)+'"':'')+(ex&&!n.bind&&n.text&&n.text.indexOf('{{')>=0&&(n.t==='text'||n.t==='heading'||n.t==='link'||n.t==='button')?' data-tx="'+E(n.text)+'"':'')+ck+hpg+(pn?' data-panel role="tabpanel"'+(pn.h?' hidden':''):'')+(n.hs&&n.hs.wheel?' data-wheel="1"':'')+stl;
 const kids=n.t==='slot'?'':n.c.map((c,i)=>nodeHTML(c,ex,n.tabs?{h:i!==activeIdx(n,ex)}:null)).join('');
 const tag=n.tag||D.tag;
 switch(n.t){
  case 'slot':{const src=RC&&RC.inst.c.length?RC.inst.c:n.c;const sv=RC;const iid=RC?RC.inst.id:'';RC=null;const k2=src.map(c=>nodeHTML(c,ex)).join('');RC=sv;
   return '<'+tag+at+(ex||!iid?'':' data-slot="'+iid+'"')+'>'+k2+'</'+tag+'>'}
  case 'section':case 'container':case 'box':case 'stack':
   return '<'+tag+at+(tag==='a'?' href="'+E(hrefOf(n.href,ex))+'"'+(n.blank?' target="_blank" rel="noopener"':''):'')+'>'+kids+'</'+tag+'>';
  case 'heading':case 'text':return '<'+tag+at+'>'+txt(bv(n,ex))+'</'+tag+'>';
  case 'link':case 'button':return '<a'+at+' href="'+E(hrefOf(n.href,ex))+'"'+(n.blank?' target="_blank" rel="noopener"':'')+'>'+txt(bv(n,ex))+'</a>';
  case 'image':{let src=rs(n.src)||PH,x2='';
   if(ex){const first=X&&!X.firstDone&&!n.bind;
    if(X&&n.src&&n.src.indexOf('asset:')===0){const inf=X.img(n.src.slice(6));if(inf){src=inf.main;if(inf.w)x2+=' width="'+inf.w+'" height="'+inf.h+'"';if(inf.srcset)x2+=' srcset="'+E(inf.srcset)+'" sizes="100vw"'}}
    if(X){x2+=first?' fetchpriority="high" decoding="async"':' loading="lazy" decoding="async"';if(!n.bind)X.firstDone=true}else x2+=' loading="lazy"'}
   return '<img'+at+' src="'+E(src)+'" alt="'+E(n.alt||'')+'"'+x2+'>'}
  case 'divider':return '<hr'+at+'>';
  case 'spacer':return '<div'+at+'></div>';
  case 'youtube':{const id=ytId(n.url);
   if(ex)return '<div'+at+'>'+(id?'<iframe src="https://www.youtube.com/embed/'+id+'" title="YouTube" style="width:100%;height:100%;border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>':'')+'</div>';
   return '<div'+at+'><div class="ph"><span style="font-size:30px">▶</span>'+(id?'YouTube · '+E(id)+'<small>(내보낸 페이지에서 재생돼요)</small>':'YouTube 주소를 설정에서 입력하세요')+'</div></div>'}
  case 'video':{const s=rs(n.src);
   if(!s&&!ex)return '<div'+at+'><div class="ph"><span style="font-size:30px">🎬</span>비디오 주소(mp4)를 설정에서 입력하세요</div></div>';
   return '<video'+at+' src="'+E(s)+'"'+(n.controls?' controls':'')+(n.autoplay?' autoplay':'')+(n.loop?' loop':'')+(n.muted||n.autoplay?' muted':'')+' playsinline></video>'}
  case 'embed':
   if(ex)return '<div'+at+'>'+(n.code||'')+'</div>';
   return '<div'+at+'><div class="ph"><span style="font-size:22px">&lt;/&gt;</span>코드 임베드<pre>'+E((n.code||'').slice(0,160))+'</pre></div></div>';
  case 'board':{const cu=n.c.length>0,vw=cu?'custom':(n.bview||'box');
   const attrs=' data-board="'+E(n.board||'notice')+'" data-view="'+E(vw)+'"'+(n.bsrc&&n.bsrc!=='supabase'?' data-src="'+E(n.bsrc)+'"':'')+(cu?' data-lay="'+E(n.blay||'col')+'"':'')+(ex&&n.bdetail&&doc.pages.some(q=>q.id===n.bdetail&&q.kind==='post')?' data-detail="'+E(doc.pages.find(q=>q.id===n.bdetail).slug)+'.html"':'')+' data-limit="'+(parseInt(n.blimit,10)||10)+'"'+(ex?' aria-label="'+E(n.name||n.board||'게시판')+'"':'');
   let inner;
   if(ex)inner='<ul class="bd-list" aria-live="polite"><li class="bd-msg">불러오는 중…</li></ul>'+(cu?'<template class="bd-tpl">'+kids+'</template>':'');
   else if(cu){let g='';[0,1].forEach(i=>{GH=SAMPLEP[i];g+='<li class="bd-item bd-ghost">'+n.c.map(c=>nodeHTML(c,false)).join('')+'</li>';GH=null});
    inner='<ul class="bd-list"><li class="bd-item">'+kids+'</li>'+g+'</ul><p class="bd-note">게시판 "'+E(n.board)+'" · 카드 직접 디자인 · 첫 카드만 편집하고, 나머지는 미리보기예요</p>'}
   else inner=sampleBoard(n);
   return '<'+tag+at+attrs+'>'+inner+'</'+tag+'>'}
  case 'form':{
   const fs=(n.fields||'').split('\n').filter(Boolean).map(l=>{const p=l.split('|');const lb=E(p[0].trim());const ty=(p[1]||'text').trim();
    return ty==='textarea'?'<textarea name="'+lb+'" placeholder="'+lb+'" rows="4"></textarea>':'<input type="'+E(ty)+'" name="'+lb+'" placeholder="'+lb+'">'}).join('');
   return '<form'+at+' action="'+E(n.action||'')+'" method="post">'+fs+'<button type="submit">'+E(n.btn||'보내기')+'</button></form>'}
 }
 return '<div'+at+'>'+kids+'</div>'}

/* ---------- css generation ---------- */
function decl(s,edit){let o='';for(const k in s){let v=s[k];if(v===''||v==null)continue;v=String(v).replace(/asset:(\w+)/g,(m,i)=>X?X.css(i):(ASSETS[i]||''));if(edit&&k==='opacity'&&parseFloat(v)<0.25)v='0.25';o+=k+':'+v+';'}return o}
function resetCSS(ex){const P=ex?'':'.pg ',R=ex?'body':'.pg';
 return P+'*,'+P+'*::before,'+P+'*::after{box-sizing:border-box}\n'+R+'{margin:0;-webkit-text-size-adjust:100%}\n'+P+'img,'+P+'video,'+P+'iframe{max-width:100%}\n'+P+'img{height:auto}\n'+P+'[hidden]{display:none!important}\n'+P+'a{color:inherit}\n'+P+'form input,'+P+'form textarea{width:100%;padding:12px 14px;border:1px solid #cfd0d8;border-radius:10px;font:inherit;background:#fff;color:#111}\n'+P+'form button{padding:12px 20px;border:0;border-radius:10px;background:#111;color:#fff;font:inherit;font-weight:600;cursor:pointer}\n'+P+'[data-ck]{cursor:pointer}\n'}
const KF={fade:'@keyframes a-fade{from{opacity:0}}',up:'@keyframes a-up{from{opacity:0;translate:0 32px}}',down:'@keyframes a-down{from{opacity:0;translate:0 -32px}}',left:'@keyframes a-left{from{opacity:0;translate:-40px 0}}',right:'@keyframes a-right{from{opacity:0;translate:40px 0}}',zoom:'@keyframes a-zoom{from{opacity:0;scale:.8}}',spin:'@keyframes a-spin{from{opacity:0;rotate:-120deg;scale:.6}}',float:'@keyframes a-float{to{translate:0 -12px}}',pulse:'@keyframes a-pulse{to{scale:1.06}}',rotate:'@keyframes a-rotate{to{rotate:360deg}}',blink:'@keyframes a-blink{50%{opacity:.3}}'};
function fxCSS(ex,used){
 const pv=ex?'':'.pg.pvm ',sm=ex?'':'.pg ';const uf=n=>!used||used.fx.has(n),ua=n=>!used||used.an.has(n);
 const anyFx=!used||used.fx.size>0,anyAn=!used||used.an.size>0;
 let o='';
 if(anyFx)o+='.fx{transition:translate .25s,scale .25s,rotate .25s,filter .25s,box-shadow .25s,background-color .25s,color .25s,opacity .25s,border-color .25s}\n';
 FXL.forEach(f=>{if(uf(f[0]))o+=pv+'.fx-'+f[0]+':hover,'+sm+'.fx-'+f[0]+'.sim{'+f[2]+'}\n'});
 if(uf('wiggle'))o+='@keyframes wig{0%,100%{rotate:0deg}25%{rotate:-4deg}75%{rotate:4deg}}\n';
 if(anyAn){
  o+='.an{animation-duration:var(--ad,.7s);animation-delay:var(--ads,0s);animation-fill-mode:backwards;animation-timing-function:ease}\n';
  ANL.forEach(a=>{if(ua(a[0]))o+='.an-'+a[0]+'{animation-name:a-'+a[0]+'}\n'});
  if(ua('float')||ua('pulse')||ua('blink'))o+='.an-float,.an-pulse,.an-blink{animation-iteration-count:infinite;animation-duration:var(--ad,2s)}\n.an-float,.an-pulse{animation-direction:alternate;animation-timing-function:ease-in-out}\n';
  if(ua('rotate'))o+='.an-rotate{animation-iteration-count:infinite;animation-timing-function:linear;animation-duration:var(--ad,8s)}\n';
  ANL.forEach(a=>{if(ua(a[0]))o+=KF[a[0]]+'\n'});
  if(!used||ANL.some(a=>!LOOPS.has(a[0])&&ua(a[0])))o+='.ae:not(.in){animation-play-state:paused}\n'}
 if(!ex)o+='.pg:not(.pvm) .an:not(.sim){animation:none}\n.pg .an.ae.sim{animation-play-state:running}\n';
 if(ex&&used&&(anyFx||anyAn))o+='@media (prefers-reduced-motion:reduce){.fx,.an{transition:none!important;animation:none!important}}\n';
 return o}
function collectUsed(roots){const u={fx:new Set(),an:new Set(),board:false};const f=n=>{if(n.t==='board')u.board=true;if(n.fx)u.fx.add(n.fx);if(n.an)u.an.add(n.an)};roots.forEach(r=>walk(r,f));Object.keys(doc.comps||{}).forEach(c=>walk(doc.comps[c].node,f));return u}
function buildCSS(ex,roots,used,nocustom){
 const R={d:'',t:'',m:''};let RO='';
 const rts=roots||(ex?[pageRoot()]:[doc.root]);if(ex)syncComp();
 const one=(n,p)=>{const root=rts.indexOf(n)>=0;
  ['d','t','m'].forEach(b=>{let d=decl(n.s[b],!ex&&!S.pv);
   if(b==='d'){let pre='';if(n.free)pre+='position:relative;';if(p&&p.free)pre+='position:absolute;';if(n.hs)pre+='overflow-x:auto;overflow-y:hidden;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;'+(n.hs.snap?'scroll-snap-type:x mandatory;':'')+(n.hs.hide?'scrollbar-width:none;':'');d=pre+d}
   if(b==='d'&&n.tr)d+='transition:all '+n.tr+'s ease '+(n.trd||0)+'s;';
   if(!d)return;const bc=b==='t'?'.bt':b==='m'?'.bm':'';
   const sel=root?(ex?'body.'+n.k:'.pg'+bc):(ex?'.'+n.k:'.pg'+bc+' .'+n.k);
   R[b]+=sel+'{'+d+'}\n'});
  if(n.t==='board'&&n.bgap!=null&&n.bgap!==''){R.d+=(ex?'.':'.pg .')+n.k+' .bd-list{gap:'+(parseInt(n.bgap,10)||0)+'px}\n'}
  if(n.hs){const bs=ex?'.'+n.k:'.pg .'+n.k;R.d+=bs+'>*{flex-shrink:0'+(n.hs.snap?';scroll-snap-align:center':'')+'}\n'+(n.hs.hide?bs+'::-webkit-scrollbar{display:none}\n':'')}
  if(!root){const so=decl(n.s.o||{},!ex&&!S.pv);if(so)RO+=(ex?'.'+n.k+'.open,.open .'+n.k:'.pg .'+n.k+'.open,.pg .open .'+n.k+',.pg.open .'+n.k)+'{'+so+'}\n'}};
 Object.keys(doc.comps||{}).forEach(cid=>{if(ex||cid!==doc.compEditing)walk(doc.comps[cid].node,one)});
 rts.forEach(r=>walk(r,one));
 let o=resetCSS(ex)+fxCSS(ex,used)+((!used||used.board)?boardCSS(ex):'')+R.d;
 if(ex){if(R.t)o+='@media (max-width:991px){\n'+R.t+'}\n';if(R.m)o+='@media (max-width:479px){\n'+R.m+'}\n';o+=RO;if(!nocustom&&doc.css&&doc.css.trim())o+='\n/* 사용자 CSS */\n'+doc.css+'\n'}
 else o+=R.t+R.m+RO;
 return o}
function fontsUsed(roots){const set=new Set();const fu=n=>{['d','t','m'].forEach(b=>{const f=n.s[b]['font-family'];if(f)FONTS.forEach(x=>{if(f.indexOf("'"+x[0]+"'")>=0)set.add(x[1])})})};syncComp();(roots||[pageRoot()]).forEach(r=>walk(r,fu));Object.keys(doc.comps||{}).forEach(c=>walk(doc.comps[c].node,fu));return Array.from(set).map(q=>'family='+q).join('&')}
const CLICKJS="document.addEventListener('click',function(e){var t=e.target.closest('[data-ck]');if(!t)return;var a=t.getAttribute('data-ck'),s=t.getAttribute('data-to'),h=t.getAttribute('href');if(!h||h==='#')e.preventDefault();if(a==='show'){var g=t.getAttribute('data-grp');if(!g)return;document.querySelectorAll('[data-ck=show]').forEach(function(x){if(x.getAttribute('data-grp')===g){x.classList.remove('open');x.setAttribute('aria-selected','false')}});t.classList.add('open');t.setAttribute('aria-selected','true');document.querySelectorAll(g+'>[data-panel]').forEach(function(p){p.hidden=!p.matches(s)});return}document.querySelectorAll(s).forEach(function(x){if(a==='open')x.classList.add('open');else if(a==='close')x.classList.remove('open');else x.classList.toggle('open')})});document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-ck]:not(a):not(button)')){e.preventDefault();e.target.click()}});";
const WHEELJS="document.querySelectorAll('[data-wheel]').forEach(function(el){el.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;var max=el.scrollWidth-el.clientWidth;if(max<=0)return;var l=el.scrollLeft;if((e.deltaY>0&&l>=max-1)||(e.deltaY<0&&l<=0))return;e.preventDefault();el.scrollLeft+=e.deltaY},{passive:false})});";
const ANIMJS="(function(){var els=document.querySelectorAll('.ae');if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.15});els.forEach(function(e){io.observe(e)})})();";
function buildHTML(){
 const fam=fontsUsed();const rt=pageRoot();
 return '<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>'+E(doc.title)+'</title>\n'+(doc.idx===true?'':'<meta name="robots" content="noindex,nofollow,noarchive">\n')+(fam?'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'+fam+'&display=swap">\n':'')+'<style>\n'+buildCSS(true,[rt])+'</style>\n</head>\n<body class="'+rt.k+'">\n'+rt.c.map(c=>nodeHTML(c,true)).join('\n')+'\n<'+'script>'+ANIMJS+CLICKJS+WHEELJS+'<\/script>\n</body>\n</html>\n'}

/* ---------- board (Supabase) ---------- */
const BOARDJS='('+(function(){
 var C=window.NJ_CONFIG||{};
 function el2(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function sub(s,p,n){var dd=new Date(p.created_at),M={'제목':p.title,'본문':p.body||'','날짜':isNaN(dd)?'':dd.toLocaleDateString('ko-KR'),'번호':n==null?'':n,'카테고리':p.category||''};return s.replace(/\{\{\s*([^}]+?)\s*\}\}/g,function(m,k){return M[k]!=null?M[k]:m})}
 function fsRows(j){return(j||[]).filter(function(x){return x.document}).map(function(x){var f=x.document.fields||{};function s(k){return f[k]&&(f[k].stringValue||f[k].timestampValue)||''}return{id:x.document.name.split('/').pop(),title:s('title'),body:s('body'),image:s('image')||null,category:s('category'),created_at:s('created_at')}}).sort(function(a,b){return a.created_at<b.created_at?1:-1})}
 document.querySelectorAll('[data-board]').forEach(function(el){
  var ul=el.querySelector('.bd-list'),tp=el.querySelector('template.bd-tpl'),src=el.getAttribute('data-src')||'supabase',view=el.getAttribute('data-view'),lim=parseInt(el.getAttribute('data-limit'),10)||10,bd=el.getAttribute('data-board'),open=view==='cards'||view==='feed'||view==='gallery';
  var dh=el.getAttribute('data-detail');
  function msg(t){ul.textContent='';ul.appendChild(el2('li','bd-msg',t))}
  function lnk(li,p,st){if(!dh||p.id==null||p.id==='')return;var a=el2('a',st?'bd-a':'bd-more',st?null:'자세히 보기 →');a.href=dh+'?id='+encodeURIComponent(p.id);if(st)a.setAttribute('aria-label',(p.title||'글')+' 보기');var h=st?li:li.querySelector('.bd-b');if(h)h.appendChild(a)}
  function render(rows){
   rows=rows.slice(0,lim);
   if(!rows.length){msg('아직 글이 없어요.');return}
   ul.textContent='';
   rows.forEach(function(p,i){
    if(tp){var lt=el2('li','bd-item'),fr=tp.content.cloneNode(true),dd=new Date(p.created_at),okimg=p.image&&(/^https?:\/\//i.test(p.image)||/^data\/img\//.test(p.image));
     fr.querySelectorAll('[data-bind]').forEach(function(e){var k=e.getAttribute('data-bind');
      if(k==='title')e.textContent=p.title;else if(k==='body')e.textContent=p.body||'';else if(k==='num')e.textContent=rows.length-i;else if(k==='date')e.textContent=isNaN(dd)?'':dd.toLocaleDateString('ko-KR');
      else if(k==='image'){if(okimg){e.src=p.image;e.alt=p.title||''}else e.hidden=true}
      else if(k==='cat')e.textContent=p.category||'';
      else if(k==='imagebg'&&okimg)e.style.backgroundImage='url("'+p.image.replace(/["\\]/g,'')+'")'});
     fr.querySelectorAll('[data-tx]').forEach(function(e){e.textContent=sub(e.getAttribute('data-tx'),p,rows.length-i)});
     lt.appendChild(fr);lnk(lt,p,1);ul.appendChild(lt);return}
    var li=el2('li','bd-item'),dt=new Date(p.created_at),im=null,no=el2('span','bd-n',rows.length-i),t=el2(open?'h3':'span','bd-t',p.title),tm=el2('time'),b=el2('div','bd-b',p.body||'');
    if(!isNaN(dt)){tm.dateTime=p.created_at;tm.textContent=dt.toLocaleDateString('ko-KR')}
    if(p.image&&(/^https?:\/\//i.test(p.image)||/^data\/img\//.test(p.image))){im=el2('img','bd-img');im.src=p.image;im.alt=p.title||'';im.loading='lazy'}
    if(open){var a=document.createElement('article');if(im)a.appendChild(im);a.appendChild(tm);a.appendChild(t);a.appendChild(b);li.appendChild(a)}
    else{var d=document.createElement('details'),s=document.createElement('summary');if(im)b.appendChild(im);s.appendChild(no);s.appendChild(t);s.appendChild(tm);d.appendChild(s);d.appendChild(b);li.appendChild(d)}
    lnk(li,p,open);ul.appendChild(li)});
   if(view==='gallery'||el.getAttribute('data-lay')==='scroll'){ul.tabIndex=0;ul.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;var max=ul.scrollWidth-ul.clientWidth,l=ul.scrollLeft;if(max<=0||(e.deltaY>0&&l>=max-1)||(e.deltaY<0&&l<=0))return;e.preventDefault();ul.scrollLeft+=e.deltaY},{passive:false})}
  }
  function ok(r){if(!r.ok)throw 0;return r.json()}
  var p;
  if(src==='notion')p=fetch('data/'+encodeURIComponent(bd)+'.json').then(ok);
  else if(src==='firebase'){
   if(!C.fk||!C.fp){msg('게시판 연결 정보가 아직 없어요.');return}
   p=fetch('https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(C.fp)+'/databases/(default)/documents:runQuery?key='+encodeURIComponent(C.fk),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId:'posts'}],where:{fieldFilter:{field:{fieldPath:'board'},op:'EQUAL',value:{stringValue:bd}}},limit:200}})}).then(ok).then(fsRows)}
  else{
   if(!C.url||!C.key){msg('게시판 연결 정보가 아직 없어요.');return}
   var h={apikey:C.key};if(/^eyJ/.test(C.key))h.Authorization='Bearer '+C.key;
   p=fetch(C.url.replace(/\/+$/,'')+'/rest/v1/posts?select=id,title,body,image,category,created_at&board=eq.'+encodeURIComponent(bd)+'&order=created_at.desc&limit='+lim,{headers:h}).then(ok)}
  p.then(render).catch(function(){msg('글을 불러오지 못했어요.')})})
}).toString()+')();';
const POSTJS='('+(function(){
 var C=window.NJ_CONFIG||{},b=document.body,bd=b.getAttribute('data-post'),src=b.getAttribute('data-src')||'supabase',id=new URLSearchParams(location.search).get('id'),base=document.title;
function sub(s,p,n){var dd=new Date(p.created_at),M={'제목':p.title,'본문':p.body||'','날짜':isNaN(dd)?'':dd.toLocaleDateString('ko-KR'),'번호':n==null?'':n,'카테고리':p.category||''};return s.replace(/\{\{\s*([^}]+?)\s*\}\}/g,function(m,k){return M[k]!=null?M[k]:m})}
 function fsRows(j){return(j||[]).filter(function(x){return x.document}).map(function(x){var f=x.document.fields||{};function s(k){return f[k]&&(f[k].stringValue||f[k].timestampValue)||''}return{id:x.document.name.split('/').pop(),title:s('title'),body:s('body'),image:s('image')||null,category:s('category'),created_at:s('created_at')}})}
 function done(){b.classList.add('bd-ready')}
 function bad(t){var f=false;document.querySelectorAll('[data-bind]').forEach(function(e){if(!f&&e.getAttribute('data-bind')==='title'){e.textContent=t;f=true}else e.hidden=true});if(!f){var m=document.createElement('p');m.textContent=t;(document.querySelector('main')||b).appendChild(m)}done()}
 function fill(p){var dd=new Date(p.created_at),okimg=p.image&&(/^https?:\/\//i.test(p.image)||/^data\/img\//.test(p.image));
  document.querySelectorAll('[data-bind]').forEach(function(e){var k=e.getAttribute('data-bind');
   if(k==='title')e.textContent=p.title;else if(k==='body')e.textContent=p.body||'';else if(k==='date')e.textContent=isNaN(dd)?'':dd.toLocaleDateString('ko-KR');else if(k==='num')e.hidden=true;else if(k==='cat')e.textContent=p.category||'';
   else if(k==='image'){if(okimg){e.src=p.image;e.alt=p.title||''}else e.hidden=true}
   else if(k==='imagebg'&&okimg)e.style.backgroundImage='url("'+p.image.replace(/["\\]/g,'')+'")'});
  document.querySelectorAll('[data-tx]').forEach(function(e){e.textContent=sub(e.getAttribute('data-tx'),p,null)});
  document.title=p.title?p.title+' | '+base:base;done()}
 function ok(r){if(!r.ok)throw 0;return r.json()}
 if(!id){bad('글을 찾을 수 없어요.');return}
 var pr;
 if(src==='notion')pr=fetch('data/'+encodeURIComponent(bd)+'.json').then(ok).then(function(a){return(a||[]).filter(function(x){return String(x.id)===id})[0]});
 else if(src==='firebase'){
  if(!C.fk||!C.fp){bad('게시판 연결 정보가 아직 없어요.');return}
  pr=fetch('https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(C.fp)+'/databases/(default)/documents/posts/'+encodeURIComponent(id)+'?key='+encodeURIComponent(C.fk)).then(ok).then(function(j){return fsRows([{document:j}])[0]})}
 else{
  if(!C.url||!C.key){bad('게시판 연결 정보가 아직 없어요.');return}
  var h={apikey:C.key};if(/^eyJ/.test(C.key))h.Authorization='Bearer '+C.key;
  pr=fetch(C.url.replace(/\/+$/,'')+'/rest/v1/posts?select=id,title,body,image,category,created_at&board=eq.'+encodeURIComponent(bd)+'&id=eq.'+encodeURIComponent(id)+'&limit=1',{headers:h}).then(ok).then(function(a){return a[0]})}
 pr.then(function(p){if(!p)bad('글을 찾을 수 없어요.');else fill(p)}).catch(function(){bad('글을 불러오지 못했어요.')})
}).toString()+')();';
const ADMINJS='('+(function(){
 var C=window.NJ_CONFIG||{},q=function(s){return document.querySelector(s)},tok=null,editId=null,base=(C.url||'').replace(/\/+$/,'');
 try{tok=sessionStorage.getItem('nj_tok')}catch(e){}
 function hd(x){var h={apikey:C.key,'Content-Type':'application/json'};h.Authorization='Bearer '+(tok||(/^eyJ/.test(C.key)?C.key:''));if(!tok&&!/^eyJ/.test(C.key))delete h.Authorization;for(var k in x)h[k]=x[k];return h}
 function say(t,bad){var m=q('#msg');m.textContent=t||'';m.className=bad?'bad':''}
 function show(){q('#login').hidden=!!tok;q('#panel').hidden=!tok;if(tok)load()}
 function fail(r){if(r.status===401||r.status===403){say('권한이 없어요. 로그인 이메일이 SQL에 넣은 관리자 이메일과 같은지 확인하세요.',1);if(r.status===401){tok=null;try{sessionStorage.removeItem('nj_tok')}catch(e){}show()}}else say('요청에 실패했어요 ('+r.status+')',1)}
 q('#lf').onsubmit=function(e){e.preventDefault();say('로그인 중…');
  fetch(base+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:C.key,'Content-Type':'application/json'},body:JSON.stringify({email:q('#em').value.trim(),password:q('#pw').value})}).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(o){
   if(!o.ok||!o.j.access_token){say('로그인에 실패했어요. 이메일과 비밀번호를 확인하세요.',1);return}
   tok=o.j.access_token;try{sessionStorage.setItem('nj_tok',tok)}catch(e){}q('#pw').value='';say('');show()}).catch(function(){say('연결할 수 없어요. 주소와 키를 확인하세요.',1)})};
 q('#out').onclick=function(){tok=null;try{sessionStorage.removeItem('nj_tok')}catch(e){}show()};
 function reset(){editId=null;q('#ti').value='';q('#bo').value='';q('#im').value='';q('#ca').value='';q('#go').textContent='글 올리기';q('#cx').hidden=true}
 q('#cx').onclick=reset;
 q('#pf').onsubmit=function(e){e.preventDefault();var body={board:q('#bd').value,title:q('#ti').value.trim(),body:q('#bo').value,image:q('#im').value.trim()||null,category:q('#ca').value.trim()||null};if(!body.title)return;
  var url=base+'/rest/v1/posts'+(editId?'?id=eq.'+editId:'');
  fetch(url,{method:editId?'PATCH':'POST',headers:hd({Prefer:'return=minimal'}),body:JSON.stringify(body)}).then(function(r){if(!r.ok){fail(r);return}say(editId?'수정했어요':'올렸어요');reset();load()})};
 function load(){fetch(base+'/rest/v1/posts?select=*&order=created_at.desc&limit=100',{headers:hd()}).then(function(r){if(!r.ok){fail(r);return null}return r.json()}).then(function(rows){
   if(!rows)return;var ul=q('#ls');ul.textContent='';if(!rows.length){ul.textContent='아직 글이 없어요.';return}
   rows.forEach(function(p){var li=document.createElement('li'),sp=document.createElement('span'),a=document.createElement('button'),b=document.createElement('button');
    sp.textContent='['+p.board+'] '+p.title+' · '+new Date(p.created_at).toLocaleDateString('ko-KR');a.textContent='수정';b.textContent='삭제';b.className='dg';
    a.onclick=function(){editId=p.id;q('#bd').value=p.board;q('#ti').value=p.title;q('#bo').value=p.body||'';q('#im').value=p.image||'';q('#ca').value=p.category||'';q('#go').textContent='수정 저장';q('#cx').hidden=false;window.scrollTo(0,0)};
    b.onclick=function(){if(!confirm('이 글을 삭제할까요?'))return;fetch(base+'/rest/v1/posts?id=eq.'+p.id,{method:'DELETE',headers:hd()}).then(function(r){if(!r.ok){fail(r);return}say('삭제했어요');load()})};
    li.appendChild(sp);li.appendChild(a);li.appendChild(b);ul.appendChild(li)})})}
 if(!C.url||!C.key){say('js/config.js에 Supabase 주소와 키가 비어 있어요.',1)}
 show();
}).toString()+')();';
const ADMINJS_FB='('+(function(){
 var C=window.NJ_CONFIG||{},q=function(s){return document.querySelector(s)},tok=null,editId=null;
 var base='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(C.fp||'')+'/databases/(default)/documents';
 try{tok=sessionStorage.getItem('nj_ftok')}catch(e){}
 function hd(){var h={'Content-Type':'application/json'};if(tok)h.Authorization='Bearer '+tok;return h}
 function say(t,bad){var m=q('#msg');m.textContent=t||'';m.className=bad?'bad':''}
 function out(){tok=null;try{sessionStorage.removeItem('nj_ftok')}catch(e){}show()}
 function show(){q('#login').hidden=!!tok;q('#panel').hidden=!tok;if(tok)load()}
 function fail(r){if(r.status===401){say('로그인이 만료됐어요. 다시 로그인하세요.',1);out()}else if(r.status===403)say('권한이 없어요. 로그인 이메일이 규칙에 넣은 관리자 이메일과 같은지, 규칙을 게시했는지 확인하세요.',1);else say('요청에 실패했어요 ('+r.status+')',1)}
 q('#lf').onsubmit=function(e){e.preventDefault();say('로그인 중…');
  fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+encodeURIComponent(C.fk),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:q('#em').value.trim(),password:q('#pw').value,returnSecureToken:true})}).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(o){
   if(!o.ok||!o.j.idToken){say('로그인에 실패했어요. 이메일과 비밀번호를 확인하세요.',1);return}
   tok=o.j.idToken;try{sessionStorage.setItem('nj_ftok',tok)}catch(e){}q('#pw').value='';say('');show()}).catch(function(){say('연결할 수 없어요. API 키를 확인하세요.',1)})};
 q('#out').onclick=out;
 function reset(){editId=null;q('#ti').value='';q('#bo').value='';q('#im').value='';q('#ca').value='';q('#go').textContent='글 올리기';q('#cx').hidden=true}
 q('#cx').onclick=reset;
 function S(v){return{stringValue:v}}
 q('#pf').onsubmit=function(e){e.preventDefault();var im=q('#im').value.trim(),title=q('#ti').value.trim();if(!title)return;
  var f={board:S(q('#bd').value),title:S(title),body:S(q('#bo').value),image:im?S(im):{nullValue:null},category:S(q('#ca').value.trim())},url,m;
  if(editId){m='PATCH';url=base+'/posts/'+editId+'?updateMask.fieldPaths=board&updateMask.fieldPaths=title&updateMask.fieldPaths=body&updateMask.fieldPaths=image'}
  else{m='POST';url=base+'/posts';f.created_at={timestampValue:new Date().toISOString()}}
  fetch(url,{method:m,headers:hd(),body:JSON.stringify({fields:f})}).then(function(r){if(!r.ok){fail(r);return}say(editId?'수정했어요':'올렸어요');reset();load()})};
 function load(){fetch(base+':runQuery',{method:'POST',headers:hd(),body:JSON.stringify({structuredQuery:{from:[{collectionId:'posts'}],orderBy:[{field:{fieldPath:'created_at'},direction:'DESCENDING'}],limit:100}})}).then(function(r){if(!r.ok){fail(r);return null}return r.json()}).then(function(j){
   if(!j)return;var ul=q('#ls');ul.textContent='';var rows=j.filter(function(x){return x.document});if(!rows.length){ul.textContent='아직 글이 없어요.';return}
   rows.forEach(function(x){var f=x.document.fields||{},id=x.document.name.split('/').pop();function s(k){return f[k]&&(f[k].stringValue||f[k].timestampValue)||''}
    var li=document.createElement('li'),sp=document.createElement('span'),a=document.createElement('button'),b=document.createElement('button');
    sp.textContent='['+s('board')+'] '+s('title')+' · '+new Date(s('created_at')).toLocaleDateString('ko-KR');a.textContent='수정';b.textContent='삭제';b.className='dg';
    a.onclick=function(){editId=id;q('#bd').value=s('board');q('#ti').value=s('title');q('#bo').value=s('body');q('#im').value=s('image');q('#ca').value=s('category');q('#go').textContent='수정 저장';q('#cx').hidden=false;window.scrollTo(0,0)};
    b.onclick=function(){if(!confirm('이 글을 삭제할까요?'))return;fetch(base+'/posts/'+id,{method:'DELETE',headers:hd()}).then(function(r){if(!r.ok){fail(r);return}say('삭제했어요');load()})};
    li.appendChild(sp);li.appendChild(a);li.appendChild(b);ul.appendChild(li)})})}
 if(!C.fk||!C.fp){say('js/config.js에 Firebase API 키와 프로젝트 ID가 비어 있어요.',1)}
 show();
}).toString()+')();';
function adminHTML(boards,fb){
 return '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>관리자</title><style>'
 +minCSS(':root{color-scheme:light dark;--b:#d9d9e0;--m:#6b6b7a}*{box-sizing:border-box}body{margin:0;font:16px/1.6 system-ui,-apple-system,"Noto Sans KR",sans-serif;padding:24px 16px}main{max-width:640px;margin:0 auto}h1{font-size:22px}input,textarea,select,button{font:inherit;padding:10px 12px;border:1px solid var(--b);border-radius:10px;background:transparent;color:inherit;width:100%}button{width:auto;cursor:pointer;background:#111;color:#fff;border-color:#111}button.dg{background:transparent;color:#e5484d;border-color:#e5484d}@media(prefers-color-scheme:dark){button{background:#fff;color:#111;border-color:#fff}}form{display:grid;gap:10px;margin:16px 0}#msg{min-height:1.5em;color:var(--m)}#msg.bad{color:#e5484d}ul{list-style:none;padding:0;display:grid;gap:8px}li{display:flex;gap:8px;align-items:center;border:1px solid var(--b);border-radius:10px;padding:8px 10px}li span{flex:1;min-width:0;overflow-wrap:anywhere}li button{padding:6px 10px}[hidden]{display:none!important}.row{display:flex;gap:8px}')
 +'</style></head><body><main><h1>관리자</h1><p id="msg"></p>'
 +'<section id="login"><form id="lf"><input id="em" type="email" placeholder="이메일" autocomplete="username" required><input id="pw" type="password" placeholder="비밀번호" autocomplete="current-password" required><button type="submit">로그인</button></form></section>'
 +'<section id="panel" hidden><div class="row"><button id="out" type="button" class="dg">로그아웃</button></div><form id="pf"><select id="bd" aria-label="게시판">'+boards.map(b=>'<option>'+E(b)+'</option>').join('')+'</select><input id="ti" placeholder="제목" maxlength="200" required><input id="ca" placeholder="카테고리 (선택)" maxlength="40"><textarea id="bo" rows="8" placeholder="내용"></textarea><input id="im" type="url" placeholder="이미지 주소 (선택, https://…)"><div class="row"><button id="go" type="submit">글 올리기</button><button id="cx" type="button" class="dg" hidden>수정 취소</button></div></form><h2 style="font-size:17px">올린 글</h2><ul id="ls"></ul></section></main>'
 +'<script src="js/config.js"><\/script><script>'+(fb?ADMINJS_FB:ADMINJS)+'<\/script></body></html>'}
function boardCSS(ex){const P=ex?'':'.pg ',V=v=>P+'[data-view='+v+'] ',M='rgba(128,128,140,.3)';
 return P+'.bd-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}\n'
 +P+'.bd-item{border:1px solid '+M+';border-radius:12px;overflow:hidden}\n'
 +P+'.bd-item summary{display:flex;justify-content:space-between;gap:12px;padding:14px 16px;cursor:pointer;list-style:none;font-weight:600}\n'
 +P+'.bd-item summary::-webkit-details-marker{display:none}\n'
 +P+'.bd-t{flex:1;min-width:0;overflow-wrap:anywhere;margin:0;font-size:inherit}\n'
 +P+'.bd-n{display:none}\n'
 +P+'.bd-item time{font-weight:400;font-size:.85em;opacity:.6;white-space:nowrap}\n'
 +P+'.bd-b{padding:0 16px 16px;white-space:pre-wrap;line-height:1.7;overflow-wrap:anywhere}\n'
 +P+'.bd-b img{display:block;max-width:100%;margin-top:12px;border-radius:8px}\n'
 +P+'.bd-msg{opacity:.6;padding:8px 2px}\n'
 +P+'.bd-item article{display:flex;flex-direction:column;gap:8px}\n'
 +P+'.bd-item article>.bd-img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px}\n'
 +P+'.bd-item article>.bd-b{padding:0}\n'
 +V('line')+'.bd-list{gap:0}\n'+V('line')+'.bd-item{border:0;border-bottom:1px solid '+M+';border-radius:0}\n'+V('line')+'.bd-item summary{padding-left:2px;padding-right:2px}\n'
 +V('table')+'.bd-list{gap:0;border-top:2px solid currentColor}\n'+V('table')+'.bd-item{border:0;border-bottom:1px solid '+M+';border-radius:0}\n'+V('table')+'.bd-item summary{display:grid;grid-template-columns:3em 1fr auto;align-items:baseline;padding:12px 6px;font-weight:500}\n'+V('table')+'.bd-n{display:block;opacity:.55;font-weight:400}\n'+V('table')+'.bd-b{padding:4px 6px 18px 3.4em}\n'
 +V('cards')+'.bd-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}\n'+V('cards')+'.bd-item{background:rgba(128,128,140,.07);padding:12px}\n'+V('cards')+'.bd-t{font-weight:600}\n'
 +V('feed')+'.bd-list{gap:48px}\n'+V('feed')+'.bd-item{border:0;border-radius:0;overflow:visible}\n'+V('feed')+'.bd-item time{order:-2;font-size:.85em}\n'+V('feed')+'.bd-t{order:-1;font-size:1.6em;line-height:1.3;font-weight:700}\n'+V('feed')+'.bd-item article>.bd-img{aspect-ratio:auto;height:auto}\n'
 +V('gallery')+'.bd-list{flex-direction:row;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:14px;-webkit-overflow-scrolling:touch}\n'+V('gallery')+'.bd-item{flex:0 0 min(300px,78%);scroll-snap-align:center;border:0;border-radius:0;overflow:visible}\n'+V('gallery')+'.bd-item article>.bd-img{aspect-ratio:4/5;border-radius:6px}\n'+V('gallery')+'.bd-t{font-weight:600}\n'+V('gallery')+'.bd-list:focus-visible{outline:2px solid currentColor;outline-offset:4px}\n'
 +V('custom')+'.bd-item{border:0;border-radius:0;overflow:visible;min-width:0}\n'
 +P+'[data-lay=grid2] .bd-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}\n'+P+'[data-lay=grid3] .bd-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}\n'+P+'[data-lay=grid4] .bd-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}\n'
 +P+'[data-lay=scroll] .bd-list{flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:14px;-webkit-overflow-scrolling:touch}\n'+P+'[data-lay=scroll] .bd-item{flex:0 0 auto;scroll-snap-align:center}\n'
 +P+'[data-bind=body]{white-space:pre-wrap}\n'+P+'.bd-item{position:relative}\n'+P+'.bd-a{position:absolute;top:0;right:0;bottom:0;left:0;z-index:1;border-radius:inherit}\n'+P+'.bd-a:focus-visible{outline:2px solid currentColor;outline-offset:-2px}\n'+P+'.bd-more{display:inline-block;margin-top:10px;font-size:.9em;text-decoration:underline;color:inherit}\n'
 +(ex?'@media (max-width:991px){[data-lay=grid4] .bd-list{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media (max-width:479px){[data-lay=grid2] .bd-list,[data-lay=grid3] .bd-list,[data-lay=grid4] .bd-list{grid-template-columns:1fr}}\n':'.pg.bt [data-lay=grid4] .bd-list{grid-template-columns:repeat(2,minmax(0,1fr))}\n.pg.bm [data-lay=grid2] .bd-list,.pg.bm [data-lay=grid3] .bd-list,.pg.bm [data-lay=grid4] .bd-list{grid-template-columns:1fr}\n.pg .bd-ghost{pointer-events:none;opacity:.5}\n.pg.pvm .bd-ghost{pointer-events:auto;opacity:1}\n')
 +(ex?'':'.pg .bd-note{font-size:12px;opacity:.55;margin-top:8px}\n')}
function sampleBoard(n){const rows=[['환영합니다','첫 글이에요. 글을 올리면 여기에 나타나요.','2026. 11. 2.'],['공지 예시','게시판 이름이 같은 글만 이 블록에 보여요.','2026. 11. 1.'],['세 번째 글','내용은 줄바꿈이 그대로 보여요.','2026. 10. 30.'],['네 번째 글','가로 갤러리는 옆으로 넘겨 볼 수 있어요.','2026. 10. 28.']];const v=n.bview,op=(v==='cards'||v==='feed'||v==='gallery');
 const label={supabase:'Supabase',notion:'Notion',firebase:'Firebase'}[n.bsrc||'supabase'];
 return '<ul class="bd-list">'+rows.map((r,i)=>op?'<li class="bd-item"><article><img class="bd-img" src="'+PH+'" alt=""><time>'+r[2]+'</time><h3 class="bd-t">'+r[0]+'</h3><div class="bd-b">'+r[1]+'</div></article></li>':'<li class="bd-item"><details><summary><span class="bd-n">'+(rows.length-i)+'</span><span class="bd-t">'+r[0]+'</span><time>'+r[2]+'</time></summary><div class="bd-b">'+r[1]+'</div></details></li>').join('')+'</ul><p class="bd-note">게시판 "'+E(n.board)+'" · '+label+' · 편집 화면의 예시 글이에요</p>'}
function keyIsSecret(k){k=(k||'').trim();if(/^sb_secret_/i.test(k))return true;const m=/^eyJ[\w-]+\.([\w-]+)\./.exec(k);if(m){try{const j=JSON.parse(atob(m[1].replace(/-/g,'+').replace(/_/g,'/')));if(j.role==='service_role')return true}catch(e){}}return false}
function sbSQL(email){const em=(email||'admin@example.com').replace(/'/g,"''").toLowerCase();
 return `-- 둥지메이커 게시판용 · Supabase 대시보드의 SQL Editor에 붙여 넣고 Run
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  board text not null,
  title text not null,
  body text not null default '',
  image text,
  category text,
  created_at timestamptz not null default now()
);
alter table public.posts add column if not exists category text;
create index if not exists posts_board_created on public.posts (board, created_at desc);

alter table public.posts enable row level security;

drop policy if exists "누구나 읽기" on public.posts;
create policy "누구나 읽기" on public.posts for select using (true);

drop policy if exists "관리자만 쓰기" on public.posts;
create policy "관리자만 쓰기" on public.posts for all to authenticated
  using (lower(auth.jwt() ->> 'email') = '${em}')
  with check (lower(auth.jwt() ->> 'email') = '${em}');
`}
function fbRules(email){const em=(email||'admin@example.com').replace(/'/g,"\\'").toLowerCase();
 return `// 둥지메이커 게시판용 · Firebase 콘솔 → Firestore Database → 규칙 탭에 붙여 넣고 게시
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{id} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email.lower() == '${em}';
    }
  }
}
`}
function readmeMD(sbB,ntB,fbB,sb){
 const L=[];L.push('# 내 홈페이지 배포 안내\n\n둥지메이커로 만든 사이트예요. 이 폴더의 파일을 그대로 올리면 돼요.\n');
 L.push('## 1. 사이트 올리기 — 호스팅 고르기 (모두 무료로 시작)\n\n이 폴더는 서버 프로그램이 필요 없는 일반 파일이라, 파일을 올릴 수 있는 곳이면 어디든 돼요. 아래 중 하나만 고르세요.\n\n### A. Netlify (가장 쉬움)\n\n1. [netlify.com](https://www.netlify.com)에 가입해요.\n2. **Add new site → Deploy manually**를 누르고, 이 폴더를 통째로 끌어다 놓아요. (zip은 먼저 풀어 주세요)\n3. 잠시 뒤 `https://무작위이름.netlify.app` 주소가 생겨요. **Site configuration → Change site name**에서 이름을 바꿀 수 있어요.\n4. 사이트를 고치면 다시 내보내서 같은 방법으로 덮어 올려요.\n\n### B. Cloudflare Pages\n\n1. [dash.cloudflare.com](https://dash.cloudflare.com)에 가입하고 **Workers & Pages → Create → Pages → Upload assets**를 골라요.\n2. 프로젝트 이름을 정하고 이 폴더를 올리면 `https://이름.pages.dev` 주소가 생겨요.\n\n### C. GitHub Pages\n\n1. GitHub에서 **New repository**로 저장소를 만들어요 (Public).\n2. 이 폴더 안의 파일을 모두 저장소에 업로드해요. (`index.html`이 맨 위에 보여야 해요)\n   - `.github` 폴더는 이름이 점(.)으로 시작해서 숨김 폴더예요. 드래그가 안 되면 GitHub에서 **Add file → Create new file**을 누르고 파일 이름칸에 `.github/workflows/notion-sync.yml`을 입력한 뒤 내용을 붙여 넣으세요. (Git이나 GitHub Desktop으로 올리면 그대로 올라가요.)\n3. 저장소 **Settings → Pages**에서 Branch를 `main`, 폴더를 `/ (root)`로 정하고 Save.\n4. 잠시 뒤 `https://내아이디.github.io/저장소이름/` 에서 열려요.\n\n### Notion 게시판을 쓴다면\n\n노션 글을 자동으로 가져오는 기능(30분마다)은 GitHub의 자동 실행 기능(Actions)이 해요. 그래서 A·B에 폴더를 끌어다 놓는 방식으로는 자동 동기화가 안 돼요. 노션을 쓰려면 C처럼 GitHub 저장소에 올린 뒤, Netlify는 **Add new site → Import an existing project**, Cloudflare는 **Pages → Connect to Git**으로 그 저장소를 연결하세요. 글이 바뀔 때마다 호스팅이 자동으로 다시 올려 줘요. (Supabase·Firebase 게시판은 어느 호스팅이든 그대로 돼요.)\n\n### 검색에 안 나오게 하기\n\n둥지메이커 내보내기 창의 "검색엔진 노출 허용"을 꺼 두면(기본값) 모든 페이지에 검색 제외 표시가 들어가요. 주소를 아는 사람은 열 수 있어요.\n');
 let n=2;
 if(sbB.length){L.push('## '+(n++)+'. 게시판 연결하기 — Supabase (무료)\n\n게시판: '+sbB.map(b=>'`'+b+'`').join(', ')+'\n\n1. [supabase.com](https://supabase.com)에 가입하고 **New project**를 만들어요. 리전은 서울이 빨라요. DB 비밀번호는 따로 적어 두세요.\n2. 왼쪽 **SQL Editor**에 이 폴더의 `supabase.sql` 내용을 붙여 넣고 **Run**. (글 표와 보안 규칙이 만들어져요: 읽기는 누구나, 쓰기는 관리자만)\n3. **Authentication → Users → Add user**로 관리자 계정을 만들어요. 이메일은 `'+(sb.email||'(둥지메이커에서 관리자 이메일을 입력하고 다시 내보내세요)')+'` 이어야 해요.\n4. **Authentication** 설정에서 새 가입(Allow new users to sign up)을 꺼요. 이걸 꺼야 다른 사람이 계정을 만들 수 없어요.\n5. **Settings → API Keys**에서 Project URL과 **Publishable key**(`sb_publishable_…`)를 복사해, `js/config.js`에 넣어요. (둥지메이커 내보내기 창에 미리 넣었다면 이미 들어 있어요.)\n6. `https://사이트주소/admin.html`에서 로그인하면 글쓰기·수정·삭제를 할 수 있어요.\n\n**주의:** Secret key(`sb_secret_…`, service_role)는 절대 사이트에 넣지 마세요.\n\n무료 Supabase는 1주일 동안 접속이 없으면 일시정지돼요. 대시보드에서 복구 버튼을 누르면 다시 열려요.\n')}
if(fbB.length){L.push('## '+(n++)+'. 게시판 연결하기 — Firebase (무료 Spark 요금제)\n\n게시판: '+fbB.map(b=>'`'+b+'`').join(', ')+'\n\n1. [console.firebase.google.com](https://console.firebase.google.com)에서 **프로젝트 추가**를 해요. (Google Analytics는 꺼도 돼요)\n2. 왼쪽 **빌드 → Firestore Database → 데이터베이스 만들기**. 위치는 서울(`asia-northeast3`), 모드는 **프로덕션 모드**로 시작해요.\n3. **규칙** 탭에 이 폴더의 `firestore.rules` 내용을 붙여 넣고 **게시**해요. (읽기는 누구나, 쓰기는 관리자 이메일 하나만 되는 규칙이에요)\n4. **빌드 → Authentication → 시작하기 → 로그인 방법**에서 **이메일/비밀번호**를 켜요.\n5. Authentication의 **사용자 탭 → 사용자 추가**로 관리자 계정을 만들어요. 이메일은 `'+(sb.email||'(둥지메이커에서 관리자 이메일을 입력하고 다시 내보내세요)')+'` 이어야 해요.\n6. Authentication **설정 → 사용자 작업(User actions)**에서 가입(sign-up)을 허용하는 항목을 꺼요. 메뉴 이름은 콘솔 업데이트로 달라질 수 있어요. 관리자 계정을 만든 뒤에 끄세요.\n7. 톱니바퀴 **프로젝트 설정 → 일반 → 내 앱**에서 웹 앱(`</>`)을 추가하고 `apiKey`와 `projectId`를 복사해 `js/config.js`에 넣어요. (둥지메이커 내보내기 창에 미리 넣었다면 이미 들어 있어요.)\n8. `https://사이트주소/'+(sbB.length?'admin-firebase.html':'admin.html')+'`에서 로그인하면 글쓰기·수정·삭제를 할 수 있어요.\n\n**참고**\n- Firebase 웹 API 키는 공개돼도 되는 키예요. 실제 보호는 3단계의 규칙이 해요. 원하면 Google Cloud 콘솔 → API 및 서비스 → 사용자 인증 정보에서 이 키를 내 사이트 주소(HTTP 리퍼러)로만 쓰도록 제한할 수 있어요.\n- 무료(Spark) 한도를 넘으면 요금이 아니라 요청이 거부돼요. 한도는 Firebase 가격 페이지에서 확인하세요.\n')}
 if(ntB.length){L.push('## '+(n++)+'. 게시판 연결하기 — Notion (무료)\n\n게시판: '+ntB.map(b=>'`'+b[0]+'`'+(b[1]?'':' (⚠ DB 주소가 비어 있어요)')).join(', ')+'\n\n노션에 글을 쓰면, GitHub가 약 30분마다 노션에서 글을 가져와 사이트에 반영해요. 글쓰기는 노션에서만 하고(관리자 전용), 방문자는 읽기만 해요.\n\n1. 노션에서 **전체 페이지 데이터베이스**를 만들어요. 기본 `이름`이 글 제목이고, 글 내용은 각 행(페이지)을 열어 본문에 써요.\n   - 선택 속성: `공개`(체크박스, 체크한 글만 사이트에 보여요) · `날짜`(날짜) · `이미지`(파일 또는 URL)\n2. [notion.so/my-integrations](https://www.notion.so/my-integrations)에서 새 **내부 통합**을 만들고 토큰을 복사해요. (보통 `ntn_`로 시작해요)\n3. 데이터베이스 페이지 오른쪽 위 **… → 연결(Connections)**에서 방금 만든 통합을 추가해요.\n4. 데이터베이스 주소를 둥지메이커 게시판 설정에 붙여 넣고 다시 내보내요. (이미 넣었다면 `scripts/notion-boards.json`에 들어 있어요.)\n5. GitHub 저장소 **Settings → Secrets and variables → Actions → New repository secret**에서 이름 `NOTION_TOKEN`, 값에 토큰을 넣어요. 토큰은 여기에만 넣고 사이트 파일에는 절대 넣지 마세요.\n6. 저장소 **Actions** 탭 → **Notion 동기화** → **Run workflow**를 눌러 처음 한 번 실행해요. 성공하면 `data/게시판이름.json`이 채워지고 1~2분 뒤 사이트에 보여요. 이후에는 자동으로 돌아요.\n\n**알아둘 점**\n- 반영까지 최대 30분 안팎 걸려요. 급하면 Actions에서 다시 Run workflow를 누르세요.\n- 공개 저장소는 오랫동안 활동이 없으면 GitHub가 예약 실행을 멈출 수 있어요. 멈추면 Actions 탭에서 다시 켜거나 수동으로 실행하세요.\n- 본문은 문단·제목·목록·체크리스트·인용·코드·이미지만 가져와요. 표, 토글, 안쪽 들여쓴 목록은 건너뛰어요.\n- 노션에 올린 이미지는 주소가 1시간 뒤 만료돼서, 동기화할 때 `data/img/`로 저장해 써요.\n')}
 L.push('## '+n+'. 내 도메인 연결하기 (선택)\n\n도메인을 사는 건 유료예요(보통 1년에 1~2만 원대). 산 뒤에는 쓰는 호스팅에서 도메인을 추가해요.\n\n- **Netlify:** Domain management → Add a domain\n- **Cloudflare Pages:** 프로젝트 → Custom domains → Set up a domain\n- **GitHub Pages:** 저장소 Settings → Pages → Custom domain\n\n그러면 호스팅이 DNS에 넣을 값(레코드)을 알려줘요. 도메인을 산 업체의 DNS 설정 화면에 그대로 입력하면 돼요. 잠시 뒤 HTTPS가 자동으로 켜져요(GitHub는 **Enforce HTTPS**를 직접 켜요).\n\n링크를 다른 곳(프로필 등)에 등록할 때는 이렇게 연결한 최종 주소를 쓰세요. 사이트 주소를 바꾸면 Supabase·Firebase의 허용 주소 설정이 필요한지 확인하세요.\n');
 L.push('## 파일 구성\n\n- `index.html`, `*.html` — 페이지\n- `css/site.css` — 공통 스타일\n- `js/site.js` — 효과·탭·게시판 동작'+((sbB.length||fbB.length)?'\n- `js/config.js` — 게시판 연결 정보(공개 키)':'')+(sbB.length?'\n- `admin.html` — 관리자 화면 (Supabase)\n- `supabase.sql` — DB 만들기용 SQL':'')+(fbB.length?'\n- `'+(sbB.length?'admin-firebase.html':'admin.html')+'` — 관리자 화면 (Firebase)\n- `firestore.rules` — 보안 규칙':'')+(ntB.length?'\n- `.github/workflows/notion-sync.yml`, `scripts/` — 노션 자동 동기화\n- `data/` — 노션에서 가져온 글':'')+'\n- `images/` — 줄여 놓은 이미지\n');
 return L.join('\n')}
const NOTIONSYNC="// 둥지메이커 · Notion 데이터베이스 → data/<게시판>.json 동기화 (Node 18 이상)\nimport fs from 'node:fs/promises';\nimport crypto from 'node:crypto';\n\nconst API = process.env.NOTION_API || 'https://api.notion.com/v1';\nconst TOKEN = process.env.NOTION_TOKEN;\nconst NEW = '2025-09-03', OLD = '2022-06-28';\nif (!TOKEN) {\n  console.error('NOTION_TOKEN 이 없어요. GitHub 저장소 Settings → Secrets and variables → Actions 에 추가하세요.');\n  process.exit(1);\n}\nconst sleep = ms => new Promise(r => setTimeout(r, ms));\n\nasync function nf(path, ver, opt = {}) {\n  for (let i = 0; i < 5; i++) {\n    const r = await fetch(API + path, {\n      method: opt.method || 'GET',\n      headers: { Authorization: 'Bearer ' + TOKEN, 'Notion-Version': ver, 'Content-Type': 'application/json' },\n      body: opt.body ? JSON.stringify(opt.body) : undefined\n    });\n    if (r.status === 429) { await sleep((+r.headers.get('retry-after') || 1) * 1000); continue; }\n    if (!r.ok) throw new Error(path + ' → ' + r.status + ' ' + (await r.text()).slice(0, 200));\n    await sleep(340); // 노션은 초당 약 3회까지\n    return r.json();\n  }\n  throw new Error(path + ' → 요청이 너무 많아요(429)');\n}\n\nconst plain = rt => (rt || []).map(t => t.plain_text).join('');\n\nasync function openDb(id) {\n  const db = await nf('/databases/' + id, NEW);\n  if (db.data_sources && db.data_sources.length) {\n    const ds = db.data_sources[0].id;\n    const sch = await nf('/data_sources/' + ds, NEW);\n    return {\n      ver: NEW, props: sch.properties,\n      query: body => nf('/data_sources/' + ds + '/query', NEW, { method: 'POST', body })\n    };\n  }\n  const old = await nf('/databases/' + id, OLD);\n  return {\n    ver: OLD, props: old.properties,\n    query: body => nf('/databases/' + id + '/query', OLD, { method: 'POST', body })\n  };\n}\n\nasync function children(id, ver) {\n  let out = [], cur = null;\n  do {\n    const j = await nf('/blocks/' + id + '/children?page_size=100' + (cur ? '&start_cursor=' + cur : ''), ver);\n    out = out.concat(j.results);\n    cur = j.has_more ? j.next_cursor : null;\n  } while (cur);\n  return out;\n}\n\nfunction fileUrl(f) {\n  if (!f) return null;\n  if (f.type === 'external') return { url: f.external.url, hosted: false };\n  if (f.type === 'file') return { url: f.file.url, hosted: true };\n  return null;\n}\n\nasync function saveImage(img, pid) {\n  if (!img) return null;\n  if (!img.hosted) return /^https?:\\/\\//i.test(img.url) ? img.url : null;\n  try {\n    const h = crypto.createHash('sha1').update(new URL(img.url).pathname).digest('hex').slice(0, 10);\n    const r = await fetch(img.url);\n    if (!r.ok) return null;\n    const ct = (r.headers.get('content-type') || '').split(';')[0];\n    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' }[ct] || 'jpg';\n    const name = 'data/img/' + pid.replace(/-/g, '').slice(0, 8) + '-' + h + '.' + ext;\n    await fs.mkdir('data/img', { recursive: true });\n    try { await fs.access(name); } catch { await fs.writeFile(name, Buffer.from(await r.arrayBuffer())); }\n    return name;\n  } catch { return null; }\n}\n\nasync function pageBody(pid, ver) {\n  const lines = []; let img = null, n = 0;\n  for (const b of await children(pid, ver)) {\n    const d = b[b.type] || {};\n    const t = plain(d.rich_text);\n    switch (b.type) {\n      case 'paragraph': lines.push(t); n = 0; break;\n      case 'heading_1': case 'heading_2': case 'heading_3': lines.push('', t); n = 0; break;\n      case 'bulleted_list_item': lines.push('• ' + t); break;\n      case 'numbered_list_item': lines.push(++n + '. ' + t); break;\n      case 'to_do': lines.push((d.checked ? '☑ ' : '☐ ') + t); break;\n      case 'quote': case 'callout': lines.push('> ' + t); break;\n      case 'code': lines.push(t); break;\n      case 'divider': lines.push('———'); break;\n      case 'image': if (!img) img = fileUrl(d); break;\n      default: break;\n    }\n    if (b.type !== 'numbered_list_item') n = 0;\n  }\n  return { text: lines.join('\\n').replace(/\\n{3,}/g, '\\n\\n').trim(), img };\n}\n\nasync function syncBoard(board, dbId) {\n  const db = await openDb(dbId);\n  const ent = Object.entries(db.props);\n  const find = (type, re) => (ent.find(([k, v]) => v.type === type && re.test(k)) || [])[0];\n  const titleP = (ent.find(([, v]) => v.type === 'title') || [])[0];\n  const pubP = find('checkbox', /^(공개|게시|발행|published?|public)$/i);\n  const dateP = find('date', /^(날짜|작성일|date)$/i);\n  const catP = find('select', /^(카테고리|분류|category)$/i);\n  const imgP = ent.find(([k, v]) => (v.type === 'files' || v.type === 'url') && /^(이미지|사진|image|cover)$/i.test(k));\n  const posts = [];\n  let cursor = null;\n  do {\n    const body = { page_size: 100 };\n    if (cursor) body.start_cursor = cursor;\n    if (pubP) body.filter = { property: pubP, checkbox: { equals: true } };\n    const j = await db.query(body);\n    for (const pg of j.results) {\n      const pr = pg.properties || {};\n      const title = plain(pr[titleP] && pr[titleP].title) || '(제목 없음)';\n      const { text, img } = await pageBody(pg.id, db.ver);\n      let cover = null;\n      if (imgP) {\n        const v = pr[imgP[0]];\n        cover = v && (v.type === 'url' ? (v.url ? { url: v.url, hosted: false } : null) : fileUrl(v.files && v.files[0]));\n      }\n      cover = cover || fileUrl(pg.cover) || img;\n      posts.push({\n        id: pg.id.replace(/-/g, ''),\n        title,\n        body: text,\n        image: await saveImage(cover, pg.id),\n        category: (catP && pr[catP] && pr[catP].select && pr[catP].select.name) || '',\n        created_at: (dateP && pr[dateP] && pr[dateP].date && pr[dateP].date.start) || pg.created_time\n      });\n    }\n    cursor = j.has_more ? j.next_cursor : null;\n  } while (cursor);\n  posts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));\n  const out = JSON.stringify(posts.slice(0, 200), null, 1) + '\\n';\n  await fs.mkdir('data', { recursive: true });\n  let old = ''; try { old = await fs.readFile('data/' + board + '.json', 'utf8'); } catch {}\n  if (old !== out) await fs.writeFile('data/' + board + '.json', out);\n  console.log(board + ': 글 ' + posts.length + '개' + (old !== out ? ' (갱신됨)' : ' (변경 없음)'));\n}\n\nconst boards = JSON.parse(await fs.readFile('scripts/notion-boards.json', 'utf8'));\nlet failed = 0;\nfor (const [board, id] of Object.entries(boards)) {\n  try { await syncBoard(board, id); }\n  catch (e) { failed++; console.error(board + ' 실패: ' + e.message); }\n}\nif (failed) process.exit(1);\n";
const NOTIONWF="name: Notion 동기화\non:\n  schedule:\n    - cron: '17,47 * * * *'\n  workflow_dispatch:\npermissions:\n  contents: write\njobs:\n  sync:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n      - name: 노션에서 글 가져오기\n        run: node scripts/notion-sync.mjs\n        env:\n          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}\n      - name: 바뀐 게 있으면 저장소에 반영\n        run: |\n          git config user.name \"notion-sync\"\n          git config user.email \"actions@users.noreply.github.com\"\n          git add data\n          git diff --cached --quiet || (git commit -m \"Notion 동기화\" && git push)\n";
/* ---------- page render ---------- */
function restyle(){
 $('#ds').textContent=buildCSS(false);
 let c=(doc.css||'').replace(/(^|[}\s,;{])(body|html)\b(?![-\w])/g,'$1&');
 $('#dc').textContent=c.trim()?'.pg{'+c+'\n}':'';
 drawSel()}
function renderPage(){
 const pg=$('#pg');
 pg.className='pg'+(S.bp!=='d'?' bt':'')+(S.bp==='m'?' bm':'')+(S.pv?' pvm':'')+(S.st==='o'&&!S.pv?' open':'');
 revealPath(S.sel);pg.dataset.id=doc.root.id;
 pg.innerHTML=doc.root.c.map(c=>nodeHTML(c,false)).join('');
 restyle();layout();if(S.pv){startAnim();wheelInit()}}
function wheelInit(){$$('#sc [data-wheel]').forEach(el=>el.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;const max=el.scrollWidth-el.clientWidth;if(max<=0)return;const l=el.scrollLeft;if((e.deltaY>0&&l>=max-1)||(e.deltaY<0&&l<=0))return;e.preventDefault();el.scrollLeft+=e.deltaY},{passive:false}))}
let io=null;
function startAnim(){
 if(io)io.disconnect();
 const els=$$('#pg .ae');els.forEach(e=>e.classList.remove('in'));
 io=new IntersectionObserver(es=>{es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{root:$('#cv'),threshold:.15});
 els.forEach(e=>io.observe(e))}
function layout(){
 const cv=$('#cv'),W=BPS[S.bp].w,av=cv.clientWidth-24;
 const z=S.zm||Math.max(.2,Math.min(1,av/W));S.z=z;
 $('#pg').style.minHeight=BPS[S.bp].h+'px';
 const sc=$('#sc');sc.style.width=W+'px';sc.style.transform='scale('+z+')';
 const h=sc.offsetHeight;const w=$('#scw');w.style.width=(W*z)+'px';w.style.height=(h*z)+'px';
 $('#zl').textContent=Math.round(z*100)+'%';
 const BI={d:['🖥','모든 화면의 기본값'],t:['▭','991px 이하 화면'],m:['📱','479px 이하 화면']}[S.bp];
 $('#bpl').innerHTML=BI[0]+' <b>'+BPS[S.bp].n+' · '+W+'×'+BPS[S.bp].h+'px</b> 기준 · '+BI[1]+'에 적용 · 표시 '+Math.round(z*100)+'%'+(S.st==='o'?' · <b>펼친 상태 편집 중</b>':'');drawSel()}

/* ---------- overlay ---------- */
function drawSel(){
 const w=$('#selw');
 if(S.pv){w.innerHTML='';return}
 const f=find(S.sel);const el=f&&nodeEl(S.sel);
 if(!f||!el){w.innerHTML='';return}
 const base=$('#cvin').getBoundingClientRect(),r=el.getBoundingClientRect();
 const x=r.left-base.left,y=r.top-base.top,ww=r.width,hh=r.height,n=f.n,root=n===doc.root;
 let h='<div class="sbx" style="left:'+x+'px;top:'+y+'px;width:'+ww+'px;height:'+hh+'px"></div>';
 const ly=y<30?y+3:y-27;
 h+='<div class="lbl" style="left:'+Math.max(2,x)+'px;top:'+ly+'px">'+(root?'':'<button class="gp" data-act="grip" title="끌어서 이동">⠿</button>')+'<span>'+E(lab(n))+' <small style="opacity:.75">'+(root?'':'.'+E(n.k))+'</small></span>'
  +(root?'':'<button data-act="parent" title="부모 선택">⤴</button>')+(TXT.has(n.t)?'<button data-act="edit" title="글 수정">✎</button>':'')+(n.t==='inst'?'<button data-act="editcomp" title="컴포넌트 편집">◆✎</button>':'')
  +(root?'':'<button data-act="up" title="앞으로">↑</button><button data-act="down" title="뒤로">↓</button><button data-act="dup" title="복제">⧉</button><button data-act="del" title="삭제">🗑</button>')+'</div>';
 if(!root){
  const free=f.p&&f.p.free;
  const hs=free?[['nw',0,0],['n',.5,0],['ne',1,0],['e',1,.5],['se',1,1],['s',.5,1],['sw',0,1],['w',0,.5]]:[['e',1,.5],['s',.5,1],['se',1,1]];
  hs.forEach(a=>{h+='<div class="hd" data-h="'+a[0]+'" style="left:'+(x+ww*a[1])+'px;top:'+(y+hh*a[2])+'px;cursor:'+(a[0]==='e'||a[0]==='w'?'ew':a[0]==='n'||a[0]==='s'?'ns':a[0]==='ne'||a[0]==='sw'?'nesw':'nwse')+'-resize"></div>'})}
 w.innerHTML=h}
function showInd(d){const i=$('#ind');if(!d){i.style.display='none';return}
 const b=$('#cvin').getBoundingClientRect(),r=d.rect;
 i.className=d.box?'box':'line';i.style.cssText='display:block;left:'+(r.left-b.left)+'px;top:'+(r.top-b.top)+'px;width:'+r.width+'px;height:'+r.height+'px'}

/* ---------- history / save ---------- */
let saveT=0,cT=0;
function snap(){return ser()}
function commit(){clearTimeout(cT);const s=snap();if(s===hist[hp]){save();return}hist.length=hp+1;hist.push(s);hp++;if(hist.length>100){hist.shift();hp--}save();renderTop()}
function commitSoon(){clearTimeout(cT);cT=setTimeout(commit,350);save()}
function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('homejit-v3',snap())}catch(e){}},200)}
function saveAssets(){try{localStorage.setItem('homejit-v3a',JSON.stringify(ASSETS))}catch(e){toast('이미지가 커서 자동저장이 안 될 수 있어요. 내보내기에서 작업 파일을 저장해 두세요.')}}
function restore(s){doc=JSON.parse(s);normDoc();if(!find(S.sel))S.sel=doc.root.id;fullRender()}
function undo(){if(hp>0){clearTimeout(cT);commit();hp--;restore(hist[hp])}}
function redo(){if(hp<hist.length-1){hp++;restore(hist[hp])}}
function fullRender(){renderPage();renderTree();renderPanels();renderAdd();renderTop();$('#ttl').value=doc.title}
function refresh(){renderPage();renderTree();renderPanels();renderAdd();renderTop();save()}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)}

/* ---------- tree ops ---------- */
function moveNode(id,par,idx){const f=find(id);if(!f||!f.p)return false;if(par.id===id||find(par.id,f.n))return false;
 const oi=f.p.c.indexOf(f.n);f.p.c.splice(oi,1);if(f.p===par&&oi<idx)idx--;
 par.c.splice(Math.max(0,Math.min(idx,par.c.length)),0,f.n);return true}
function setS(n,prop,val,bp){const s=n.s[bp||(S.st==='o'?'o':S.bp)];if(!s)return;if(val===''||val==null)delete s[prop];else s[prop]=val}
function getS(n,prop){const base=S.bp==='d'?['d']:S.bp==='t'?['t','d']:['m','t','d'];const order=S.st==='o'?['o'].concat(base):base;
 for(let i=0;i<order.length;i++){const v=n.s[order[i]][prop];if(v!=null&&v!=='')return{v:v,own:i===0}}return{v:'',own:false}}
function placeNew(nn,par,idx,pt){
 par.c.splice(idx,0,nn);
 if(par.free){const pe=nodeEl(par.id);const r=pe?pe.getBoundingClientRect():null;const off=par.c.length*14;
  let lx=24+off,ty=24+off;if(pt&&r){lx=Math.round((pt.x-r.left)/S.z);ty=Math.round((pt.y-r.top)/S.z)}
  setS(nn,'left',lx+'px','d');setS(nn,'top',ty+'px','d');
  if(isCont(nn)||nn.t==='image'||nn.t==='youtube'||nn.t==='video')setS(nn,'width','240px','d')}
 S.sel=nn.id;commit();refresh()}
function addClick(nn){const f=find(S.sel)||{n:doc.root};let par,idx;const s=f.n;
 if(isCont(s)){par=s;idx=s.c.length}else{par=f.p;idx=par.c.indexOf(s)+1}
 placeNew(nn,par,idx);toast(lab(nn)+' 추가됨')}
function delSel(){const f=find(S.sel);if(!f||!f.p)return;const i=f.p.c.indexOf(f.n);f.p.c.splice(i,1);S.sel=(f.p.c[i]||f.p.c[i-1]||f.p).id;commit();refresh()}
function dupSel(){const f=find(S.sel);if(!f||!f.p)return;const c=cloneNode(f.n);f.p.c.splice(f.p.c.indexOf(f.n)+1,0,c);S.sel=c.id;commit();refresh()}
function shift(d){const f=find(S.sel);if(!f||!f.p)return;const i=f.p.c.indexOf(f.n),j=i+d;if(j<0||j>=f.p.c.length)return;f.p.c.splice(i,1);f.p.c.splice(j,0,f.n);commit();refresh()}
function selParent(){const f=find(S.sel);if(f&&f.p)select(f.p.id)}
function select(id){S.sel=id;if(revealPath(id))renderPage();renderTree();renderPanels();drawSel()}

/* ---------- drop target ---------- */
function inSub(id,anc){const f=find(anc);return !!(f&&find(id,f.n))}
function dropAt(x,y,exId){
 let el=document.elementFromPoint(x,y);let ne=el&&el.closest?el.closest('#sc [data-id]'):null;
 while(ne&&exId&&inSub(ne.dataset.id,exId))ne=ne.parentElement?ne.parentElement.closest('#sc [data-id]'):null;
 if(!ne)return null;
 const f=find(ne.dataset.id);if(!f)return null;
 let n=f.n,par,ref=null;
 if(!isCont(n)){ref=n;par=f.p;if(!par)return null}else par=n;
 const pe=par.t==='inst'?($('#sc [data-slot="'+par.id+'"]')||nodeEl(par.id)):nodeEl(par.id);
 if(par.free)return{par:par,free:true,x:x,y:y,idx:par.c.length,rect:pe.getBoundingClientRect(),box:true};
 const kids=par.c.filter(c=>c.id!==exId);
 if(!kids.length)return{par:par,idx:0,rect:pe.getBoundingClientRect(),box:true};
 const cs=getComputedStyle(pe);
 let axis='y';if(cs.display.indexOf('flex')>=0&&cs.flexDirection.indexOf('row')===0)axis='x';else if(cs.display.indexOf('grid')>=0)axis='g';
 let best=null,bd=1e9;
 if(ref)best=ref;else kids.forEach(c=>{const ce=nodeEl(c.id);if(!ce)return;const r=ce.getBoundingClientRect();const dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom);const d=dx*dx+dy*dy;if(d<bd){bd=d;best=c}});
 const be=nodeEl(best.id);const r=be.getBoundingClientRect();
 let before;const cx=r.left+r.width/2,cy=r.top+r.height/2;
 if(axis==='x')before=x<cx;else if(axis==='y')before=y<cy;else before=(y>=r.top&&y<=r.bottom)?x<cx:y<cy;
 const bi=kids.indexOf(best);let idx=par.c.indexOf(best)+(before?0:1);
 let line;
 if(axis==='x'||(axis==='g'&&y>=r.top&&y<=r.bottom))line={left:before?r.left-2:r.right-2,top:r.top,width:4,height:r.height};
 else line={left:r.left,top:before?r.top-2:r.bottom-2,width:r.width,height:4};
 return{par:par,idx:idx,rect:line,bi:bi}}
function applyDrop(d,id,nn){
 if(!d)return false;
 if(nn){placeNew(nn,d.par,d.idx,d.free?{x:d.x,y:d.y}:null);return true}
 const f=find(id);
 if(d.free){if(!moveNode(id,d.par,d.idx))return false;const pe=nodeEl(d.par.id).getBoundingClientRect();
  setS(f.n,'left',Math.round((d.x-pe.left)/S.z)+'px','d');setS(f.n,'top',Math.round((d.y-pe.top)/S.z)+'px','d');
  if(!f.n.s.d.width)setS(f.n,'width','200px','d')}
 else{if(!moveNode(id,d.par,d.idx))return false;
  if(f.p&&f.p.free){/* leaving free box: drop absolute coords */['left','top'].forEach(k=>['d','t','m'].forEach(b=>delete f.n.s[b][k]))}}
 commit();refresh();return true}

/* ---------- presets & add panel ---------- */
const mkN=mk;
function stackN(n){const cells=[];for(let i=0;i<n;i++)cells.push(mk('box'));return mk('stack',{d:{'grid-template-columns':'repeat('+n+',1fr)'},t:n>2?{'grid-template-columns':'repeat(2,1fr)'}:{}},cells)}
function cardN(t,d,fx){return mk('box',{fx:fx===undefined?'lift':fx,d:{'background-color':'#ffffff','border-radius':'16px','box-shadow':'0 8px 24px rgba(0,0,0,.08)',padding:'0',overflow:'hidden',gap:'0'}},[mk('image',{d:{height:'160px','object-fit':'cover'}}),mk('box',{d:{gap:'6px',padding:'18px'}},[mk('heading',{tag:'h3',text:t,d:{'font-size':'20px'}}),mk('text',{text:d,d:{color:'#666666','font-size':'15px'}})])])}
function secN(kids,o){return mk('section',o||{},[mk('container',{},kids)])}
function navN(){return mk('box',{tag:'nav',name:'네비게이션',d:{'flex-direction':'row','justify-content':'space-between','align-items':'center',padding:'16px 24px',gap:'16px'},m:{padding:'12px 16px'}},[
 mk('text',{text:'My Page',d:{'font-weight':'700','font-size':'20px'}}),
 mk('box',{d:{'flex-direction':'row',gap:'20px',padding:'0'}},[mk('link',{text:'소개',href:'#about',d:{color:'inherit','text-decoration':'none'},fx:'fade'}),mk('link',{text:'작업',href:'#work',d:{color:'inherit','text-decoration':'none'},fx:'fade'}),mk('link',{text:'연락',href:'#contact',d:{color:'inherit','text-decoration':'none'},fx:'fade'})])])}
function heroN(){return mk('section',{name:'히어로',d:{'background-color':'#f5f3ff',padding:'96px 24px'},m:{padding:'56px 16px'}},[
 mk('container',{d:{'align-items':'center','text-align':'center',gap:'18px','max-width':'720px'}},[
  mk('image',{d:{width:'128px',height:'128px','border-radius':'50%','object-fit':'cover'},an:'zoom'}),
  mk('heading',{tag:'h1',text:'안녕하세요, 저는 홍길동입니다',d:{'font-size':'52px'},m:{'font-size':'34px'},an:'up'}),
  mk('text',{text:'만들고 기록하는 사람이에요. 이곳에 간단한 소개를 적어보세요.',d:{color:'#555555'},an:'up',ads:0.15}),
  mk('box',{d:{'flex-direction':'row','justify-content':'center',gap:'12px',padding:'0','flex-wrap':'wrap'}},[
   mk('button',{text:'작업 보기',href:'#work',fx:'lift'}),
   mk('button',{text:'연락하기',href:'#contact',fx:'lift',d:{'background-color':'transparent',color:'#111111','border-width':'2px','border-style':'solid','border-color':'#111111'}})])])])}
function profileN(){return mk('box',{name:'프로필',d:{'align-items':'center',gap:'10px'}},[mk('image',{d:{width:'120px',height:'120px','border-radius':'50%','object-fit':'cover'}}),mk('heading',{tag:'h2',text:'이름',d:{'font-size':'26px'}}),mk('text',{text:'한 줄 소개를 적어보세요.',d:{color:'#666666','text-align':'center'}})])}
function linksN(){const b=t=>mk('button',{text:t,href:'#',fx:'grow',d:{width:'100%','background-color':'#ffffff',color:'#111111','border-width':'1px','border-style':'solid','border-color':'#d9d9e0'}});return mk('box',{name:'링크 목록',d:{gap:'12px',width:'100%','max-width':'420px',padding:'0'}},[b('블로그'),b('인스타그램'),b('깃허브'),b('이메일')])}
function footN(){return mk('section',{tag:'footer',name:'푸터',d:{padding:'32px 24px','background-color':'#111111',color:'#cccccc'}},[mk('text',{text:'© 2026 My Page. All rights reserved.',d:{'font-size':'14px','text-align':'center'}})])}
const PRE={
 section:()=>mk('section',{},[mk('container')]),container:()=>mk('container'),box:()=>mk('box'),
 free:()=>mk('box',{free:true,name:'자유 배치 박스',d:{height:'360px',padding:'0',gap:'0','background-color':'#f4f4f8'}}),
 stack2:()=>stackN(2),stack3:()=>stackN(3),stack4:()=>stackN(4),
 heading:()=>mk('heading',{text:'제목을 입력하세요'}),
 text:()=>mk('text',{text:'여기에 내용을 입력하세요. 더블클릭하거나 ✎ 버튼으로 수정할 수 있어요.'}),
 link:()=>mk('link',{text:'텍스트 링크',href:'#'}),button:()=>mk('button',{text:'버튼',href:'#'}),
 image:()=>mk('image'),divider:()=>mk('divider'),spacer:()=>mk('spacer'),
 youtube:()=>mk('youtube'),video:()=>mk('video'),embed:()=>mk('embed',{code:'<p style="padding:16px;background:#fff7e6">여기에 HTML 코드를 붙여넣으세요</p>'}),form:()=>mk('form'),board:()=>mk('board'),
 slot:()=>mk('slot'),nav:navN,hero:heroN,profile:profileN,card:()=>cardN('카드 제목','카드 설명을 적어보세요.'),links:linksN,footer:footN
};
const ADDS=[
 ['구조',[['section','▭','섹션'],['container','⬚','컨테이너'],['box','☐','박스'],['stack2','▥','퀵 스택'],['free','⤧','자유 배치 박스'],['slot','⬒','슬롯']]],
 ['기본 요소',[['heading','H','제목'],['text','¶','문단'],['link','🔗','텍스트 링크'],['button','▣','버튼'],['image','🖼','이미지'],['divider','―','구분선'],['spacer','↕','여백']]],
 ['미디어 · 폼 · 게시판',[['youtube','▶','유튜브'],['video','🎬','비디오'],['embed','</>','코드 임베드'],['form','✉','폼'],['board','📋','게시판']]],
 ['완성형 블록',[['nav','☰','네비게이션'],['hero','★','히어로'],['profile','☺','프로필'],['card','▤','카드'],['links','🔗','링크 목록'],['footer','▁','푸터']]]
];
function pageBar(){return '<div class="pgb"><select data-pgsel title="페이지">'+doc.pages.map((p,i)=>'<option value="'+i+'"'+(i===doc.cur?' selected':'')+'>'+(i===0?'🏠 ':p.kind==='post'?'📰 ':'')+E(p.name)+'</option>').join('')+'</select><button data-pgbtn="add" title="새 페이지">＋</button><button data-pgbtn="set" title="페이지 설정">⚙</button></div>'}
document.addEventListener('change',e=>{const s=e.target.closest('[data-pgsel]');if(s)switchPage(+s.value)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-pgbtn]');if(!b)return;if(b.dataset.pgbtn==='add')addPage();else openPageSet()});
function renderAdd(){
 const cs=Object.keys(doc.comps||{});
 $('#p-add').innerHTML=pageBar()+(cs.length?'<div class="gt" style="margin-top:0">내 컴포넌트</div><div class="tiles">'+cs.map(id=>'<button class="tile" data-comp="'+id+'"><i>◆</i>'+E(doc.comps[id].name)+'</button>').join('')+'</div>':'')+'<p class="note" style="margin:0 0 4px">탭하면 선택한 박스 안에 들어가요. 마우스로는 캔버스로 끌어다 놓을 수도 있어요.</p>'+ADDS.map(g=>'<div class="gt">'+g[0]+'</div><div class="tiles">'+g[1].map(t=>'<button class="tile" data-add="'+t[0]+'"><i>'+t[1]+'</i>'+t[2]+'</button>').join('')+'</div>').join('')}

/* ---------- navigator ---------- */
function renderTree(){
 const o=[];
 (function w(n,d){const D=T[n.t],k=n.c.length,col=S.col.has(n.id),root=n===doc.root;
  const hid=getS(n,'display').v==='none';
  o.push('<div class="tr'+(n.id===S.sel?' on':'')+(hid?' hid':'')+'" data-id="'+n.id+'" style="padding-left:'+(d*14+4)+'px"><i class="tg" data-tg="'+n.id+'">'+(k?(col?'▸':'▾'):'·')+'</i><span>'+D.ic+'</span><span class="tn">'+E(root?(doc.main?'컴포넌트 편집 영역':'페이지 (body)'):lab(n))+'</span><em>'+(root?'':'.'+E(n.k)+(n.cls?' .'+E(n.cls.split(' ')[0]):''))+'</em>'+(root?'':'<b class="grip" data-grip="'+n.id+'" title="끌어서 이동">⠿</b>')+'</div>');
  if(!col)n.c.forEach(c=>w(c,d+1))})(doc.root,0);
 const p=$('#p-tree'),st=p.scrollTop;p.innerHTML=pageBar()+o.join('');p.scrollTop=st}

/* ---------- style panel ---------- */
const U=['px','%','rem','em','vw','vh','auto'];
function toHex(v){v=(v||'').trim();if(/^#[0-9a-f]{6}$/i.test(v))return v;const m=/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v);return m?'#'+m[1]+m[1]+m[2]+m[2]+m[3]+m[3]:'#000000'}
function lenF(n,label,p,units){units=units||U;const g=getS(n,p);let num='',u='px',raw=false;const v=g.v;
 if(v==='auto')u='auto';else if(v){const m=/^(-?\d*\.?\d+)([a-z%]*)$/.exec(v);if(m){num=m[1];u=m[2]||'px';if(units.indexOf(u)<0){raw=true;num=v}}else{raw=true;num=v}}
 return '<div class="f'+(g.own||!g.v?'':' inh')+'"><span class="fl">'+label+'</span><span class="len'+(g.own?' own':'')+'"><input type="text" data-p="'+p+'" inputmode="decimal" value="'+E(num)+'" placeholder="–"><select data-u="'+p+'">'+(raw?'<option value="" selected>—</option>':'')+units.map(x=>'<option'+(x===u&&!raw?' selected':'')+'>'+x+'</option>').join('')+'</select>'+(g.own?'<i data-reset="'+p+'" title="이 화면의 값 지우기">↺</i>':'')+'</span></div>'}
function selF(n,label,p,opts){const g=getS(n,p);let h='<option value="">기본</option>';let hit=!g.v;opts.forEach(o=>{if(o[0]===g.v)hit=true;h+='<option value="'+E(o[0])+'"'+(o[0]===g.v?' selected':'')+'>'+o[1]+'</option>'});if(!hit)h+='<option selected value="'+E(g.v)+'">'+E(g.v)+'</option>';
 return '<div class="f'+(g.own||!g.v?'':' inh')+'"><span class="fl">'+label+'</span><span class="fc"><select data-p="'+p+'">'+h+'</select>'+(g.own?'<i class="rst" data-reset="'+p+'">↺</i>':'')+'</span></div>'}
function segF(n,label,p,opts,tg){const g=getS(n,p);return '<div class="f"><span class="fl">'+label+'</span><span class="seg">'+opts.map(o=>'<button data-p="'+p+'" data-v="'+E(o[0])+'"'+(tg?' data-tg2="1"':'')+(o[0]===g.v?' class="on"':'')+'>'+o[1]+'</button>').join('')+'</span></div>'}
function colF(n,label,p){const g=getS(n,p);return '<div class="f'+(g.own||!g.v?'':' inh')+'"><span class="fl">'+label+'</span><span class="col"><input type="color" data-p="'+p+'" data-c="1" value="'+toHex(g.v)+'"><input type="text" data-p="'+p+'" data-ct="1" value="'+E(g.v)+'" placeholder="없음">'+(g.own?'<i class="rst" data-reset="'+p+'">↺</i>':'')+'</span></div>'}
function numF(n,label,p,min,max,step,range){const g=getS(n,p);return '<div class="f'+(g.own||!g.v?'':' inh')+'"><span class="fl">'+label+'</span><span class="fc">'+(range?'<input type="range" data-p="'+p+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+(g.v===''?max:g.v)+'" style="flex:1">':'')+'<input type="number" data-p="'+p+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+E(g.v)+'" placeholder="–" style="'+(range?'width:64px;flex:none':'')+'">'+(g.own?'<i class="rst" data-reset="'+p+'">↺</i>':'')+'</span></div>'}
function txtF(n,label,p,ph){const g=getS(n,p);return '<div class="f'+(g.own||!g.v?'':' inh')+'"><span class="fl">'+label+'</span><span class="fc"><input type="text" data-p="'+p+'" value="'+E(g.v)+'" placeholder="'+E(ph||'')+'">'+(g.own?'<i class="rst" data-reset="'+p+'">↺</i>':'')+'</span></div>'}
function spF(n,title,pre){const nm=['위','오른','아래','왼'];return '<div class="f"><span class="fl">'+title+'</span><span class="sp4">'+['top','right','bottom','left'].map((s,i)=>{const p=pre+'-'+s,g=getS(n,p);return '<label>'+nm[i]+'<input type="text" data-p="'+p+'" data-sp="1" inputmode="decimal" value="'+E(g.v.replace(/px$/,''))+'" placeholder="0" style="'+(g.own?'border-color:var(--ac);background:var(--ac2)':'')+'"></label>'}).join('')+'</span></div>'}
function chipsF(label,p,vals){return '<div class="f"><span class="fl">'+label+'</span><span class="chips">'+vals.map(v=>'<button data-setp="'+p+'" data-setv="'+E(v[0])+'">'+v[1]+'</button>').join('')+'</span></div>'}
function sec(name,title,body){return '<details class="sec" data-s="'+name+'"'+(S.sec[name]?' open':'')+'><summary>'+title+'</summary><div class="sb2">'+body+'</div></details>'}
function nodeHead(n){const root=n===doc.root;return '<div class="nh"><span class="chip">'+E(lab(n))+'</span>'+(root?'':'<span class="cl">.'+E(n.k)+'</span>')+(root?'':'<span class="acts"><button data-act="parent" title="부모 선택">⤴</button><button data-act="up" title="앞으로">↑</button><button data-act="down" title="뒤로">↓</button><button data-act="dup" title="복제">⧉</button><button data-act="del" title="삭제">🗑</button></span>')+'</div>'}
const GRADS=['linear-gradient(135deg,#6366f1,#ec4899)','linear-gradient(135deg,#06b6d4,#3b82f6)','linear-gradient(135deg,#f59e0b,#ef4444)','linear-gradient(180deg,#0f172a,#334155)'];
function renderStyle(){
 const box=$('#p-style'),st=box.scrollTop,f=find(S.sel);
 if(!f){box.innerHTML='<p class="hint">요소를 선택하세요</p>';return}
 const n=f.n,cont=n.t!=='inst'&&isCont(n),root=n===doc.root,free=f.p&&f.p.free;
 const bpn=S.bp==='d'?'<b>데스크톱</b> 기본값을 편집 중이에요. 태블릿·모바일에도 기본으로 적용돼요.':'<b>'+BPS[S.bp].n+'</b> 화면에서만 다르게 적용돼요. 파란 칸 = 이 화면에서 바꾼 값, 회색 = 위 화면에서 물려받은 값.';
 let h=nodeHead(n)+'<div class="bpn">'+bpn+'</div>'+(S.st==='o'?'<div class="bpn" style="background:var(--ac2)"><b>펼친 상태</b>를 편집 중이에요. 클릭 동작으로 열렸을 때의 값이고, 안 바꾼 항목은 기본 상태 그대로예요.</div>':'');
 let lay='';
 if(cont){
  const disp=getS(n,'display').v||'block';
  lay+=segF(n,'배치','display',[['flex','플렉스'],['grid','그리드'],['block','블록']]);
  if(disp==='flex'){const dir=getS(n,'flex-direction').v||'row',row=dir.indexOf('row')===0;
   lay+=segF(n,'방향','flex-direction',[['column','↓ 세로'],['row','→ 가로']]);
   lay+=segF(n,'줄바꿈','flex-wrap',[['nowrap','한 줄'],['wrap','감싸기']]);
   lay+=selF(n,row?'가로 배치':'세로 배치','justify-content',[['flex-start','시작'],['center','가운데'],['flex-end','끝'],['space-between','양끝 분산'],['space-around','균등 분산']]);
   lay+=selF(n,row?'세로 정렬':'가로 정렬','align-items',[['stretch','늘이기'],['flex-start','시작'],['center','가운데'],['flex-end','끝']]);
   lay+=lenF(n,'간격','gap');
   const hs=n.hs;lay+='<div class="f"><span class="fl">가로 스크롤</span><span class="chips"><button data-hs="on"'+(hs?' class="on"':'')+'>'+(hs?'켜짐':'꺼짐')+'</button>'+(hs?'<button data-hs="snap"'+(hs.snap?' class="on"':'')+'>카드에 붙기</button><button data-hs="hide"'+(hs.hide?' class="on"':'')+'>스크롤바 숨김</button><button data-hs="wheel"'+(hs.wheel?' class="on"':'')+'>휠로 가로 이동</button>':'')+'</span></div>'+(hs?'<p class="note">안의 요소 폭을 고정해 두면(예: 480px) 옆으로 넘겨져요. 양 끝 여백은 안쪽 여백으로 조절해요. 휠 이동은 ▶ 미리보기와 내보낸 페이지에서 동작해요.</p>':'')}
  else if(disp==='grid'){const m=/repeat\((\d+)/.exec(getS(n,'grid-template-columns').v||'');
   const cur=m?parseInt(m[1],10):0;
   lay+='<div class="f"><span class="fl">열 개수</span><span class="seg">'+[1,2,3,4].map(k=>'<button data-colsv="'+k+'"'+(cur===k?' class="on"':'')+'>'+k+'열</button>').join('')+'</span></div>';
   lay+='<div class="f"><span class="fl">직접 입력</span><span class="fc"><input type="number" data-cols="1" min="1" max="12" value="'+(m?m[1]:'')+'" placeholder="–"></span></div>';
   lay+=lenF(n,'간격','gap');lay+=selF(n,'세로 정렬','align-items',[['stretch','늘이기'],['start','위'],['center','가운데'],['end','아래']]);
   if(n.t==='stack')lay+='<button class="btn2" data-act="addcell">＋ 셀(박스) 추가</button>'}
  if(n.t!=='stack'&&n.t!=='root')lay+='<label class="f" style="cursor:pointer"><span class="fl">자유 배치</span><span class="fc"><input type="checkbox" data-free="1"'+(n.free?' checked':'')+'> 안의 요소를 마음대로 끌어 배치</span></label>';
  if(n.free)lay+='<p class="note">자유 배치 박스예요. 안의 요소를 끌어 옮기고 핸들로 크기를 조절하세요. 위치 값은 화면(데스크톱/태블릿/모바일)별로 따로 저장돼요.</p>'}
 if(!root){lay+=selF(n,'자기 정렬','align-self',[['auto','자동'],['flex-start','시작'],['center','가운데'],['flex-end','끝'],['stretch','늘이기']]);lay+=numF(n,'늘어남','flex-grow',0,5,1)}
 h+=sec('layout','레이아웃',lay||'<p class="note">페이지 전체 설정이에요.</p>');
 if(!root){
  h+=sec('size','크기',chipsF('너비','width',[['auto','자동'],['100%','100%'],['50%','50%'],['fit-content','내용만큼']])+lenF(n,'너비','width')+lenF(n,'최대 너비','max-width')+lenF(n,'높이','height')+lenF(n,'최소 높이','min-height')+(n.t==='image'?selF(n,'맞춤','object-fit',[['cover','채우기'],['contain','맞추기'],['fill','늘이기']])+txtF(n,'비율','aspect-ratio','16/9'):''));
  h+=sec('space','여백',spF(n,'바깥 여백','margin')+spF(n,'안쪽 여백','padding'));
  if(free)h+=sec('pos','위치 (자유 배치)',lenF(n,'왼쪽','left')+lenF(n,'위','top')+numF(n,'겹침','z-index',-10,99,1))}
 else h+=sec('space','여백',spF(n,'안쪽 여백','padding'));
 h+=sec('typo','글자',selF(n,'글꼴','font-family',FONTS.map(x=>[FAM(x[0]),x[0]]))+lenF(n,'크기','font-size',['px','rem','em','vw'])
  +selF(n,'굵기','font-weight',[['400','보통'],['500','중간'],['700','굵게'],['900','매우 굵게']])+colF(n,'색','color')
  +segF(n,'정렬','text-align',[['left','왼쪽'],['center','가운데'],['right','오른쪽']])+numF(n,'줄 높이','line-height',0.8,4,0.1)+lenF(n,'자간','letter-spacing',['px','em'])
  +segF(n,'모양','font-style',[['italic','기울임']],true)+segF(n,'밑줄','text-decoration',[['underline','밑줄'],['none','없음']],true)+selF(n,'대소문자','text-transform',[['none','그대로'],['uppercase','대문자'],['capitalize','첫 글자']]));
 let bg=colF(n,'배경색','background-color')+'<div class="f"><span class="fl">배경 이미지</span><span class="chips"><button data-setp="background-image" data-setv="">없음</button>'+GRADS.map((g,i)=>'<button class="sw" data-setp="background-image" data-setv="'+E(g)+'" style="background:'+g+'"></button>').join('')+'<button data-act="bgup">올리기</button></span></div>'+txtF(n,'CSS 값','background-image','url(...) / gradient')+selF(n,'크기','background-size',[['cover','채우기'],['contain','맞추기'],['auto','원본']])+selF(n,'위치','background-position',[['center','가운데'],['top','위'],['bottom','아래']]);
 h+=sec('bg','배경',bg);
 const dv=n.t==='divider';
 h+=sec('bd','테두리 · 효과',lenF(n,'테두리 두께',dv?'border-top-width':'border-width',['px'])+selF(n,'종류','border-style',[['none','없음'],['solid','실선'],['dashed','점선'],['dotted','점']])+colF(n,'테두리 색','border-color')+lenF(n,'모서리','border-radius',['px','%','rem'])
  +'<div class="f"><span class="fl">그림자</span><span class="chips">'+[['','없음'],['0 2px 8px rgba(0,0,0,.08)','약하게'],['0 8px 24px rgba(0,0,0,.14)','보통'],['0 16px 48px rgba(0,0,0,.28)','강하게']].map(s=>'<button data-setp="box-shadow" data-setv="'+E(s[0])+'"'+(getS(n,'box-shadow').v===s[0]?' class="on"':'')+'>'+s[1]+'</button>').join('')+'</span></div>'
  +'<div class="f"><span class="fl">필터</span><span class="chips">'+[['','없음'],['grayscale(1)','흑백'],['sepia(.6)','세피아'],['brightness(.7)','어둡게'],['blur(3px)','흐리게'],['grayscale(1) contrast(1.15)','흑백+대비']].map(s=>'<button data-setp="filter" data-setv="'+E(s[0])+'"'+(getS(n,'filter').v===s[0]?' class="on"':'')+'>'+s[1]+'</button>').join('')+'</span></div>'+numF(n,'투명도','opacity',0,1,0.05,true)+selF(n,'넘침','overflow',[['visible','보이기'],['hidden','자르기'],['auto','스크롤']]));
 if(!root)h+=sec('vis','표시','<label class="f" style="cursor:pointer"><input type="checkbox" data-hide="1"'+(getS(n,'display').v==='none'?' checked':'')+'> <span>'+BPS[S.bp].n+' 화면에서 숨기기</span></label>');
 box.innerHTML=h;box.scrollTop=st}

function lenVal(wrap,byUnit){const inp=$('input',wrap),sel=$('select',wrap);const v=inp.value.trim(),u=sel?sel.value:'px';
 if(u==='auto'&&(byUnit||!v))return 'auto';if(v==='')return '';if(/^-?\d*\.?\d+$/.test(v))return v+((u&&u!=='auto')?u:'px');return v}
function setFree(n,on){
 if(on){if(S.bp!=='d'){toast('자유 배치는 데스크톱 화면에서 켜 주세요');return false}
  const pe=nodeEl(n.id),pr=pe.getBoundingClientRect();
  n.c.forEach(c=>{const ce=nodeEl(c.id);if(!ce)return;const r=ce.getBoundingClientRect();
   setS(c,'left',Math.round((r.left-pr.left)/S.z)+'px','d');setS(c,'top',Math.round((r.top-pr.top)/S.z)+'px','d');setS(c,'width',Math.round(r.width/S.z)+'px','d');
   if(isCont(c))setS(c,'height',Math.round(r.height/S.z)+'px','d')});
  n.free=true;if(!n.s.d.height&&!n.s.d['min-height'])setS(n,'height',Math.max(Math.round(pr.height/S.z),320)+'px','d')}
 else{n.c.forEach(c=>['left','top'].forEach(k=>['d','t','m'].forEach(b=>delete c.s[b][k])));n.free=false}
 return true}
function setCols(n,v){
 if(!(v>0)){setS(n,'grid-template-columns','');restyle();commit();renderStyle();return}
 v=Math.min(v,12);setS(n,'grid-template-columns','repeat('+v+',1fr)');
 let add=false;if(n.t==='stack')while(n.c.length<v){n.c.push(mk('box'));add=true}
 commit();if(add)refresh();else{restyle();renderStyle()}}
function styleEv(e,final){
 const t=e.target,f=find(S.sel);if(!f)return;const n=f.n;
 if(t.dataset.free){if(!setFree(n,t.checked)){t.checked=!t.checked;return}commit();refresh();return}
 if(t.dataset.hide){if(t.checked)setS(n,'display','none');else{setS(n,'display','');if(getS(n,'display').v==='none')setS(n,'display',T[n.t].d.display||(isCont(n)?'flex':'block'))}restyle();commit();renderTree();renderStyle();return}
 if(t.dataset.cols){setCols(n,parseInt(t.value,10));return}
 const prop=t.dataset.p||t.dataset.u;if(!prop)return;
 let val;
 if(t.dataset.u!==undefined||(t.closest('.len')&&t.dataset.p))val=lenVal(t.closest('.len'),t.dataset.u!==undefined);
 else if(t.dataset.sp){const v=t.value.trim();val=v===''?'':/^-?\d*\.?\d+$/.test(v)?v+'px':v}
 else if(t.dataset.c){val=t.value;const tx=t.parentNode.querySelector('[data-ct]');if(tx)tx.value=val}
 else val=t.value;
 setS(n,prop,val);
 if(prop==='border-width'&&val&&!getS(n,'border-style').v)setS(n,'border-style','solid');
 restyle();
 if(final){commit();renderStyle();if(prop==='display'||prop==='font-family')renderTree()}else commitSoon()}
$('#p-style').addEventListener('change',e=>styleEv(e,true));
$('#p-style').addEventListener('input',e=>{const t=e.target;if(t.dataset.c||t.type==='range')styleEv(e,false)});
$('#p-style').addEventListener('toggle',e=>{if(e.target.dataset&&e.target.dataset.s)S.sec[e.target.dataset.s]=e.target.open?1:0},true);
$('#p-style').addEventListener('click',e=>{
 const f=find(S.sel);if(!f)return;const n=f.n;
 const cb=e.target.closest('[data-colsv]');
 if(cb){setCols(n,+cb.dataset.colsv);return}
 const hb=e.target.closest('[data-hs]');
 if(hb){const k=hb.dataset.hs;if(k==='on'){if(n.hs)delete n.hs;else{n.hs={snap:true,hide:true,wheel:true};if(getS(n,'flex-direction').v!=='row')setS(n,'flex-direction','row','d')}}else if(n.hs)n.hs[k]=!n.hs[k];commit();refresh();return}
 const sg=e.target.closest('button[data-p][data-v]');
 if(sg){const p=sg.dataset.p,v=sg.dataset.v;const cur=getS(n,p).v;setS(n,p,(sg.dataset.tg2&&cur===v)?(p==='text-decoration'?'none':''):v);restyle();commit();renderStyle();if(p==='display')renderTree();return}
 const sp=e.target.closest('[data-setp]');
 if(sp){setS(n,sp.dataset.setp,sp.dataset.setv);restyle();commit();renderStyle();return}
 const rt=e.target.closest('[data-reset]');
 if(rt){setS(n,rt.dataset.reset,'');restyle();commit();renderStyle();renderTree();return}
 const a=e.target.closest('[data-act]');
 if(a)act(a.dataset.act)});

/* ---------- settings panel ---------- */
function nkText(n,label,k,ph){return '<div class="f"><span class="fl">'+label+'</span><span class="fc"><input type="text" data-nk="'+k+'" value="'+E(n[k]||'')+'" placeholder="'+E(ph||'')+'"></span></div>'}
function nkArea(n,label,k,rows,cls){return '<div class="gt" style="margin:6px 0 4px">'+label+'</div><textarea class="'+(cls||'')+'" data-nk="'+k+'" rows="'+(rows||3)+'">'+E(n[k]||'')+'</textarea>'}
function nkChk(n,label,k){return '<label class="f" style="cursor:pointer"><input type="checkbox" data-nk="'+k+'"'+(n[k]?' checked':'')+'> <span>'+label+'</span></label>'}
function nkSel(n,label,k,opts){return '<div class="f"><span class="fl">'+label+'</span><span class="fc"><select data-nk="'+k+'">'+opts.map(o=>'<option value="'+o[0]+'"'+((n[k]||T[n.t].tag)===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div>'}
function hrefF(n,label,ph){const cur=n.href&&n.href.indexOf('page:')===0;return '<div class="f"><span class="fl">연결 페이지</span><span class="fc"><select data-nk="href"><option value="">직접 입력 / 선택 안 함</option>'+doc.pages.map(p=>'<option value="page:'+p.id+'"'+(n.href==='page:'+p.id?' selected':'')+'>'+E(p.name)+'</option>').join('')+'</select></span></div>'+(cur?'':nkText(n,label,'href',ph))}
function renderSet(){
 const box=$('#p-set'),st=box.scrollTop,f=find(S.sel);
 if(!f){box.innerHTML='';return}
 const n=f.n,root=n===doc.root;let h=nodeHead(n)+'<div class="sb2">';
 if(n.t==='inst')h+='<button class="btn2" data-act="editcomp">◆ 컴포넌트 편집 (모양 바꾸기)</button><button class="btn2" data-act="detach">컴포넌트에서 분리하기</button><p class="note">컴포넌트를 고치면 쓴 모든 곳에 반영돼요. 슬롯 자리에는 이 인스턴스만의 내용을 넣을 수 있어요.</p>';
 else if(!root&&isCont(n)&&n.t!=='slot'&&n.t!=='board')h+=(!boardOf(n.id)?'<button class="btn2" data-act="mkboard">📋 게시판 카드로 만들기</button>':'')+'<button class="btn2" data-act="mkcomp">◆ 컴포넌트로 만들기</button><p class="note">헤더·푸터·카드처럼 여러 번 쓰는 구조를 한 번만 고치면 돼요. 안에 <b>슬롯</b>을 넣으면 쓸 때마다 다른 내용을 끼울 수 있어요.</p>';
 if(n.t==='slot')h+='<p class="note"><b>슬롯</b>은 컴포넌트 안에서 "여기에 내용이 들어와요" 하고 비워두는 자리예요. 컴포넌트를 쓰는 곳마다 이 자리에 다른 요소를 넣을 수 있어요.</p>';
 if(!root){
  h+=nkText(n,'이름','name','구조 패널에 표시')+nkText(n,'클래스','cls','my-class other')+nkText(n,'ID','eid','section-a');
  h+='<p class="note">자동 클래스 <code>.'+E(n.k)+'</code>가 항상 붙어요. 직접 만든 클래스와 ID는 <b>CSS 탭</b>에서 <code>.my-class{…}</code> <code>#section-a{…}</code>로 꾸미거나, 링크의 <code>#section-a</code>로 이동할 때 써요.</p>'}

 if(isCont(n)&&!root&&n.t!=='inst'&&n.t!=='slot'){h+=nkChk(n,'탭 영역 (자식 중 하나만 보여요)','tabs');if(n.tabs)h+='<div class="f"><span class="fl">처음에 보일 것</span><span class="fc"><select data-nk="tab">'+n.c.map((c,i)=>'<option value="'+i+'"'+((parseInt(n.tab,10)||0)===i?' selected':'')+'>'+(i+1)+'. '+E(lab(c))+'</option>').join('')+'</select></span></div><p class="note">이 박스의 자식이 하나씩 "내용 칸"이 돼요. 버튼·링크·박스를 골라 <b>효과 탭 → 클릭하면 → 박스 안 내용 바꾸기</b>로 어떤 칸을 보일지 정해요. 편집 화면에서는 선택한 칸이 자동으로 보여요.</p>'}

 {const bo=n.t!=='board'&&!root?(boardOf(n.id)||(doc.pages[doc.cur].kind==='post'?true:null)):null;if(bo){const opts=TXT.has(n.t)?[['','연결 안 함 (입력한 그대로)'],['title','글 제목'],['date','작성일'],['body','글 내용'],['cat','카테고리'],['num','번호']]:n.t==='image'?[['','연결 안 함'],['image','글의 이미지']]:isCont(n)?[['','연결 안 함'],['imagebg','글의 이미지를 배경으로']]:null;
  if(opts)h+='<div class="f"><span class="fl">📋 게시판 연결</span><span class="fc"><select data-nk="bind">'+opts.map(o=>'<option value="'+o[0]+'"'+((n.bind||'')===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div><p class="note">게시판 안(또는 글 상세 페이지)의 요소예요. 연결하면 글마다 그 내용으로 바뀌어 보여요. (편집 화면에는 입력한 예시가 보여요)<br>글자 안에 <code>{{제목}} {{날짜}} {{본문}} {{번호}} {{카테고리}}</code>를 직접 써도 돼요. 예: 작성일 {{날짜}} · {{카테고리}}</p>'}}
 if(n.t==='heading')h+=nkSel(n,'제목 단계','tag',[['h1','H1'],['h2','H2'],['h3','H3'],['h4','H4'],['h5','H5'],['h6','H6']]);
 if(isCont(n)&&!root&&n.t!=='inst')h+=nkSel(n,'HTML 태그','tag',[['div','div'],['section','section'],['header','header'],['nav','nav'],['main','main'],['article','article'],['aside','aside'],['footer','footer'],['ul','ul'],['a','a (링크 박스)']]);
 if(isCont(n)&&n.tag==='a')h+=hrefF(n,'링크 주소','https://…')+nkChk(n,'새 탭에서 열기','blank');
 if(TXT.has(n.t))h+=nkArea(n,'내용','text',3,'tx');
 if(n.t==='link'||n.t==='button')h+=hrefF(n,'링크 주소','https://… 또는 #id')+nkChk(n,'새 탭에서 열기','blank');
 if(n.t==='image')h+='<button class="btn2" data-act="imgup">📁 이미지 올리기</button>'+nkText(n,'주소(URL)','src',n.src&&n.src.indexOf('asset:')===0?'(올린 이미지)':'https://…')+nkText(n,'대체 텍스트','alt','이미지 설명');
 if(n.t==='youtube')h+=nkText(n,'유튜브 주소','url','https://youtu.be/…')+'<p class="note">편집 화면에서는 자리표시자로 보이고, 내보낸 페이지에서 재생돼요.</p>';
 if(n.t==='video')h+=nkText(n,'비디오 주소','src','https://…/video.mp4')+nkChk(n,'컨트롤 표시','controls')+nkChk(n,'자동 재생(음소거)','autoplay')+nkChk(n,'반복','loop');
 if(n.t==='embed')h+=nkArea(n,'HTML / 스크립트 코드','code',8)+'<p class="note">내보낸 페이지에서만 실행돼요. 믿을 수 있는 코드만 붙여넣으세요.</p>';
 if(n.t==='board'){const cu=n.c.length>0;
  h+=nkText(n,'게시판 이름','board','notice');
  if(cu)h+=nkSel(n,'목록 배치','blay',[['col','세로 한 줄'],['grid2','2열'],['grid3','3열'],['grid4','4열'],['scroll','가로 스크롤']])+nkText(n,'카드 간격(px)','bgap','16');
  else h+=nkSel(n,'디자인','bview',[['box','박스 목록'],['line','줄 목록'],['table','게시판 표'],['cards','카드'],['feed','블로그 피드'],['gallery','가로 스크롤 갤러리']])+'<button class="btn2" data-act="bdt">🎨 디자인 템플릿 보기</button><button class="btn2" data-act="seedcard">🛠 카드를 직접 디자인하기 (지금 디자인으로 시작)</button>';
  h+=nkText(n,'보여줄 글 수','blimit','10')+nkSel(n,'글 상세 페이지','bdetail',[['','없음 (이동 안 함)']].concat(doc.pages.filter(q=>q.kind==='post').map(q=>[q.id,q.name])))+'<button class="btn2" data-act="mkpost">📄 글 상세 페이지 새로 만들기</button>'+nkSel(n,'데이터 출처','bsrc',[['supabase','Supabase (관리자 화면에서 글쓰기)'],['notion','Notion (노션에 쓰면 자동 반영)'],['firebase','Firebase (관리자 화면에서 글쓰기)']]);
  if(n.bsrc==='notion')h+=nkText(n,'Notion DB 주소','bnotion','데이터베이스 주소를 붙여 넣기')+'<p class="note">노션 데이터베이스를 통합에 연결하고, 내보낸 파일의 README 순서대로 하면 돼요.</p>';
  else h+='<p class="note">글쓰기는 내보낸 사이트의 관리자 화면(<code>admin.html</code>)에서 관리자만 해요. '+(n.bsrc==='firebase'?'Firebase':'Supabase')+' 연결 정보는 <b>내보내기</b> 창에서 입력해요.</p>';
  if(cu)h+='<p class="note"><b>카드 직접 디자인 중</b> — 구조 패널에서 카드를 선택해 일반 요소처럼 꾸미세요(드래그, 크기, 효과, 태블릿·모바일별 모양 모두 가능). 제목·날짜·본문·이미지 요소를 선택하고 그 요소의 설정 탭에서 <b>게시판 연결</b>을 정하면, 글마다 그 내용으로 채워져요.</p><button class="btn2" data-act="unboard">게시판 풀기 (일반 요소로 되돌리기)</button>';
  else h+='<p class="note">같은 이름의 글만 이 블록에 보여요. 편집 화면의 글은 예시예요. 일반 페이지에서 먼저 디자인한 박스를 게시판 카드로 바꿀 수도 있어요(박스를 선택 → 설정 → 📋 게시판 카드로 만들기).</p>'}
 if(n.t==='form')h+=nkText(n,'전송 주소','action','https://formspree.io/f/…')+nkText(n,'버튼 글자','btn','보내기')+nkArea(n,'입력칸 (한 줄에 하나: 이름|종류)','fields',5)+'<p class="note">종류: text, email, tel, textarea …</p>';
 if(root)h+='<div class="f"><span class="fl">페이지 제목</span><span class="fc"><input type="text" data-ttl="1" value="'+E(doc.title)+'"></span></div><p class="note">페이지 전체 글꼴·색·배경은 스타일 탭에서 바꿔요. 반응형: 위쪽 버튼으로 태블릿·모바일을 전환하고 그 화면에서 값을 바꾸면, 그 크기 이하에서만 적용돼요.</p>';
 box.innerHTML=h+'</div>';box.scrollTop=st}
$('#p-set').addEventListener('change',e=>{
 const t=e.target;if(t.dataset.ttl){doc.title=t.value;$('#ttl').value=doc.title;commit();return}
 const k=t.dataset.nk;if(!k)return;const f=find(S.sel);if(!f)return;const n=f.n;
 let v=t.type==='checkbox'?t.checked:t.value;
 if(k==='board')v=(String(v).toLowerCase().replace(/[^a-z0-9-]/g,'')||'notice');if(k==='bnotion'){const m=/([0-9a-f]{32})/i.exec(String(v).replace(/-/g,''));if(m)v=m[1].toLowerCase();else if(v){toast('데이터베이스 주소에서 ID를 찾지 못했어요');v=''}}
 if(k==='bgap'&&v!=='')v=String(Math.max(0,Math.min(200,parseInt(v,10)||0)));
 if(k==='blimit')v=String(Math.max(1,Math.min(50,parseInt(v,10)||10)));
 if(k==='cls')v=cleanCls(v);if(k==='eid')v=cleanId(v);
 if(v===''||v===false)delete n[k];else n[k]=v;
 commit();refresh()});
$('#p-set').addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(a)act(a.dataset.act)});

/* ---------- effects panel ---------- */
function renderFx(){
 const box=$('#p-fx'),f=find(S.sel);if(!f){box.innerHTML='';return}
 const n=f.n,root=n===doc.root;
 if(root){box.innerHTML=nodeHead(n)+'<p class="hint">효과를 줄 요소를 선택하세요.</p>';return}
 let h=nodeHead(n)+'<div class="gt" style="margin-top:4px">마우스 올렸을 때 (호버)</div><div class="fxg"><button class="fxb'+(!n.fx?' on':'')+'" data-fx="">없음</button>'+FXL.map(x=>'<button class="fxb'+(n.fx===x[0]?' on':'')+'" data-fx="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
 h+='<div class="gt">나타날 때 · 계속 움직이기</div><div class="fxg"><button class="fxb'+(!n.an?' on':'')+'" data-an="">없음</button>'+ANL.map(x=>'<button class="fxb'+(n.an===x[0]?' on':'')+'" data-an="'+x[0]+'">'+(LOOPS.has(x[0])?'♾ ':'')+x[1]+'</button>').join('')+'</div>';
 h+='<div class="sb2">'+'<div class="f"><span class="fl">시간(초)</span><span class="fc"><input type="number" data-nk2="ad" min="0.1" max="10" step="0.1" value="'+E(n.ad||'')+'" placeholder="0.7"></span></div><div class="f"><span class="fl">지연(초)</span><span class="fc"><input type="number" data-nk2="ads" min="0" max="10" step="0.1" value="'+E(n.ads||'')+'" placeholder="0"></span></div></div>';
 const ck=n.ck||{};
 h+='<div class="gt">클릭하면 (상태 전환)</div><div class="sb2"><div class="f"><span class="fl">동작</span><span class="fc"><select data-ckf="a">'+[['','없음'],['toggle','펼치기/접기'],['open','펼치기'],['close','접기'],['show','박스 안 내용 바꾸기 (탭)']].map(o=>'<option value="'+o[0]+'"'+((ck.a||'')===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div>';
 if(ck.a==='show'){let opts='';walk(doc.root,(x,pp)=>{if(pp&&pp.tabs)opts+='<option value="'+x.id+'"'+(ck.to===x.id?' selected':'')+'>'+E(lab(pp))+' › '+E(lab(x))+'</option>'});
  h+=opts?'<div class="f"><span class="fl">보일 칸</span><span class="fc"><select data-ckf="to">'+opts+'</select></span></div>':'<p class="note">먼저 박스 <b>설정 탭</b>에서 "탭 영역"을 켜 주세요. 그 박스의 자식들이 여기에 나와요.</p>'}
 else if(ck.a){let opts='<option value="self">이 요소 자신</option>';walk(doc.root,x=>{if(x!==n&&x!==doc.root)opts+='<option value="'+x.id+'"'+(ck.to===x.id?' selected':'')+'>'+E(lab(x))+' (.'+x.k+')</option>'});h+='<div class="f"><span class="fl">대상</span><span class="fc"><select data-ckf="to">'+opts+'</select></span></div>'}
 h+='<div class="f"><span class="fl">전환 시간(초)</span><span class="fc"><input type="number" data-nk2="tr" min="0" max="5" step="0.1" value="'+E(n.tr||'')+'" placeholder="0"></span></div><div class="f"><span class="fl">전환 지연(초)</span><span class="fc"><input type="number" data-nk2="trd" min="0" max="5" step="0.1" value="'+E(n.trd||'')+'" placeholder="0"></span></div><button class="btn2" data-act="reveal">✨ 펼칠 때 서서히 나타나게 하기</button></div><p class="note">위쪽 <b>기본 / 펼침</b> 버튼으로 상태를 바꿔 가며, 각 상태의 모양(크기·투명도·색…)을 스타일 탭에서 정해요. 클릭 확인은 ▶ 미리보기에서 해요.</p>';
 h+='<p class="note">누르면 잠깐 미리 보여줘요. ▶ 미리보기에서는 마우스를 올리거나 스크롤하며 실제처럼 확인할 수 있어요. 호버는 한 요소에 하나, 애니메이션도 하나씩 적용돼요. 더 세밀한 건 CSS 탭에서 <code>.'+E(n.k)+':hover{…}</code>로 직접 쓰세요.</p>';
 box.innerHTML=h}
function simulate(id){const el=nodeEl(id);if(!el)return;el.classList.add('sim');setTimeout(()=>{const e2=nodeEl(id);if(e2)e2.classList.remove('sim')},1500)}
$('#p-fx').addEventListener('click',e=>{
 const a=e.target.closest('[data-act]');if(a){act(a.dataset.act);return}
 const f=find(S.sel);if(!f)return;const n=f.n;
 const fx=e.target.closest('[data-fx]'),an=e.target.closest('[data-an]');
 if(fx){const v=fx.dataset.fx;if(v)n.fx=v;else delete n.fx;commit();refresh();if(v)simulate(n.id)}
 if(an){const v=an.dataset.an;if(v)n.an=v;else delete n.an;commit();refresh();if(v)simulate(n.id)}});
$('#p-fx').addEventListener('change',e=>{const t=e.target;if(t.dataset.ckf){const f=find(S.sel);if(!f)return;const n=f.n;n.ck=n.ck||{};if(t.dataset.ckf==='a'){if(t.value){n.ck.a=t.value;if(t.value==='show'){let fp=null;walk(doc.root,(x,pp)=>{if(!fp&&pp&&pp.tabs)fp=x.id});n.ck.to=fp||'self'}else if(!n.ck.to||(findAny(n.ck.to)&&parentAny(n.ck.to)&&parentAny(n.ck.to).tabs&&false))n.ck.to='self'}else delete n.ck}else n.ck.to=t.value;commit();refresh();return}const k=e.target.dataset.nk2;if(!k)return;const f=find(S.sel);const v=parseFloat(e.target.value);if(v>=0)f.n[k]=v;else delete f.n[k];commit();refresh();simulate(f.n.id)});

/* ---------- css panel ---------- */
const SNIPS=[
 ['링크 호버','.my-link{transition:color .2s}\n.my-link:hover{color:#ec4899}\n'],
 ['글자 그라디언트','.gradient-text{background:linear-gradient(90deg,#6366f1,#ec4899);-webkit-background-clip:text;background-clip:text;color:transparent}\n'],
 ['유리 카드','.glass{background:rgba(255,255,255,.55);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.6)}\n'],
 ['부드러운 스크롤','html{scroll-behavior:smooth}\n'],
 ['흑백→컬러','.gray-img{filter:grayscale(1);transition:filter .3s}\n.gray-img:hover{filter:none}\n'],
 ['모바일에서 숨김','@media (max-width:479px){.hide-m{display:none}}\n']
];
function renderCssPane(){
 const box=$('#p-css'),f=find(S.sel);const n=f&&f.n;
 box.innerHTML='<div class="gt" style="margin-top:0">사용자 CSS</div><textarea class="cssta" id="cssTa" spellcheck="false" placeholder=".my-class{ color: tomato; }\n#section-a:hover{ ... }">'+E(doc.css||'')+'</textarea>'
  +'<p class="note">'+(n&&n!==doc.root?'선택한 요소: <code>.'+E(n.k)+'</code>'+(n.cls?' <code>.'+E(n.cls.split(' ').join('.'))+'</code>':'')+(n.eid?' <code>#'+E(n.eid)+'</code>':''):'요소를 선택하면 클래스 이름이 여기에 나와요.')+' — 이 CSS는 맨 마지막에 적용되어 스타일 패널 값을 덮어써요. <code>@media</code>도 쓸 수 있어요(편집 화면에선 실제 창 너비 기준).</p>'
  +'<div class="gt">예시 넣기</div><div class="chips">'+SNIPS.map((s,i)=>'<button data-snip="'+i+'">'+s[0]+'</button>').join('')+'</div>'
  +'<div class="row"><button class="b" data-act="showcss">생성된 CSS 보기</button></div>'}
$('#p-css').addEventListener('input',e=>{if(e.target.id==='cssTa'){doc.css=e.target.value;restyle();commitSoon()}});
$('#p-css').addEventListener('click',e=>{
 const s=e.target.closest('[data-snip]');
 if(s){const ta=$('#cssTa');ta.value=(ta.value&&!/\n$/.test(ta.value)?ta.value+'\n':ta.value)+SNIPS[+s.dataset.snip][1];doc.css=ta.value;restyle();commit();toast('예시를 넣었어요. 클래스 이름은 설정 탭에서 요소에 붙여 주세요.');return}
 const a=e.target.closest('[data-act]');if(a)act(a.dataset.act)});
function renderPanels(){renderStyle();renderSet();renderFx();renderCssPane()}

/* ---------- top / panes ---------- */
function renderTop(){
 $$('#bps [data-bp]').forEach(b=>b.classList.toggle('on',b.dataset.bp===S.bp));
 $('#bcomp').hidden=!doc.main;$$('#sts [data-st]').forEach(b=>b.classList.toggle('on',b.dataset.st===S.st));
 $('#bun').disabled=hp<=0;$('#bre').disabled=hp>=hist.length-1;
 const pv=$('#bpv');pv.textContent=S.pv?'✎ 편집으로':'▶ 미리보기';pv.classList.toggle('on',S.pv)}
function applyPanes(){
 const nw=narrow();const actv=nw?(S.sheet?[S.sheet]:[]):[S.lp,S.rp];
 $$('.pane').forEach(p=>{p.hidden=actv.indexOf(p.id.slice(2))<0});
 if(nw&&S.sheet)document.body.setAttribute('data-sheet',(S.sheet==='add'||S.sheet==='tree')?'l':'r');else document.body.removeAttribute('data-sheet');
 $$('#tsl button,#tsr button').forEach(b=>b.classList.toggle('on',b.dataset.pane===S.lp||b.dataset.pane===S.rp));
 $$('#bar button').forEach(b=>b.classList.toggle('on',nw&&S.sheet===b.dataset.pane));
 layout()}
function setPane(p){const left=p==='add'||p==='tree';if(left)S.lp=p;else S.rp=p;if(narrow())S.sheet=S.sheet===p?null:p;applyPanes()}
function setBp(b){S.bp=b;S.zm=0;renderPage();renderTree();renderPanels();renderTop()}
function setSt(v){S.st=v;$('#pg').classList.toggle('open',v==='o'&&!S.pv);restyle();layout();renderTree();renderPanels();renderTop()}
function togglePv(){S.pv=!S.pv;if(S.pv){S.sheet=null;S.st='b';applyPanes()}renderPage();renderTop()}

/* ---------- actions ---------- */
function act(a){
 switch(a){
  case 'parent':selParent();break;
  case 'up':shift(-1);break;case 'down':shift(1);break;
  case 'dup':dupSel();break;case 'del':delSel();break;
  case 'edit':beginEdit(S.sel);break;
  case 'reveal':{const f=find(S.sel);if(!f||f.n===doc.root)break;const n=f.n;n.s.d.opacity='0';n.s.d['pointer-events']='none';n.s.o=n.s.o||{};n.s.o.opacity='1';n.s.o['pointer-events']='auto';n.tr=n.tr||0.6;n.trd=n.trd||0.4;commit();refresh();toast('펼친 상태에서만 보이게 했어요. 편집 화면에선 흐릿하게 보여요');break}
  case 'mkcomp':makeComp();break;case 'detach':detach();break;case 'bdt':openTpl('board');break;case 'mkboard':makeBoardCard();break;case 'unboard':unBoard();break;case 'mkpost':makePostPage();break;case 'seedcard':seedCard();break;
  case 'editcomp':{const f=find(S.sel);if(f&&f.n.t==='inst')enterComp(f.n.comp);break}
  case 'exitcomp':exitComp();break;
  case 'addcell':{const f=find(S.sel);if(f&&f.n.t==='stack'){f.n.c.push(mk('box'));commit();refresh()}break}
  case 'imgup':pickImage(src=>{const f=find(S.sel);if(f){f.n.src=src;commit();refresh()}});break;
  case 'bgup':pickImage(src=>{const f=find(S.sel);if(!f)return;setS(f.n,'background-image','url("'+src+'")');if(!getS(f.n,'background-size').v)setS(f.n,'background-size','cover');if(!getS(f.n,'background-position').v)setS(f.n,'background-position','center');commit();restyle();renderStyle()});break;
  case 'showcss':showText('생성된 CSS (내보내기와 동일)',buildCSS(true)+(doc.css?'':''));break;
 }}
function makeComp(){const f=find(S.sel);if(!f||!f.p||!isCont(f.n)||f.n.t==='inst'||f.n.t==='slot')return;
 doc.comps=doc.comps||{};const n=f.n,cid='c'+Math.random().toString(36).slice(2,7),nm=(n.name||T[n.t].label)+' 컴포넌트';
 doc.comps[cid]={name:nm,node:n};const inst=mk('inst',{comp:cid,name:nm});
 ['d','t','m'].forEach(b=>['width','max-width','margin-top','margin-bottom','margin-left','margin-right','align-self','flex-grow','left','top'].forEach(k=>{if(n.s[b][k]!=null){inst.s[b][k]=n.s[b][k];delete n.s[b][k]}}));
 f.p.c.splice(f.p.c.indexOf(n),1,inst);S.sel=inst.id;commit();refresh();
 toast('컴포넌트로 만들었어요. ◆✎로 편집하고, 편집 화면에서 "슬롯"을 넣어 보세요')}
function enterComp(cid){if(doc.main||!doc.comps[cid])return;commit();
 const w=mk('root');w.s=JSON.parse(JSON.stringify(doc.root.s));w.c=[doc.comps[cid].node];
 doc.main=doc.root;doc.compEditing=cid;doc.root=w;S.sel=w.c[0].id;S.col=new Set();commit();fullRender()}
function exitComp(){if(!doc.main)return;const cid=doc.compEditing;syncComp();doc.root=doc.main;doc.main=null;delete doc.compEditing;
 let sel=doc.root.id;walk(doc.root,x=>{if(x.t==='inst'&&x.comp===cid&&sel===doc.root.id)sel=x.id});S.sel=sel;S.col=new Set();commit();fullRender()}
function detach(){const f=find(S.sel);if(!f||!f.p||f.n.t!=='inst')return;const c=doc.comps[f.n.comp];if(!c)return;
 const cl=cloneNode(c.node);let sl=null;walk(cl,x=>{if(!sl&&x.t==='slot')sl=x});if(sl){if(f.n.c.length)sl.c=f.n.c;sl.t='box'}
 ['d','t','m'].forEach(b=>Object.assign(cl.s[b],f.n.s[b]));
 f.p.c.splice(f.p.c.indexOf(f.n),1,cl);S.sel=cl.id;commit();refresh();toast('컴포넌트에서 분리했어요')}
function beginEdit(id){
 const f=find(id);if(!f||!TXT.has(f.n.t))return;const el=nodeEl(id);if(!el)return;
 if(f.n.text&&f.n.text.indexOf('{{')>=0&&!f.n.bind)el.textContent=f.n.text;
 el.contentEditable='plaintext-only';if(el.contentEditable!=='plaintext-only')el.contentEditable='true';
 el.focus();const rg=document.createRange();rg.selectNodeContents(el);const sl=getSelection();sl.removeAllRanges();sl.addRange(rg);
 const kd=ev=>{if(ev.key==='Escape'){ev.preventDefault();el.blur()}else if(ev.key==='Enter'&&f.n.t!=='text'&&!ev.shiftKey){ev.preventDefault();el.blur()}};
 el.addEventListener('keydown',kd);
 el.addEventListener('blur',()=>{el.removeEventListener('keydown',kd);el.contentEditable='false';f.n.text=el.innerText.replace(/\n$/,'');commit();refresh()},{once:true})}

/* ---------- images ---------- */
function loadImg(file,cb){const r=new FileReader();r.onload=()=>{const raw=r.result;
 if(/svg|gif/.test(file.type)||(file.size<150000&&/png|jpeg|webp/.test(file.type))){cb(raw);return}
 const im=new Image();im.onload=()=>{const sc=Math.min(1,1600/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',0.86))};im.onerror=()=>cb(raw);im.src=raw};r.readAsDataURL(file)}
function pickImage(cb){const fi=$('#fi');fi.value='';fi.onchange=()=>{const f=fi.files[0];if(!f)return;loadImg(f,url=>{const id='a'+Math.random().toString(36).slice(2,8);ASSETS[id]=url;saveAssets();cb('asset:'+id)})};fi.click()}

/* ---------- modal / files ---------- */
function modal(html){$('#mb').innerHTML=html;$('#modal').classList.add('on')}
function closeModal(){$('#modal').classList.remove('on')}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'||e.target.closest('[data-close]'))closeModal()});
function showText(title,text){modal('<h3>'+E(title)+'</h3><p>전체 선택 후 복사해서 쓰세요.</p><textarea id="mt" readonly>'+E(text)+'</textarea><div class="row"><button class="b" data-copy="1">복사</button><button class="b" data-close="1">닫기</button></div>');$('#mb [data-copy]').onclick=()=>copyText(text)}
async function copyText(t){try{await navigator.clipboard.writeText(t);toast('복사했어요');return}catch(e){}
 const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();if(ok)toast('복사했어요');else{const m=$('#mt');if(m){m.select();toast('선택됐어요. 길게 눌러 복사하세요')}else showText('직접 복사하세요',t)}}
async function saveFile(name,data,mime){
 try{if(window.claude&&window.claude.use){const dl=await window.claude.use('downloads');if(dl){await dl.save({filename:name,data:data});toast('저장했어요');return true}}}catch(err){if(err&&err.code==='declined')return false}
 if(!window.claude){try{const a=document.createElement('a');const u=URL.createObjectURL(new Blob([data],{type:mime||'text/plain'}));a.href=u;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(u)},4000);return true}catch(e){}}
 showText(name+' — 복사해서 저장하세요',data);return false}
/* ---------- pages ---------- */
function uniqSlug(base,self){let s=base||'page',n=2;const bad=x=>x==='index'||doc.pages.some(p=>p!==self&&p.slug===x);while(bad(s)){s=(base||'page')+'-'+n;n++}return s}
function switchPage(i,quiet){
 if(i===doc.cur){renderTop();return}
 if(doc.main){toast('컴포넌트 편집을 먼저 끝내 주세요');renderTop();return}
 if(!quiet)commit();
 doc.pages[doc.cur].root=doc.root;doc.cur=i;doc.root=doc.pages[i].root;S.sel=doc.root.id;S.col=new Set();
 if(!quiet)commit();fullRender()}
function addPage(){
 if(doc.main){toast('컴포넌트 편집을 먼저 끝내 주세요');return}
 const n=doc.pages.length+1;const root=mk('root');root.s=JSON.parse(JSON.stringify(doc.root.s));root.c=[PRE.section()];
 doc.pages.push({id:uid(),name:'새 페이지 '+n,slug:uniqSlug('page-'+n),title:'',desc:'',root:root});
 switchPage(doc.pages.length-1)}
function makePostPage(){const f=find(S.sel);if(!f||f.n.t!=='board')return;const b=f.n;
 if(doc.main){toast('컴포넌트 편집을 먼저 끝내 주세요');return}
 if(b.bdetail&&doc.pages.some(q=>q.id===b.bdetail&&q.kind==='post')){toast('이미 상세 페이지가 있어요');return}
 const here=doc.pages[doc.cur];const nm=(b.name||b.board||'글')+' 상세';
 const root=mk('root');root.s=JSON.parse(JSON.stringify(doc.root.s));
 const back=mk('link',{text:'← 목록으로',href:'page:'+here.id,d:{'font-size':'14px'}});
 const date=mk('text',{text:'2026. 11. 2.',bind:'date',d:{'font-size':'13px',opacity:'0.6'}});
 const title=mk('heading',{tag:'h1',text:'글 제목',bind:'title',d:{'font-size':'34px'}});
 const img=mk('image',{bind:'image',d:{width:'100%','border-radius':'12px','object-fit':'cover'}});
 const body=mk('text',{text:'글 내용이 여기에 보여요.',bind:'body',d:{'font-size':'16px','line-height':'1.8'}});
 const box=mk('box',{d:{width:'100%','max-width':'720px',gap:'16px'}},[back,date,title,img,body]);
 const sec=mk('section',{},[box]);root.c=[sec];
 const id=uid();doc.pages.push({id:id,name:nm,slug:uniqSlug('post'),title:'',desc:'',root:root,kind:'post',pboard:b.board||'notice',psrc:b.bsrc||'supabase'});
 b.bdetail=id;commit();switchPage(doc.pages.length-1);toast('글 상세 페이지를 만들었어요. 요소를 마음껏 꾸미세요')}
function dupPage(){
 if(doc.main)return;const p=doc.pages[doc.cur];doc.pages[doc.cur].root=doc.root;const root=cloneNode(p.root);
 doc.pages.splice(doc.cur+1,0,{id:uid(),name:p.name+' 복사',slug:uniqSlug(p.slug+'-copy'),title:p.title,desc:p.desc,root:root,kind:p.kind,pboard:p.pboard,psrc:p.psrc});
 closeModal();switchPage(doc.cur+1)}
function delPage(){
 if(doc.main||doc.pages.length<2){toast('페이지는 최소 1개가 필요해요');return}
 const i=doc.cur;doc.pages[i].root=doc.root;const id=doc.pages[i].id;doc.pages.splice(i,1);doc.pages[0].slug='index';
 const ni=Math.min(i,doc.pages.length-1);doc.cur=ni;doc.root=doc.pages[ni].root;S.sel=doc.root.id;S.col=new Set();
 walk(doc.root,x=>{});closeModal();commit();fullRender();toast('페이지를 삭제했어요')}
function openPageSet(){
 const p=doc.pages[doc.cur],home=doc.cur===0;
 const row=(l,k,v,ph,dis)=>'<div class="f"><span class="fl" style="width:84px">'+l+'</span><span class="fc"><input type="text" data-pk="'+k+'" value="'+E(v)+'" placeholder="'+E(ph||'')+'"'+(dis?' disabled':'')+'></span></div>';
 modal('<h3>페이지 설정</h3><p>지금 편집 중인 페이지의 이름·주소·검색 정보예요.</p><div class="sb2">'
  +row('이름','name',p.name,'메뉴에서 보일 이름')
  +row('주소','slug',home?'index':p.slug,'about',home)
  +'<p class="note" style="margin:0 0 4px">'+(home?'첫 페이지는 항상 index.html 이에요.':'내보내면 <code>'+E(p.slug)+'.html</code> 파일이 돼요. 영문 소문자·숫자·-만 써요.')+'</p>'
  +'<div class="f"><span class="fl" style="width:84px">종류</span><span class="fc"><select data-pk="kind"'+(home?' disabled':'')+'><option value="">일반 페이지</option><option value="post"'+(p.kind==='post'?' selected':'')+'>글 상세 페이지</option></select></span></div>'
  +(p.kind==='post'?'<p class="note" style="margin:0 0 4px">게시판 글을 눌렀을 때 열리는 페이지예요. 주소 뒤에 <code>?id=글번호</code>가 붙어 글마다 내용이 채워져요. 게시판 설정에서 이 페이지를 연결하세요.</p>'+row('게시판 이름','pboard',p.pboard||'','notice')+'<div class="f"><span class="fl" style="width:84px">출처</span><span class="fc"><select data-pk="psrc">'+[['supabase','Supabase'],['firebase','Firebase'],['notion','Notion']].map(o=>'<option value="'+o[0]+'"'+((p.psrc||'supabase')===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></span></div><p class="note" style="margin:0 0 4px">게시판 설정에서 연결하면 위 두 값은 그 게시판 것을 자동으로 써요.</p>':'')
  +row('검색 제목','title',p.title,'비우면 이름으로 만들어요')
  +'<div class="gt" style="margin:4px 0 0">검색 설명 (160자 안팎)</div><textarea class="tx" data-pk="desc" rows="3" placeholder="검색 결과와 공유 카드에 보일 한두 문장">'+E(p.desc)+'</textarea></div>'
  +'<div class="row"><button class="b" data-pg="dup">이 페이지 복제</button><button class="b" data-pg="del"'+(doc.pages.length<2?' disabled':'')+'>삭제</button><button class="b" data-close="1">닫기</button></div>');
 $('#mb').onchange=ev=>{const t=ev.target,k=t.dataset.pk;if(!k)return;let v=t.value;
  if(k==='slug'){v=v.toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,40)||'page';v=uniqSlug(v,p);t.value=v}
  if(k==='name'&&!v.trim()){v='페이지';t.value=v}
  if(k==='kind'&&!v){delete p.kind}else p[k]=v;commit();renderTop();renderTree();renderSet();if(k==='kind')openPageSet()};
 $('#mb').onclick=ev=>{const b=ev.target.closest('[data-pg]');if(!b)return;if(b.dataset.pg==='dup')dupPage();else if(b.dataset.pg==='del')delPage()}}

/* ---------- site export (multi-file, optimized) ---------- */
const enc=new TextEncoder();
function b64u8(b64){const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
function loadImgEl(blob){return new Promise((res,rej)=>{const url=URL.createObjectURL(blob);const im=new Image();im.onload=()=>res({im:im,url:url});im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('img'))};im.src=url})}
const toBlob=(c,type,q)=>new Promise(r=>c.toBlob(r,type,q));
const EXT={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/svg+xml':'svg'};
async function procImage(id,du,files){
 const m=/^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(du);if(!m)return null;
 const mime=m[1];let bytes=m[2]?b64u8(m[3]):enc.encode(decodeURIComponent(m[3]));let ext=EXT[mime]||'bin';
 let im=null,url=null,w=0,h=0;
 try{const r=await loadImgEl(new Blob([bytes],{type:mime}));im=r.im;url=r.url;w=im.naturalWidth;h=im.naturalHeight}catch(e){}
 const out={main:'',w:w,h:h,srcset:''};
 if(im&&w>0&&/png|jpeg|webp/.test(mime)){
  const enc2=async tw=>{const th=Math.max(1,Math.round(h*tw/w));const c=document.createElement('canvas');c.width=tw;c.height=th;c.getContext('2d').drawImage(im,0,0,tw,th);
   let b=await toBlob(c,'image/webp',0.82),e='webp';if(!b||b.type!=='image/webp'){e=mime==='image/png'?'png':'jpg';b=await toBlob(c,mime==='image/png'?'image/png':'image/jpeg',0.84)}
   return{u:new Uint8Array(await b.arrayBuffer()),e:e}};
  try{const mn=await enc2(w);if(mn.u.length<bytes.length){bytes=mn.u;ext=mn.e}}catch(e){}
  const vs=[];
  for(const tw of [640,1280]){if(w>tw*1.15){try{const v=await enc2(tw);const p='images/'+id+'-'+tw+'.'+v.e;files.push({name:p,data:v.u});vs.push(p+' '+tw+'w')}catch(e){}}}
  out.main='images/'+id+'.'+ext;if(vs.length)out.srcset=vs.join(', ')+', '+out.main+' '+w+'w'}
 else out.main='images/'+id+'.'+ext;
 files.push({name:out.main,data:bytes});if(url)URL.revokeObjectURL(url);return out}
function minCSS(s){return s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,>])\s*/g,'$1').replace(/;}/g,'}').trim()}
function minUser(s){return (s||'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{};])\s*/g,'$1').trim()}
function eachNode(n,f){f(n);if(n.t==='inst'){const c=doc.comps[n.comp];if(c)eachNode(c.node,f)}n.c.forEach(c=>eachNode(c,f))}
function lint(){const out=[];
 doc.pages.forEach((p,i)=>{const root=i===doc.cur?pageRoot():p.root;let h1=0,noalt=0,empty=0,noimg=0;
  eachNode(root,n=>{if(n.t==='heading'&&n.tag==='h1')h1++;if(n.t==='image'&&!n.bind){if(!n.src)noimg++;else if(!n.alt)noalt++}
   if((n.t==='link'||n.t==='button')&&(!n.href||n.href==='#')&&!(n.ck&&n.ck.a))empty++});
  const nm='['+p.name+'] ';
  if(h1!==1)out.push(nm+'H1 제목이 '+(h1?h1+'개':'없어요')+' — 페이지마다 1개가 좋아요');
  if(noimg)out.push(nm+'비어 있는 이미지 '+noimg+'개');
  if(noalt)out.push(nm+'대체 텍스트(alt) 없는 이미지 '+noalt+'개');
  if(empty)out.push(nm+'연결 안 된 링크/버튼 '+empty+'개');
  if(!p.desc)out.push(nm+'검색 설명이 비어 있어요')});
 {let hb=false,hn=false,nn=false;doc.pages.forEach((p,i)=>eachNode(i===doc.cur?pageRoot():p.root,n=>{if(n.t==='board'){if(n.bsrc==='notion'){hn=true;if(!n.bnotion)nn=true}else hb=true}}));const sb=doc.sb||{};if(hb){if(!sb.url||!sb.key)out.push('[게시판] Supabase 주소/공개 키가 비어 있어요 — 내보내기 창에서 입력하세요');if(!sb.email)out.push('[게시판] 관리자 이메일이 비어 있어요 — SQL에 들어가요')}{let hf=false;doc.pages.forEach((p,i)=>eachNode(i===doc.cur?pageRoot():p.root,n=>{if(n.t==='board'&&n.bsrc==='firebase')hf=true}));if(hf){if(!sb.fk||!sb.fp)out.push('[게시판] Firebase API 키/프로젝트 ID가 비어 있어요 — 내보내기 창에서 입력하세요');if(!sb.email)out.push('[게시판] 관리자 이메일이 비어 있어요 — 규칙에 들어가요')}}
 {doc.pages.forEach((p,i)=>eachNode(i===doc.cur?pageRoot():p.root,n=>{if(n.t==='board'&&n.c.length){let any=false;n.c.forEach(c=>eachNode(c,x=>{if(x.bind)any=true}));if(!any)out.push('[게시판] 카드에 연결된 요소가 없어요 — 제목·본문·이미지 요소의 "게시판 연결"을 정해 주세요')}}))}
 if(nn)out.push('[게시판] Notion DB 주소가 비어 있는 게시판이 있어요')}
 return out}
function landmark(c){const t=c.t==='inst'?((doc.comps[c.comp]||{node:{tag:'div'}}).node.tag):c.tag;return t==='header'||t==='nav'||t==='footer'}
function wrapMain(kids){const html=kids.map(c=>nodeHTML(c,true));let s=-1,e=-1;kids.forEach((c,i)=>{if(!landmark(c)){if(s<0)s=i;e=i}});
 if(s<0)return '<main>'+html.join('')+'</main>';
 return html.slice(0,s).join('')+'<main>'+html.slice(s,e+1).join('')+'</main>'+html.slice(e+1).join('')}
async function buildSite(){
 syncComp();
 const sb=doc.sb||{};if(keyIsSecret(sb.key))throw new Error('Secret key는 사이트에 넣을 수 없어요. Publishable key를 쓰세요.');
 const roots=allRoots(),files=[],info={};
 const ids=new Set();
 const sbBoards=new Set(),fbBoards=new Set(),ntBoards=new Map();
 const coll=n=>{if(n.t==='board'){const k=n.board||'notice';if(n.bsrc==='notion'){if(!ntBoards.has(k)||!ntBoards.get(k))ntBoards.set(k,n.bnotion||'')}else if(n.bsrc==='firebase')fbBoards.add(k);else sbBoards.add(k)}if(n.src&&n.src.indexOf('asset:')===0)ids.add(n.src.slice(6));['d','t','m','o'].forEach(b=>{const bi=(n.s[b]||{})['background-image'];if(bi){const mm=/asset:(\w+)/.exec(bi);if(mm)ids.add(mm[1])}})};
 const pm={};roots.forEach(r=>walk(r,n=>{if(n.t==='board'&&n.bdetail)pm[n.bdetail]={b:n.board||'notice',s:n.bsrc||'supabase'}}));
 doc.pages.forEach(q=>{if(q.kind==='post'&&!pm[q.id]){const k=q.pboard||'notice';pm[q.id]={b:k,s:q.psrc||'supabase'};if(pm[q.id].s==='notion'){if(!ntBoards.has(k))ntBoards.set(k,'')}else if(pm[q.id].s==='firebase')fbBoards.add(k);else sbBoards.add(k)}});
 roots.forEach(r=>walk(r,coll));Object.keys(doc.comps||{}).forEach(c=>walk(doc.comps[c].node,coll));
 for(const id of ids){if(ASSETS[id]){const r=await procImage(id,ASSETS[id],files);if(r)info[id]=r}}
 const used=collectUsed(roots);
 const fam=fontsUsed(roots);
 const hide=doc.idx!==true;const site=(hide?'':(doc.site||'')).replace(/\/+$/,'');
 X={html:id=>info[id]?info[id].main:'',css:id=>info[id]?'../'+info[id].main:'',img:id=>info[id]||null,firstDone:false};
 let css='',pages=[];
 try{
  if(doc.pages.some(q=>q.kind==='post'))used.board=true;
  css=minCSS(buildCSS(true,roots,used,true))+minUser(doc.css)+(doc.pages.some(q=>q.kind==='post')?'body[data-post]:not(.bd-ready) [data-bind]{visibility:hidden}':'');
  doc.pages.forEach((pg,i)=>{
   X.firstDone=false;X.cur=pg.id;const root=roots[i];
   const body=wrapMain(root.c);
   const title=pg.title||(i===0?doc.title:pg.name+' | '+doc.title);
   const url=site?site+'/'+(i===0?'':pg.slug+'.html'):'';
   let head='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+E(title)+'</title>';
   if(pg.desc)head+='<meta name="description" content="'+E(pg.desc)+'">';
   if(url)head+='<link rel="canonical" href="'+E(url)+'">';
   const pst=pg.kind==='post'&&i>0?pm[pg.id]:null;if(hide)head+='<meta name="robots" content="noindex,nofollow,noarchive,noimageindex">';else if(pst)head+='<meta name="robots" content="noindex">';
   head+='<meta property="og:type" content="website"><meta property="og:title" content="'+E(title)+'">'+(pg.desc?'<meta property="og:description" content="'+E(pg.desc)+'">':'')+(url?'<meta property="og:url" content="'+E(url)+'">':'')+'<meta property="og:locale" content="ko_KR">';
   if(fam){const href='https://fonts.googleapis.com/css2?'+fam+'&display=swap';head+='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="'+href+'" media="print" onload="this.media=\'all\'"><noscript><link rel="stylesheet" href="'+href+'"></noscript>'}
   head+='<link rel="stylesheet" href="css/site.css">';
   pages.push({name:i===0?'index.html':pg.slug+'.html',head:head,body:body,root:root,post:pst})});
 }finally{X=null}
 const all=pages.map(p=>p.body).join('');
 let js='';
 if(/class="[^"]*\bae\b/.test(all))js+=ANIMJS;const hasBoard=/data-board=/.test(all);if(hasBoard)js+=BOARDJS;if(pages.some(p=>p.post))js+=POSTJS;if(/data-ck=/.test(all))js+=CLICKJS;if(/data-wheel=/.test(all))js+=WHEELJS;
 pages.forEach(p=>{files.push({name:p.name,data:'<!DOCTYPE html><html lang="ko"><head>'+p.head+'</head><body class="'+p.root.k+'"'+(p.post?' data-post="'+E(p.post.b)+'"'+(p.post.s!=='supabase'?' data-src="'+p.post.s+'"':''):'')+'>'+p.body+((sbBoards.size||fbBoards.size)?'<script src="js/config.js" defer><\/script>':'')+(js?'<script src="js/site.js" defer><\/script>':'')+'</body></html>'})});
 files.push({name:'css/site.css',data:css});
 const sbl=Array.from(sbBoards),fbl=Array.from(fbBoards),ntl=Array.from(ntBoards.entries());
 if(sbl.length||fbl.length)files.push({name:'js/config.js',data:'window.NJ_CONFIG='+JSON.stringify({url:(sb.url||'').trim(),key:(sb.key||'').trim(),fk:(sb.fk||'').trim(),fp:(sb.fp||'').trim()})+';\n'});
 if(sbl.length){files.push({name:'admin.html',data:adminHTML(sbl,false)});files.push({name:'supabase.sql',data:sbSQL(sb.email)})}
 if(fbl.length){files.push({name:sbl.length?'admin-firebase.html':'admin.html',data:adminHTML(fbl,true)});files.push({name:'firestore.rules',data:fbRules(sb.email)})}
 if(ntl.length){files.push({name:'.github/workflows/notion-sync.yml',data:NOTIONWF});files.push({name:'scripts/notion-sync.mjs',data:NOTIONSYNC});const cfg={};ntl.forEach(e=>{cfg[e[0]]=e[1]});files.push({name:'scripts/notion-boards.json',data:JSON.stringify(cfg,null,1)+'\n'});ntl.forEach(e=>files.push({name:'data/'+e[0]+'.json',data:'[]\n'}))}
 files.push({name:'README.md',data:readmeMD(sbl,ntl,fbl,sb)});
 if(js)files.push({name:'js/site.js',data:js});
 files.push({name:'robots.txt',data:'User-agent: *\nAllow: /\n'+(site?'Sitemap: '+site+'/sitemap.xml\n':'')});
 if(site)files.push({name:'sitemap.xml',data:'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+doc.pages.filter(p=>p.kind!=='post').map((p,i)=>'<url><loc>'+E(site+'/'+(doc.pages.indexOf(p)===0?'':p.slug+'.html'))+'</loc></url>').join('\n')+'\n</urlset>\n'});
 return files}
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
async function deflateRaw(u){const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(u);w.close();return new Uint8Array(await new Response(cs.readable).arrayBuffer())}
async function makeZip(files){
 const parts=[],cen=[];let off=0;const d=new Date();
 const dt=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&0xFFFF,dd=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())&0xFFFF;
 for(const f of files){
  const nb=enc.encode(f.name);const data=typeof f.data==='string'?enc.encode(f.data):f.data;const crc=crc32(data);let cd=data,method=0;
  if(typeof CompressionStream!=='undefined'&&data.length>256&&!/\.(webp|jpe?g|png|gif)$/i.test(f.name)){try{const z=await deflateRaw(data);if(z.length<data.length){cd=z;method=8}}catch(e){}}
  const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,method,true);lh.setUint16(10,dt,true);lh.setUint16(12,dd,true);lh.setUint32(14,crc,true);lh.setUint32(18,cd.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,nb.length,true);
  parts.push(new Uint8Array(lh.buffer),nb,cd);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,method,true);ch.setUint16(12,dt,true);ch.setUint16(14,dd,true);ch.setUint32(16,crc,true);ch.setUint32(20,cd.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,nb.length,true);ch.setUint32(42,off,true);
  cen.push(new Uint8Array(ch.buffer),nb);off+=30+nb.length+cd.length}
 let cl=0;cen.forEach(c=>{cl+=c.length});
 const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cl,true);end.setUint32(16,off,true);
 return new Blob(parts.concat(cen,[new Uint8Array(end.buffer)]),{type:'application/zip'})}
/* ---------- work file (save / resume) ---------- */
const workName=()=>((doc.title||'homepage').replace(/[^\w가-힣\- ]/g,'').trim().replace(/\s+/g,'-')||'homepage')+'.homejit.json';
const dirty=()=>S.fileSnap!==ser();
async function saveWork(){const ok=await saveFile(workName(),JSON.stringify({v:3,doc:JSON.parse(ser()),assets:ASSETS}),'application/json');if(ok){S.fileSnap=ser();S.fileAt=new Date()}return ok}
function openWork(){const fj=$('#fj');fj.value='';fj.onchange=()=>{const f=fj.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{let o;try{o=JSON.parse(r.result);if(!o.doc||!o.doc.root&&!o.doc.pages)throw 0}catch(e){toast('열 수 없는 파일이에요');return}
  const go=()=>{ASSETS=Object.assign(ASSETS,o.assets||{});saveAssets();doc=o.doc;normDoc();S.sel=doc.root.id;S.col=new Set();S.tabs={};S.fileSnap=ser();S.fileAt=new Date();commit();fullRender();closeModal();toast('불러왔어요 · 이어서 작업하세요')};
  if(S.fileSnap!=null&&dirty()||S.fileSnap==null&&allRoots().some(rt=>cnt(rt)>4)){
   modal('<h3>작업 파일 열기</h3><p>저장하지 않은 작업이 있어요. 열면 지금 작업이 불러온 파일로 바뀌어요. (↶ 실행 취소로 되돌릴 수는 있어요)</p><div class="row"><button class="b pri" data-w="go">그래도 열기</button><button class="b" data-w="save">먼저 저장하기</button><button class="b" data-close="1">취소</button></div>');
   $('#mb').onclick=async ev=>{const x=ev.target.closest('[data-w]');if(!x)return;if(x.dataset.w==='go')go();else{const ok=await saveWork();if(ok)go()}}}
  else go()};r.readAsText(f)};fj.click()}
const cnt=n=>{let c=0;walk(n,()=>{c++});return c};
function openFile(){
 const when=S.fileAt?'마지막 저장: '+S.fileAt.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+(dirty()?' · 이후 바뀐 내용이 있어요':' · 최신 상태예요'):'아직 파일로 저장하지 않았어요';
 modal('<h3>파일</h3><div class="sb2"><b>① 작업 파일 — 나중에 이어서 작업하기</b><p style="margin:4px 0 8px">만들던 사이트를 통째로(모든 페이지·컴포넌트·이미지) 내 기기에 저장해요. <b>'+when+'</b></p><div class="row" style="margin-top:0"><button class="b pri" data-w="save">💾 작업 저장</button><button class="b" data-w="open">📂 작업 열기</button></div><p class="note" style="margin-top:8px">브라우저 자동저장은 이 기기에만 남고 지워질 수 있어요. 저장은 <code>Ctrl/⌘+S</code>로도 돼요.</p></div>'
  +'<div class="sb2" style="margin-top:12px"><b>② 테마 파일 — 다른 사람과 공유하기</b><p style="margin:4px 0 8px">내 디자인을 이름·설명과 함께 파일로 만들어 공유해요. 받은 사람은 둥지메이커에서 불러와 자기 사이트에 붙여 써요.</p><div class="row" style="margin-top:0"><button class="b" data-w="tsave">🎁 테마 파일 저장</button><button class="b" data-w="topen">🎨 테마 불러오기</button></div></div>'
  +'<p class="note" style="margin-top:12px">실제로 공개할 완성 사이트(zip)는 <b>내보내기</b>에서 받아요.</p><div class="row"><button class="b" data-close="1">닫기</button></div>');
 $('#mb').onclick=async ev=>{const x=ev.target.closest('[data-w]');if(!x)return;const w=x.dataset.w;if(w==='save'){if(await saveWork())openFile()}else if(w==='open')openWork();else if(w==='tsave')openThemeSave();else openTheme()}}
/* ---------- theme file (share) ---------- */
function themeData(o){syncComp();const roots=allRoots();
 const pages=doc.pages.map((p,i)=>({id:p.id,name:p.name,slug:p.slug,title:p.title,desc:p.desc,kind:p.kind,pboard:p.pboard,psrc:p.psrc,root:JSON.parse(JSON.stringify(roots[i]))}));
 const comps=JSON.parse(JSON.stringify(doc.comps||{}));const need=new Set(),assets={};
 const each=f=>{pages.forEach(p=>walk(p.root,f));Object.keys(comps).forEach(c=>walk(comps[c].node,f))};
 each(n=>{if(n.src&&n.src.indexOf('asset:')===0){if(o.img)need.add(n.src.slice(6));else n.src=''}
  ['d','t','m','o'].forEach(b=>{const st=n.s[b]||{},bi=st['background-image'];if(bi&&bi.indexOf('asset:')>=0){if(o.img){const re=/asset:(\w+)/g;let m;while((m=re.exec(bi)))need.add(m[1])}else delete st['background-image']}})});
 need.forEach(i=>{if(ASSETS[i])assets[i]=ASSETS[i]});
 return{type:'homejit-theme',v:1,meta:{name:o.name,desc:o.desc,author:o.author},doc:{title:doc.title,css:doc.css||'',pages:pages,comps:comps},assets:assets}}
function openThemeSave(){
 modal('<h3>테마 파일로 저장 (공유용)</h3><p>내가 만든 사이트의 <b>구조와 디자인</b>을 파일 하나(.json)로 만들어요. 다른 사람이 둥지메이커에서 이 파일을 불러와 자기 사이트에 쓸 수 있어요. 작업 이어하기용 파일과는 달리, 이름·설명·만든 사람이 들어가요.</p><div class="sb2">'
  +'<div class="f"><span class="fl" style="width:84px">테마 이름</span><span class="fc"><input type="text" id="th-n" value="'+E(doc.title)+'" maxlength="40"></span></div>'
  +'<div class="f"><span class="fl" style="width:84px">만든 사람</span><span class="fc"><input type="text" id="th-a" placeholder="이름 또는 닉네임 (선택)" maxlength="40"></span></div>'
  +'<div class="gt" style="margin:4px 0">설명</div><textarea class="tx" id="th-d" rows="3" placeholder="어떤 용도의 테마인지 한두 문장"></textarea>'
  +'<label class="f" style="cursor:pointer;margin-top:8px"><input type="checkbox" id="th-i" checked> <span>내 이미지도 함께 담기 (끄면 사진 없이 구조·디자인만 공유)</span></label></div>'
  +'<div class="row"><button class="b pri" data-w="go">테마 파일 저장</button><button class="b" data-close="1">닫기</button></div>');
 $('#mb').onclick=async ev=>{const x=ev.target.closest('[data-w]');if(!x)return;
  const nm=($('#th-n').value.trim()||doc.title||'theme');
  const t=themeData({name:nm,author:$('#th-a').value.trim(),desc:$('#th-d').value.trim(),img:$('#th-i').checked});
  const fn=nm.replace(/[^\w가-힣\- ]/g,'').trim().replace(/\s+/g,'-')||'theme';
  if(await saveFile(fn+'.homejit-theme.json',JSON.stringify(t),'application/json'))closeModal()}}
function importTheme(t,mode){
 if(doc.main){toast('컴포넌트 편집을 먼저 끝내 주세요');return}
 const td=t.doc,map={};
 const rekey=n=>{const o=n.id;n.id=uid();map[o]=n.id;doc.cnt[n.t]=(doc.cnt[n.t]||0)+1;n.k=n.t+'-'+doc.cnt[n.t]};
 const pages=(td.pages||[]).filter(p=>p&&p.root);if(!pages.length){toast('가져올 페이지가 없어요');return}
 const comps={};Object.keys(td.comps||{}).forEach(c=>{const nc='c'+uid();map[c]=nc;comps[nc]=td.comps[c];walk(comps[nc].node,rekey)});
 pages.forEach(p=>{walk(p.root,rekey);const o=p.id;p.id=uid();map[o]=p.id});
 const fix=n=>{if(n.ck&&n.ck.to&&map[n.ck.to])n.ck.to=map[n.ck.to];if(n.href&&n.href.indexOf('page:')===0)n.href=map[n.href.slice(5)]?'page:'+map[n.href.slice(5)]:'#';if(n.bdetail&&map[n.bdetail])n.bdetail=map[n.bdetail];if(n.t==='inst'&&map[n.comp])n.comp=map[n.comp]};
 pages.forEach(p=>walk(p.root,fix));Object.keys(comps).forEach(c=>walk(comps[c].node,fix));
 pages.forEach(p=>walk(p.root,n=>{if(!n.s.o)n.s.o={}}));
 ASSETS=Object.assign(ASSETS,t.assets||{});saveAssets();Object.assign(doc.comps,comps);
 const css=(td.css||'').trim();if(css&&(doc.css||'').indexOf(css)<0)doc.css=((doc.css||'')+'\n'+css).trim();
 const nm=(t.meta&&t.meta.name)||'테마';
 if(mode==='replace'){const p=pages[0];doc.root=p.root;doc.pages[doc.cur].root=p.root}
 else{pages.forEach((p,i)=>{doc.pages.push({id:p.id,name:i===0?nm:p.name,slug:uniqSlug(p.slug==='index'?'home':p.slug),title:p.title||'',desc:p.desc||'',root:p.root,kind:p.kind==='post'?'post':undefined,pboard:p.pboard,psrc:p.psrc})});
  doc.cur=doc.pages.length-pages.length;doc.root=doc.pages[doc.cur].root}
 S.sel=doc.root.id;S.col=new Set();S.tabs={};commit();fullRender();closeModal();toast('테마를 가져왔어요')}
function openTheme(){const fj=$('#fj');fj.value='';fj.onchange=()=>{const f=fj.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{let t;
  try{t=JSON.parse(r.result);if(t.type!=='homejit-theme'){if(t.doc&&(t.doc.root||t.doc.pages)){const d=t.doc;if(!d.pages){d.pages=[{id:uid(),name:'홈',slug:'index',title:'',desc:'',root:d.root}]}else{const cr=d.pages[d.cur||0];if(cr&&!cr.root)cr.root=d.main||d.root}t={type:'homejit-theme',meta:{name:d.title||'작업 파일'},doc:d,assets:t.assets}}else throw 0}}catch(e){toast('테마 파일이 아니에요');return}
  const m=t.meta||{},pg=(t.doc.pages||[]).filter(p=>p&&p.root);
  modal('<h3>테마 불러오기</h3><div class="sb2"><b style="font-size:15px">'+E(m.name||'이름 없는 테마')+'</b>'+(m.author?' <span style="color:var(--mu)">· '+E(m.author)+'</span>':'')+(m.desc?'<p style="margin:6px 0 0">'+E(m.desc)+'</p>':'')+'<p class="note" style="margin-top:8px">페이지 '+pg.length+'개: '+pg.map(p=>E(p.name)).join(', ')+'</p></div>'
   +'<div class="row"><button class="b pri" data-w="add">내 사이트에 페이지로 추가</button><button class="b" data-w="rep">지금 페이지를 이 테마의 첫 페이지로 교체</button><button class="b" data-close="1">취소</button></div><p class="note" style="margin-top:10px">"추가"는 지금 만든 페이지는 그대로 두고 테마의 페이지를 새로 붙여요. 두 방식 모두 ↶로 되돌릴 수 있어요.</p>');
  $('#mb').onclick=ev=>{const x=ev.target.closest('[data-w]');if(!x)return;importTheme(t,x.dataset.w==='rep'?'replace':'add')}};r.readAsText(f)};fj.click()}
function openExport(){
 const fn=(doc.title||'homepage').replace(/[^\w가-힣\- ]/g,'').trim().replace(/\s+/g,'-')||'homepage';
 const warns=lint();
 modal('<h3>내보내기</h3><p>페이지마다 HTML 파일, 공통 CSS·JS, 가볍게 줄인 이미지 폴더를 zip 하나로 받아요. 압축을 풀어 그대로 호스팅(Netlify, GitHub Pages 등)에 올리면 돼요.</p>'
  +'<div class="f"><span class="fl" style="width:84px">사이트 주소</span><span class="fc"><input type="text" id="siteu" value="'+E(doc.site||'')+'" placeholder="https://example.com (선택 · sitemap·검색용)"></span></div>'
 +'<label class="f" style="gap:8px;align-items:flex-start"><input type="checkbox" id="idxon"'+(doc.idx===true?' checked':'')+'><span>검색엔진(구글 등)에 노출 허용 <small style="opacity:.7">— 끄면 모든 페이지에 검색 제외 표시(noindex)가 들어가요</small></span></label>'
 +'<div class="gt" style="margin:12px 0 4px">게시판 연결 — 게시판 블록을 쓸 때만 (Notion은 별도 입력 없음)</div>'
  +'<div class="f"><span class="fl" style="width:84px">프로젝트 URL</span><span class="fc"><input type="text" data-sb="url" value="'+E((doc.sb||{}).url||'')+'" placeholder="https://xxxx.supabase.co"></span></div>'
  +'<div class="f"><span class="fl" style="width:84px">공개 키</span><span class="fc"><input type="text" data-sb="key" value="'+E((doc.sb||{}).key||'')+'" placeholder="sb_publishable_… (Secret key는 안 돼요)"></span></div>'
  +'<div class="f"><span class="fl" style="width:84px">관리자 이메일(공통)</span><span class="fc"><input type="text" data-sb="email" value="'+E((doc.sb||{}).email||'')+'" placeholder="me@example.com"></span></div>'
  +'<div class=\"f\"><span class=\"fl\" style=\"width:84px\">Firebase API 키</span><span class=\"fc\"><input type=\"text\" data-sb=\"fk\" value=\"'+E((doc.sb||{}).fk||'')+'\" placeholder=\"AIza… (웹 앱의 apiKey)\"></span></div>'
  +'<div class=\"f\"><span class=\"fl\" style=\"width:84px\">Firebase 프로젝트 ID</span><span class=\"fc\"><input type=\"text\" data-sb=\"fp\" value=\"'+E((doc.sb||{}).fp||'')+'\" placeholder=\"my-project-12345\"></span></div>'
  +'<div class="row" style="margin-top:6px"><button class="b" data-x="sql">Supabase SQL 보기·복사</button><button class="b" data-x="rules">Firebase 규칙 보기·복사</button></div>'
  +(warns.length?'<div class="note" style="margin:10px 0"><b>점검 결과</b><ul style="margin:4px 0 0;padding-left:18px">'+warns.map(w=>'<li>'+E(w)+'</li>').join('')+'</ul></div>':'<p style="margin-top:10px">점검 결과: 문제 없어요 ✓</p>')
  +'<div class="row"><button class="b pri" data-x="zip">ZIP으로 내보내기 (권장)</button></div>'
  +'<div class="row"><button class="b" data-x="html">현재 페이지만 HTML 한 파일</button><button class="b" data-x="copy">HTML 복사</button></div>'
  +'<p style="margin-top:12px">이 파일은 공개(배포)용 완성물이에요. 나중에 이어서 편집하거나 디자인을 공유하려면 <b>💾 파일</b> 메뉴를 쓰세요.</p><div class="row"><button class="b" data-close="1">닫기</button></div>'
  +'<p class="note" style="margin-top:14px;font-size:11px;line-height:1.6;opacity:.75"><b>올릴 수 있는 곳</b> · 호스팅: Netlify, Cloudflare Pages, GitHub Pages, Vercel, Firebase Hosting · 게시판 DB: Supabase, Firebase, Notion · 도메인: 위 호스팅 모두 내 도메인 연결 가능 (Notion 자동 동기화는 GitHub 연결 필요)</p>');
 $('#mb').onchange=e=>{const t=e.target,k=t.dataset.sb;if(!k)return;let v=t.value.trim();if(k==='key'&&keyIsSecret(v)){toast('Secret key는 사이트에 넣으면 안 돼요. Publishable key를 쓰세요');t.value='';v=''}doc.sb=doc.sb||{};doc.sb[k]=v;commit()};
 $('#idxon').onchange=e=>{doc.idx=e.target.checked?true:undefined;commit()};
 $('#siteu').onchange=e=>{doc.site=e.target.value.trim().replace(/\/+$/,'');commit()};
 $('#mb').onclick=async ev=>{const x=ev.target.closest('[data-x]');if(!x)return;const k=x.dataset.x;
  if(k==='zip'){toast('사이트를 만드는 중…');try{const files=await buildSite();const blob=await makeZip(files);await saveFile(fn+'.zip',blob,'application/zip')}catch(e){X=null;toast('내보내기에 실패했어요: '+(e&&e.message||e))}}
  else if(k==='rules')showText('Firebase 콘솔 → Firestore → 규칙에 붙여 넣고 게시',fbRules((doc.sb||{}).email));
  else if(k==='sql')showText('Supabase SQL Editor에 붙여 넣고 Run',sbSQL((doc.sb||{}).email));
  else if(k==='html')saveFile(fn+'.html',buildHTML(),'text/html');
  else if(k==='copy')copyText(buildHTML());
  }}


/* ---------- templates ---------- */
const TPL=[
 {n:'기본(스크롤 형)',i:'👋',d:'소개 · 작업 카드 · 연락',make:()=>{blank('자기소개');doc.root.c=[navN(),heroN(),
  secN([mk('heading',{text:'소개',an:'up'}),mk('text',{text:'저는 이런 사람이에요. 무엇을 좋아하고, 어떤 일을 하는지 편하게 적어보세요.\n두 번째 문단도 이어서 쓸 수 있어요.',d:{color:'#444444'}})],{eid:'about',name:'소개'}),
  secN([mk('heading',{text:'작업',an:'up'}),mk('stack',{d:{'grid-template-columns':'repeat(3,1fr)'},t:{'grid-template-columns':'repeat(2,1fr)'}},[cardN('프로젝트 하나','어떤 프로젝트인지 짧게 설명해요.'),cardN('프로젝트 둘','사용한 기술과 결과를 적어보세요.'),cardN('프로젝트 셋','링크나 느낀 점을 남겨도 좋아요.')])],{eid:'work',name:'작업',d:{'background-color':'#fafafa'}}),
  secN([mk('heading',{text:'연락',an:'up'}),mk('text',{text:'이야기 나누고 싶다면 편하게 연락 주세요.'}),mk('button',{text:'hello@example.com',href:'mailto:hello@example.com',fx:'glow'})],{eid:'contact',name:'연락'}),footN()];return doc}},
 {n:'기본(카드 형)',i:'🔗',d:'한 화면에 링크만',make:()=>{blank('링크 모음');setS(doc.root,'background-image','linear-gradient(160deg,#eef2ff,#fdf2f8)','d');
  doc.root.c=[mk('section',{d:{padding:'72px 20px','min-height':'100vh'}},[mk('container',{d:{'max-width':'420px','align-items':'center',gap:'22px'}},[profileN(),linksN()])])];return doc}},
 {n:'효과 모음',i:'✨',d:'호버·애니메이션 예시',make:()=>{blank('효과 모음');
  const hv=FXL.map(x=>mk('box',{fx:x[0],name:x[1],d:{'background-color':'#ffffff','border-radius':'14px','box-shadow':'0 4px 16px rgba(0,0,0,.08)',padding:'28px 16px','align-items':'center'}},[mk('text',{text:x[1],d:{'font-weight':'700'}}),mk('text',{text:'마우스를 올려보세요',d:{'font-size':'13px',color:'#888888'}}),mk('text',{text:'.'+x[0]+':hover {\n  '+x[2].split(';').join(';\n  ')+';\n}',d:{'font-size':'11px',color:'#555566','font-family':'monospace','white-space':'pre-wrap','background-color':'#f3f3f8','border-radius':'8px',padding:'8px 10px',width:'100%','text-align':'left'}})]));
  const an=ANL.map((x,i)=>mk('box',{an:x[0],ads:(i%3)*0.1,name:x[1],d:{'background-color':'#eef2ff','border-radius':'14px',padding:'28px 16px','align-items':'center'}},[mk('text',{text:x[1],d:{'font-weight':'700'}}),mk('text',{text:LOOPS.has(x[0])?'계속 움직여요':'스크롤하면 나타나요',d:{'font-size':'13px',color:'#667'}}),mk('text',{text:(KF[x[0]]||'').replace(/\{/,' {\n  ').replace(/\}\s*$/,'\n}'),d:{'font-size':'11px',color:'#555566','font-family':'monospace','white-space':'pre-wrap','overflow-wrap':'anywhere','background-color':'#ffffff','border-radius':'8px',padding:'8px 10px',width:'100%','text-align':'left'}})]));
  doc.root.c=[secN([mk('heading',{tag:'h1',text:'호버 효과'}),mk('stack',{d:{'grid-template-columns':'repeat(3,1fr)'}},hv)]),secN([mk('heading',{tag:'h1',text:'애니메이션'}),mk('stack',{d:{'grid-template-columns':'repeat(3,1fr)'}},an)],{d:{'background-color':'#f8f8fc'}})];return doc}},
 {n:'자유 배치 체험',i:'⤧',d:'박스 안에서 마음대로',make:()=>{blank('자유 배치');
  const fb=mk('box',{free:true,name:'자유 배치 박스',d:{height:'480px',padding:'0','background-image':'linear-gradient(135deg,#6366f1,#ec4899)','border-radius':'20px',width:'100%','max-width':'960px'},m:{height:'520px'}},[
   mk('heading',{tag:'h1',text:'자유롭게 놓아보세요',d:{left:'48px',top:'56px',width:'520px',color:'#ffffff','font-size':'48px'},t:{left:'32px',width:'420px'},m:{left:'20px',top:'40px',width:'300px','font-size':'32px'},an:'up'}),
   mk('box',{d:{left:'620px',top:'80px',width:'220px',height:'220px','border-radius':'50%','background-color':'rgba(255,255,255,.25)',padding:'0'},t:{left:'480px'},m:{left:'180px',top:'260px',width:'140px',height:'140px'},an:'float'}),
   mk('text',{text:'박스를 선택하고 핸들로 크기를,\n본체를 끌어 위치를 바꿔요.\n태블릿·모바일 화면에선 따로 배치할 수 있어요.',d:{left:'48px',top:'210px',width:'420px',color:'#ffffff'},m:{left:'20px',top:'150px',width:'290px'}}),
   mk('button',{text:'버튼',href:'#',fx:'grow',d:{left:'48px',top:'380px','background-color':'#ffffff',color:'#111111'},m:{left:'20px',top:'430px'}})]);
  doc.root.c=[mk('section',{d:{padding:'60px 24px'},m:{padding:'24px 12px'}},[fb])];return doc}},
 {n:'클릭 확장 패널',i:'↔',d:'가운데 패널이 옆으로 펼쳐져요',make:()=>{blank('클릭 확장 패널');setS(doc.root,'background-color','#222222','d');
  const A=mk('box',{name:'왼쪽 패널',d:{'background-color':'#f6f1e9',padding:'28px',width:'340px','flex-shrink':'0','align-items':'center',gap:'18px',color:'#111111'},m:{width:'100%'}},[
   mk('image',{d:{width:'230px',height:'300px','border-radius':'50%','object-fit':'cover',filter:'grayscale(1)'}}),
   mk('heading',{tag:'h2',text:"I'm sewing\nthe patches",d:{'font-family':FAM('Italiana'),'font-size':'44px','font-weight':'400','line-height':'1.1',width:'100%'}}),
   mk('text',{text:'Right onto my skin',d:{'font-family':FAM('Playfair Display'),'font-style':'italic','font-size':'18px',width:'100%'}})]);
  const B=mk('box',{name:'가운데 패널 (클릭하면 펼쳐져요)',free:true,tr:0.8,ck:{a:'open',to:'self'},d:{width:'340px','flex-shrink':'0','flex-grow':'0',height:'760px',overflow:'hidden','background-image':'linear-gradient(160deg,#6b6b6b,#1b1b1b)',padding:'0',gap:'0'},o:{'flex-grow':'1'},m:{width:'100%',height:'580px'}},[]);
  B.c.push(
   mk('text',{text:'Monroe',d:{left:'36px',top:'56px',width:'270px','font-family':FAM('Great Vibes'),'font-size':'64px',color:'#ffffff','line-height':'1'}}),
   mk('heading',{tag:'h3',text:'Avernei',d:{left:'36px',top:'610px',width:'270px','font-family':FAM('Great Vibes'),'font-size':'56px',color:'#ffffff','font-weight':'400'},m:{top:'420px'}}),
   mk('text',{text:'in love · 24 years',d:{left:'36px',top:'700px',width:'270px',color:'#dddddd','font-size':'14px'},m:{top:'500px'}}),
   mk('text',{name:'펼치면 나오는 글',text:'가운데 패널을 누르면 옆으로 펼쳐지면서 이 글이 서서히 나타나요.\n\n이 자리에 소개나 작업 내용을 적어보세요.',tr:0.6,trd:0.5,d:{left:'400px',top:'130px',width:'360px',color:'#eeeeee','font-size':'18px','line-height':'1.8',opacity:'0','pointer-events':'none'},o:{opacity:'1','pointer-events':'auto'},m:{left:'36px',top:'130px',width:'300px'}}),
   mk('button',{text:'닫기 ✕',ck:{a:'close',to:B.id},tr:0.6,trd:0.5,d:{left:'400px',top:'56px','background-color':'transparent',color:'#ffffff','border-width':'1px','border-style':'solid','border-color':'#ffffff',opacity:'0','pointer-events':'none'},o:{opacity:'1','pointer-events':'auto'},m:{left:'36px',top:'56px'}}));
  const row=mk('box',{name:'패널 줄',d:{'flex-direction':'row',gap:'24px',padding:'0',width:'100%','max-width':'1200px'},m:{'flex-direction':'column'}},[A,B]);
  doc.root.c=[mk('section',{d:{'background-color':'#222222',padding:'48px 24px'}},[mk('container',{d:{'max-width':'1200px','align-items':'center'}},[row])])];return doc}},
 {n:'갤러리 (게시판 연결)',i:'⇆',d:'옆으로 넘기는 사진 게시판 페이지',make:()=>{blank('ordinary day');setS(doc.root,'background-color','#141414','d');setS(doc.root,'color','#ffffff','d');
  doc.root.c=[mk('section',{d:{'background-color':'#141414',padding:'48px 0 40px',gap:'28px'},m:{padding:'32px 0'}},[mk('heading',{tag:'h1',text:'ordinary day',d:{'font-family':FAM('Great Vibes'),'font-size':'88px',color:'#ffffff','font-weight':'400',width:'100%','text-align':'center'},m:{'font-size':'56px'}}),mk('board',{board:'gallery',bview:'gallery',blimit:20,d:{'max-width':'100%',color:'#ffffff',padding:'0 28px'}})])];return doc}},
 {n:'빈 페이지',i:'▭',d:'처음부터 만들기',make:()=>{blank('새 페이지');doc.root.c=[PRE.section()];return doc}}
];
function applyTpl(i){
 if(doc.main){toast('컴포넌트 편집을 먼저 끝내 주세요');return}
 const old=doc;let nd;try{TPL[i].make();nd=doc}finally{doc=old}
 const rk=n=>{doc.cnt[n.t]=(doc.cnt[n.t]||0)+1;n.k=n.t+'-'+doc.cnt[n.t]};
 walk(nd.root,rk);Object.keys(nd.comps||{}).forEach(c=>{walk(nd.comps[c].node,rk);doc.comps[c]=nd.comps[c]});
 if(nd.css&&nd.css.trim()&&(doc.css||'').indexOf(nd.css.trim())<0)doc.css=((doc.css||'')+'\n'+nd.css).trim();
 doc.root=nd.root;doc.pages[doc.cur].root=nd.root;S.sel=doc.root.id;S.col=new Set();S.tabs={};commit();fullRender();closeModal();toast('"'+doc.pages[doc.cur].name+'" 페이지에 적용했어요')}
const BDS=[
 {n:'박스 목록',i:'☐',d:'글마다 둥근 상자',view:'box'},
 {n:'줄 목록',i:'≡',d:'구분선만 있는 깔끔한 목록',view:'line'},
 {n:'게시판 표',i:'▤',d:'번호 · 제목 · 날짜',view:'table'},
 {n:'카드',i:'▦',d:'사진 카드가 여러 열로',view:'cards'},
 {n:'블로그 피드',i:'✎',d:'큰 제목 아래 본문이 이어져요',view:'feed'},
 {n:'가로 스크롤 갤러리',i:'⇆',d:'옆으로 넘기는 사진 카드',view:'gallery',s:{'max-width':'100%'}},
 {n:'갤러리 (어두운 배경)',i:'🌙',d:'검은 배경 · 흰 글씨 갤러리',view:'gallery',s:{'max-width':'100%','background-color':'#141414',color:'#ffffff',padding:'40px 28px','border-radius':'20px'}}
];
function applyBoardDesign(i){
 const d=BDS[i],f=find(S.sel);
 if(f&&f.n.t==='board'){const n=f.n;
  if(n.c.length){toast('이 게시판은 카드를 직접 디자인한 상태예요. 설정에서 "게시판 풀기"를 하거나 새 게시판에 적용하세요');return}
  if(n.bdk)n.bdk.forEach(k=>{delete n.s.d[k]});delete n.bdk;delete n.bdp;
  n.bview=d.view;if(d.s){n.bdk=Object.keys(d.s);Object.assign(n.s.d,d.s);n.bdp=d.n}
  commit();refresh();closeModal();toast('"'+d.n+'" 디자인을 적용했어요');return}
 const nn=mk('board',{bview:d.view});if(d.s){nn.bdk=Object.keys(d.s);Object.assign(nn.s.d,d.s);nn.bdp=d.n}
 closeModal();addClick(nn)}

/* ---------- board card (custom design) ---------- */
function guessBinds(n){let h=null,t=null,im=null;walk(n,x=>{if(x.t==='heading'&&!h)h=x;else if(x.t==='text'&&!t&&!(x.text||'').includes('{{'))t=x;else if(x.t==='image'&&!im)im=x});if(h)h.bind='title';if(t)t.bind='body';if(im)im.bind='image'}
function makeBoardCard(){const f=find(S.sel);if(!f||!f.p||f.n.t==='board'||f.n.t==='inst'||!isCont(f.n))return;if(boardOf(f.n.id)){toast('이미 게시판 안이에요');return}
 const n=f.n;guessBinds(n);const bd=mk('board',{board:'notice',d:{'max-width':'100%'}},[n]);
 f.p.c.splice(f.p.c.indexOf(n),1,bd);S.sel=n.id;commit();refresh();toast('게시판 카드로 만들었어요 · 요소 설정의 "게시판 연결"에서 바꿀 수 있어요')}
function unBoard(){const f=find(S.sel);if(!f||f.n.t!=='board'||!f.p)return;const n=f.n;n.c.forEach(x=>walk(x,y=>{delete y.bind}));f.p.c.splice(f.p.c.indexOf(n),1,...n.c);S.sel=n.c.length?n.c[0].id:f.p.id;commit();refresh()}
function seedCard(){const f=find(S.sel);if(!f||f.n.t!=='board')return;const n=f.n,v=n.bview||'box';
 const sty={box:{border:'1px solid #d9d9e0','border-radius':'12px',padding:'16px'},line:{'border-bottom':'1px solid #d9d9e0',padding:'14px 2px'},table:{'border-bottom':'1px solid #d9d9e0',padding:'12px 4px','flex-direction':'row','align-items':'baseline'},cards:{'background-color':'#f4f4f7','border-radius':'12px',padding:'12px'},feed:{padding:'0',gap:'8px'},gallery:{width:'300px',padding:'0',gap:'10px'}}[v]||{};
 const img=mk('image',{bind:'image',d:{'aspect-ratio':v==='gallery'?'4/5':'4/3','object-fit':'cover','border-radius':'10px'}});
 const date=mk('text',{text:'2026. 11. 2.',bind:'date',d:{'font-size':'13px',opacity:'0.6'}});
 const title=mk('heading',{tag:'h3',text:'글 제목',bind:'title',d:{'font-size':v==='feed'?'28px':'18px'}});
 const body=mk('text',{text:'글 내용이 여기에 보여요.',bind:'body',d:{'font-size':'15px'}});
 let kids;
 if(v==='table'){const num=mk('text',{text:'1',bind:'num',d:{'font-size':'14px',opacity:'0.55',width:'3em'}});title.s.d.flex='1';title.s.d['font-size']='16px';kids=[num,title,date]}
 else kids=v==='feed'?[date,title,img,body]:[img,date,title,body];
 const card=mk('box',{name:'글 카드',d:Object.assign({gap:'8px'},sty)},kids);
 n.c=[card];n.blay=v==='cards'?'grid3':v==='gallery'?'scroll':'col';delete n.bdk;delete n.bdp;S.sel=card.id;commit();refresh();toast('카드를 직접 디자인할 수 있어요 · 구조 패널에서 요소를 골라 보세요')}
function openTpl(tab){
 const pn=doc.pages[doc.cur].name,bt=tab==='board';
 const sf=find(S.sel),isB=sf&&sf.n.t==='board';
 const tabs='<div class="row" style="margin:0 0 10px"><button class="b'+(bt?'':' pri')+'" data-tab="page">📄 페이지 전체</button><button class="b'+(bt?' pri':'')+'" data-tab="board">📋 게시판 디자인</button></div>';
 if(bt){
  modal('<h3>템플릿</h3>'+tabs+'<p>'+(isB?'선택한 게시판 <b>"'+E(lab(sf.n))+'"</b>의 모양만 바뀌어요. 글 내용과 페이지의 다른 부분은 그대로예요.':'선택된 게시판이 없어서, 고르면 <b>새 게시판 블록</b>이 추가돼요. 기존 게시판에 적용하려면 먼저 그 블록을 선택하세요.')+' (↶ 실행 취소로 되돌릴 수 있어요)</p><div class="cards">'+BDS.map((t,i)=>'<button class="card" data-bds="'+i+'"><i>'+t.i+'</i><b>'+t.n+'</b><span>'+t.d+'</span></button>').join('')+'</div><div class="row"><button class="b" data-close="1">닫기</button></div>');
  $('#mb').onclick=ev=>{const t=ev.target.closest('[data-tab]');if(t){openTpl(t.dataset.tab);return}const c=ev.target.closest('[data-bds]');if(c)applyBoardDesign(+c.dataset.bds)};return}
 modal('<h3>템플릿</h3>'+tabs+'<p>고르면 지금 보고 있는 <b>"'+E(pn)+'"</b> 페이지 <b>전체</b>가 바뀌어요. 다른 페이지와 컴포넌트는 그대로예요. 게시판·갤러리처럼 한 요소만 바꾸려면 <b>게시판 디자인</b> 탭을 쓰세요. (↶ 실행 취소로 되돌릴 수 있어요)</p><div class="cards">'+TPL.map((t,i)=>'<button class="card" data-tpl="'+i+'"><i>'+t.i+'</i><b>'+t.n+'</b><span>'+t.d+'</span></button>').join('')+'</div><div class="row"><button class="b" data-w="theme">🎨 테마 파일 불러오기</button><button class="b" data-close="1">닫기</button></div>');
 $('#mb').onclick=async ev=>{const tb=ev.target.closest('[data-tab]');if(tb){openTpl(tb.dataset.tab);return}if(ev.target.closest('[data-w=theme]')){openTheme();return}const c=ev.target.closest('[data-tpl]');if(!c)return;const i=+c.dataset.tpl;
  if(cnt(doc.root)<=4){applyTpl(i);return}
  modal('<h3>이 페이지를 바꿀까요?</h3><p>"'+E(pn)+'" 페이지에 지금 만든 내용이 <b>"'+E(TPL[i].n)+'" 템플릿으로 바뀌어요.</b> 다른 페이지는 그대로예요.</p><div class="row"><button class="b pri" data-w="go">바꾸기</button><button class="b" data-w="save">먼저 파일로 저장</button><button class="b" data-w="back">템플릿 목록으로</button></div>');
  $('#mb').onclick=async e2=>{const x=e2.target.closest('[data-w]');if(!x)return;if(x.dataset.w==='go')applyTpl(i);else if(x.dataset.w==='save'){if(await saveWork())applyTpl(i)}else openTpl()}}}

/* ---------- pointer interactions ---------- */
const cvin=$('#cvin');
function ghost(txt,x,y){const g=$('#gh');g.textContent=txt;g.style.display='block';g.style.left=(x+12)+'px';g.style.top=(y+12)+'px'}
function hideGhost(){$('#gh').style.display='none';$('#tip').style.display='none';showInd(null)}
function startMove(e,id){const f=find(id);if(!f||!f.p)return;drag={k:'move',id:id,sx:e.clientX,sy:e.clientY,on:false,free:!!f.p.free};
 if(drag.free){const el=nodeEl(id);drag.l0=el.offsetLeft;drag.t0=el.offsetTop}}
function startResize(e,hd){const f=find(S.sel),el=nodeEl(S.sel);if(!f||!el)return;const r=el.getBoundingClientRect();
 drag={k:'rs',h:hd,n:f.n,p:f.p,sx:e.clientX,sy:e.clientY,on:false,w0:r.width/S.z,h0:r.height/S.z,l0:el.offsetLeft,t0:el.offsetTop,free:!!(f.p&&f.p.free)};e.preventDefault()}
cvin.addEventListener('pointerdown',e=>{
 if(S.pv)return;
 const hd=e.target.closest('[data-h]');if(hd){startResize(e,hd.dataset.h);return}
 if(e.target.closest('[data-act="grip"]')){startMove(e,S.sel);e.preventDefault();return}
 if(e.target.closest('.lbl'))return;
 const ne=e.target.closest('#sc [data-id]');
 if(!ne){select(doc.root.id);return}
 if(ne.isContentEditable)return;
 const id=ne.dataset.id;if(id!==S.sel)select(id);
 if(e.pointerType!=='touch'&&id!==doc.root.id){startMove(e,id);if(e.pointerType==='mouse')e.preventDefault()}});
cvin.addEventListener('dblclick',e=>{if(S.pv)return;const ne=e.target.closest('#sc [data-id]');if(ne)beginEdit(ne.dataset.id)});
cvin.addEventListener('click',e=>{
 if(S.pv){const cc=e.target.closest('[data-ck]');if(cc&&e.target.closest('#sc')){e.preventDefault();const am=cc.dataset.ck;if(am==='show'){const g=cc.dataset.grp;if(g){$$('#sc [data-ck=show]').forEach(x=>{if(x.dataset.grp===g){x.classList.remove('open');x.setAttribute('aria-selected','false')}});cc.classList.add('open');cc.setAttribute('aria-selected','true');$$('#sc '+g+'>[data-panel]').forEach(pp=>{pp.hidden=!pp.matches(cc.dataset.to)})}return}$$('#sc '+cc.dataset.to).forEach(x=>{if(am==='open')x.classList.add('open');else if(am==='close')x.classList.remove('open');else x.classList.toggle('open')});return}}
 const a=e.target.closest('a');if(a&&e.target.closest('#sc')){e.preventDefault();if(S.pv&&a.dataset.page){const pi=doc.pages.findIndex(q=>q.id===a.dataset.page);if(pi>=0){switchPage(pi);return}}const h=a.getAttribute('href')||'';if(S.pv&&h.charAt(0)==='#'&&h.length>1){const t=$('#sc [id="'+h.slice(1).replace(/"/g,'')+'"]');if(t)t.scrollIntoView({behavior:'smooth'})}}
 const b=e.target.closest('#selw [data-act]');if(b&&b.dataset.act!=='grip')act(b.dataset.act)});
cvin.addEventListener('submit',e=>e.preventDefault());
cvin.addEventListener('pointermove',e=>{
 if(drag||S.pv||e.pointerType==='touch'){$('#hv').style.display='none';return}
 const ne=e.target.closest&&e.target.closest('#sc [data-id]');const hv=$('#hv');
 if(!ne||ne.dataset.id===S.sel){hv.style.display='none';return}
 const b=cvin.getBoundingClientRect(),r=ne.getBoundingClientRect();hv.style.cssText='display:block;left:'+(r.left-b.left)+'px;top:'+(r.top-b.top)+'px;width:'+r.width+'px;height:'+r.height+'px'});
cvin.addEventListener('pointerleave',()=>{$('#hv').style.display='none'});

window.addEventListener('pointermove',e=>{
 if(!drag)return;
 const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
 if(!drag.on){if(Math.hypot(dx,dy)<6)return;drag.on=true}
 if(drag.k==='move'){
  if(drag.free){const f=find(drag.id);setS(f.n,'left',Math.round(drag.l0+dx/S.z)+'px');setS(f.n,'top',Math.round(drag.t0+dy/S.z)+'px');restyle();return}
  const f=find(drag.id);ghost(lab(f.n),e.clientX,e.clientY);
  const d=dropAt(e.clientX,e.clientY,drag.id);drag.drop=d;showInd(d);
 }else if(drag.k==='add'){
  ghost(drag.label,e.clientX,e.clientY);
  const r=$('#cv').getBoundingClientRect();const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  const d=inside?dropAt(e.clientX,e.clientY,null):null;drag.drop=d;showInd(d);
 }else if(drag.k==='rs'){
  const z=S.z,n=drag.n,hd=drag.h,ddx=dx/z,ddy=dy/z;
  let w=drag.w0,h=drag.h0,l=drag.l0,t=drag.t0;
  if(hd.indexOf('e')>=0)w=drag.w0+ddx;
  if(hd.indexOf('w')>=0){w=drag.w0-ddx;l=drag.l0+ddx}
  if(hd.indexOf('s')>=0)h=drag.h0+ddy;
  if(hd.indexOf('n')>=0){h=drag.h0-ddy;t=drag.t0+ddy}
  w=Math.max(16,w);h=Math.max(12,h);
  if(hd.indexOf('e')>=0||hd.indexOf('w')>=0){
   let wv=Math.round(w)+'px';
   if(!drag.free&&drag.p){const pe=nodeEl(drag.p.id),cs=getComputedStyle(pe),pw=pe.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);if(Math.abs(w-pw)<8)wv='100%'}
   setS(n,'width',wv)}
  if(hd.indexOf('w')>=0)setS(n,'left',Math.round(l)+'px');
  if(hd.indexOf('s')>=0||hd.indexOf('n')>=0){
   setS(n,(drag.free||!isCont(n))?'height':'min-height',Math.round(h)+'px');
   if(n.t==='image'&&!getS(n,'object-fit').v)setS(n,'object-fit','cover')}
  if(hd.indexOf('n')>=0)setS(n,'top',Math.round(t)+'px');
  restyle();const tp=$('#tip');tp.style.display='block';tp.style.left=(e.clientX+14)+'px';tp.style.top=(e.clientY+14)+'px';tp.textContent=Math.round(w)+' × '+Math.round(h);
 }else if(drag.k==='tree'){
  const f=find(drag.id);ghost(lab(f.n),e.clientX,e.clientY);
  $$('#p-tree .tr').forEach(r=>r.classList.remove('dz-b','dz-a','dz-in'));drag.drop=null;
  const el=document.elementFromPoint(e.clientX,e.clientY);const row=el&&el.closest?el.closest('#p-tree .tr'):null;
  if(row){const id=row.dataset.id;if(id===drag.id||inSub(id,drag.id))return;
   const rc=row.getBoundingClientRect(),fy=(e.clientY-rc.top)/rc.height,tn=find(id).n;
   let zone=fy<0.3?'b':fy>0.7?'a':'in';if(id===doc.root.id)zone='in';if(zone==='in'&&!isCont(tn))zone=fy<0.5?'b':'a';
   row.classList.add('dz-'+zone);drag.drop={id:id,zone:zone}}}
});
function endDrag(e,cancel){
 if(!drag)return;const d=drag;drag=null;hideGhost();$$('#p-tree .tr').forEach(r=>r.classList.remove('dz-b','dz-a','dz-in'));
 if(!d.on)return;
 if(d.k==='add'){S.noClick=true;setTimeout(()=>{S.noClick=false},50);if(!cancel&&d.drop)applyDrop(d.drop,null,PRE[d.key]());return}
 if(cancel){refresh();return}
 if(d.k==='move'){if(d.free){commit();renderStyle()}else if(d.drop)applyDrop(d.drop,d.id)}
 else if(d.k==='rs'){commit();renderStyle()}
 else if(d.k==='tree'&&d.drop){
  const t=find(d.drop.id);if(!t)return;let par,idx;
  if(d.drop.zone==='in'){par=t.n;idx=par.c.length;S.col.delete(par.id)}
  else{par=t.p;idx=par.c.indexOf(t.n)+(d.drop.zone==='a'?1:0)}
  const mv=find(d.id);const wasFree=mv&&mv.p&&mv.p.free;
  if(moveNode(d.id,par,idx)){if(wasFree&&!par.free)['left','top'].forEach(k=>['d','t','m'].forEach(b=>delete mv.n.s[b][k]));
   if(par.free){setS(mv.n,'left','24px','d');setS(mv.n,'top','24px','d')}
   commit();refresh()}}}
window.addEventListener('pointerup',e=>endDrag(e,false));
window.addEventListener('pointercancel',e=>endDrag(e,true));

/* add panel: click or (mouse) drag */
$('#p-add').addEventListener('pointerdown',e=>{
 const t=e.target.closest('[data-add]');if(!t||e.pointerType==='touch')return;
 drag={k:'add',key:t.dataset.add,label:t.textContent.trim(),sx:e.clientX,sy:e.clientY,on:false}});
$('#p-add').addEventListener('click',e=>{
 const ct=e.target.closest('[data-comp]');
 if(ct){const cid=ct.dataset.comp;if(doc.compEditing===cid){toast('이 컴포넌트를 편집하는 중에는 자기 자신을 넣을 수 없어요');return}addClick(mk('inst',{comp:cid,name:doc.comps[cid].name}));if(narrow()){S.sheet=null;applyPanes()}return}
 const t=e.target.closest('[data-add]');if(!t||S.noClick)return;
 addClick(PRE[t.dataset.add]());if(narrow()){S.sheet=null;applyPanes()}});
$('#p-tree').addEventListener('click',e=>{
 const tg=e.target.closest('[data-tg]');if(tg){const id=tg.dataset.tg;if(S.col.has(id))S.col.delete(id);else S.col.add(id);renderTree();return}
 const tr=e.target.closest('.tr');if(tr)select(tr.dataset.id)});
$('#p-tree').addEventListener('pointerdown',e=>{const g=e.target.closest('[data-grip]');if(g){drag={k:'tree',id:g.dataset.grip,sx:e.clientX,sy:e.clientY,on:false};e.preventDefault()}});

/* header actions + panes */
$('#top').addEventListener('click',e=>{
 const b=e.target.closest('[data-bp]');if(b){setBp(b.dataset.bp);return}
 const sb=e.target.closest('[data-st]');if(sb){setSt(sb.dataset.st);return}
 const a=e.target.closest('[data-act]');if(!a)return;
 switch(a.dataset.act){
  case 'zi':S.zm=Math.min(2,S.z*1.2);layout();break;
  case 'zo':S.zm=Math.max(0.2,S.z/1.2);layout();break;
  case 'zf':S.zm=0;layout();break;
  case 'undo':undo();break;case 'redo':redo();break;
  case 'exitcomp':exitComp();break;case 'tpl':openTpl();break;case 'pv':togglePv();break;case 'exp':openExport();break;case 'file':openFile();break;case 'bdt':openTpl('board');break;case 'mkboard':makeBoardCard();break;case 'unboard':unBoard();break;case 'mkpost':makePostPage();break;case 'seedcard':seedCard();break}});
$$('#tsl button,#tsr button,#bar button').forEach(b=>b.addEventListener('click',()=>setPane(b.dataset.pane)));
$('#ttl').addEventListener('change',e=>{doc.title=e.target.value;commit()});
$('#selw').addEventListener('pointerdown',e=>{if(e.target.closest('.lbl button:not(.gp)'))e.stopPropagation()},true);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveWork()}});
document.addEventListener('keydown',e=>{
 const tg=e.target;if(tg&&(/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)||tg.isContentEditable))return;
 const m=e.metaKey||e.ctrlKey;
 if(m&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}
 else if(m&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}
 else if(m&&e.key.toLowerCase()==='d'){e.preventDefault();dupSel()}
 else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();delSel()}
 else if(e.key==='Escape'){if(S.pv)togglePv();else selParent()}
 else if(e.key==='Enter'){beginEdit(S.sel)}});
let rzT=0;
window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(applyPanes,80)});

/* ---------- boot ---------- */
try{ASSETS=JSON.parse(localStorage.getItem('homejit-v3a')||'{}')}catch(e){ASSETS={}}
let saved=null;try{saved=localStorage.getItem('homejit-v3')}catch(e){}
if(saved){try{doc=JSON.parse(saved);if(!doc||!doc.root)throw 0}catch(e){doc=null}}
if(!doc)TPL.find(t=>t.n==='빈 페이지').make();
normDoc();S.sel=doc.root.id;hist=[snap()];hp=0;
if(narrow())S.bp='m';
renderAdd();applyPanes();fullRender();
window.__hj={importTheme:importTheme,themeData:themeData,applyTpl:applyTpl,openTpl:openTpl,saveWork:saveWork,setAsset:(i,u)=>{ASSETS[i]=u},get doc(){return doc},S:S,switchPage:switchPage,addPage:addPage,buildSite:buildSite,makeZip:makeZip,lint:lint,renderPage:renderPage,mk:mk,select:select,buildHTML:buildHTML,find:find,TPL:TPL,PRE:PRE,select:select};
})();
