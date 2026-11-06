window.scrollTo(0,0);
let S=[
 {n:'Оклейка защитной полиуретановой пленкой',p:'от 5 000 ₽',v:5000,t:'2 д',d:'Защитная плёнка на кузов',c:'Кузов',h:48},
 {n:'Полировка кузова автомобиля',p:'от 15 000 ₽',v:15000,t:'1 д',d:'Полировка кузова, устранение царапин',c:'Кузов',h:24},
 {n:'Детейлинг химчистка',p:'от 15 000 ₽',v:15000,t:'1 д',d:'Химчистка салона и детейлинг',c:'Салон',h:24},
 {n:'Предпродажная подготовка автомобиля',p:'от 18 000 ₽',v:18000,t:'1 д',d:'Комплексная подготовка к продаже',c:'Кузов',h:24},
 {n:'Защитные составы для кузова и стекол автомобиля',p:'от 5 000 ₽',v:5000,t:'6 ч',d:'Керамика и гидрофобные составы',c:'Защита',h:12},
 {n:'Полировка стекол автомобиля',p:'от 8 000 ₽',v:8000,t:'4 ч',d:'Полировка стёкол, удаление царапин',c:'Кузов',h:8}];
const AR='<svg class="ar" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 9l6-6M4 3h5v5"/></svg>';
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const WD=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
let st={svc:0,date:new Date(),time:'13:00',name:'',phone:'+7',car:''},step=1,booking=null,cat='Все',bookedLock=false;
const $=id=>document.getElementById(id);
function isSlotOpen(iso,time){const now=new Date();const today=isoDay(now);if(iso<today)return false;if(iso>today)return true;const[h,m]=time.split(':').map(Number);const nowH=now.getHours()+now.getMinutes()/60;return (h+m/60)>nowH+0.5}
function renderSlots(){
 const card=document.querySelector('#s-home .slots');if(!card)return;
 const today=isoDay(new Date());
 const slots=(DB.settings&&DB.settings.slots)||['10:00','12:00','13:00','14:00','17:00','19:00'];
 const taken={};(DB.bookings||[]).forEach(b=>{if(b.date===today&&b.status!=='cancelled')taken[b.time]=1});
 const now=new Date();const nowH=now.getHours()+now.getMinutes()/60;
 const free=slots.filter(t=>{const[h,m]=t.split(':').map(Number);return !taken[t]&&(h+m/60)>nowH+0.5});
 card.innerHTML=free.length
  ? free.map(t=>`<button type="button" class="slot" onclick="quick('${t}')"><small>Сегодня</small><b>${t}</b></button>`).join('')
  : '<div style="padding:12px;text-align:center;color:var(--mu);font-size:13px">На сегодня свободных окон нет</div>';
}
function fmtPhone(v){
 const d=String(v||'').replace(/\D/g,'').slice(0,11);
 if(!d)return '';
 const rest=d.startsWith('7')?d.slice(1):(d.startsWith('8')?d.slice(1):d);
 let out='+7';
 if(rest.length)out+=' '+rest.slice(0,3);
 if(rest.length>3)out+=' '+rest.slice(3,6);
 if(rest.length>6)out+='-'+rest.slice(6,8);
 if(rest.length>8)out+='-'+rest.slice(8,10);
 return out;
}
function row(s,i,desc){return `<div class="row" onclick="pick(${i})"><div class="l"><b>${s.n}</b><small>${desc?s.d:''}</small></div><div class="r"><b>${s.p}</b><small>Выбрать</small></div>${AR}</div>`}
function renderSvc(){let grps=['Кузов','Салон','Защита'];try{if(DB&&DB.settings&&DB.settings.groups&&DB.settings.groups.length)grps=DB.settings.groups}catch(e){};$('chips').innerHTML=['Все'].concat(grps).map(c=>{const n=c=='Все'?S.length:S.filter(s=>s.c==c).length;return `<button class="chip ${c==cat?'on':''}" onclick="cat='${c}';renderSvc()">${c} · ${n}</button>`}).join('');
 $('svcList').innerHTML=S.map((s,i)=>cat=='Все'||s.c==cat?row(s,i,1):'').join('')}
renderSvc();
const NAVO={home:0,svc:1,my:2,cab:3};let cur='home';
function go(s){if(s===cur)return;
 const dir=NAVO[s]>=NAVO[cur]?'slide-r':'slide-l';
 const el=$('s-'+s);
 document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on','slide-r','slide-l'));
 el.classList.add('on',dir);setTimeout(()=>el.classList.remove('slide-r','slide-l'),340);
 if(s=='cab'){el.classList.remove('play');void el.offsetWidth;el.classList.add('play');cabClock();renderCab()}
 cur=s;
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.s==s));$('prof').classList.toggle('on',s=='cab');$('scroll').scrollTop=0;if(s=='my'){closeBook();renderMy();setTimeout(()=>{if(cur=='my')renderMy()},50)}updProg()}
function fmt(d){return d.getDate()+' '+MON[d.getMonth()]}
function out(){const d=new Date(st.date);const[h,m]=st.time.split(':').map(Number);d.setHours(h+S[st.svc].h,m);return fmt(d)+' в '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function pick(i){st.svc=i;step=2;openBook(true)}
function quick(t){st.time=t;step=2;openBook(true)}
function openBook(keep){if(!keep){step=1;st.name='';st.phone='+7';st.car=''}bookedLock=false;render();$('ov').classList.add('on');$('sheet').classList.add('on');if($('nav'))$('nav').style.display='none'}
function closeBook(){$('ov').classList.remove('on');$('sheet').classList.remove('on');if($('nav'))$('nav').style.display=''}
const TT=['','Выберите услугу','Дата и время','Ваш автомобиль','Проверьте запись'];
function head(){return `<div class="grab"></div><div class="sh">${step>1?'<button class="back" aria-label="Назад" onclick="step--;render()"><svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 2L2 8l6 6"/></svg></button>':''}<div><h3 id="sheetTitle">${TT[step]}</h3><small>Шаг ${step} из 4</small></div><button class="x" aria-label="Закрыть" onclick="closeBook()"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13"/></svg></button></div><div class="prog">${[1,2,3,4].map(i=>`<div class="${i<=step?'on':''}"></div>`).join('')}</div>`}
const ARR='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';
function render(){const sh=$('sheet');let h='';
 if(step==1){h=head()+`<div class="sbody"><div class="card list" id="skList">${'<div class="sk-row"></div>'.repeat(4)}</div></div>`}
 if(step==2){const base=new Date();base.setHours(0,0,0,0);const todayIso=base.getFullYear()+'-'+String(base.getMonth()+1).padStart(2,'0')+'-'+String(base.getDate()).padStart(2,'0');let days='';for(let i=0;i<7;i++){const d=new Date(base);d.setDate(base.getDate()+i);days+=`<div class="d ${d.toDateString()==st.date.toDateString()?'on':''}" onclick="st.date=new Date(${d.getFullYear()},${d.getMonth()},${d.getDate()});render()"><small>${WD[d.getDay()]}</small><b>${d.getDate()}</b></div>`}
  const iso=st.date.getFullYear()+'-'+String(st.date.getMonth()+1).padStart(2,'0')+'-'+String(st.date.getDate()).padStart(2,'0');
  h=head()+`<div class="sbody"><div class="sel"><span>${S[st.svc].n}</span><span>${S[st.svc].p.replace('от ','')}</span></div><div class="days">${days}</div>
  <div class="lab">Другая дата</div><input type="date" class="inp" value="${iso}" min="${todayIso}" onchange="if(this.value){const[a,b,c]=this.value.split('-');const nd=new Date(a,b-1,c);nd.setHours(0,0,0,0);if(nd<base){toast('Нельзя выбрать прошедшую дату');render();return}st.date=nd;render()}">
  <div class="times">${(DB.settings&&DB.settings.slots&&DB.settings.slots.length?DB.settings.slots:['10:00','12:00','13:00','14:00','17:00','19:00']).filter(t=>isSlotOpen(iso,t)).map(t=>`<button class="t ${t==st.time?'on':''}" onclick="st.time='${t}';render()">${t}</button>`).join('')}</div></div><button class="bbtn" onclick="step=3;render()">Далее ${ARR}</button>`}
 if(step==3){h=head()+`<div class="sbody"><div class="lab" style="margin-top:0">Имя</div><input class="inp" value="${st.name}" placeholder="Имя" oninput="st.name=this.value">
  <div class="lab">Телефон</div><input class="inp" type="tel" inputmode="numeric" value="${st.phone}" placeholder="+7 ___ ___-__-__" oninput="var v=fmtPhone(this.value);st.phone=v;this.value=v;"><div class="lab">Автомобиль</div><input class="inp" value="${st.car}" placeholder="Например: BMW X5, Kia Rio, Лада Веста" oninput="st.car=this.value"></div><button class="bbtn" onclick="step=4;render()">Проверить запись ${ARR}</button>`}
 if(step==4){h=head()+`<div class="sbody"><div class="card sum"><h4>${S[st.svc].n}</h4><div class="kv"><span>Заезд</span><b>${fmt(st.date)} в ${st.time}</b></div><div class="kv"><span>Выдача, ориентир</span><b>${out()}</b></div><div class="kv"><span>Стоимость</span><b>${S[st.svc].p}</b></div><div class="kv p">${st.name||'—'} / ${st.car||'—'}</div><div class="kv"><span>${st.phone||'—'}</span></div><div class="kv"><span>${DB.settings?DB.settings.address:'Москва, Примерная улица, 12'}</span></div></div>
  <p class="note">Отмена онлайн не позднее чем за 2 ч до заезда.<br>Время студии: Europe/Moscow.</p></div><button class="bbtn" onclick="confirmB()">Подтвердить запись ${ARR}</button>`}
 if(step==5){h=`<div class="grab"></div><div class="sh"><button class="x" aria-label="Закрыть" onclick="closeBook()"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13"/></svg></button></div><div class="done"><div class="big"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3>Вы записаны</h3><p>${S[st.svc].n}<br>${fmt(st.date)} в ${st.time} · ${DB.settings?DB.settings.address:'Москва, Примерная улица, 12'}</p></div><button class="bbtn" onclick="closeBook();go('my')">Моя запись ${ARR}</button>`}
 sh.innerHTML=h;
 if(step==1){clearTimeout(openBook._t);openBook._t=setTimeout(()=>{const el=$('skList');if(el)el.innerHTML=S.map((s,i)=>row(s,i)).join('')},320)}}
function confirmB(){
 if(bookedLock)return;
 const box=(DB.settings.boxes||['Бокс 1'])[0];
 const date=isoDay(st.date);
 if(!isSlotOpen(date,st.time)){toast('Это время уже прошло — выберите другое');return}
 if(date<isoDay(new Date())){toast('Нельзя выбраться на прошедшую дату');return}
 if(!st.name.trim()){toast('Укажите имя');return}
 if(!st.phone.trim()||st.phone.trim().length<3){toast('Укажите телефон');return}
 const dup=DB.bookings.find(x=>x.date===date&&x.time===st.time&&x.box===box&&x.status!=='cancelled');
 if(dup){toast('Это время уже занято — выберите другое');return}
 localStorage.removeItem('sgx.dismissed');
 bookedLock=true;
 const rec={id:'b'+Date.now(),no:++DB.seq,svc:st.svc,svcName:S[st.svc].n,car:st.car,client:st.name,phone:st.phone||'',time:st.time,box,date,status:'new',paid:0};
 DB.bookings.push(rec);saveDB();
 booking=rec;syncBadge();step=5;render()}
function moveBooking(){st={...booking,date:(booking.date instanceof Date)?new Date(booking.date):(function(){const[a,b,c]=booking.date.split('-');return new Date(a,b-1,c)})()};step=2;openBook(true)}
function fmtIso(iso){if(iso instanceof Date)return fmt(iso);const[a,b,c]=iso.split('-');return +c+' '+MON[+b-1]}
function renderMy(){if(localStorage.getItem('sgx.dismissed')){$('myBox').innerHTML=`<div class="card promo"><h3>Записей пока нет</h3><p>Выберите услугу и удобное время — остальное возьмём на себя</p><button class="bbtn" onclick="openBook()">Записаться ${ARR}</button></div>`;return}
const dismissed=localStorage.getItem('sgx.dismissed');const lastB=(DB.bookings||[]).slice().reverse().find(x=>x.status!=='cancelled'&&x.id!==dismissed);let b=booking||lastB||null;if(!b){$('myBox').innerHTML=`<div class="card promo"><h3>Записей пока нет</h3><p>Выберите услугу и удобное время — остальное возьмём на себя</p><button class="bbtn" onclick="openBook()">Записаться ${ARR}</button></div>`;return}
 // актуальный статус из базы
 const fresh=DB.bookings.find(x=>x.id===b.id);if(fresh)b=fresh;
 const sv=(typeof b.svc==='number'&&S[b.svc])?S[b.svc]:{n:b.svcName||'',p:''};
 const stT=({new:'Ждём подтверждения',confirmed:'Подтверждена',in_work:'В работе',ready:'Готова',done:'Готово',cancelled:'Отменена'}[b.status]||'Подтверждена');
 $('myBox').innerHTML=`<div class="card status"><div class="ok"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><small>Номер ${b.no}</small><b>${stT}</b><p>${fmtIso(b.date)} в ${b.time}</p></div>
 <h2 style="margin-top:30px;font-size:21px">${sv.n}</h2><div class="kv"><span>Стоимость</span><b>${sv.p}</b></div><div class="kv"><span>Выдача, ориентир</span><b>${fmtIso(b.date)} в ${(function(){const[h,m]=b.time.split(':').map(Number);return String((h+(sv.h||0))%24).padStart(2,'0')+':'+String(m).padStart(2,'0')})()}</b></div><div class="kv p">${b.car}</div><div class="kv"><span>${DB.settings?DB.settings.address:'Москва, Примерная улица, 12'}</span></div>
 ${b.status==='done'
   ?`<div class="two"><button class="obtn solo" onclick="clientDismiss()">Убрать</button></div>`
   :b.status==='confirmed'
    ?''
    :`<div class="two"><button class="obtn" onclick="moveBooking()">Перенести</button><button class="obtn red" onclick="clientCancel()">Отменить</button></div>`}`}
function clientDismiss(){const cur=booking||(DB.bookings||[]).slice().reverse().find(x=>x.status!=='cancelled'&&x.id!==localStorage.getItem('sgx.dismissed'));if(!cur)return;localStorage.setItem('sgx.dismissed',cur.id);booking=null;syncBadge();renderMy()}
function syncBadge(){const b=$('myBadge');if(b)b.classList.toggle('on',!!booking)}
function clientCancel(){
 if(!booking)return;
 if(booking.id){
  const b=DB.bookings.find(x=>x.id===booking.id);
  if(b)b.status='cancelled';
  saveDB();
 }
 toast('Запись отменена');
 booking=null;renderMy();syncBadge();
 clearTimeout(clientCancel._t);
}
function cabClock(){const e=$('cabSub');if(!e)return;const d=new Date();e.textContent='Сегодня, '+fmt(d)+' · '+WD[d.getDay()]+' · '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
setInterval(cabClock,30000);cabClock();
// прогресс чтения на главной
const progEl=$('readprog'),readBar=$('readbar'),sc=$('scroll');
function updProg(){if(cur!=='home'){progEl.classList.remove('on');return}progEl.classList.add('on');const max=sc.scrollHeight-sc.clientHeight;readBar.style.width=(max>0?(sc.scrollTop/max)*100:0)+'%'}
sc.addEventListener('scroll',()=>requestAnimationFrame(updProg));
// drag-to-close шторки
(function(){let dy0=0,drag=false;const gb=document.querySelector('.grab');if(!gb)return;
gb.addEventListener('pointerdown',e=>{drag=true;dy0=e.clientY;$('sheet').classList.add('dragging')});
window.addEventListener('pointermove',e=>{if(!drag)return;const sh=$('sheet');let dy=e.clientY-dy0;if(dy<0)dy=0;sh.style.transform='translateY('+dy+'px)'});
window.addEventListener('pointerup',()=>{if(!drag)return;drag=false;const sh=$('sheet');const m=sh.style.transform.match(/translateY\(([\d.]+)px\)/);const dy=m?+m[1]:0;sh.style.transform='';sh.classList.remove('dragging');if(dy>90)closeBook()})})();
let tt;function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2200)}
// скролл-появление блоков
if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('on',e.isIntersecting)),{root:$('scroll'),threshold:.12});document.querySelectorAll('.rv').forEach(el=>io.observe(el))}else{document.querySelectorAll('.rv').forEach(el=>el.classList.add('on'))}
// галерея «Наши работы»
let gi=0;const GAL=[...document.querySelectorAll('.gslide')];
function gal(d){gi=(gi+d+GAL.length)%GAL.length;const w=$('galWrap');if(w)w.style.transform='translateX('+(-gi*100)+'%)';GAL.forEach((s,i)=>s.classList.toggle('on',i===gi));const dots=document.querySelectorAll('#galDots .dot');dots.forEach((q,i)=>q.classList.toggle('on',i===gi))}

(function(){const dots=$('galDots');if(!dots||!GAL.length)return;dots.innerHTML=GAL.map((_,i)=>`<span class="dot ${i?'':'on'}"></span>`).join('')})();
// свайп по ленте «Наши работы»
(function(){const wrap=$('galWrap');if(!wrap)return;let x0=null,dx=0;
wrap.addEventListener('pointerdown',e=>{if(e.target.closest('input'))return;x0=e.clientX;dx=0});
wrap.addEventListener('pointermove',e=>{if(x0===null)return;dx=e.clientX-x0});
wrap.addEventListener('pointerup',e=>{if(x0===null)return;if(Math.abs(dx)>40)gal(dx<0?1:-1);x0=null;dx=0})})();
const GALMETA=[];
function baMove(input){const el=input.parentElement;el.style.setProperty('--pos',input.value+'%')}
function galOpen(){const g=$('galGrid');if(!g)return;g.innerHTML=GALMETA.map((m,i)=>`<div class="wcard ${m.c}" onclick="vOpen(${i})"><span>${m.t}</span></div>`).join('');$('galModal').classList.add('on')}
function galClose(){$('galModal').classList.remove('on')}
let vi=0;
function vOpen(i){vi=i;renderV();$('galView').classList.add('on')}
function vClose(){$('galView').classList.remove('on')}
function vNav(d){vi=(vi+d+GALMETA.length)%GALMETA.length;renderV()}
function renderV(){const w=$('vWrap');if(!w)return;w.innerHTML=GALMETA.map(m=>`<div class="vslide"><div class="vimg ${m.c}"><span>${m.t}</span></div></div>`).join('');w.style.transform='translateX('+(-vi*100)+'%)';const dots=$('vDots');if(dots)dots.innerHTML=GALMETA.map((_,i)=>`<span class="dot ${i===vi?'on':''}"></span>`).join('')}
/* ===== Админка: единое хранилище студии ===== */
const DBKEY='sgx.db';
let syncing=false;
let SB=null;
function slugId(slug){let h=5381;for(let i=0;i<slug.length;i++)h=((h<<5)+h+slug.charCodeAt(i))>>>0;return h%1000000000}
const DB_ID=slugId(window.STUDIO_SLUG||'sgx-detailing');
try{if(window.SUPABASE_URL&&window.SUPABASE_KEY&&typeof supabase!=='undefined')SB=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY)}catch(e){}
window.addEventListener('load',function(){try{if(!SB&&typeof supabase!=='undefined'&&window.SUPABASE_URL){SB=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);(async()=>{try{const x=await sbLoad();if(x&&x.settings&&x.settings.address){DB=x;if(DB.services)S=DB.services;localStorage.setItem(DBKEY,JSON.stringify(DB));if(typeof applySettings==='function')applySettings();if(typeof renderSvc==='function')renderSvc()}}catch(e){}})()}}catch(e){}});
async function sbLoad(){if(!SB)return null;const r=await SB.from('app_state').select('data').eq('id',DB_ID).maybeSingle();return r.data?r.data.data:null}
async function sbSave(){if(!SB)return;await SB.from('app_state').upsert({id:DB_ID,data:DB})}
function syncServer(){try{if(syncing)return;syncing=true;(async()=>{try{await sbSave()}catch(e){}try{await fetch('api/db',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(DB)})}catch(e){}syncing=false})()}catch(e){syncing=false}}
const ST={done:{t:'Готово',cls:'g'},in_work:{t:'В работе',cls:'y'},confirmed:{t:'Подтверждена',cls:'w'},new:{t:'Входящая',cls:'w'},cancelled:{t:'Отменена',cls:'w'}};
function isoDay(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function defBookings(){
 const t=new Date(),n=new Date();n.setDate(n.getDate()+1);
 return [
  {id:'b1',no:5101,svc:3,svcName:S[3].n,car:'BMW X5',client:'Иван',phone:'+7 900 111-22-33',time:'09:00',box:'Бокс 1',date:isoDay(t),status:'done',paid:S[3].v},
  {id:'b2',no:5102,svc:0,svcName:S[0].n,car:'Kia K5',client:'Анна',phone:'+7 900 222-33-44',time:'10:00',box:'Бокс 2',date:isoDay(t),status:'done',paid:S[0].v},
  {id:'b3',no:5103,svc:2,svcName:S[2].n,car:'Mercedes E',client:'Дмитрий',phone:'+7 900 333-44-55',time:'12:00',box:'Бокс 1',date:isoDay(t),status:'in_work',paid:0},
  {id:'b4',no:5104,svc:1,svcName:S[1].n,car:'Toyota Camry',client:'Сергей',phone:'+7 900 444-55-66',time:'14:00',box:'Бокс 3',date:isoDay(t),status:'confirmed',paid:0},
  {id:'b5',no:5105,svc:0,svcName:S[0].n,car:'Audi A6',client:'Олег',phone:'+7 900 555-66-77',time:'17:00',box:'Бокс 2',date:isoDay(n),status:'new',paid:0}];
}
const SS=window.STUDIO_SETTINGS||{};
const DEFSET={address:SS.address||'Москва, Примерная улица, 12',phone:SS.phone||'+7 999 123-45-67',open:SS.open||'10:00',close:SS.close||'20:00',adminPass:SS.adminPass||'admin',name:SS.name||'SGX Detailing',tagline:SS.tagline||'Детейлинг, который возвращает кузову глубину, а салону — чистоту',boxes:SS.boxes||['Бокс 1','Бокс 2','Бокс 3'],slots:SS.slots||['10:00','12:00','13:00','14:00','17:00','19:00'],closedDays:SS.closedDays||[],groups:SS.groups||['Кузов','Салон','Защита'],stats:SS.stats||[{v:'4',l:'услуг в прайсе'},{v:'3',l:'бокса в работе'}],price:SS.price||'от 3 500 ₽',hero:SS.hero||null,reviews:SS.reviews||[
 {name:'Михаил',car:'BMW X5 · Керамика',text:'После керамики машина выглядит как из салона: глубокий блеск, вода скатывается. Всё чётко и в срок.'},
 {name:'Анна',car:'Kia K5 · Салон',text:'Химчистка спасла салон после поездки с собакой. Ни запаха, ни пятен — как будто новая машина.'},
 {name:'Дмитрий',car:'Mercedes E · Полировка',text:'Убрали голограммы, которые остались после кустарной полировки. Результат превзошёл ожидания, рекомендую.'}
],gallery:SS.gallery||[
 {ba:true,t:'До · После'},
 {c:'g4',t:'Кузов · Детейлинг',src:null},
 {c:'g5',t:'Наша работа',src:null},
 {c:'g1',t:'Керамика · BMW X5',src:null},
 {c:'g2',t:'Полировка · Mercedes E',src:null},
 {c:'g3',t:'Салон · Kia K5',src:null}
]};
let DB=null;
let freshCreated=false;
try{DB=JSON.parse(localStorage.getItem(DBKEY))}catch(e){}
const DB_EXISTS=!!DB;
if(!DB||!DB.settings){
 freshCreated=true;
 DB={settings:{...DEFSET},seq:0,services:null,bookings:[]};
}else{
 // миграция старых настроек: добавить недостающие поля
 Object.keys(DEFSET).forEach(k=>{if(DB.settings[k]===undefined)DB.settings[k]=DEFSET[k]});
 saveDB();
}
if(DB.services)S=DB.services;
// миграция: если услуги всё ещё старые дефолтные — заменить на актуальные
(function(){
 const oldKeys=['Комплексная мойка','Химчистка салона','Полировка кузова','Керамика'];
 if(DB.services&&DB.services.length===4&&DB.services.every(s=>oldKeys.indexOf(s.n)>=0)
    &&SS.services&&Array.isArray(SS.services)&&SS.services.length){
  S=SS.services.map(x=>({...x}));DB.services=S;saveDB();
 }
})();
// синхронизация с общей базой сервера (Supabase / api/db.json)
function mergeRemote(x){
 if(!x||!x.settings||!x.settings.address)return false;
 const localBook=(DB.bookings||[]);
 const remBook=(x.bookings||[]);
 const ids=new Set(remBook.map(b=>b.id));
 const extra=localBook.filter(b=>!ids.has(b.id));
 x.bookings=remBook.concat(extra);
 DB=x;if(DB.services)S=DB.services;
 localStorage.setItem(DBKEY,JSON.stringify(DB));
 if(typeof applySettings==='function')applySettings();
 if(typeof renderSvc==='function')renderSvc();
 if(typeof renderMy==='function')renderMy();
 if(typeof syncBadge==='function')syncBadge();
 return true;
}
async function fetchRemote(){
 try{const x=await sbLoad();if(x)return x}catch(e){}
 try{const r=await fetch('api/db');if(r.ok){const x=await r.json();return x}}catch(e){}
 return null;
}
try{
 (async()=>{
  for(let i=0;i<12&&!SB;i++){await new Promise(r=>setTimeout(r,500));if(window.SUPABASE_URL&&typeof supabase!=='undefined'){try{SB=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY)}catch(e){}}}
  const x=await fetchRemote();
  if(x){mergeRemote(x)}else if(freshCreated){saveDB()}
 })();
}catch(e){}
setInterval(async()=>{try{const x=await fetchRemote();if(x)mergeRemote(x)}catch(e){}},25000);
// «Моя запись»: показываем реальную запись из базы (отменённые не показываем)
booking=(DB.bookings||[]).slice().reverse().find(x=>x.status!=='cancelled')||null;syncBadge();renderSlots();
let ADMIN=false;
let showLogin=false,ADMTAB='bookings',ADF='all';
function saveDB(){localStorage.setItem(DBKEY,JSON.stringify(DB));syncServer();if(typeof renderSlots==='function')renderSlots()}
