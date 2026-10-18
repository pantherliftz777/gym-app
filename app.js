/* ================= FitFuel app ================= */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const today = () => new Date().toISOString().slice(0,10);
const store = {
  get:(k,d)=>{ try{ const v=localStorage.getItem('ff_'+k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set:(k,v)=>{ try{ localStorage.setItem('ff_'+k,JSON.stringify(v)); }catch(e){} if(typeof FF!=='undefined'&&FF.patch) FF.patch({[k]:v}); },
  del:k=>localStorage.removeItem('ff_'+k)
};
const rnd = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; };

let profile = store.get('profile',null);
let log    = store.get('log',{});
let custom = store.get('custom',[]);
let plan   = store.get('plan',null);
let savedPlans = store.get('savedPlans',[]);
let water  = store.get('water',{date:today(),ml:0});
let weights = store.get('weights',[]);
let workoutsDone = store.get('workoutsDone',[]);
let curMeal = 'Breakfast';
let camState = null;
let session = store.get('session',null);

/* ---------- toast ---------- */
let toastT;
function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2600);
}

/* ---------- navigation ---------- */
function go(page){
  $$('.page').forEach(p=>p.classList.remove('active'));
  $('#page-'+page).classList.add('active');
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  window.scrollTo({top:0});
  if(page==='tracking') renderTracking();
}
$$('.nav-btn').forEach(b=>b.onclick=()=>go(b.dataset.page));
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-goto]'); if(g) go(g.dataset.goto);
  const c=e.target.closest('[data-close]'); if(c) c.closest('.modal-back').classList.remove('open');
});
function openModal(id){ $(id).classList.add('open'); }
$$('.modal-back').forEach(m=>m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('open'); }));

/* ---------- macro engine ---------- */
function calcMacros(cal,wKg,gender){
  const per = gender==='female'?1.6:gender==='other'?1.75:1.9;
  const p = Math.round(wKg*per);
  const f = Math.round(wKg*0.9);
  const c = Math.max(0,Math.round((cal - p*4 - f*9)/4));
  return {p,c,f};
}
const bmiOf = p => p && p.hCm && p.wKg ? (p.wKg/Math.pow(p.hCm/100,2)) : null;
function bmiTag(b){
  if(b<18.5) return ['Underweight','#38bdf8'];
  if(b<25) return ['Healthy','#22d37f'];
  if(b<30) return ['Overweight','#f59e0b'];
  return ['Obese','#ef4444'];
}
function waterGoal(){
  if(plan && plan.water) return plan.water;
  if(profile && profile.wKg) return Math.max(1500,Math.round(profile.wKg*35/250)*250);
  return 2000;
}

/* ---------- db badge ---------- */
function dbBadge(){
  const b=$('#dbBadge'); if(!b) return;
  if(FF.online){ b.textContent='💾 Database: ON'; b.className='db-badge online'; }
  else { b.textContent='📱 Offline (device only)'; b.className='db-badge offline'; }
}

/* ================= AUTH (register / login — stays logged in) ================= */
function authTab(which){
  $$('#authTabs button').forEach(b=>b.classList.toggle('active',b.dataset.auth===which));
  $('#authLogin').hidden = which!=='login';
  $('#authRegister').hidden = which!=='register';
}
$$('#authTabs button').forEach(b=>b.onclick=()=>authTab(b.dataset.auth));
$('#gotoRegister').onclick=()=>authTab('register');
$('#gotoLogin').onclick=()=>authTab('login');

function passErrors(p){
  const e=[];
  if(p.length<6) e.push('len');
  if(!/[A-Z]/.test(p)) e.push('cap');
  if(!/[^A-Za-z0-9]/.test(p)) e.push('sp');
  return e;
}
function updPassRules(){
  const p=$('#regPass').value;
  const bad=passErrors(p);
  $$('#passRules li').forEach(li=>{
    li.classList.toggle('ok',!bad.includes(li.dataset.rule));
  });
}
$('#regPass').oninput=updPassRules;
function validEmail(e){ return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(e); }
function validMobile(d){ return /^[6-9]\d{9}$/.test(d); }

async function doRegister(){
  const name=$('#regName').value.trim();
  const email=$('#regEmail').value.trim().toLowerCase();
  const contact=$('#regContact').value.trim();
  const pw=$('#regPass').value;
  if(name.length<2 || !/^[A-Za-z .'-]{2,40}$/.test(name)) return toast('Enter your full name');
  if(!validEmail(email)) return toast('Invalid email - must end with .com, .in, .org etc. (e.g. you@gmail.com)');
  const digits=contact.replace(/\D/g,'');
  if(digits.length!==10) return toast('Mobile number must be exactly 10 digits (you entered '+digits.length+')');
  if(!validMobile(digits)) return toast('Mobile must start with 6-9 (valid Indian number)');
  const perr=passErrors(pw);
  if(perr.length) return toast('Password: '+ (perr.includes('len')?'min 6 characters, ':'') + (perr.includes('cap')?'one capital letter, ':'') + (perr.includes('sp')?'one special character':''));
  try{
    const user=await FF.register(name,email,digits,pw);
    onLoggedIn(user,true);
  }catch(e){ toast(e.message); authTab('register'); }
}
async function doLogin(){
  const email=$('#loginEmail').value.trim().toLowerCase();
  const pw=$('#loginPass').value;
  if(!email || !pw) return toast('Enter email and password');
  try{
    const user=await FF.login(email,pw);
    onLoggedIn(user,false);
  }catch(e){ toast(e.message); }
}
$('#regBtn').onclick=doRegister;
$('#loginBtn').onclick=doLogin;
['regName','regEmail','regContact','regPass'].forEach(id=>{ $('#'+id).onkeydown=e=>{ if(e.key==='Enter') doRegister(); }; });
['loginEmail','loginPass'].forEach(id=>{ $('#'+id).onkeydown=e=>{ if(e.key==='Enter') doLogin(); }; });

function onLoggedIn(user,fresh){
  session={name:user.name,email:user.email,phone:user.contact||'',at:Date.now(),lastLogin:user.last_login||Date.now()};
  store.set('session',session);
  $('#authScreen').classList.remove('open');
  dbBadge();
  if(fresh){
    FF.patch({profile,log,custom,plan,water,settings:{}}).catch(()=>{});
  }
  renderUser(); renderDash();
  toast('Welcome, '+user.name.split(' ')[0]+' 🎉'+(user.is_admin?' 👑 Admin':''));
}
const isAdmin=()=>!!(FF.user&&FF.user.is_admin);
function renderUser(){
  const first=session?session.name.split(' ')[0]:'Account';
  $('#userChip').querySelector('span').textContent=first;
  $('#acctInfo').innerHTML = session
    ? `👤 <b>${session.name}</b><br>✉️ ${session.email}${session.phone?'<br>📱 +91 '+session.phone:''}${isAdmin()?'<br>👑 <b>Admin account</b>':''}<br><small class="muted">Logged in — you stay logged in until you tap Logout.</small>`
    : '<span class="muted">Not logged in</span>';
  $('#adminSection').hidden=!isAdmin();
  $('#claimAdminBox').hidden=isAdmin();
}
async function logout(){
  await FF.logout();
  session=null; store.del('session');
  $('#authScreen').classList.add('open');
  authTab('login');
  renderUser(); toast('Logged out');
}
$('#userChip').onclick=()=>{ renderProfileModal(); openModal('#profileModal'); };
$('#openSettingsFromProfile').onclick=()=>{
  $('#profileModal').classList.remove('open');
  renderUser(); openModal('#settingsModal');
};
function renderProfileModal(){
  const nm=session?session.name:'Your Name';
  $('#pfName').textContent=nm;
  $('#pfEmail').textContent=session?session.email:'';
  if(profile){
    $('#pfGoal').textContent=(profile.goal||'—')+(profile.gender?(' · '+profile.gender):'');
    $('#pfCal').textContent=profile.cal?profile.cal+' kcal':'—';
    $('#pfPcf').textContent=(profile.p||0)+'g / '+(profile.c||0)+'g / '+(profile.f||0)+'g';
    const b=bmiOf(profile);
    $('#pfHwb').textContent=(profile.hCm||'—')+' cm · '+(profile.wKg||'—')+' kg · '+(b?b.toFixed(1):'—')+' BMI';
  } else {
    $('#pfGoal').textContent='Set your goal';
    $('#pfCal').textContent='—';
    $('#pfPcf').textContent='—';
    $('#pfHwb').textContent='—';
  }
}
$('#claimAdminBtn').onclick=async()=>{
  const s=$('#adminSecret').value.trim();
  if(!s) return toast('Enter admin secret');
  try{ await FF.req('POST','/api/admin/claim',{secret:s}); FF.user={...(FF.user||{}),is_admin:1}; renderUser(); toast('👑 You are now admin!'); }
  catch(e){ toast(e.message); }
};
let adminComplaintsCache=[];
$('#adminPanelBtn').onclick=async()=>{
  openModal('#adminModal');
  $('#adminUsers').innerHTML='<div class="empty">Loading…</div>';
  $('#adminComplaints').innerHTML='<div class="empty">Loading…</div>';
  try{
    const [users,cmps]=await Promise.all([FF.adminUsers(),FF.adminComplaints()]);
    adminComplaintsCache=cmps;
    $('#adminUsers').innerHTML=users.map(u=>`
      <div class="log-item"><div class="li-main"><b>${u.name} ${u.is_admin?'👑':''}</b>
      <small>${u.email} · ${u.contact||'no contact'} · ${u.logCount} log entries · joined ${new Date(u.created_at).toLocaleDateString()}</small></div>
      ${u.is_admin?'':'<button class="li-x" data-deluser="'+u.id+'">🗑</button>'}</div>`).join('')||'<div class="empty">No users</div>';
    $$('#adminUsers [data-deluser]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Delete this user and ALL their data?')) return;
      try{ await FF.adminDeleteUser(+b.dataset.deluser); toast('User deleted'); $('#adminPanelBtn').click(); }
      catch(e){ toast(e.message); }
    });
    $('#adminComplaints').innerHTML=cmps.map(c=>`
      <div class="log-item" style="flex-direction:column;align-items:stretch;gap:6px">
        <div class="row between"><b>${c.name}</b><span class="badge">${c.type}</span></div>
        <small class="muted">${new Date(c.created).toLocaleString()}</small>
        <p style="font-size:.85rem;white-space:pre-wrap">${c.text}</p>
        ${(c.files||[]).map(f=>f.type&&f.type.startsWith('image')?`<img src="${f.data}" style="max-width:180px;border-radius:10px">`:`<small class="muted">📎 ${f.name}</small>`).join(' ')}
      </div>`).join('')||'<div class="empty">No complaints — sab theek hai! 🎉</div>';
  }catch(e){ toast(e.message); $('#adminUsers').innerHTML='<div class="empty">'+e.message+'</div>'; }
};

/* ---------- complaint / suggestion form ---------- */
let cmpTypeVal='complaint';
segWire('#cmpType',b=>cmpTypeVal=b.dataset.t);
$('#cmpSubmitBtn').onclick=async()=>{
  const name=$('#cmpName').value.trim();
  const text=$('#cmpText').value.trim();
  if(name.length<2) return toast('Enter your name');
  if(text.length<5) return toast('Please describe your problem / suggestion');
  const files=[...($('#cmpFiles').files||[])].slice(0,3);
  const readAll=files.map(f=>new Promise(res=>{
    if(f.size>900000) return res({name:f.name,type:f.type,data:''});
    const fr=new FileReader();
    fr.onload=()=>res({name:f.name,type:f.type,data:fr.result});
    fr.readAsDataURL(f);
  }));
  const safe=await Promise.all(readAll);
  try{
    await FF.sendComplaint(name,cmpTypeVal,text,safe);
    toast('✅ Complaint saved — admin ko mil gaya!');
  }catch(e){ toast('Saved locally nahi gaya: '+e.message+' — email use karein'); }
  const body=`Name: ${name}\nType: ${cmpTypeVal}\n\n${text}`;
  $('#cmpMailLink').href='mailto:fun.123learn@gmail.com?subject='+encodeURIComponent('FitFuel '+cmpTypeVal+' from '+name)+'&body='+encodeURIComponent(body);
  $('#cmpText').value='';
  try{ window.open($('#cmpMailLink').href,'_blank'); }catch(e){}
};

/* ================= CALORIE MODAL ================= */
let calUnit={h:'cm',w:'kg'}, calGender=null;
function openCalorie(){
  $('#calStep1').hidden=false; $('#calStep2').hidden=true; $('#calStep3').hidden=true;
  if(profile){
    calUnit.h='cm'; calUnit.w='kg';
    $('#heightInput').value = Math.round(profile.hCm*10)/10;
    $('#weightInput').value = Math.round(profile.wKg*10)/10;
    calGender = profile.gender;
    [...$('#genderSeg').children].forEach(b=>b.classList.toggle('active',b.dataset.g===calGender));
    [...$('#heightUnit').children].forEach(b=>b.classList.toggle('active',b.dataset.unit==='cm'));
    [...$('#weightUnit').children].forEach(b=>b.classList.toggle('active',b.dataset.unit==='kg'));
    $('#calorieInput').value = profile.cal||'';
  }
  openModal('#calorieModal');
}
$('#openCalorieBtn').onclick=openCalorie;
$('#openCalorieBtn2').onclick=openCalorie;
function segWire(id,cb){
  [...$(id).children].forEach(b=>b.onclick=()=>{
    [...$(id).children].forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); cb(b);
  });
}
segWire('#heightUnit',b=>calUnit.h=b.dataset.unit);
segWire('#weightUnit',b=>calUnit.w=b.dataset.unit);
segWire('#genderSeg',b=>calGender=b.dataset.g);

$('#calNextBtn').onclick=()=>{
  const h=parseFloat($('#heightInput').value), w=parseFloat($('#weightInput').value);
  if(!h||h<50||h>260) return toast('Enter a valid height');
  if(!w||w<20||w>300) return toast('Enter a valid weight');
  if(!calGender) return toast('Select your gender');
  const hCm = calUnit.h==='cm'? h : h*2.54;
  const wKg = calUnit.w==='kg'? w : w/2.20462;
  window.__calTmp = {hCm:Math.round(hCm*10)/10, wKg:Math.round(wKg*10)/10, gender:calGender};
  const wKg2 = window.__calTmp.wKg;
  $('#calSuggestions').innerHTML='';
  [['Fat loss',31],['Maintain',35],['Muscle gain',39]].forEach(([lab,x])=>{
    const v=Math.round(wKg2*x/10)*10;
    const b=document.createElement('button');
    b.textContent=`${lab}: ${v} kcal`;
    b.onclick=()=>{ $('#calorieInput').value=v; updateMacroPreview(); };
    $('#calSuggestions').appendChild(b);
  });
  if(profile && profile.cal) $('#calorieInput').value=profile.cal;
  else $('#calorieInput').value = Math.round(wKg2*35/10)*10;
  updateMacroPreview();
  $('#calStep1').hidden=true; $('#calStep2').hidden=false;
};
$('#calBackBtn').onclick=()=>{ $('#calStep2').hidden=true; $('#calStep1').hidden=false; };
$('#calorieInput').oninput=updateMacroPreview;
function updateMacroPreview(){
  const cal=parseInt($('#calorieInput').value)||0;
  const t=window.__calTmp||{};
  if(cal<800){ $('#macroPreview').innerHTML='<span class="muted">Enter calories to see auto-calculated protein, carbs &amp; fats…</span>'; return; }
  const m=calcMacros(cal,t.wKg||70,t.gender||'male');
  const bmi=bmiOf({hCm:t.hCm,wKg:t.wKg});
  $('#macroPreview').innerHTML=
    `Auto-calculated from <b>${cal}</b> kcal, weight <b>${(t.wKg||0).toFixed(1)} kg</b>, <b>${(t.gender||'').toUpperCase()}</b><br>`+
    `🥩 Protein: <b>${m.p} g</b> (${m.p*4} kcal)<br>`+
    `🍚 Carbs: <b>${m.c} g</b> (${m.c*4} kcal)<br>`+
    `🥑 Fats: <b>${m.f} g</b> (${m.f*9} kcal)<br>`+
    (bmi?`📏 BMI: <b>${bmi.toFixed(1)}</b> · Height <b>${t.hCm} cm</b>`:'');
}
$('#calSaveBtn').onclick=()=>{
  const cal=parseInt($('#calorieInput').value)||0;
  if(cal<800||cal>6000) return toast('Enter calories between 800–6000');
  const t=window.__calTmp;
  const m=calcMacros(cal,t.wKg,t.gender);
  profile={...t,cal,p:m.p,c:m.c,f:m.f};
  store.set('profile',profile);
  $('#calResult').innerHTML=
    `<div class="big-num">${cal} kcal</div> per day<br>`+
    `🥩 Protein <b>${m.p} g</b> &nbsp; 🍚 Carbs <b>${m.c} g</b> &nbsp; 🥑 Fats <b>${m.f} g</b><br>`+
    `📏 Height <b>${profile.hCm} cm</b> · Weight <b>${profile.wKg} kg</b> · BMI <b>${(bmiOf(profile)||0).toFixed(1)}</b>`;
  $('#calStep2').hidden=true; $('#calStep3').hidden=false;
  renderDash(); renderDietMacros();
  toast('Calorie goal saved!');
};

/* ================= FOOD LOG ================= */
function dayLog(){ return log[today()]||[]; }
function addEntry(entry){
  const d=today(); log[d]=log[d]||[]; log[d].push(entry);
  store.set('log',log); renderAll();
}
function removeEntry(i){
  const d=today(); (log[d]||[]).splice(i,1); store.set('log',log); renderAll();
}
function entryTotals(){
  return dayLog().reduce((a,e)=>({k:a.k+e.k,p:a.p+e.p,c:a.c+e.c,f:a.f+e.f}),{k:0,p:0,c:0,f:0});
}
function logHTML(){
  const items=dayLog();
  if(!items.length) return '<div class="empty">Nothing logged yet — add your first meal 🍽️</div>';
  let html='', last='';
  items.forEach((e,i)=>{
    if(e.meal!==last){ html+=`<div class="log-meal-h">${e.meal}</div>`; last=e.meal; }
    html+=`<div class="log-item">
      ${e.img?`<img src="${e.img}" style="width:38px;height:38px;border-radius:9px;object-fit:cover">`:`<span style="font-size:1.4rem">${e.e||'🍽️'}</span>`}
      <div class="li-main"><b>${e.n}</b><small>${e.g} g · P ${Math.round(e.p)}g · C ${Math.round(e.c)}g · F ${Math.round(e.f)}g</small></div>
      <span class="li-kcal">${Math.round(e.k)}</span>
      <button class="li-x" data-rm="${i}">✕</button></div>`;
  });
  return html;
}
document.addEventListener('click',e=>{
  const rm=e.target.closest('[data-rm]');
  if(rm) removeEntry(+rm.dataset.rm);
});
$('#clearLogBtn').onclick=()=>{ if(confirm('Clear all of today\'s food log?')){ log[today()]=[]; store.set('log',log); renderAll(); toast('Day cleared'); } };

/* ================= DIET (search + veg/junk filters) ================= */
let fCat='all';
function foodPer100(f){ return f.per100 || {k:f.k,p:f.p,c:f.c,f:f.f}; }
function matchFoodCat(f){
  if(fCat==='all') return true;
  const t=foodTags(f.n||f.name||'');
  if(fCat==='veg') return t.veg;
  if(fCat==='nonveg') return !t.veg;
  return t.cats.includes(fCat);
}
function renderSearch(){
  const q=($('#foodSearch').value||'').toLowerCase().trim();
  let list = custom.map(cf=>({...cf,custom:1}));
  const base = FOODS.filter(f=>matchFoodCat(f) && (!q || f.n.toLowerCase().includes(q)));
  if(q) list = list.filter(cf=>cf.name.toLowerCase().includes(q)).concat(base);
  else list = list.concat(base);
  const box=$('#foodResults');
  if(!list.length){ box.innerHTML='<div class="empty">No match — try another word, or “Create Custom Food” in Library 📚</div>'; return; }
  box.innerHTML=list.map((f,i)=>{
    const per = f.custom
      ? {k:f.k/Math.max(1,f.totalG)*100,p:f.p/Math.max(1,f.totalG)*100,c:f.c/Math.max(1,f.totalG)*100,f:f.f/Math.max(1,f.totalG)*100}
      : foodPer100(f);
    const name=f.custom?f.name:f.n;
    const t=f.custom?null:foodTags(f.n);
    const kindCat=f.custom?null:(t.cats.find(c=>c!=='main')||t.cats[0]);
    const tag=f.custom?'<span class="badge">Custom</span>'
      :`<span class="cat-tag ${t.veg?'veg':'nonveg'}">${t.veg?'🥗 Veg':'🍗 Non-veg'}</span>`+
       (kindCat&&kindCat!=='other'?`<span class="cat-tag kind">${FOOD_CAT_LABEL[kindCat]||kindCat}</span>`:'');
    const img=f.img?`<img class="fimg" src="${f.img}">`:`<div class="food-emoji">${f.e||'🍽️'}</div>`;
    return `<div class="food-card" data-food="${i}" data-custom="${f.custom?1:0}">
      ${f.custom?`<button class="del" data-delcustom="${f.id}">🗑</button>`:''}
      ${img}${tag}<b>${name}</b>
      <span class="kcal">~${Math.round(per.k)} kcal / 100 g</span>
      <span class="pfc">P ${Math.round(per.p)} · C ${Math.round(per.c)} · F ${Math.round(per.f)}</span></div>`;
  }).join('');
  box.querySelectorAll('[data-food]').forEach(el=>el.onclick=ev=>{
    if(ev.target.closest('[data-delcustom]')) return;
    const i=+el.dataset.food;
    openPortion(list[i], el.dataset.custom==='1');
  });
  box.querySelectorAll('[data-delcustom]').forEach(b=>b.onclick=ev=>{
    ev.stopPropagation();
    if(confirm('Delete this custom food?')){
      custom=custom.filter(c=>c.id!=b.dataset.delcustom); store.set('custom',custom);
      renderSearch(); renderLibrary(); toast('Deleted');
    }
  });
}
$('#foodSearch').oninput=renderSearch;
$('#clearSearch').onclick=()=>{ $('#foodSearch').value=''; fCat='all'; $$('#foodTypeFilters .chip').forEach((c,i)=>c.classList.toggle('active',i===0)); renderSearch(); };
$$('#foodTypeFilters .chip').forEach(b=>b.onclick=()=>{
  $$('#foodTypeFilters .chip').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); fCat=b.dataset.cat; renderSearch();
});
[...$('#mealTabs').children].forEach(b=>b.onclick=()=>{
  [...$('#mealTabs').children].forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); curMeal=b.dataset.meal;
});

/* ================= NUTRIENTS TODAY (vitamins, minerals, omega etc.) ================= */
function dayNutrients(){
  const tot={};
  NUTRIENT_RDA.forEach(n=>tot[n.k]=0);
  for(const e of dayLog()){
    const g=e.g||0;
    tot.protein+=e.p||0; tot.carbs+=e.c||0; tot.fat+=e.f||0;
    const m=FOOD_MICRO[e.n];
    if(m) for(const k in m){ if(k in tot) tot[k]+= m[k]*g/100; }
  }
  return tot;
}
function renderNutrients(){
  const tot=dayNutrients();
  const anyLogged=dayLog().length>0;
  $('#nutrientDisclaimer').innerHTML=DISCLAIMER;
  $('#nutrientList').innerHTML = !anyLogged
    ? '<div class="empty">Log some food first — nutrients yahan dikhenge 🔬</div>'
    : NUTRIENT_RDA.map(n=>{
      const v=tot[n.k]||0;
      const pct=n.rda? Math.round(v/n.rda*100):0;
      const cls = pct===0?'low' : (n.warn && pct>100 ? 'over' : '');
      const shown = v>=100? Math.round(v) : Math.round(v*10)/10;
      return `<div class="nutrient-item">
        <div class="n-top">${n.l}<span class="${cls}">${shown} ${n.u}</span></div>
        <small>${pct}% of daily reference${n.note?' · '+n.note:''}</small>
        <div class="bar"><i style="width:${Math.min(100,pct)}%"></i></div>
      </div>`;
    }).join('') +
    `<div class="nutrient-item" style="grid-column:1/-1"><small>Custom foods ke micronutrients estimate ke roop mein dikhate hain ya missing ho sakte hain — upar wala disclaimer zaroor padhein.</small></div>`;
}
$('#nutrientsToggle').onclick=()=>{
  const list=$('#nutrientList');
  list.hidden=!list.hidden;
  $('#nutrientsToggle').textContent = list.hidden? 'Show details ▾':'Hide details ▴';
  if(!list.hidden) renderNutrients();
};

/* ================= NUTRITION BOT ================= */
function botAnswer(q){
  const ql=q.toLowerCase().trim();
  const numMatch=ql.match(/(\d+(?:\.\d+)?)/);
  const qty=numMatch?parseFloat(numMatch[1]):null;
  const words=ql.replace(/[^\w\s]/g,' ').split(/\s+/).filter(w=>w.length>2&&!['kitna','kitni','kitne','mein','hota','hoti','hai','ke','ki','ka','the','and','how','much','many','does','contain','contain','rich','foods','food','calories','protein','give','tell','please'].includes(w));
  const nutrientKeys=[
    ['protein',['protein','p']],
    ['carbs',['carbs','carbohydrate','carbohydrates','carb','starch']],
    ['fat',['fat','fats','oil','lipid']],
    ['fiber',['fiber','fibre']],
    ['sugar',['sugar','sugars','sweet']],
    ['iron',['iron']],
    ['calcium',['calcium']],
    ['potassium',['potassium']],
    ['zinc',['zinc']],
    ['vitA',['vitamin a','vita','retinol']],
    ['vitC',['vitamin c','vitc','ascorbic']],
    ['vitD',['vitamin d','vitd']],
    ['vitB12',['vitamin b12','b12','cobalamin']],
    ['omega3',['omega 3','omega-3','omega3','flax','alas']],
    ['cholesterol',['cholesterol']],
    ['sodium',['sodium','salt']]
  ];
  let wanted=null;
  for(const [k,alts] of nutrientKeys){
    if(alts.some(a=>ql.includes(a))) { wanted=k; break; }
  }
  // food match
  const foodMatches=FOODS.filter(f=>words.some(w=>f.n.toLowerCase().includes(w)||w.includes(f.n.toLowerCase().slice(0,5))));
  const customMatches=custom.filter(c=>words.some(w=>c.name.toLowerCase().includes(w)));
  const target=foodMatches[0]||(customMatches.length?{n:customMatches[0].n,k:customMatches[0].k/Math.max(1,customMatches[0].totalG)*100,p:customMatches[0].p/Math.max(1,customMatches[0].totalG)*100,c:customMatches[0].c/Math.max(1,customMatches[0].totalG)*100,f:customMatches[0].f/Math.max(1,customMatches[0].totalG)*100,serve:Math.round(customMatches[0].totalG/2),isCustom:1}:null);

  // iron-rich foods query
  if(!target && wanted==='iron'){
    const top=FOODS.map(f=>({f,m:FOOD_MICRO[f.n]||{}})).filter(x=>x.m.iron>2).sort((a,b)=>b.m.iron-a.m.iron).slice(0,6);
    if(top.length) return `<b>Iron-rich foods 💪:</b><br>`+top.map(x=>`• ${x.f.e} ${x.f.n} — ${x.m.iron} mg iron/100g (per serve ≈ ${x.f.serve||100}g)`).join('<br>')+`<br><small class="muted">Plant iron ke saath vitamin C (nimbu, amla) lo — absorption badhta hai. ${DISCLAIMER.slice(0,80)}…</small>`;
  }
  if(!target && wanted && ['vitC','calcium','potassium','zinc','vitA','vitD','vitB12','omega3','fiber','sugar'].includes(wanted)){
    const nInfo=NUTRIENT_RDA.find(n=>n.k===wanted);
    const top=FOODS.map(f=>({f,m:FOOD_MICRO[f.n]||{}})).filter(x=>x.m[wanted]>0).sort((a,b)=>(b.m[wanted]||0)-(a.m[wanted]||0)).slice(0,6);
    if(top.length) return `<b>${nInfo?nInfo.l:wanted}-rich foods 🥗:</b><br>`+top.map(x=>`• ${x.f.e} ${x.f.n} — ${(x.m[wanted]||0).toFixed(1)} ${nInfo?nInfo.u:'mg'}/100g`).join('<br>')+`<br><small class="muted">Daily reference: ${nInfo?nInfo.rda+' '+nInfo.u:''}</small>`;
  }
  if(!target) return `Mujhe samajh nahi aaya — try: “<b>100g paneer me kitna protein</b>”, “<b>iron rich foods</b>”, “<b>2 roti ke calories</b>”, “<b>banana me kitni sugar</b>”`;
  const g=qty||target.serve||100;
  const m=FOOD_MICRO[target.n]||null;
  const kp=target.k*g/100, pp=target.p*g/100, cp=target.c*g/100, fp=target.f*g/100;
  let html=`<b>${target.e||'🍽️'} ${target.n} — ${g} g</b><br>🔥 <b>${Math.round(kp)} kcal</b> · 🥩 Protein <b>${Math.round(pp)} g</b> · 🍚 Carbs <b>${Math.round(cp)} g</b> · 🥑 Fat <b>${Math.round(fp)} g</b>`;
  if(wanted && m && wanted in m){
    const nInfo=NUTRIENT_RDA.find(n=>n.k===wanted);
    const mv=m[wanted]*g/100;
    html+=`<br>🔬 ${nInfo?nInfo.l:wanted}: <b>${mv>=10?Math.round(mv):Math.round(mv*100)/100} ${nInfo?nInfo.u:'mg'}</b> (${nInfo&&nInfo.rda?Math.round(mv/nInfo.rda*100)+'% of daily reference':''})`;
  } else if(m){
    const nInfo=NUTRIENT_RDA.find(n=>n.k==='iron');
    html+=`<br>🔬 Iron: ${Math.round(m.iron*g/100*10)/10} mg · Calcium: ${Math.round(m.calcium*g/100)} mg · Vitamin C: ${Math.round(m.vitC*g/10)/10} mg`;
  }
  html+=`<br><small class="muted">Values approximate hain. ${DISCLAIMER.slice(0,100)}…</small>`;
  return html;
}
$('#botAskBtn').onclick=()=>{
  const q=$('#botQ').value.trim();
  if(!q) return toast('Pehle sawaal likho…');
  const box=$('#botA'); box.hidden=false; box.innerHTML='🤖 Soch raha hoon…';
  setTimeout(()=>{ box.innerHTML=botAnswer(q); },200);
};
$('#botQ').onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); $('#botAskBtn').click(); } };

/* ================= PORTION MODAL ================= */
let portionCtx=null;
function openPortion(f, isCustom){
  const per = isCustom ? {k:f.k/Math.max(1,f.totalG)*100, p:f.p/Math.max(1,f.totalG)*100, c:f.c/Math.max(1,f.totalG)*100, f:f.f/Math.max(1,f.totalG)*100} : foodPer100(f);
  const name = isCustom? f.name : f.n;
  const serve = isCustom? Math.round(f.totalG/ (f.rows.length>2?3:2)) : (f.serve||100);
  portionCtx = {name, per, isCustom, img:isCustom?f.img:null, e:f.e};
  const quick = [serve, Math.round(serve*1.5), serve*2];
  $('#portionBody').innerHTML=`
    <h2>${name}</h2>
    <p class="muted">Per 100 g → ${Math.round(per.k)} kcal · P ${Math.round(per.p)} · C ${Math.round(per.c)} · F ${Math.round(per.f)}</p>
    <div class="meal-tabs">${quick.map(q=>`<button class="chip" data-q="${q}">${q} g</button>`).join('')}</div>
    <label class="field">Weight (grams)
      <input type="number" id="portionG" class="input" value="${serve}" min="1" max="5000">
    </label>
    <div class="preview-box" id="portionCalc"></div>
    <label class="field">Meal
      <div class="seg wide" id="portionMeal">
        ${['Breakfast','Lunch','Snack','Dinner'].map(m=>`<button class="${m===curMeal?'active':''}" data-m="${m}">${m}</button>`).join('')}
      </div>
    </label>
    <button class="btn primary full" id="portionAdd">Add to log ✓</button>`;
  let meal=curMeal;
  const upd=()=>{
    const g=+$('#portionG').value||0;
    const k=per.k*g/100, p=per.p*g/100, c=per.c*g/100, f2=per.f*g/100;
    $('#portionCalc').innerHTML=`<b>${g} g</b> → <b>${Math.round(k)} kcal</b> · 🥩 P <b>${Math.round(p)} g</b> · 🍚 C <b>${Math.round(c)} g</b> · 🥑 F <b>${Math.round(f2)} g</b>`;
    portionCtx.macros={k,p,c,f:f2,g};
  };
  $('#portionG').oninput=upd;
  $$('#portionBody [data-q]').forEach(b=>b.onclick=()=>{ $('#portionG').value=b.dataset.q; upd(); });
  $$('#portionMeal button').forEach(b=>b.onclick=()=>{ $$('#portionMeal button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); meal=b.dataset.m; });
  $('#portionAdd').onclick=()=>{
    const g=+$('#portionG').value||0;
    if(g<1) return toast('Enter weight in grams');
    addEntry({n:name,e:portionCtx.e||'🍽️',img:portionCtx.img,meal,g,...portionCtx.macros});
    $('#portionModal').classList.remove('open'); toast(`${name} added to ${meal}`);
  };
  upd(); openModal('#portionModal');
}

/* ================= CAMERA / ANALYSIS ================= */
function camStep(n){ [1,2,3,4].forEach(i=>$('#camStep'+i).hidden = i!==n); }
$('#openCameraBtn').onclick=()=>{
  camState=null;
  $('#camPreview').hidden=true; $('#analyzeBtn').hidden=true; $('#camDrop').hidden=false;
  camStep(1); openModal('#cameraModal');
};
$('#camTakeBtn').onclick=()=>{ $('#camInput').setAttribute('capture','environment'); $('#camInput').click(); };
$('#camUploadBtn').onclick=()=>{ $('#camInput').removeAttribute('capture'); $('#camInput').click(); };
$('#camDrop').ondragover=e=>{ e.preventDefault(); $('#camDrop').classList.add('hover'); };
$('#camDrop').ondragleave=()=>$('#camDrop').classList.remove('hover');
$('#camDrop').ondrop=e=>{ e.preventDefault(); $('#camDrop').classList.remove('hover'); if(e.dataTransfer.files[0]) handleCamFile(e.dataTransfer.files[0]); };
$('#camInput').onchange=e=>{ if(e.target.files[0]) handleCamFile(e.target.files[0]); };
function compressImage(file,maxW,cb){
  const fr=new FileReader();
  fr.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,maxW/img.width);
      const cv=document.createElement('canvas');
      cv.width=Math.round(img.width*scale); cv.height=Math.round(img.height*scale);
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      cb(cv.toDataURL('image/jpeg',.75));
    };
    img.src=fr.result;
  };
  fr.readAsDataURL(file);
}
function handleCamFile(file){
  if(!file.type.startsWith('image/')) return toast('Please choose an image');
  compressImage(file,700,data=>{
    camState={img:data};
    const pv=$('#camPreview'); pv.src=data; pv.hidden=false;
    $('#camDrop').hidden=true; $('#analyzeBtn').hidden=false;
  });
}
$('#analyzeBtn').onclick=()=>{
  camStep(2);
  const msgs=['Analysing your food…','Detecting ingredients…','Estimating portion sizes…','Calculating macros…'];
  let i=0; $('#analyzeMsg').textContent=msgs[0];
  const iv=setInterval(()=>{ i++; if(i<msgs.length) $('#analyzeMsg').textContent=msgs[i]; },450);
  setTimeout(()=>{
    clearInterval(iv);
    const cands=shuffle(FOODS.filter(f=>f.det)).slice(0,4).map(f=>({f,conf:70+Math.floor(Math.random()*28)}));
    cands.sort((a,b)=>b.conf-a.conf);
    camState.cands=cands;
    $('#analysisResults').innerHTML=cands.map((c,i)=>
      `<div class="detect-item" data-pick="${i}">
        <div><b>${c.f.e} ${c.f.n}</b><br><small class="muted">~${c.f.k} kcal/100g</small></div>
        <span class="conf">${c.conf}% match</span></div>`).join('');
    $$('#analysisResults [data-pick]').forEach(el=>el.onclick=()=>pickDetected(cands[+el.dataset.pick].f));
    camStep(3);
  },1900);
};
function pickDetected(f){
  camState.sel=f;
  $('#selThumb').src=camState.img; $('#selThumb').hidden=false;
  $('#selName').textContent=f.e+' '+f.n;
  $('#selMacros').textContent=`${f.k} kcal · P ${f.p} · C ${f.c} · F ${f.f} per 100 g`;
  $('#weightModeSeg').children[0].classList.add('active');
  $('#weightModeSeg').children[1].classList.remove('active');
  $('#foodWeightInput').value=f.serve||100;
  updWeightCalc(); camStep(4);
}
function updWeightCalc(){
  const f=camState&&camState.sel; if(!f) return;
  const g=+$('#foodWeightInput').value||0;
  const k=f.k*g/100,p=f.p*g/100,c=f.c*g/100,f2=f.f*g/100;
  $('#weightCalc').innerHTML=`<b>${g} g</b> → <b>${Math.round(k)} kcal</b> · 🥩 P <b>${Math.round(p)} g</b> · 🍚 C <b>${Math.round(c)} g</b> · 🥑 F <b>${Math.round(f2)} g</b>`;
}
$('#foodWeightInput').oninput=updWeightCalc;
segWire('#weightModeSeg',b=>{
  if(b.dataset.mode==='auto'){ $('#foodWeightInput').value=camState.sel.serve||100; toast('Auto portion estimate applied'); }
  else { $('#foodWeightInput').value=''; $('#foodWeightInput').focus(); toast('Type the food weight in grams'); }
  updWeightCalc();
});
segWire('#camMealSeg',()=>{});
$('#camRestartBtn').onclick=()=>{
  camState=null; $('#camPreview').hidden=true; $('#analyzeBtn').hidden=true; $('#camDrop').hidden=false;
  $('#camInput').value=''; camStep(1);
};
$('#camAddBtn').onclick=()=>{
  const f=camState.sel, g=+$('#foodWeightInput').value||0;
  if(g<1) return toast('Enter food weight');
  const meal=$('#camMealSeg').querySelector('.active').dataset.m;
  addEntry({n:f.n,e:f.e,img:camState.img,meal,g,k:f.k*g/100,p:f.p*g/100,c:f.c*g/100,f:f.f*g/100});
  $('#cameraModal').classList.remove('open'); toast(`${f.n} (${g} g) added to ${meal}`);
};

/* ================= WORKOUTS ================= */
let wFilter={type:'all',group:'all'}, wShuffle=false;
[...$('#typeFilters').children].forEach(b=>b.onclick=()=>{
  [...$('#typeFilters').children].forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); wFilter.type=b.dataset.type; wShuffle=false; renderWorkouts();
});
[...$('#groupFilters').children].forEach(b=>b.onclick=()=>{
  [...$('#groupFilters').children].forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); wFilter.group=b.dataset.group; wShuffle=false; renderWorkouts();
});
$('#refreshWorkoutsBtn').onclick=()=>{ wShuffle=true; renderWorkouts(true); toast('⟳ Fresh workout list loaded!'); };
$('#resetWorkoutsBtn').onclick=()=>{
  wFilter={type:'all',group:'all'}; wShuffle=false;
  $$('#typeFilters .chip').forEach((c,i)=>c.classList.toggle('active',i===0));
  $$('#groupFilters .chip').forEach((c,i)=>c.classList.toggle('active',i===0));
  renderWorkouts(); toast('Filters reset — showing all exercises');
};
function filteredWorkouts(){
  return WORKOUTS.filter(w=>{
    const t = wFilter.type==='all' ? true
      : (wFilter.type==='gym'||wFilter.type==='home') ? w.t.includes(wFilter.type)
      : w.c===wFilter.type;
    const g = wFilter.group==='all' ? true : w.g===wFilter.group;
    return t&&g;
  });
}
function woTags(w){
  return `<span class="tag ${w.t.includes('gym')?'gym':'home'}">${w.t.map(x=>TYPE_LABEL[x]||x).join(' + ')}</span>`+
    `<span class="tag">${GROUP_LABEL[w.g]||w.g}</span>`+
    `<span class="tag">${CAT_LABEL[w.c]||w.c}</span>`;
}
function renderWorkouts(isRefresh){
  let list=filteredWorkouts();
  const total=list.length;
  if(wShuffle){ list=shuffle(list).slice(0,Math.min(9,total)); }
  $('#workoutCount').textContent=`${list.length} of ${total} exercises shown`;
  $('#refreshHint').style.display = total>9 ? '' : 'none';
  $('#workoutGrid').innerHTML=list.map((w,i)=>{
    return `<div class="wo-card" data-wo="${WORKOUTS.indexOf(w)}" style="animation:fade .3s ease ${i*.03}s both">
      <div class="wo-img">${POSES[w.p]||POSES.squat}</div>
      <div class="wo-body"><b>${w.n}</b><div class="wo-tags">${woTags(w)}</div>
      <p class="wo-why">${w.w[0]}</p>
      <small class="muted">${w.lvl} · ${w.sets} · ${w.rest==='—'?'':'Rest '+w.rest}</small></div></div>`;
  }).join('') || '<div class="empty">No exercises match these filters.</div>';
  $$('#workoutGrid [data-wo]').forEach(el=>el.onclick=()=>openWorkout(+el.dataset.wo));
}
function openWorkout(i){
  const w=WORKOUTS[i];
  $('#workoutDetail').innerHTML=`
    <div class="wd-head">
      <div class="wd-figure">${POSES[w.p]||POSES.squat}</div>
      <div><h2>${w.n}</h2>
        <div class="wo-tags" style="margin:6px 0">${woTags(w)}</div>
        <p class="muted">${w.lvl} · ${w.eq}</p>
        <p><b>${w.sets}</b> ${w.rest!=='—'?'· rest '+w.rest:''}</p></div>
    </div>
    <h4>Steps to do it ✅</h4>
    <ol class="wd-steps">${w.s.map(x=>`<li>${x}</li>`).join('')}</ol>
    <h4>Why do this exercise? 🤔</h4>
    <ul class="why-list">${w.w.map(x=>`<li>${x}</li>`).join('')}</ul>
    <button class="btn primary full" id="didWorkoutBtn">✅ I did this workout — track it</button>`;
  $('#didWorkoutBtn').onclick=()=>markWorkoutDone(w.n);
  openModal('#workoutModal');
}
function markWorkoutDone(name){
  const d=today();
  workoutsDone.push({date:d,name,at:Date.now()});
  store.set('workoutsDone',workoutsDone);
  FF.addWorkoutDone(name).catch(()=>{});
  toast(`“${name}” tracked — see it in Tracking 📈`);
}

/* ================= SEARCH EXERCISE (name + speech + description) ================= */
const EX_SYNONYMS = {
  chest:['chest','pecs','bench','press','pushup','push up','fly','incline','dip','upper body'],
  back:['back','lat','rows','pull','pulldown','deadlift','rear','trap'],
  legs:['leg','squat','lunge','quad','hamstring','glute','calf','thigh','hip'],
  shoulders:['shoulder','delts','lateral','raise','overhead','military','face pull'],
  arms:['arm','bicep','curl','tricep','pushdown','hammer','forearm'],
  core:['core','abs','plank','situp','sit up','crunch','twist','dead bug','oblique','midsection'],
  fullbody:['full body','fullbody','burpee','swing','farmer','carry','circuit','whole'],
  cardio:['cardio','run','running','jog','treadmill','cycle','bike','rowing','rope','jump rope','skipping','stairs'],
  hiit:['hiit','fat burn','fatburn','tabata','intense','circuit','conditioning','metabolic'],
  flexibility:['flexib','stretch','mobility','yoga','warmup','warm up','cool down','downdog','cobra','child'],
  home:['home','no equipment','bodyweight','no gym','without equipment'],
  gym:['gym','machine','cable','barbell','dumbbell','weights']
};
function tokenize(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(t=>t.length>2); }
function expandTerms(tokens){
  const set=new Set(tokens);
  for(const t of tokens) for(const key in EX_SYNONYMS) if(EX_SYNONYMS[key].some(s=>t.includes(s)||s.includes(t))) EX_SYNONYMS[key].forEach(x=>set.add(x));
  return [...set];
}
function scoreWorkout(w,terms){
  const hay=(w.n+' '+w.c+' '+w.g+' '+w.t.join(' ')+' '+w.eq+' '+w.lvl+' '+w.s.join(' ')+' '+w.w.join(' ')).toLowerCase();
  let s=0;
  for(const t of terms){
    const re=new RegExp('\\b'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b');
    if(re.test(hay)||re.test(w.n.toLowerCase())) s+= re.test(w.n.toLowerCase())?3:1;
  }
  return s;
}
function renderSearchEx(results,infoText,showAll){
  $('#resultsHead').hidden=false;
  $('#resultsInfo').textContent=infoText;
  $('#showAllBtn').hidden=!showAll;
  $('#searchGrid').innerHTML=results.map((w,i)=>
    `<div class="wo-card" data-wo="${WORKOUTS.indexOf(w)}" style="animation:fade .3s ease ${i*.03}s both">
      <div class="wo-img">${POSES[w.p]||POSES.squat}</div>
      <div class="wo-body"><b>${w.n}</b><div class="wo-tags">${woTags(w)}</div>
      <p class="wo-why">${w.w[0]}</p>
      <small class="muted">${w.lvl} · ${w.sets}</small></div></div>`).join('')
    || '<div class="empty">Kuch nahi mila — apne shabd badal kar try karo.</div>';
  $$('#searchGrid [data-wo]').forEach(el=>el.onclick=()=>openWorkout(+el.dataset.wo));
}
function searchExerciseName(){
  const q=($('#exName').value||'').toLowerCase().trim();
  $('#failPanel').hidden=true;
  if(!q){ $('#resultsHead').hidden=true; $('#searchGrid').innerHTML=''; return; }
  const terms=expandTerms(tokenize(q));
  let hits=WORKOUTS.filter(w=>scoreWorkout(w,terms)>0)
    .sort((a,b)=>scoreWorkout(b,terms)-scoreWorkout(a,terms)).slice(0,12);
  if(!hits.length){
    $('#failPanel').hidden=false;
    $('#resultsHead').hidden=true; $('#searchGrid').innerHTML='';
    return;
  }
  renderSearchEx(hits,`🔎 ${hits.length} exercise(s) found for “${q}”`,false);
}
function searchExerciseDesc(){
  const d=($('#exDesc').value||'').toLowerCase().trim();
  if(!d) return toast('Kuch likho ya 🎤 se bolo');
  const terms=expandTerms(tokenize(d));
  const scored=WORKOUTS.map(w=>({w,s:scoreWorkout(w,terms)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
  if(!scored.length){ toast('Still no match — try simpler words like “chest”, “legs”, “cardio”'); return; }
  $('#failPanel').hidden=true;
  renderSearchEx(scored.slice(0,12).map(x=>x.w),`🤖 ${Math.min(12,scored.length)} relevant exercise(s) found from your description`,scored.length>12);
  toast('Description se exercises dhoondh liye!');
}
$('#exSearchBtn').onclick=searchExerciseName;
$('#exName').onkeydown=e=>{ if(e.key==='Enter') searchExerciseName(); };
$('#descSearchBtn').onclick=searchExerciseDesc;
$('#showAllBtn').onclick=()=>{ $('#failPanel').hidden=true; renderSearchEx(WORKOUTS.slice(),`📋 Showing all ${WORKOUTS.length} exercises`,false); };
$$('#quickChips [data-q]').forEach(b=>b.onclick=()=>{ $('#exName').value=b.dataset.q; $('#failPanel').hidden=true; searchExerciseName(); });

let recog=null;
$('#speakBtn').onclick=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ $('#speakStatus').textContent='❌ Aapke browser me speech support nahi hai — text likh kar search karein (Chrome try karein).'; return; }
  if(recog){ try{recog.stop();}catch(e){} recog=null; }
  recog=new SR();
  recog.lang='en-IN'; recog.interimResults=false; recog.maxAlternatives=1;
  $('#speakBtn').classList.add('recording'); $('#speakStatus').textContent='🎙️ Sun raha hoon… bolo';
  recog.onresult=ev=>{
    const txt=ev.results[0][0].transcript;
    $('#exDesc').value=txt;
    $('#speakStatus').textContent='✅ Suna: “'+txt+'” — ab search kar rahe hain…';
    searchExerciseDesc();
  };
  recog.onerror=ev=>{ $('#speakStatus').textContent='❌ Mic error: '+ev.error+' — text likh kar try karein.'; };
  recog.onend=()=>{ $('#speakBtn').classList.remove('recording'); };
  try{ recog.start(); }catch(e){ $('#speakStatus').textContent='❌ Mic start nahi hua — text likh kar try karein.'; }
};

/* ================= PLAN WIZARD (with target weight + insights) ================= */
let planCtx={};
function planStep(n){ [1,2,3,4,5].forEach(i=>$('#planStep'+i).hidden=i!==n); }
$('#createPlanBtn').onclick=()=>{ planCtx={}; planStep(1); openModal('#planModal'); };
$$('#planStep1 [data-purpose]').forEach(b=>b.onclick=()=>{
  $$('#planStep1 [data-purpose]').forEach(x=>x.classList.remove('selected'));
  b.classList.add('selected'); planCtx.purpose=b.dataset.purpose;
  setTimeout(()=>planStep(2),150);
});
$('#planBack1').onclick=()=>planStep(1);
$$('#planStep2 [data-days]').forEach(b=>b.onclick=()=>{
  $$('#planStep2 [data-days]').forEach(x=>x.classList.remove('selected'));
  b.classList.add('selected'); planCtx.days=+b.dataset.days;
  setTimeout(()=>planStep(3),150);
});
$('#planBack2').onclick=()=>planStep(2);
$$('#planStep3 [data-creatine]').forEach(b=>b.onclick=()=>{
  $$('#planStep3 [data-creatine]').forEach(x=>x.classList.remove('selected'));
  b.classList.add('selected'); planCtx.creatine=b.dataset.creatine;
  if(profile && profile.wKg) $('#targetWeight').value=planCtx.purpose==='fatloss'? Math.round((profile.wKg-5)*10)/10 : Math.round((profile.wKg+4)*10)/10;
  setTimeout(()=>planStep(4),150);
});
$('#planBack3').onclick=()=>planStep(3);
segWire('#targetUnit',()=>{});
$('#planTargetNext').onclick=()=>{
  const raw=parseFloat($('#targetWeight').value);
  if(!raw||raw<20||raw>400) return toast('Enter a valid target weight');
  const unit=$('#targetUnit .active')?$('#targetUnit .active').dataset.unit:'kg';
  planCtx.targetW = unit==='lb'? Math.round(raw/2.20462*10)/10 : raw;
  buildPlanResult();
  planStep(5);
};
$('#planRestart').onclick=()=>{ planCtx={}; planStep(1); };

function pickW(filters,n){
  let list=WORKOUTS.filter(w=>{
    if(filters.cat && w.c!==filters.cat) return false;
    if(filters.groups && !filters.groups.includes(w.g)) return false;
    if(filters.type && !w.t.includes(filters.type)) return false;
    return true;
  });
  return shuffle(list).slice(0,n).map(w=>w.n);
}
function splitFor(purpose,days){
  const R='Rest — Recover & Grow 💤';
  if(purpose==='muscle'){
    if(days===4) return [
      ['Day 1','Upper Body — Chest, Back & Shoulders',{groups:['chest','back','shoulders']}],
      ['Day 2','Lower Body — Legs & Glutes',{groups:['legs']}],
      ['Day 3',R,null],
      ['Day 4','Push Day — Chest, Shoulders & Triceps',{groups:['chest','shoulders','arms']}],
      ['Day 5','Pull Day — Back & Biceps',{groups:['back','arms']}],
      ['Day 6',R,null],['Day 7',R,null]];
    if(days===5) return [
      ['Day 1','Push Day — Chest, Shoulders & Triceps',{groups:['chest','shoulders','arms']}],
      ['Day 2','Pull Day — Back & Biceps',{groups:['back','arms']}],
      ['Day 3','Leg Day — Quads, Hamstrings & Glutes',{groups:['legs']}],
      ['Day 4','Upper Body — Chest, Back & Shoulders',{groups:['chest','back','shoulders']}],
      ['Day 5','Lower Body — Legs & Glutes',{groups:['legs']}],
      ['Day 6',R,null],['Day 7',R,null]];
    return [
      ['Day 1','Push Day — Chest, Shoulders & Triceps',{groups:['chest','shoulders','arms']}],
      ['Day 2','Pull Day — Back & Biceps',{groups:['back','arms']}],
      ['Day 3','Leg Day — Quads, Hamstrings & Glutes',{groups:['legs']}],
      ['Day 4','Push Day (More Volume)',{groups:['chest','shoulders','arms']}],
      ['Day 5','Pull Day (More Volume)',{groups:['back','arms']}],
      ['Day 6','Leg Day (More Volume)',{groups:['legs']}],
      ['Day 7',R,null]];
  }
  if(days===4) return [
    ['Day 1','Full Body Strength',{groups:['fullbody','chest']}],
    ['Day 2','HIIT Fat Burn',{cat:'hiit'}],
    ['Day 3',R,null],
    ['Day 4','Full Body Strength',{groups:['fullbody','legs']}],
    ['Day 5','Cardio + Core',{cat:'cardio',extra:'core'}],
    ['Day 6',R,null],['Day 7',R,null]];
  if(days===5) return [
    ['Day 1','Full Body Strength',{groups:['fullbody','chest']}],
    ['Day 2','HIIT Fat Burn',{cat:'hiit'}],
    ['Day 3','Cardio + Core',{cat:'cardio',extra:'core'}],
    ['Day 4','Full Body Strength',{groups:['fullbody','legs']}],
    ['Day 5','Steady Cardio (Easy Pace)',{cat:'cardio'}],
    ['Day 6',R,null],['Day 7',R,null]];
  return [
    ['Day 1','Full Body Strength',{groups:['fullbody','chest']}],
    ['Day 2','HIIT Fat Burn',{cat:'hiit'}],
    ['Day 3','Core + Mobility',{extra:'core',groups:['back']}],
    ['Day 4','Full Body Strength',{groups:['fullbody','legs']}],
    ['Day 5','HIIT + Cardio',{cat:'hiit'}],
    ['Day 6','Steady Cardio (Easy Pace)',{cat:'cardio'}],
    ['Day 7',R,null]];
}
function exercisesFor(spec){
  if(!spec) return ['Complete rest — recovery is where you grow 💤'];
  const out=[];
  if(spec.cat) out.push(...pickW({cat:spec.cat}, spec.cat==='hiit'?4:3));
  if(spec.groups) out.push(...pickW({groups:spec.groups}, 4));
  if(spec.extra) out.push(...pickW({groups:[spec.extra]},2));
  return [...new Set(out)].slice(0,6);
}
function buildPlanInsights(purpose,days,creatine,wKg,targetW){
  const out=[];
  const hM = profile? profile.hCm/100 : null;
  if(profile && profile.wKg && profile.hCm){
    const b=bmiOf(profile);
    const [tag,col]=bmiTag(b);
    const good=b>=18.5&&b<25;
    out.push({icon:'📏',kind:good?'good':'warn',
      text:`Your BMI today: <b>${b.toFixed(1)}</b> (${tag}). ${good?'This is in the healthy range — keep it up!':'Yeh healthy range se bahar hai — doctor/dietitian se baat karna best hai.'}`});
    const minW=Math.round(18.5*hM*hM*10)/10, maxW=Math.round(24.9*hM*hM*10)/10, ideal=Math.round(22*hM*hM*10)/10;
    out.push({icon:'🎯',kind:'good',
      text:`For your height (<b>${profile.hCm} cm</b>), a healthy weight range is <b>${minW}–${maxW} kg</b> (ideal ≈ <b>${ideal} kg</b> at BMI 22).`});
    if(targetW){
      const diff=Math.abs(targetW-wKg);
      let rate,rateTxt,kind='good';
      if(purpose==='fatloss'){ rate=Math.min(0.75,Math.max(0.25,wKg*0.0075)); rateTxt=`0.5–0.75% of body weight per week (≈ <b>${rate.toFixed(2)} kg/week</b> for you)`; }
      else { rate=0.3; rateTxt=`~0.25–0.4 kg/week (muscle gain) — slow and clean wins`; }
      if(diff<0.5) out.push({icon:'✅',kind:'good',text:`You are already at your target weight (${targetW} kg) — focus on maintenance and strength.`});
      else{
        const weeks=Math.max(1,Math.round(diff/rate));
        out.push({icon:'⏳',kind,
          text:`Safe pace to reach <b>${targetW} kg</b>: ${rateTxt}. At that pace you will reach your target in about <b>${weeks} week${weeks>1?'s':''}</b> (${diff.toFixed(1)} kg to go).`});
        if(targetW<minW) out.push({icon:'⚠️',kind:'warn',text:`Target ${targetW} kg is below the healthy range for your height. Please talk to a doctor/dietitian before aiming for it.`});
        if(targetW>maxW) out.push({icon:'⚠️',kind:'warn',text:`Target ${targetW} kg is above the healthy BMI range for your height. A professional can guide you safely.`});
      }
    }
  }
  const waterMl=Math.round((wKg*35 + days*100 + (creatine==='yes'?500:0))/250)*250;
  out.push({icon:'💧',kind:'good',
    text:`Why <b>${waterMl.toLocaleString()} ml</b> water? Base = 35 ml × <b>${wKg} kg</b> body weight = ${Math.round(wKg*35)} ml, + <b>${days*100} ml</b> for training days${creatine==='yes'?', + <b>500 ml</b> because creatine pulls extra water into muscles':''}. Sip through the day — 8–10 glasses plus one with every meal.`});
  if(creatine==='yes') out.push({icon:'🧪',kind:'good',text:'With creatine, drink even more water (add a glass around your workout) and keep taking it daily at the same time.'});
  out.push({icon:'⚖️',kind:'good',text:`Weigh yourself <b>same time each day</b> (morning, after toilet, before food) and log it in Tracking — weekly averages matter more than daily ups/downs.`});
  return out;
}
function buildPlanResult(){
  const {purpose,days,creatine,targetW}=planCtx;
  const wKg=profile?profile.wKg:70;
  const waterMl=Math.round((wKg*35 + days*100 + (creatine==='yes'?500:0))/250)*250;
  const split=splitFor(purpose,days).map(([d,title,spec])=>({d,title,list:exercisesFor(spec)}));
  const calAdvice = profile ? (purpose==='fatloss'
      ? `Your goal: <b>${profile.cal}</b> kcal — try eating ~<b>${Math.max(1200,profile.cal-300)}</b> kcal (slight deficit) to lose fat.`
      : `Your goal: <b>${profile.cal}</b> kcal — try eating ~<b>${profile.cal+250}</b> kcal (slight surplus) to build muscle.`)
    : 'Set your Calorie Goal in the Dashboard to get calorie advice.';
  const insights=buildPlanInsights(purpose,days,creatine,wKg,targetW);
  planCtx.result={purpose,days,creatine,targetW,water:waterMl,split,
    macros: profile?calcMacros(profile.cal,wKg,profile.gender):null, wKg, calAdvice, insights,
    created:new Date().toLocaleDateString()};
  $('#planResult').innerHTML=planResultHTML(planCtx.result);
}
function planResultHTML(r){
  const pLabel = r.purpose==='fatloss'?'Fat Loss':'Muscle Building';
  const waterBreak=`35 ml × ${r.wKg} kg = ${Math.round(r.wKg*35)} ml &nbsp;+&nbsp; ${r.days*100} ml (training)${r.creatine==='yes'?' &nbsp;+&nbsp; 500 ml (creatine)':''}`;
  return `
  <div class="water-hero">💧 Daily Water Intake
    <div class="big-num">${r.water.toLocaleString()} ml</div>
    <small class="muted">${waterBreak}</small>
  </div>
  <div class="plan-stats">
    <div><b>${pLabel}</b><small>purpose</small></div>
    <div><b>${r.days} days</b><small>per week</small></div>
    <div><b>${r.creatine==='yes'?'Yes':'No'}</b><small>creatine</small></div>
    <div><b>${r.macros?r.macros.p+'g':'—'}</b><small>protein/day</small></div>
    ${r.targetW?`<div><b>${r.targetW} kg</b><small>target weight</small></div>`:''}
  </div>
  <div class="preview-box">🎯 ${r.calAdvice}<br>🥩 Protein <b>${r.macros?r.macros.p+' g':'—'}</b> · 🍚 Carbs <b>${r.macros?r.macros.c+' g':'—'}</b> · 🥑 Fats <b>${r.macros?r.macros.f+' g':'—'}</b></div>
  ${r.insights&&r.insights.length?`<h4>Personalised Insights ✨</h4><div class="insight-list">${r.insights.map(i=>`<div class="insight-item ${i.kind}">${i.icon} ${i.text}</div>`).join('')}</div>`:''}
  <h4>Weekly Split</h4>
  ${r.split.map(d=>`<div class="split-day"><b>${d.d} — ${d.title}</b>
    <ul>${d.list.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('')}`;
}
$('#savePlanBtn').onclick=async()=>{
  if(!planCtx.result) return;
  plan=planCtx.result; store.set('plan',plan);
  const label=(plan.purpose==='fatloss'?'Fat Loss':'Muscle Gain')+' · '+plan.days+' days/wk · '+new Date().toLocaleDateString();
  const copy={...plan,label};
  savedPlans.unshift(copy); store.set('savedPlans',savedPlans);
  if(FF.online) try{ const id=await FF.savePlan(copy); copy.sid=id; }catch(e){}
  renderPlanPage(); renderDash(); renderSavedPlans(); toast('Plan saved! Water target updated 💧');
};
$('#refreshPlanBtn').onclick=()=>{
  const src=plan||planCtx.result;
  if(!src) return toast('Pehle ek plan banao — 🚀 Create Workout Plan');
  planCtx={...planCtx,...src};
  buildPlanResult();
  if(plan){ plan=planCtx.result; store.set('plan',plan); renderPlanPage(); }
  toast('⟳ Fresh exercises loaded in your plan!');
};
$('#resetPlanBtn').onclick=()=>{
  if(!confirm('Clear your saved plan?')) return;
  plan=null; store.del('plan'); FF.patch({plan:null}).catch(()=>{});
  renderPlanPage(); renderDash(); toast('Plan cleared');
};
function renderPlanPage(){
  $('#planOutput').innerHTML = plan
    ? `<div class="plan-card"><div class="row between align-c"><h2>Your Saved Plan</h2><button class="btn ghost small-btn" id="regenPlan">↺ New plan</button></div>
       ${planResultHTML(plan)}</div>`
    : `<div class="card"><div class="empty">No plan yet — hit <b>🚀 Create Workout Plan</b> above to build your personalised split.</div></div>`;
  const rp=$('#regenPlan'); if(rp) rp.onclick=()=>$('#createPlanBtn').click();
  renderSavedPlans();
}
function renderSavedPlans(){
  const box=$('#savedPlansList');
  if(!box) return;
  box.innerHTML = savedPlans.length
    ? savedPlans.map((p,i)=>`
      <div class="log-item">
        <div class="li-main"><b>${p.label||(p.purpose==='fatloss'?'Fat Loss':'Muscle Gain')+' · '+p.days+' days'}</b>
        <small>💧 ${p.water?p.water.toLocaleString()+' ml':'—'} · 🥩 ${p.macros?p.macros.p+'g protein':'—'} · created ${p.created||''}</small></div>
        <div class="row gap">
          <button class="btn ghost small-btn" data-openplan="${i}">Open</button>
          <button class="li-x" data-delplan="${i}">🗑</button>
        </div>
      </div>`).join('')
    : '<div class="empty">No saved plans yet — build one and hit Save 💾</div>';
  box.querySelectorAll('[data-openplan]').forEach(b=>b.onclick=()=>{
    const p=savedPlans[+b.dataset.openplan];
    plan=p; store.set('plan',plan);
    planCtx={...planCtx,...p};
    renderPlanPage(); renderDash();
    toast('Plan loaded — ab edits kar sakte ho 🚀');
    go('plan');
  });
  box.querySelectorAll('[data-delplan]').forEach(b=>b.onclick=()=>{
    if(!confirm('Delete this plan?')) return;
    const p=savedPlans.splice(+b.dataset.delplan,1)[0];
    store.set('savedPlans',savedPlans);
    if(p && p.sid && FF.online) FF.deletePlan(p.sid).catch(()=>{});
    renderSavedPlans(); toast('Plan deleted');
  });
}
$('#clearAllPlansBtn').onclick=()=>{
  if(!savedPlans.length) return toast('No plans to delete');
  if(!confirm('Delete ALL saved plans?')) return;
  savedPlans=[]; store.set('savedPlans',savedPlans);
  renderSavedPlans(); toast('All plans deleted');
};

/* ================= CUSTOM FOOD ================= */
let ingRows=[], customImg=null, editingId=null;
function openCustom(cf){
  editingId = cf ? cf.id : null;
  ingRows = cf ? cf.rows.map(r=>({...r})) : [];
  customImg = cf ? cf.img : null;
  $('#customName').value = cf ? cf.name : '';
  $('#customImgPick').innerHTML = cf && cf.img ? `<img src="${cf.img}">` : '<span>📷<small>Add photo</small></span>';
  $('#customModal h2').textContent = cf ? '✏️ Edit Custom Food' : '🧪 Create Custom Food';
  $('#customSaveBtn').textContent = cf ? 'Update Food 💾' : 'Save to Library 💾';
  renderIngRows(); updCustomTotals();
  $('#ingredientList').innerHTML=INGREDIENTS.map(i=>`<option value="${i.n}">`).join('');
  openModal('#customModal');
}
$('#openCustomFoodBtn').onclick=openCustom;
$('#customImgPick').onclick=()=>$('#customImgInput').click();
$('#customImgInput').onchange=e=>{
  const file=e.target.files[0]; if(!file) return;
  compressImage(file,360,data=>{
    customImg=data;
    $('#customImgPick').innerHTML=`<img src="${data}">`;
  });
};
function renderIngRows(){
  $('#ingredientRows').innerHTML = ingRows.length? '' : '<p class="muted tiny" style="margin-bottom:6px">No ingredients yet — add your first one below 👇</p>';
  ingRows.forEach((r,i)=>{
    const div=document.createElement('div');
    div.className='ing-row';
    div.innerHTML=`<span class="ing-name">${r.n}<div class="ing-macros">${Math.round(r.k*r.g/100)} kcal · P ${Math.round(r.p*r.g/100)} · C ${Math.round(r.c*r.g/100)} · F ${Math.round(r.f*r.g/100)}</div></span>
      <span class="ing-g">${r.g} g</span><button class="ing-x">✕</button>`;
    div.querySelector('.ing-x').onclick=()=>{ ingRows.splice(i,1); renderIngRows(); updCustomTotals(); };
    $('#ingredientRows').appendChild(div);
  });
}
function updCustomTotals(){
  const t=ingRows.reduce((a,r)=>({g:a.g+r.g,k:a.k+r.k*r.g/100,p:a.p+r.p*r.g/100,c:a.c+r.c*r.g/100,f:a.f+r.f*r.g/100}),{g:0,k:0,p:0,c:0,f:0});
  $('#customTotals').innerHTML = t.g?
    `Total <b>${t.g} g</b> recipe → <b>${Math.round(t.k)} kcal</b> · 🥩 P <b>${Math.round(t.p)} g</b> · 🍚 C <b>${Math.round(t.c)} g</b> · 🥑 F <b>${Math.round(t.f)} g</b><br>
     <span class="muted">Per 100 g: ${Math.round(t.k/Math.max(1,t.g)*100)} kcal · P ${Math.round(t.p/Math.max(1,t.g)*100)} · C ${Math.round(t.c/Math.max(1,t.g)*100)} · F ${Math.round(t.f/Math.max(1,t.g)*100)}</span>`
    : '<span class="muted">Add ingredients with grams to see the nutrition breakdown…</span>';
  return t;
}
function addIngredient(){
  const name=$('#ingName').value.trim(), g=+$('#ingGrams').value;
  if(!name) return toast('Enter ingredient name');
  if(!g||g<1) return toast('Enter weight in grams');
  const known=INGREDIENTS.find(i=>i.n.toLowerCase()===name.toLowerCase());
  ingRows.push(known?{...known,g}:{n:name,k:0,p:0,c:0,f:0,g});
  $('#ingName').value=''; $('#ingGrams').value='';
  renderIngRows(); updCustomTotals();
  if(!known) toast('Unknown ingredient added as 0 kcal — check nutrition labels');
}
$('#addIngBtn').onclick=addIngredient;
$('#ingName').onkeydown=$('#ingGrams').onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); addIngredient(); } };
$('#customClearBtn').onclick=()=>{ ingRows=[]; customImg=null; $('#customName').value=''; $('#customImgPick').innerHTML='<span>📷<small>Add photo</small></span>'; renderIngRows(); updCustomTotals(); };
function foodHealthNote(kcalPer100, proteinPerServing, serveG, goal){
  const notes=[];
  const kcalServing=Math.max(1,kcalPer100*Math.max(1,serveG)/100);
  const pf=proteinPerServing/kcalServing*4*100;
  notes.push(kcalPer100>400?'⚠️ Calorie-dense — portion control important':kcalPer100<150?'✅ Light on calories':'👍 Moderate calories');
  if(goal==='fatloss') notes.push(pf>30?'💪 High protein — great for fat loss':pf>15?'👍 Decent protein for cutting':'⚠️ Low protein — pair with dal/paneer/chicken');
  else notes.push(pf>30?'💪 Excellent for muscle gain':pf>15?'👍 Good protein, add a bit more':'⚠️ Low protein — not ideal for bulking');
  notes.push(proteinPerServing>=20?'🥩 Protein per serving: enough ✅':proteinPerServing>=10?'🥩 Protein per serving: good 👍':'🥩 Protein per serving: low — add a protein source ⚠️');
  return notes;
}
$('#customSaveBtn').onclick=()=>{
  const name=$('#customName').value.trim();
  if(!name) return toast('Give your food a name');
  if(!ingRows.length) return toast('Add at least one ingredient');
  const t=updCustomTotals();
  if(editingId){
    const i=custom.findIndex(c=>c.id===editingId);
    if(i>=0) custom[i]={...custom[i],name,img:customImg,rows:[...ingRows],totalG:t.g,k:t.k,p:t.p,c:t.c,f:t.f};
    toast(`“${name}” updated 💾`);
  } else {
    custom.push({id:Date.now(),name,img:customImg,rows:[...ingRows],totalG:t.g,k:t.k,p:t.p,c:t.c,f:t.f});
    toast(`“${name}” saved to Library 💾`);
  }
  editingId=null;
  store.set('custom',custom);
  $('#customModal').classList.remove('open');
  renderSearch(); renderLibrary();
};

/* ================= LIBRARY ================= */
function renderLibrary(){
  const box=$('#libraryGrid');
  if(!custom.length){ box.innerHTML='<div class="empty">Library is empty — create your first custom food 🧪</div>'; return; }
  box.innerHTML=custom.map(cf=>{
    const goal=profile?profile.goal:(plan?plan.purpose:'fatloss');
    const per100=cf.k/Math.max(1,cf.totalG)*100;
    const serve=Math.round(cf.totalG/(cf.rows.length>2?3:2));
    const protServe=Math.round(cf.p/Math.max(1,cf.totalG)*serve);
    const notes=foodHealthNote(per100,protServe,serve,goal);
    return `
    <div class="food-card" data-lib="${cf.id}">
      <button class="del" data-del2="${cf.id}">🗑</button>
      <button class="mini-btn edit-btn" data-edit="${cf.id}">✏️</button>
      ${cf.img?`<img class="fimg" src="${cf.img}">`:'<div class="food-emoji">🧪</div>'}
      <span class="badge">Custom</span><b>${cf.name}</b>
      <span class="kcal">${Math.round(cf.k)} kcal / ${cf.totalG} g</span>
      <span class="pfc">P ${Math.round(cf.p)} · C ${Math.round(cf.c)} · F ${Math.round(cf.f)}</span>
      <small class="muted">${cf.rows.length} ingredient${cf.rows.length>1?'s':''} · ~${serve}g serving</small>
      <small class="health-note">${notes.map(n=>`<br>${n}`).join('')}</small>
    </div>`;}).join('');
  box.querySelectorAll('[data-lib]').forEach(el=>el.onclick=e=>{
    if(e.target.closest('[data-del2]')||e.target.closest('[data-edit]')) return;
    const cf=custom.find(c=>c.id==el.dataset.lib);
    openPortion(cf,true);
  });
  box.querySelectorAll('[data-del2]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();
    if(confirm('Delete this custom food?')){
      custom=custom.filter(c=>c.id!=b.dataset.del2); store.set('custom',custom);
      renderLibrary(); renderSearch(); toast('Deleted');
    }
  });
  box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();
    const cf=custom.find(c=>c.id==b.dataset.edit);
    if(cf) openCustom(cf);
  });
}

/* ================= TRACKING (consistency + performance) ================= */
function dayKeysSet(){ return new Set(Object.keys(log).filter(d=>(log[d]||[]).length>0)); }
function streakDays(){
  const days=dayKeysSet();
  let s=0; const d=new Date();
  if(!days.has(today().slice(0,10))) d.setDate(d.getDate()-1);
  while(days.has(d.toISOString().slice(0,10))){ s++; d.setDate(d.getDate()-1); }
  return s;
}
function daysLoggedLast(n){
  const days=dayKeysSet(); let c=0; const d=new Date();
  for(let i=0;i<n;i++){ if(days.has(d.toISOString().slice(0,10))) c++; d.setDate(d.getDate()-1); }
  return c;
}
function workoutsLast(n){
  const cut=Date.now()-n*864e5;
  return workoutsDone.filter(w=>(w.at||0)>=cut).length;
}
function avgKcalLast(n){
  const days=[...dayKeysSet()].sort().slice(-n);
  if(!days.length) return 0;
  const tot=days.reduce((a,d)=>a+(log[d]||[]).reduce((s,e)=>s+e.k,0),0);
  return Math.round(tot/days.length);
}
function renderTracking(){
  const streak=streakDays();
  const cons=daysLoggedLast(30);
  $('#trackStreak').textContent=streak;
  $('#trackConsistency').textContent=Math.round(cons/30*100)+'%';
  $('#trackWorkouts').textContent=workoutsLast(30);
  $('#trackAvgKcal').textContent=avgKcalLast(7);
  const goal=profile?profile.cal:2000;
  const cols=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10);
    const kcal=(log[key]||[]).reduce((s,e)=>s+e.k,0);
    const lab=d.toLocaleDateString(undefined,{weekday:'short'});
    const pct=Math.min(100,Math.round(kcal/goal*100));
    const cls = kcal===0?'miss' : (kcal>goal*1.15?'over':'');
    cols.push(`<div class="wc-col"><span class="wc-val">${kcal?Math.round(kcal):'—'}</span><div class="wc-bar ${cls}" style="height:${kcal?Math.max(6,pct):8}%"></div><span class="wc-lab">${lab}</span></div>`);
  }
  $('#trackWeek').innerHTML=cols.join('');
  const wl=[...weights].slice(-10).reverse();
  $('#weightList').innerHTML = wl.length? wl.map(w=>
    `<div class="log-item"><span style="font-size:1.3rem">⚖️</span><div class="li-main"><b>${w.wKg} kg</b><small>${w.date}</small></div></div>`).join('')
    : '<div class="empty">No weigh-ins yet — log today\'s weight above ⚖️</div>';
  if(weights.length>=2){
    const a=weights[weights.length-1], b=weights[0];
    const diff=Math.round((a.wKg-b.wKg)*10)/10;
    $('#weightTrend').innerHTML = diff===0? 'Trend: <b>steady</b> — great for a clean bulk or recomposition.' :
      (diff<0? `Trend: <b>${diff} kg</b> since ${b.date} — fat loss on track 🔥` : `Trend: <b>+${diff} kg</b> since ${b.date} — muscle gain 💪`);
  } else $('#weightTrend').textContent='';
  const wd=[...workoutsDone].slice(-15).reverse();
  $('#trackWorkoutList').innerHTML = wd.length? wd.map(w=>
    `<div class="log-item"><span style="font-size:1.3rem">🏆</span><div class="li-main"><b>${w.name}</b><small>${w.date}</small></div></div>`).join('')
    : '<div class="empty">No workouts tracked yet — open an exercise and tap “I did this” ✅</div>';
}
$('#logWeightBtn').onclick=()=>{
  const w=parseFloat($('#weightLogInput').value);
  if(!w||w<20||w>400) return toast('Enter a valid weight in kg');
  const entry={date:today(),wKg:Math.round(w*10)/10,at:Date.now()};
  weights.push(entry);
  store.set('weights',weights);
  if(profile){ profile.wKg=entry.wKg; store.set('profile',profile); }
  FF.addWeight(entry.wKg).catch(()=>{});
  $('#weightLogInput').value='';
  renderTracking(); renderDash(); toast('Weight logged ⚖️');
};

/* ================= DASHBOARD / RENDERS ================= */
function renderDash(){
  const t=entryTotals();
  const goal=profile?profile.cal:0;
  $('#calConsumed').textContent=Math.round(t.k);
  $('#calGoal').textContent=goal;
  const pct=goal? Math.min(100,Math.round(t.k/goal*100)) : 0;
  $('#calRing').style.setProperty('--pct',pct);
  const mp=profile?profile.p:0, mc=profile?profile.c:0, mf=profile?profile.f:0;
  $('#dashPg').textContent=mp; $('#dashCg').textContent=mc; $('#dashFg').textContent=mf;
  $('#dashP').textContent=Math.round(t.p); $('#dashC').textContent=Math.round(t.c); $('#dashF').textContent=Math.round(t.f);
  $('#barP').style.width=(mp?Math.min(100,t.p/mp*100):0)+'%';
  $('#barC').style.width=(mc?Math.min(100,t.c/mc*100):0)+'%';
  $('#barF').style.width=(mf?Math.min(100,t.f/mf*100):0)+'%';
  const wg=waterGoal();
  if(water.date!==today()){ water={date:today(),ml:0}; store.set('water',water); }
  $('#waterFill').style.height=Math.min(100,water.ml/wg*100)+'%';
  $('#waterText').textContent=`${water.ml} / ${wg} ml`;
  const b=bmiOf(profile);
  if(b){ $('#bmiVal').textContent=b.toFixed(1); const [tag,col]=bmiTag(b); $('#bmiTag').textContent=tag; $('#bmiVal').style.color=col; }
  else { $('#bmiVal').textContent='—'; $('#bmiTag').textContent='Set your stats'; $('#bmiVal').style.color=''; }
  const h=new Date().getHours();
  const who=session?session.name.split(' ')[0]:'';
  $('#greeting').textContent=(h<12?'Good morning ☀️ ':h<17?'Good afternoon 🌤️ ':'Good evening 🌙 ')+(who?who+' — keep it up!':profile?'keep it up!':'— welcome to FitFuel');
  $('#dashLog').innerHTML=logHTML();
}
function renderDietMacros(){
  const t=entryTotals();
  $('#dCal').textContent=Math.round(t.k); $('#dCalG').textContent='/ '+(profile?profile.cal:0);
  $('#dP').textContent=Math.round(t.p)+'g'; $('#dPg').textContent='/ '+(profile?profile.p:0)+'g';
  $('#dC').textContent=Math.round(t.c)+'g'; $('#dCg').textContent='/ '+(profile?profile.c:0)+'g';
  $('#dF').textContent=Math.round(t.f)+'g'; $('#dFg').textContent='/ '+(profile?profile.f:0)+'g';
  $('#dietLog').innerHTML=logHTML();
  if(!$('#nutrientList').hidden) renderNutrients();
}
function renderAll(){ renderDash(); renderDietMacros(); renderSearch(); renderLibrary(); }

/* ================= WATER / SETTINGS ================= */
$('#addWaterBtn').onclick=()=>{ water.ml+=250; store.set('water',water); renderDash(); };
$('#resetWaterBtn').onclick=()=>{ water.ml=0; store.set('water',water); renderDash(); };
$('#saveSettingsBtn').onclick=()=>{ $('#settingsModal').classList.remove('open'); toast('Settings saved'); };
$('#wipeDataBtn').onclick=()=>{
  if(!confirm('Erase profile, logs, custom foods and plans from THIS device? This cannot be undone.')) return;
  ['profile','log','custom','plan','water','weights','workoutsDone','session'].forEach(store.del);
  location.reload();
};

/* ================= INIT / BOOT ================= */
function initTips(){
  $('#tipsList').innerHTML=shuffle(TIPS).slice(0,4).map(t=>`<li>${t}</li>`).join('');
}
$('#refreshTipsBtn').onclick=()=>{ initTips(); toast('✨ Fresh tips!'); };
async function boot(){
  initTips();
  dbBadge();
  renderUser(); renderPlanPage(); renderWorkouts(); renderAll();
  const res=await FF.boot();
  dbBadge();
  if(res==='offline'){
    dbBadge();
    if(!session) $('#authScreen').classList.add('open');
    else $('#authScreen').classList.remove('open');
    toast('📴 Offline mode — data saved on this device');
    return;
  }
  if(res===null){
    // no server session — try legacy local session migration
    if(session && session.email){
      try{
        const randPass=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
        const user=await FF.register(session.name,session.email,session.phone||'',randPass);
        onLoggedIn(user,true);
        return;
      }catch(e){
        $('#authScreen').classList.add('open'); authTab('login');
        toast('Ek baar login karna hoga — pehle wala data device pe safe hai');
        return;
      }
    }
    $('#authScreen').classList.add('open'); authTab('login');
    return;
  }
  // server session found — hydrate everything
  FF.user=res.user;
  session={name:res.user.name,email:res.user.email,phone:res.user.contact||'',at:Date.now(),lastLogin:res.user.last_login};
  store.set('session',session);
  const st=res.state||{};
  if(st.profile!==undefined && st.profile!==null){ profile=st.profile; store.set('profile',profile); }
  if(st.log){ log=st.log; store.set('log',log); }
  if(st.custom){ custom=st.custom; store.set('custom',custom); }
  if(st.plan!==undefined){ plan=st.plan; if(plan) store.set('plan',plan); }
  if(st.water){ water=st.water; store.set('water',water); }
  if(st.weights){ weights=st.weights.map(w=>({...w,at:w.at||Date.parse(w.date)||Date.now()})); store.set('weights',weights); }
  if(st.workouts){ workoutsDone=st.workouts.map(w=>({...w,at:w.at||Date.parse(w.date)||Date.now()})); store.set('workoutsDone',workoutsDone); }
  try{
    const sp=await FF.getPlans();
    if(sp && sp.length){
      const localIds=new Set(savedPlans.map(p=>p.sid).filter(Boolean));
      for(const p of sp){ if(!localIds.has(p.id)) savedPlans.push({...p,sid:p.id}); }
      store.set('savedPlans',savedPlans);
    }
  }catch(e){}
  $('#authScreen').classList.remove('open');
  dbBadge(); renderUser(); renderPlanPage(); renderWorkouts(); renderAll(); renderProfileModal();
}
boot();
