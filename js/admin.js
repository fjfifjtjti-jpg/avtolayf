/* ===== Кабинет владельца =====
   Макет: «Расписание» (дата, День/Неделя, метрики, сетка действий)
   + отдельные экраны редактирования. Внешний вид сайта для посетителей не меняется. */

// --- старт: применить настройки и подтянуть услуги из единого файла ---
if(SS.services&&Array.isArray(SS.services)&&(!DB.services||!DB.services.length)){
 S=SS.services;DB.services=S;if(!freshCreated)saveDB();renderSvc();
}
// дозаполнить телефоны в старых записях
(function(){
 const PH={'Иван':'+7 900 111-22-33','Анна':'+7 900 222-33-44','Дмитрий':'+7 900 333-44-55','Сергей':'+7 900 444-55-66','Олег':'+7 900 555-66-77'};
 let changed=false;
 (DB.bookings||[]).forEach(b=>{if(!b.phone){b.phone=PH[b.client]||'';changed=true}});
 if(changed)saveDB();
})();
applySettings();

function moneyText(v){return Number(v||0).toLocaleString('ru-RU')+' ₽'}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function fmtMoney(n){return Number(n||0).toLocaleString('ru-RU')+' ₽'}
function fmtD(iso){const[a,b,c]=iso.split('-');return +c+' '+MON[+b-1]}
function setText(sel,txt){const el=document.querySelector(sel);if(el)el.textContent=txt}
function setLastText(sel,txt){const el=document.querySelector(sel);if(el&&el.lastChild)el.lastChild.nodeValue=txt}

// --- применение всех настроек на страницы сайта ---
const LOGO_ORIG=(document.querySelector('header .logo')||{}).innerHTML||'';
function applySettings(){
 const s=DB.settings;
 if($('fAddr'))$('fAddr').textContent=s.address;
 if($('fPhone'))$('fPhone').textContent=s.phone;
 if($('fHours'))$('fHours').textContent='Ежедневно · '+s.open+'–'+s.close;
 if($('fRoute'))$('fRoute').setAttribute('href','https://yandex.ru/maps/?text='+encodeURIComponent(s.address));
 if($('fCopy'))$('fCopy').textContent=s.copy||('© '+new Date().getFullYear()+' '+(s.name||''));
 document.title=s.name||'SGX Detailing';
 setText('#s-home h1',s.name||'SGX Detailing');
 setText('#s-home .sub',s.tagline||'');
 const gh=document.querySelector('#galModal .galhead b');if(gh)gh.textContent=s.name||'SGX Detailing';
 const lg=document.querySelector('header .logo');
 if(lg){
  if(s.logo){lg.innerHTML='<img class="lgimg" alt="" src="'+s.logo+'"><span class="lg-name">'+esc(s.name||'SGX Detailing')+'</span>'}
  else{if(lg.querySelector('img'))lg.innerHTML=LOGO_ORIG;const txt=[...lg.childNodes].find(n=>n.nodeType===3);if(txt)txt.nodeValue=' '+(s.name||'SGX Detailing')}
 }
 const hero=document.querySelector('.hero .img');
 if(hero){hero.style.backgroundImage=s.hero?'url("'+s.hero+'")':''}
 const bef=document.querySelector('.bef');
 if(bef){bef.style.backgroundImage=s.afterImg?'url("'+s.afterImg+'")':''}
 const bfr=document.querySelector('.ba.before');
 if(bfr){bfr.style.backgroundImage=s.beforeImg?'url("'+s.beforeImg+'")':''}
 const stats=document.querySelectorAll('#s-home .stat');
 const svcN=S.length;
 const boxN=(s.boxes||[]).length;
 Array.prototype.forEach.call(stats,(el,i)=>{
  const b=el.querySelector('b'),sp=el.querySelector('span');
  const v=i===0?svcN:i===1?boxN:((s.stats||[])[i]||{}).v;
  const l=i===0?'услуг в прайсе':i===1?'бокса в работе':((s.stats||[])[i]||{}).l;
  if(b&&b.lastChild)b.lastChild.nodeValue=v;
  if(sp)sp.textContent=l;
 });
 const minV=Math.min.apply(null,S.map(x=>x.v||0))||0;
 const pr=document.querySelector('#s-home .price b');
 if(pr&&pr.lastChild)pr.lastChild.nodeValue='от '+moneyText(minV);
 const svcSub=document.querySelector('#s-svc .sub');
 if(svcSub)svcSub.textContent='Цены от '+moneyText(minV);
 const rv=document.querySelector('#s-home .revs');
 if(rv){const rs=s.reviews||[];rv.innerHTML=rs.map(r=>`<div class="rev"><div class="revtop"><span class="ava">${esc((r.name||'М')[0])}</span><div><b>${esc(r.name||'')}</b><small>${esc(r.car||'')}</small></div><span class="stars">★★★★★</span></div><p>${esc(r.text||'')}</p></div>`).join('')}
}

// --- навигация админки ---
let ADMVIEW='main',ADSEG='week',ADDATE=new Date(),ADOPEN=null;
const MONSH=['янв.','февр.','марта','апр.','мая','июня','июля','авг.','сент.','окт.','нояб.','дек.'];

// --- вход и общий рендер кабинета ---
function cabToggle(){
 if(ADMIN){ADMIN=false;sessionStorage.removeItem('sgx.admin');toast('Вы вышли из режима владельца');renderCab()}
}
function admLogin(){const p=$('admPass');if(!p)return;if(p.value===DB.settings.adminPass){ADMIN=true;sessionStorage.setItem('sgx.admin','1');toast('Вы вошли как владелец')}else{toast('Неверный пароль')}renderCab()}
function renderCab(){
 const body=$('cabBody');if(!body)return;
 try{
  body.innerHTML=ADMIN?cabAdminHTML():cabGuestHTML();
 }catch(e){/* оставляем текущее содержимое — пустым не останется */}
 const btn=$('cabBtn');if(btn)btn.classList.toggle('on',ADMIN);
 const h1=document.querySelector('#s-cab .cabhead h1');if(h1)h1.style.display=ADMIN?'none':'';
}

function cabGuestHTML(){
 return `<div class="card admin-login rv"><div class="al-hero"><div class="al-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.8"/></svg></div><b>Кабинет владельца</b><small>Доступ к расписанию, статистике и настройкам студии</small></div><input class="inp" type="password" id="admPass" placeholder="Пароль" onkeydown="if(event.key==='Enter')admLogin()"><button class="bbtn" onclick="admLogin()">Войти</button></div>`;
}
function admResetAll(){
 if(!confirm('Сбросить все данные студии к значениям по умолчанию?'))return;
 localStorage.removeItem(DBKEY);sessionStorage.clear();location.reload();
}
function admWipeBookings(){
 if(!confirm('Удалить ВСЕ записи? Это нельзя отменить.'))return;
 DB.bookings=[];DB.seq=0;booking=null;syncBadge();saveDB();renderCab();toast('Все записи удалены');
}
function admRestoreDefaults(){
 if(!confirm('Вернуть настройки студии к значениям по умолчанию? Записи сохранятся.'))return;
 const SS=window.STUDIO_SETTINGS||{};
 const s=DB.settings;
 s.name=SS.name||'SGX Detailing';
 s.tagline=SS.tagline||'Детейлинг, который возвращает кузову глубину, а салону — чистоту';
 s.address=SS.address||'Москва, Примерная улица, 12';
 s.phone=SS.phone||'+7 999 123-45-67';
 s.open=SS.open||'10:00';
 s.close=SS.close||'20:00';
 s.adminPass='admin';
 s.boxes=SS.boxes||['Бокс 1','Бокс 2','Бокс 3'];
 s.slots=SS.slots||['10:00','12:00','13:00','14:00','17:00','19:00'];
 s.closedDays=[];
 s.stats=SS.stats||[{v:'4',l:'услуг в прайсе'},{v:'3',l:'бокса в работе'}];
 s.price=SS.price||'от 3 500 ₽';
 delete s.hero; delete s.logo;
 s.gallery=JSON.parse(JSON.stringify(SS.gallery||[
  {ba:true,t:'До · После'},
  {c:'g4',t:'Кузов · Детейлинг',src:null},
  {c:'g5',t:'Наша работа',src:null},
  {c:'g1',t:'Керамика · BMW X5',src:null},
  {c:'g2',t:'Полировка · Mercedes E',src:null},
  {c:'g3',t:'Салон · Kia K5',src:null}
 ]));
 if(Array.isArray(SS.services)&&SS.services.length){S=JSON.parse(JSON.stringify(SS.services));DB.services=S}
 saveDB();applySettings();renderSvc();rebuildGal();renderCab();toast('Настройки возвращены');
}

// ================= ГЛАВНЫЙ ЭКРАН «РАСПИСАНИЕ» =================
function periodDays(){
 const d=new Date(ADDATE);
 if(ADSEG==='day')return [isoDay(d)];
 const wd=(d.getDay()+6)%7;d.setDate(d.getDate()-wd);
 const arr=[];
 for(let i=0;i<7;i++){const x=new Date(d);x.setDate(x.getDate()+i);arr.push(isoDay(x));}
 return arr;
}
function fmtDatePill(d){return d.getDate()+' '+MONSH[d.getMonth()]+' '+d.getFullYear()+'г.'}
function admShift(dir){const d=new Date(ADDATE);d.setDate(d.getDate()+dir);ADDATE=d;renderCab()}

function admMainHTML(){
 const pill=`<div class="adm-date"><span>Дата</span><div class="datepill"><button class="pk" onclick="admShift(-1)" aria-label="Предыдущий день"><svg viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 2L2 8l6 6"/></svg></button><b>${fmtDatePill(new Date(ADDATE))}</b><button class="pk" onclick="admShift(1)" aria-label="Следующий день"><svg viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 2l6 6-6 6"/></svg></button></div></div>`;
 const seg=`<div class="adm-seg"><button class="${ADSEG==='day'?'on':''}" onclick="ADSEG='day';renderCab()">День</button><button class="${ADSEG==='week'?'on':''}" onclick="ADSEG='week';renderCab()">Неделя</button></div>`;
 const st=admStatsPeriod();
 const acts=`<div class="adm-mainbtns"><button class="bbtn" onclick="openEditor('add')">+ Добавить запись</button><button class="bbtn ghost" onclick="openEditor('settings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"/></svg>Настройки</button></div>`;
 const rows=admRowsPeriod();
 return `<div class="adm-head"><div><h2>Расписание</h2><small>${esc(DB.settings.name||'')}</small></div><button class="adm-exit" onclick="cabToggle()" aria-label="Выйти"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l6 6-6 6"/><path d="M20 12H10"/><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5"/></svg></button></div>
 ${pill}${seg}<div class="adm-stat1">${st}</div>${acts}<div class="adm-sec">Записи</div>${rows}`;
}

function admStatsPeriod(){
 const days=periodDays();
 const list=DB.bookings.filter(b=>days.indexOf(b.date)>=0&&b.status!=='cancelled');
 const requests=list.filter(b=>b.status==='new').length;
 return `<div class="reqwrap"><div class="req-circle">${list.length}</div><span>записи</span><small>из них ${requests} новых</small></div>`;
}

function admRowsPeriod(){
 const days=periodDays();
 let list=DB.bookings.filter(b=>days.indexOf(b.date)>=0).sort((a,b)=>(a.status==='new'?0:1)-(b.status==='new'?0:1)||(a.date+a.time).localeCompare(b.date+b.time));
 const boxes=DB.settings.boxes||['Бокс 1','Бокс 2','Бокс 3'];
 const rows=list.map(b=>{
  const st=ST[b.status];const price=S[b.svc]?S[b.svc].v:0;const paid=b.paid>=price&&price;
  const nextT={new:'Принять',confirmed:'Готова',done:null}[b.status];
  const open=ADOPEN===b.id;
  const bx=boxes.map(x=>`<option ${x===b.box?'selected':''}>${esc(x)}</option>`).join('');
  const acts=[];
  if(nextT&&b.status!=='cancelled')acts.push(`<button class="act ok" onclick="admNext('${b.id}')">${nextT}</button>`);
  if(b.status!=='cancelled'){
   acts.push(`<button class="act" onclick="admMoveOpen('${b.id}')">Перенести</button>`);
   acts.push(`<button class="act bad" onclick="admCancel('${b.id}')">Отменить</button>`);
  }
  const move=ADF===b.id?`<div class="adm-move"><input class="inp" type="date" id="adMd" value="${b.date}"><input class="inp" type="time" id="adMt" value="${b.time}"><select class="inp" id="adMb">${bx}</select><div class="frow2"><button class="mini ok" onclick="admMoveSave('${b.id}')">Сохранить</button><button class="mini" onclick="admMoveClose()">Отмена</button></div></div>`:'';
  const detail=open?`<div class="adm-row-detail">
   <div class="fd"><span>Клиент</span><b>${esc(b.client)}</b></div>
   <div class="fd"><span>Телефон</span><b>${esc(b.phone||'—')}</b></div>
   <div class="fd"><span>Услуга</span><b>${esc(b.svcName)}</b></div>
   ${move}<div class="adm-row-acts">${acts.join('')}</div>
  </div>`:'';
  return `<div class="card adm-row"><button class="adm-row-head" onclick="admToggleOpen('${b.id}')"><span class="chevwrap"><svg class="chev ${open?'open':''}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3.5L8 6l-3.5 2.5"/></svg></span><div class="tm"><b>${b.time}</b><small>${fmtD(b.date)}</small></div><div class="l"><b>${esc(b.car)} · ${esc(b.svcName)}</b><small>${esc(b.client)} · ${esc(b.box)} · №${b.no}</small></div><span class="tag ${st.cls}">${st.t}</span></button>${detail}</div>`;
 }).join('');
 return `<div class="adm-list">${rows||'<div class="card adm-empty">На этот период записей нет</div>'}</div>`;
}
function admToggleOpen(id){ADOPEN=ADOPEN===id?null:id;ADF=null;renderCab()}

// --- экраны редактирования ---
let admBack='main';
function openEditor(v){admBack=(v==='add'||v==='settings')?'main':'settings';ADMVIEW=v;renderCab()}
function backFromEditor(){ADMVIEW=admBack;ADF=null;renderCab()}
function admWrap(title,inner){
 return `<button class="adm-back" onclick="backFromEditor()"><svg viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 2L2 8l6 6"/></svg><span>${title}</span></button><div class="adm-wrap">${inner}</div>`;
}
function admSettingsMenuHTML(){
 const items=[
  ['contacts','Контакты','Название, описание, адрес, телефон, пароль владельца'],
  ['hours','Часы работы','Время работы, выходные дни, слоты для записи'],
  ['services','Услуги и цены','Список услуг, цены, длительность, порядок'],
  ['cards','Карточки витрины','Цифры и карточка цены на главной'],
  ['photo','Главное фото','Фото вверху главной страницы'],
  ['logo','Логотип','Логотип в шапке сайта'],
  ['gallery','Работы','Галерея работ на главной'],
  ['reviews','Отзывы','Отзывы клиентов на главной странице']
 ];
 const rows=items.map(([v,t,d])=>`<button class="card adm-set" onclick="openEditor('${v}')"><div><b>${t}</b><small>${d}</small></div><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 9l6-6M4 3h5v5"/></svg></button>`).join('');
 return `<div class="adm-sec">Настройки студии</div><div class="adm-list">${rows}</div>
 <div class="adm-sec">Опасная зона</div>
 <div class="card adm-form"><button class="bbtn ghost" onclick="admWipeBookings()">Удалить все записи</button>
 <button class="bbtn ghost" onclick="admRestoreDefaults()">Вернуть настройки по умолчанию</button>
 <button class="bbtn ghost" onclick="admResetAll()">Полный сброс студии</button></div>`;
}
function cabAdminHTML(){
 if(ADMVIEW==='services')return admWrap('Услуги и цены',admServicesHTML());
 if(ADMVIEW==='contacts')return admWrap('Контакты',admContactsHTML());
 if(ADMVIEW==='hours')return admWrap('Часы работы',admHoursHTML());
 if(ADMVIEW==='cards')return admWrap('Карточки витрины',admCardsHTML());
 if(ADMVIEW==='photo')return admWrap('Главное фото',admPhotoHTML());
 if(ADMVIEW==='logo')return admWrap('Логотип',admLogoHTML());
 if(ADMVIEW==='gallery')return admWrap('Работы',admGalleryHTML());
 if(ADMVIEW==='reviews')return admWrap('Отзывы',admReviewsHTML());
 if(ADMVIEW==='add')return admWrap('Новая запись',admAddFormHTML());
 if(ADMVIEW==='settings')return admSettingsMenuHTML();
 return admMainHTML();
}

// ================= ЗАПИСИ (добавление, действия) =================
function admAddFormHTML(){
 const svcOpts=S.map((s,i)=>`<option value="${i}">${esc(s.n)} · ${s.p}</option>`).join('');
 const boxes=(DB.settings.boxes||['Бокс 1']).map(x=>`<option>${esc(x)}</option>`).join('');
 return `<div class="card adm-form" id="admAddForm"><div class="lab" style="margin-top:0">Новая запись</div>
 <select class="inp" id="adSv">${svcOpts}</select>
 <div class="frow"><input class="inp" type="date" id="adDate" value="${isoDay(ADDATE)}"><input class="inp" type="time" id="adTime" value="10:00"></div>
 <div class="frow"><input class="inp" id="adClient" placeholder="Имя"><input class="inp" id="adPhone" placeholder="Телефон"></div>
 <div class="frow"><input class="inp" id="adCar" placeholder="Автомобиль"><select class="inp" id="adBx">${boxes}</select></div>
 <button class="bbtn" onclick="admAdd()">Добавить запись</button></div>`;
}
function admAdd(){
 const i=+$('adSv').value,s=S[i];if(!s){toast('Выберите услугу');return}
 const date=$('adDate').value,time=$('adTime').value,client=$('adClient').value.trim(),phone=$('adPhone').value.trim(),car=$('adCar').value.trim();
 const bx=$('adBx')?$('adBx').value:(DB.settings.boxes||['Бокс 1'])[0];
 if(!date||!time){toast('Дата и время обязательны');return}
 if(date<isoDay(new Date())){toast('Нельзя выбрать прошедшую дату');return}
 DB.bookings.push({id:'b'+Date.now(),no:++DB.seq,svc:i,svcName:s.n,car:car||'—',client:client||'Клиент',phone:phone||'',time,box:bx,date,status:'new',paid:0});
 saveDB();ADF=null;ADMVIEW='main';renderCab();toast('Запись добавлена');
}
function admNext(id){const b=DB.bookings.find(x=>x.id===id);if(!b)return;const next={new:'confirmed',confirmed:'done'}[b.status];if(next){b.status=next;saveDB();renderCab()}}
function admPay(id){const b=DB.bookings.find(x=>x.id===id);if(!b)return;const price=S[b.svc]?S[b.svc].v:0;b.paid=b.paid>=price&&price?0:price;saveDB();renderCab()}
function admCancel(id){const b=DB.bookings.find(x=>x.id===id);if(!b)return;if(!confirm('Отменить запись?'))return;b.status='cancelled';saveDB();renderCab()}
function admMoveOpen(id){ADF=id;renderCab()}
function admMoveClose(){ADF=null;renderCab()}
function admMoveSave(id){const b=DB.bookings.find(x=>x.id===id);if(!b)return;const d=$('adMd'),t=$('adMt'),bx=$('adMb');if(!d||!t)return;b.date=d.value||b.date;b.time=t.value||b.time;if(bx)b.box=bx.value;saveDB();ADF=null;renderCab();toast('Запись перенесена')}

// ================= УСЛУГИ =================
function admServicesHTML(){
 const s=DB.settings;
 const grps=(s.groups&&s.groups.length)?s.groups:['Кузов','Салон','Защита'];
 const rows=S.map((x,i)=>`
 <div class="card svc-card">
  <div class="frow"><input class="inp" value="${esc(x.n)}" data-svc="${i}" data-f="n" placeholder="Название услуги"><select class="inp" data-svc="${i}" data-f="c">${grps.map(c=>`<option ${c===x.c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
  <div class="frow"><input class="inp" type="number" value="${x.v}" data-svc="${i}" data-f="v" placeholder="Цена, ₽"><div class="frow2"><button class="mini" title="Выше" onclick="admUpSvc(${i})">▲</button><button class="mini" title="Ниже" onclick="admDownSvc(${i})">▼</button><button class="mini bad" onclick="admDelSvc(${i})">Удалить</button></div></div>
  <textarea class="inp ta" data-svc="${i}" data-f="d" placeholder="Описание">${esc(x.d)}</textarea>
 </div>`).join('');
 return `<div class="adm-sec">Услуги и цены</div>${rows}
 <button class="bbtn ghost" onclick="admAddSvc()">+ Добавить услугу</button>
 <button class="bbtn" onclick="admSaveSvc()">Сохранить услуги</button>
 <div class="adm-sec">Группы услуг</div>
 <div class="card adm-form">
  ${grps.map((g,i)=>`<div class="frow"><input class="inp" value="${esc(g)}" onchange="admRenameGroup(${i},this.value)"><button class="mini bad" onclick="admDelGroup(${i})">Удалить</button></div>`).join('')}
  <div class="frow"><input class="inp" id="newGroupName" placeholder="Новая группа"><button class="bbtn ghost" onclick="admAddGroup()">+ Добавить группу</button></div>
 </div>`;
}
function admAddGroup(){const v=$('newGroupName').value.trim();if(!v)return;const s=DB.settings;s.groups=s.groups||['Кузов','Салон','Защита'];if(s.groups.indexOf(v)>=0){toast('Такая группа уже есть');return}s.groups.push(v);saveDB();renderCab()}
function admDelGroup(i){const s=DB.settings;const g=(s.groups||[])[i];if(!g)return;if(S.some(x=>x.c===g)){toast('Сначала перенесите услуги из этой группы');return}s.groups.splice(i,1);saveDB();renderCab()}
function admRenameGroup(i,v){const s=DB.settings;v=v.trim();if(!v)return;const old=(s.groups||[])[i];if(!old)return;s.groups[i]=v;S.forEach(x=>{if(x.c===old)x.c=v});saveDB();renderCab()}
function admAddSvc(){S.push({n:'Новая услуга',p:'1 000 ₽',v:1000,t:'2 ч',d:'Описание услуги',c:'Кузов',h:2});renderCab()}
function admDelSvc(i){S.splice(i,1);renderCab()}
function admUpSvc(i){if(i<=0)return;[S[i-1],S[i]]=[S[i],S[i-1]];renderCab()}
function admDownSvc(i){if(i>=S.length-1)return;[S[i+1],S[i]]=[S[i],S[i+1]];renderCab()}
function admSaveSvc(){DB.services=S.map(x=>({...x}));saveDB();renderSvc();applySettings();toast('Услуги сохранены')}
document.addEventListener('input',e=>{
 const el=e.target,si=el.dataset.svc,f=el.dataset.f;
 if(si==null||!f)return;const x=S[+si];if(!x)return;
 if(f==='v'){x.v=+el.value.replace(/\D/g,'')||0;x.p=moneyText(x.v)}
 else if(f==='h')x.h=+el.value||0;
 else if(f==='c')x.c=el.value;
 else if(f==='n')x.n=el.value;
 else if(f==='t')x.t=el.value;
 else x.d=el.value;
});

// ================= КОНТАКТЫ =================
function admContactsHTML(){
 const s=DB.settings;
 return `
 <div class="adm-sec">Студия</div>
 <div class="card adm-form">
  <div class="lab">Название студии</div><input class="inp" id="ctName" value="${esc(s.name||'')}" placeholder="SGX Detailing">
  <div class="lab">Короткое описание под названием</div><input class="inp" id="ctTag" value="${esc(s.tagline||'')}" placeholder="Описание">
  <div class="lab">Адрес</div><input class="inp" id="adAddr" value="${esc(s.address)}" placeholder="Адрес">
  <div class="lab">Телефон</div><input class="inp" id="adPhone" value="${esc(s.phone)}" placeholder="Телефон">
  <div class="lab">Пароль владельца</div><input class="inp" id="adPass" value="${esc(s.adminPass)}" placeholder="Пароль">
  <div class="lab">Текст внизу страницы</div><input class="inp" id="ctCopy" value="${esc(s.copy||'')}" placeholder="Например: © 2026 2DRA Studio">
  <button class="bbtn" onclick="admSaveContacts()">Сохранить контакты</button>
 </div>`;
}
function admSaveContacts(){
 const s=DB.settings;
 s.name=$('ctName').value.trim()||s.name;
 s.tagline=$('ctTag').value.trim()||s.tagline;
 s.address=$('adAddr').value.trim()||s.address;
 s.phone=$('adPhone').value.trim()||s.phone;
 s.adminPass=$('adPass').value.trim()||s.adminPass;
 s.copy=$('ctCopy').value.trim()||s.copy;
 saveDB();applySettings();toast('Контакты сохранены');
}

// ================= ЧАСЫ РАБОТЫ =================
function admHoursHTML(){
 const s=DB.settings;
 const WDn=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
 const closed=(s.closedDays||[]);
 const wdChips=WDn.map((w,i)=>`<button class="chip ${closed.indexOf(i)>=0?'on':''}" onclick="admToggleDay(${i},this)">${w}</button>`).join('');
 return `
 <div class="card adm-form">
  <div class="lab">Часы работы</div>
  <div class="frow"><input class="inp" type="time" id="adOpen" value="${s.open}"><input class="inp" type="time" id="adClose" value="${s.close}"></div>
  <div class="lab">Выходные дни</div><div class="adm-days">${wdChips}</div>
  <div class="lab">Слоты времени для записи (через запятую)</div><input class="inp" id="adSlots" value="${esc((s.slots||[]).join(', '))}" placeholder="10:00, 12:00, 14:00">
  <button class="bbtn" onclick="admSaveHours()">Сохранить часы</button>
 </div>`;
}
function admToggleDay(i,btn){const s=DB.settings;const c=s.closedDays||[];const j=c.indexOf(i);const on=j<0;if(on)c.push(i);else c.splice(j,1);s.closedDays=c;if(btn)btn.classList.toggle('on',on)}
function admSaveHours(){
 const s=DB.settings;
 s.open=$('adOpen').value||s.open;
 s.close=$('adClose').value||s.close;
 s.slots=$('adSlots').value.split(',').map(x=>x.trim()).filter(Boolean);
 saveDB();applySettings();toast('Часы сохранены');
}

// ================= КАРТОЧКИ ВИТРИНЫ =================
function admCardsHTML(){
 const s=DB.settings;
 const st=(s.stats||[{v:'4',l:'услуг в прайсе'},{v:'3',l:'бокса в работе'}]);
 return `
 <div class="card adm-form">
  <div class="lab">Карточка 1</div>
  <div class="frow"><input class="inp" id="st1v" value="${esc(st[0].v)}" placeholder="Значение"><input class="inp" id="st1l" value="${esc(st[0].l)}" placeholder="Подпись"></div>
  <div class="lab">Карточка 2</div>
  <div class="frow"><input class="inp" id="st2v" value="${esc(st[1].v)}" placeholder="Значение"><input class="inp" id="st2l" value="${esc(st[1].l)}" placeholder="Подпись"></div>
  <div class="lab">Карточка цены</div><input class="inp" id="adPrice" value="${esc(s.price||'')}" placeholder="от 3 500 ₽">
  <div class="lab">Боксы в работе (через запятую)</div><input class="inp" id="adBoxes" value="${esc((s.boxes||[]).join(', '))}" placeholder="Бокс 1, Бокс 2, Бокс 3">
  <button class="bbtn" onclick="admSaveHome()">Сохранить карточки</button>
 </div>`;
}
function admSaveHome(){
 const s=DB.settings;
 s.stats=[{v:$('st1v').value.trim()||'4',l:$('st1l').value.trim()||'услуг в прайсе'},{v:$('st2v').value.trim()||'3',l:$('st2l').value.trim()||'бокса в работе'}];
 s.price=$('adPrice').value.trim()||s.price;
 const bx=$('adBoxes');if(bx){const list=bx.value.split(',').map(x=>x.trim()).filter(Boolean);if(list.length)s.boxes=list}
 saveDB();applySettings();toast('Карточки сохранены');
}

// ================= ФОТО И ЛОГОТИП =================
function admPhotoHTML(){
 const s=DB.settings;
 const heroStyle=s.hero?'style="background-image:url(\''+s.hero+'\')"':'';
 const befStyle=s.beforeImg?'style="background-image:url(\''+s.beforeImg+'\')"':'';
 const aftStyle=s.afterImg?'style="background-image:url(\''+s.afterImg+'\')"':'';
 return `
 <div class="card adm-form">
  <div class="lab">Главное фото (вверху страницы)</div>
  <div class="adm-photo"><div class="ph" ${heroStyle}></div><div class="frow2"><label class="mini">Заменить фото<input type="file" accept="image/*" hidden onchange="admUpload(this,'hero')"></label>${s.hero?'<button class="mini bad" onclick="admRmHero()">Убрать</button>':''}</div></div>
  <div class="lab">До · После — фото "ДО"</div>
  <div class="adm-photo"><div class="ph" ${befStyle}></div><div class="frow2"><label class="mini">Загрузить фото<input type="file" accept="image/*" hidden onchange="admUpload(this,'before')"></label>${s.beforeImg?'<button class="mini bad" onclick="admRmBefore()">Убрать</button>':''}</div></div>
  <div class="lab">До · После — фото "ПОСЛЕ"</div>
  <div class="adm-photo"><div class="ph" ${aftStyle}></div><div class="frow2"><label class="mini">Загрузить фото<input type="file" accept="image/*" hidden onchange="admUpload(this,'after')"></label>${s.afterImg?'<button class="mini bad" onclick="admRmAfter()">Убрать</button>':''}</div></div>
 </div>`;
}
function admLogoHTML(){
 const s=DB.settings;
 const logoStyle=s.logo?'style="background-image:url(\''+s.logo+'\')"':'';
 return `
 <div class="card adm-form">
  <div class="lab">Логотип (шапка сайта)</div>
  <div class="adm-photo"><div class="ph lg" ${logoStyle}></div><div class="frow2"><label class="mini">Заменить логотип<input type="file" accept="image/*" hidden onchange="admUpload(this,'logo')"></label>${s.logo?'<button class="mini bad" onclick="admRmLogo()">Убрать</button>':''}</div></div>
  <div class="lab">Или текст логотипа (название)</div><input class="inp" id="lgName" value="${esc(s.name||'')}" placeholder="SGX Detailing">
  <button class="bbtn" onclick="admSaveLogo()">Сохранить логотип</button>
 </div>`;
}
function admSaveLogo(){
 const s=DB.settings;
 const n=$('lgName').value.trim();if(n)s.name=n;
 saveDB();applySettings();toast('Логотип сохранён');
}
function admRmLogo(){delete DB.settings.logo;saveDB();applySettings();renderCab()}
function admRmHero(){delete DB.settings.hero;saveDB();applySettings();renderCab()}
function admRmBefore(){delete DB.settings.beforeImg;saveDB();applySettings();renderCab()}
function admRmAfter(){delete DB.settings.afterImg;saveDB();applySettings();renderCab()}
function admUpload(input,kind,idx){
 const f=input.files&&input.files[0];if(!f)return;
 if(f.size>8*1024*1024){toast('Фото слишком большое (до 8 МБ)');return}
 const rd=new FileReader();
 rd.onload=()=>{
  const img=new Image();
  img.onload=()=>{
   const max=kind==='logo'?400:1000;let w=img.width,h=img.height;
   if(w>max){h=Math.round(h*max/w);w=max}
   const cv=document.createElement('canvas');cv.width=w;cv.height=h;
   cv.getContext('2d').drawImage(img,0,0,w,h);
   const data=cv.toDataURL('image/jpeg',0.82);
   if(kind==='hero'){DB.settings.hero=data;saveDB();applySettings();renderCab();toast('Главное фото обновлено')}
   else if(kind==='logo'){DB.settings.logo=data;saveDB();applySettings();renderCab();toast('Логотип обновлён')}
   else if(kind==='before'){DB.settings.beforeImg=data;saveDB();applySettings();renderCab();toast('Фото "ДО" обновлено')}
   else if(kind==='after'){DB.settings.afterImg=data;saveDB();applySettings();renderCab();toast('Фото "ПОСЛЕ" обновлено')}
   else{const g=DB.settings.gallery[idx];if(g){g.src=data;g.ba=false;}saveDB();rebuildGal();renderCab();toast('Фото обновлено')}
  };
  img.src=rd.result;
 };
 rd.readAsDataURL(f);
}

// ================= ГАЛЕРЕЯ РАБОТ =================
function admGalleryHTML(){
 const s=DB.settings;
 const gal=(s.gallery||[]).map((g,i)=>{
  const thumb=g.src?'style="background-image:url(\''+g.src+'\')"':(g.ba?'class="th ba"':(g.c?`class="th ${g.c}"`:'class="th"'));
  const del=g.ba?'':'<button class="mini bad" onclick="admDelGal('+i+')">Удалить</button>';
  return `<div class="adm-gal"><div class="th" ${thumb}></div><div class="gal-in"><input class="inp" value="${esc(g.t)}" oninput="admGalCap(${i},this.value)"><div class="frow2"><label class="mini">Фото<input type="file" accept="image/*" hidden onchange="admUpload(this,'gal',${i})"></label>${del}</div></div></div>`;
 }).join('');
 return gal+`<button class="bbtn ghost" onclick="admAddGal()">+ Добавить работу</button>
 <button class="bbtn" onclick="admSaveGal()">Сохранить галерею</button>`;
}
function admGalCap(i,v){const g=DB.settings.gallery[i];if(g){g.t=v;saveDB()}}
function admAddGal(){DB.settings.gallery.push({t:'Новая работа',c:'g4',src:null});saveDB();renderCab()}
function admDelGal(i){if(DB.settings.gallery[i]&&DB.settings.gallery[i].ba)return;DB.settings.gallery.splice(i,1);saveDB();renderCab()}
function admSaveGal(){rebuildGal();renderCab();toast('Галерея сохранена')}

// ================= ОТЗЫВЫ =================
function admReviewsHTML(){
 const rs=DB.settings.reviews||[];
 const rows=rs.map((r,i)=>`
 <div class="card adm-form" style="margin-bottom:10px">
  <div class="frow"><input class="inp" value="${esc(r.name)}" data-rv="${i}" data-f="name" placeholder="Имя"><input class="inp" value="${esc(r.car)}" data-rv="${i}" data-f="car" placeholder="Машина · услуга"></div>
  <textarea class="inp ta" data-rv="${i}" data-f="text" placeholder="Текст отзыва">${esc(r.text)}</textarea>
  <div class="frow2"><button class="mini bad" onclick="admDelRev(${i})">Удалить</button></div>
 </div>`).join('');
 return rows+'<button class="bbtn ghost" onclick="admAddRev()">+ Добавить отзыв</button><button class="bbtn" onclick="admSaveReviews()">Сохранить отзывы</button>';
}
document.addEventListener('input',e=>{
 const el=e.target,ri=el.dataset.rv,f=el.dataset.f;
 if(ri==null||!f)return;
 const rs=DB.settings.reviews;if(!rs||!rs[+ri])return;
 if(f==='name')rs[+ri].name=el.value;
 else if(f==='car')rs[+ri].car=el.value;
 else rs[+ri].text=el.value;
});
function admAddRev(){if(!DB.settings.reviews)DB.settings.reviews=[];DB.settings.reviews.push({name:'Имя',car:'Машина · услуга',text:'Текст отзыва'});renderCab()}
function admDelRev(i){DB.settings.reviews.splice(i,1);renderCab()}
function admSaveReviews(){saveDB();applySettings();toast('Отзывы сохранены')}

// --- пересобрать ленту работ на главной из настроек ---
function rebuildGal(){
 const g=DB.settings.gallery||[];
 const wrap=$('galWrap');
 if(wrap){
  wrap.innerHTML=g.map(it=>it.ba?
   `<div class="gslide on" id="baSlide"><div class="bef gbef" id="baBox"><div class="ba before"></div><span class="bab">${esc(it.t)}</span><input type="range" min="0" max="100" value="25" aria-label="Сравнение до и после" oninput="baMove(this)"></div></div>`
   :`<div class="gslide ${it.c||''}" ${it.src?'style="background-image:url(\''+it.src+'\')"':''}><span>${esc(it.t)}</span></div>`).join('');
  wrap.style.transform='';
 }
 GAL.length=0;Array.prototype.push.apply(GAL,wrap?[...wrap.children]:[]);
 GALMETA.length=0;
 g.forEach(it=>{if(!it.ba)GALMETA.push({c:it.c||'',t:it.t||'Новая работа'})});
 gi=0;
 const dots=$('galDots');if(dots)dots.innerHTML=GAL.map((_,i)=>`<span class="dot ${i?'':'on'}"></span>`).join('');
 const grid=$('galGrid');if(grid&&grid.classList.contains('on'))galOpen();
}
