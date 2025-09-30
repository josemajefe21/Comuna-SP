/* ====== Datos de ejemplo (reemplazar por backend o CMS) ====== */
const NEWS = [
  { id:1, title:"Limpieza integral en Av. San Martín", cat:"Destacadas", text:"Se realizó un operativo de limpieza y despeje de calzada en Av. San Martín.", img:"https://loremflickr.com/600/360/street,cleaning", date:"2025-08-25" },
  { id:2, title:"Vacunación antirrábica gratuita", cat:"Salud", text:"Jornada gratuita de vacunación antirrábica para mascotas.", img:"https://loremflickr.com/600/360/veterinary,vaccination,dog", date:"2025-09-02" },
  { id:3, title:"Taller de huerta urbana", cat:"Cultura y Deportes", text:"Aprendé a iniciar tu propia huerta en casa.", img:"https://loremflickr.com/600/360/urban,garden,vegetables", date:"2025-09-05" },
  { id:4, title:"Señalización vial renovada", cat:"Obras", text:"Colocamos nuevas señales en cruces estratégicos.", img:"https://loremflickr.com/600/360/road,signage,traffic", date:"2025-08-30" },
  { id:5, title:"Colecta solidaria", cat:"Social", text:"Sumate con alimentos no perecederos para familias de la zona.", img:"https://loremflickr.com/600/360/charity,donation,food", date:"2025-09-07" },
];

const WORKS = [
  {
    id: 'w1',
    title: 'Pavimentación Calle Belgrano',
    cover: 'https://loremflickr.com/800/480/road,paving,asphalt',
    summary: 'Mejora de calzada y drenaje pluvial en 6 cuadras.',
    log: [
      { date: '2025-08-15', text: 'Inicio de obra y vallado de seguridad.' },
      { date: '2025-08-25', text: 'Compactación de base y sub-base.' },
      { date: '2025-09-03', text: 'Colado de hormigón en primera cuadra.' }
    ]
  },
  {
    id: 'w2',
    title: 'Iluminación LED Plaza Principal',
    cover: 'https://loremflickr.com/800/480/street,lights,led',
    summary: 'Reemplazo a luminarias LED de bajo consumo.',
    log: [
      { date: '2025-08-20', text: 'Relevamiento de columnas y cableado.' },
      { date: '2025-08-28', text: 'Instalación de 15 artefactos LED.' },
      { date: '2025-09-06', text: 'Pruebas nocturnas y ajuste de fotocélulas.' }
    ]
  },
  {
    id: 'w3',
    title: 'Mejoras Centro de Salud',
    cover: 'https://loremflickr.com/800/480/clinic,health,facility',
    summary: 'Refacción de sala de espera y pediatría.',
    log: [
      { date: '2025-08-18', text: 'Pintura interior y reparación de techos.' },
      { date: '2025-08-27', text: 'Mobiliario nuevo en recepción.' },
      { date: '2025-09-04', text: 'Señalética accesible instalada.' }
    ]
  }
];

const EVENTS = [
  { id:'e1', title:'Fería de Emprendedores', date:'2025-09-12', time:'17:00', place:'Plaza Principal', description:'Espacio para productores locales. Música y sorteos.', form:'https://forms.gle/ejemplo1' },
  { id:'e2', title:'Clínica de Fútbol Infantil', date:'2025-09-20', time:'10:00', place:'Polideportivo', description:'Actividad gratuita para niños de 6 a 12 años.', form:null },
  { id:'e3', title:'Jornada de Vacunación', date:'2025-10-03', time:'09:00', place:'Centro de Salud', description:'Llevá carnet y DNI. Cupos por orden de llegada.', form:'https://forms.gle/ejemplo2' },
];

const SUG_KEY = 'sp_sugerencias_v1';
const CFG_KEY = 'sp_config_v1';
const NEWS_KEY = 'sp_news_v1';
const ORDER_KEY = 'sp_news_order_v1';

/* ====== Utilidades ====== */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const fmt = (d) => new Date(d).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' });
const setVar = (name, value) => document.documentElement.style.setProperty(name, value);
const getCfg = () => { try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch { return {}; } };
const saveCfg = (cfg) => localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
const readFileAsDataUrl = (file) => new Promise((res, rej) => { const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });

// Persistencia de noticias y orden
function getNews(){ try { return JSON.parse(localStorage.getItem(NEWS_KEY)) || []; } catch { return []; } }
function saveNews(items){ localStorage.setItem(NEWS_KEY, JSON.stringify(items)); }
function getOrderCfg(){ try { return JSON.parse(localStorage.getItem(ORDER_KEY)) || { mode: 'date', customIds: [] }; } catch { return { mode: 'date', customIds: [] }; } }
function saveOrderCfg(cfg){ localStorage.setItem(ORDER_KEY, JSON.stringify(cfg)); }

/* ====== Tabs ====== */
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');
    const id = btn.dataset.tab;
    const sections = ['noticias','obras_portada','obras','eventos','contacto','admin'];
    sections.forEach(sec => {
      const el = document.getElementById(sec);
      if (!el) return;
      if (id === 'noticias') {
        el.hidden = !(sec === 'noticias' || sec === 'obras_portada');
      } else {
        el.hidden = sec !== id;
      }
    });
    // Mostrar/ocultar elementos globales en modo Admin
    const footer = document.querySelector('footer');
    const fab = document.querySelector('.fab');
    if (id === 'admin') {
      if (footer) footer.hidden = true;
      if (fab) fab.hidden = true;
    } else {
      if (footer) footer.hidden = false;
      if (fab) fab.hidden = false;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ====== Noticias con filtros ====== */
function buildNewsFilters(){
  const wrap = $('#newsFilters'); if (!wrap) return;
  wrap.innerHTML = '';
  const items = getNews();
  const cats = ['Todas','Destacadas', ...Array.from(new Set(items.map(n => n.cat)))];
  cats.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'pill' + (i===0 ? ' active' : '');
    btn.textContent = c;
    btn.dataset.cat = c;
    btn.addEventListener('click', () => {
      $$('#newsFilters .pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      renderNews(c);
    });
    wrap.appendChild(btn);
  });
}

function buildCategorySelectOptions(){
  const sel = $('#newsCatSelect'); if (!sel) return;
  const items = getNews();
  const set = Array.from(new Set(items.map(n => n.cat))).sort();
  sel.innerHTML = '';
  set.forEach(c => { const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt); });
  const optNew = document.createElement('option'); optNew.value='__new'; optNew.textContent='Crear nueva…'; sel.appendChild(optNew);
}

function applyNewsOrder(items){
  const cfg = getOrderCfg();
  const byDate = [...items].sort((a,b)=> new Date(b.date) - new Date(a.date));
  if (cfg.mode !== 'custom') return byDate;
  const latest = byDate.slice(0, 10);
  const idToItem = new Map(latest.map(n => [String(n.id), n]));
  const ordered = [];
  (cfg.customIds||[]).forEach(id => {
    const it = idToItem.get(String(id));
    if (it) { ordered.push(it); idToItem.delete(String(id)); }
  });
  latest.forEach(n => { if (idToItem.has(String(n.id))) { ordered.push(n); idToItem.delete(String(n.id)); } });
  const rest = byDate.slice(10);
  return ordered.concat(rest);
}

function renderNews(filter='Todas') {
  const list = $('#newsList');
  list.innerHTML = '';
  let items = getNews();
  items = applyNewsOrder(items);
  if (filter !== 'Todas') items = items.filter(n => n.cat === filter || (filter==='Destacadas' && n.cat==='Destacadas'));
  items.forEach(n => {
    const card = document.createElement('article');
    card.className = 'card';
    const cfg = getCfg();
    const override = cfg.newsImgs && cfg.newsImgs[n.id];
    const imgUrl = override || n.img || 'https://loremflickr.com/600/360/city,blue';
    card.innerHTML = `
      <img src="${imgUrl}" alt="${n.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://loremflickr.com/600/360/city,blue';" />
      <div class="card-body">
        <div class="badge">${n.cat} • ${fmt(n.date)}</div>
        <h3 style="margin:0">${n.title}</h3>
        <p style="margin:0;color:var(--muted)">${n.text}</p>
        <div style="display:flex; gap:8px; margin-top:6px">
          <button class="btn secondary" aria-label="Compartir noticia">Compartir</button>
          <button class="btn" aria-label="Leer más">Leer más</button>
        </div>
      </div>
    `;
    card.querySelector('.btn.secondary').addEventListener('click', async () => {
      try {
        await navigator.share({ title:n.title, text:n.text, url: location.href });
      } catch(_) { navigator.clipboard.writeText(location.href); alert('Enlace copiado'); }
    });
    list.appendChild(card);
  });
}

/* ====== Obras con bitácora ====== */
function renderWorks() {
  const wrap = $('#worksList');
  wrap.innerHTML = '';
  WORKS.forEach(w => {
    const card = document.createElement('article');
    card.className = 'card';
    const cfg = getCfg();
    const coverUrl = (cfg.workImgs && cfg.workImgs[w.id]) ? cfg.workImgs[w.id] : w.cover;
    card.innerHTML = `
      <img src="${coverUrl}" alt="${w.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://loremflickr.com/800/480/city,infrastructure';" />
      <div class="card-body work">
        <div class="work-header">
          <div class="work-title">${w.title}</div>
          <span class="badge">${w.summary}</span>
        </div>
        <details open class="work">
          <summary>Bitácora de avances</summary>
          <div class="timeline">
            ${w.log.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(i => `
              <div class="tl-item">
                <div class="when">${fmt(i.date)}</div>
                <div>${i.text}</div>
              </div>`).join('')}
          </div>
        </details>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function renderFeaturedWorks(){
  const list = $('#featuredWorks'); if (!list) return;
  list.innerHTML = '';
  const items = WORKS.slice(0, 3);
  const cfg = getCfg();
  items.forEach(w => {
    const coverUrl = (cfg.workImgs && cfg.workImgs[w.id]) ? cfg.workImgs[w.id] : w.cover;
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${coverUrl}" alt="${w.title}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://loremflickr.com/800/480/city,infrastructure';" />
      <div class="card-body">
        <div class="badge">${w.summary}</div>
        <strong>${w.title}</strong>
      </div>
    `;
    list.appendChild(card);
  });
  const btn = $('#gotoObras'); if(btn){ btn.onclick = ()=>{ 
    // Ir a pestaña Obras
    $$('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    const obrasBtn = Array.from($$('.tab-btn')).find(b=>b.dataset.tab==='obras');
    if(obrasBtn){ obrasBtn.classList.add('active'); obrasBtn.setAttribute('aria-selected','true'); }
    ['noticias','obras_portada','obras','eventos','contacto','admin'].forEach(sec => { const el = document.getElementById(sec); if(!el) return; el.hidden = sec !== 'obras'; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } }
}

/* ====== Calendario ====== */
function drawCalendar(year, month) {
  const root = document.createElement('div');
  const head = document.createElement('div'); head.className='cal-head';
  const prev = document.createElement('button'); prev.className='btn secondary'; prev.textContent='◀';
  const next = document.createElement('button'); next.className='btn secondary'; next.textContent='▶';
  const title = document.createElement('strong'); title.style.fontSize='14px'; title.textContent = new Date(year,month,1).toLocaleDateString('es-AR',{month:'long',year:'numeric'});
  head.append(prev,title,next);

  const grid = document.createElement('div'); grid.className='cal-grid';
  const weekdays = ['L','M','X','J','V','S','D'];
  weekdays.forEach(d => {
    const c = document.createElement('div'); c.className='cal-cell'; c.style.fontWeight='700'; c.style.textAlign='center'; c.textContent=d; grid.appendChild(c);
  });

  const first = new Date(year, month, 1);
  const start = (first.getDay() + 6) % 7; // Lunes=0
  const days = new Date(year, month+1, 0).getDate();

  for (let i=0;i<start;i++) { const c=document.createElement('div'); c.className='cal-cell'; grid.appendChild(c); }

  for (let d=1; d<=days; d++) {
    const dateStr = new Date(year, month, d).toISOString().slice(0,10);
    const cell = document.createElement('div'); cell.className='cal-cell';
    const num = document.createElement('div'); num.className='num'; num.textContent=d; cell.appendChild(num);
    const evs = EVENTS.filter(e => e.date===dateStr);
    if (evs.length) {
      cell.classList.add('has-event');
      const mark = document.createElement('div'); mark.style.position='absolute'; mark.style.right='6px'; mark.style.bottom='6px'; mark.style.width='8px'; mark.style.height='8px'; mark.style.borderRadius='50%'; mark.style.background='var(--brand)'; cell.appendChild(mark);
      cell.addEventListener('click', () => showEventsFor(dateStr));
      cell.title = evs.map(e=>e.title).join(' • ');
    }
    grid.appendChild(cell);
  }

  root.append(head, grid);
  const cal = $('#calendar'); cal.innerHTML=''; cal.appendChild(root);

  prev.addEventListener('click', () => {
    const m = month===0 ? 11 : month-1; const y = month===0 ? year-1 : year; drawCalendar(y,m);
  });
  next.addEventListener('click', () => {
    const m = month===11 ? 0 : month+1; const y = month===11 ? year+1 : year; drawCalendar(y,m);
  });
}

function showEventsFor(dateStr) {
  const list = $('#eventList');
  list.innerHTML = '';
  const items = EVENTS.filter(e => e.date===dateStr).sort((a,b)=>a.time.localeCompare(b.time));
  if (!items.length) { list.innerHTML = '<p style="color:var(--muted)">No hay actividades en esta fecha.</p>'; return; }
  items.forEach(e => {
    const el = document.createElement('div'); el.className='event';
    el.innerHTML = `
      <strong>${e.title}</strong>
      <div class="when">${fmt(e.date)} · ${e.time} · ${e.place}</div>
      <p style="margin:.5em 0">${e.description}</p>
      ${e.form ? `<a class="btn" href="${e.form}" target="_blank" rel="noopener">Inscribirme</a>` : `<span class="badge">Formulario próximamente</span>`}
    `;
    list.appendChild(el);
  });
}

function renderUpcoming() {
  const today = new Date().toISOString().slice(0,10);
  const list = $('#eventList');
  const items = EVENTS.filter(e => e.date >= today).sort((a,b)=> new Date(a.date)-new Date(b.date));
  list.innerHTML = '';
  items.forEach(e => {
    const el = document.createElement('div'); el.className='event';
    el.innerHTML = `
      <strong>${e.title}</strong>
      <div class="when">${fmt(e.date)} · ${e.time} · ${e.place}</div>
      <p style="margin:.5em 0">${e.description}</p>
      ${e.form ? `<a class="btn" href="${e.form}" target="_blank" rel="noopener">Inscribirme</a>` : `<span class="badge">Formulario próximamente</span>`}
    `;
    list.appendChild(el);
  });
}

/* ====== Sugerencias (localStorage demo) ====== */
function getSuggestions(){ try { return JSON.parse(localStorage.getItem(SUG_KEY)) || []; } catch { return []; } }
function saveSuggestions(items){ localStorage.setItem(SUG_KEY, JSON.stringify(items)); }

function renderFeed(){
  const feed = $('#sugFeed');
  const items = getSuggestions().sort((a,b)=> b.ts - a.ts).slice(0,50);
  feed.innerHTML = items.length ? '' : '<p style="color:var(--muted)">Aún no hay sugerencias publicadas.</p>';
  items.forEach(s => {
    const el = document.createElement('div'); el.className='msg';
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px;">
        <strong>${s.area}</strong>
        <small style="color:var(--muted)">${new Date(s.ts).toLocaleString('es-AR')}</small>
      </div>
      <p style="margin:.4em 0">${s.text}</p>
      <small style="color:var(--muted)">${s.name ? 'Por: '+s.name : 'Anónimo'} ${s.contact ? ' • '+s.contact : ''} ${s.address ? ' • '+s.address : ''}</small>
    `;
    feed.appendChild(el);
  });
}

$('#sugForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const item = {
    area: $('#sugArea').value,
    text: $('#sugText').value.trim(),
    name: $('#sugName').value.trim(),
    contact: $('#sugContact').value.trim(),
    address: $('#sugAddress').value.trim(),
    ts: Date.now()
  };
  if (!item.text) return alert('Por favor, escribí la sugerencia.');
  const items = getSuggestions(); items.push(item); saveSuggestions(items);
  e.target.reset();
  renderFeed();
  alert('¡Gracias! Tu sugerencia fue publicada.');
});

/* ====== Compartir y WhatsApp ====== */
$('#shareBtn').addEventListener('click', async ()=>{
  try { await navigator.share({ title: document.title, url: location.href }); }
  catch { await navigator.clipboard.writeText(location.href); alert('Enlace copiado'); }
});
// Editá el número de WhatsApp abajo (formato internacional sin +): 5493810000000
function setWhatsNumber(numStr){ $('#whatsBtn').href = `https://wa.me/${numStr}`; }
// setWhatsNumber('5493810000000'); // ejemplo

/* ====== Panel de Personalización ====== */
function openSettings(){ $('#settingsOverlay').hidden=false; $('#settingsPanel').hidden=false; fillSettingsForm(); }
function closeSettings(){ $('#settingsOverlay').hidden=true; $('#settingsPanel').hidden=true; }
function fillSettingsForm(){
  const cfg = getCfg();
  // Colores
  $('#c_text').value = (cfg.colors && cfg.colors.text) || '#0f172a';
  $('#c_brand').value = (cfg.colors && cfg.colors.brand) || '#29b6f6';
  $('#c_accent').value = (cfg.colors && cfg.colors.accent) || '#ff8a00';
  $('#c_bg_top').value = (cfg.colors && cfg.colors.bgTop) || '#f2f8ff';
  $('#c_bg_mid').value = (cfg.colors && cfg.colors.bgMid) || '#ffffff';
  $('#c_bg_bottom').value = (cfg.colors && cfg.colors.bgBottom) || '#f6fbff';
  // Imágenes
  const nImgs = cfg.newsImgs || {}; const wImgs = cfg.workImgs || {};
  for (let i=1;i<=5;i++){ const prev=$(`#img_prev_${i}`); if(prev){ prev.src= nImgs[i] || NEWS[i-1].img; } }
  ['w1','w2','w3'].forEach((id,idx)=>{ const prev=$(`#img_prev_w${idx+1}`); if(prev){ prev.src= wImgs[id] || WORKS[idx].cover; } })
}
function applyColorVars(cfg){
  const c = cfg.colors || {};
  setVar('--text', c.text || '#0f172a');
  setVar('--brand', c.brand || '#29b6f6');
  setVar('--accent', c.accent || '#ff8a00');
  setVar('--bg-top', c.bgTop || '#f2f8ff');
  setVar('--bg-mid', c.bgMid || '#ffffff');
  setVar('--bg-bottom', c.bgBottom || '#f6fbff');
}
function saveSettings(){
  const prevCfg = getCfg();
  const cfg = {
    colors: {
      text: $('#c_text').value,
      brand: $('#c_brand').value,
      accent: $('#c_accent').value,
      bgTop: $('#c_bg_top').value,
      bgMid: $('#c_bg_mid').value,
      bgBottom: $('#c_bg_bottom').value,
    },
    newsImgs: prevCfg.newsImgs || {},
    workImgs: prevCfg.workImgs || {}
  };
  saveCfg(cfg);
  applyColorVars(cfg);
  renderNews();
  renderWorks();
  fillSettingsForm();
  alert('Cambios guardados');
}
function resetSettings(){ localStorage.removeItem(CFG_KEY); location.reload(); }
$('#openSettings').addEventListener('click', openSettings);
$('#closeSettings').addEventListener('click', closeSettings);
$('#settingsOverlay').addEventListener('click', closeSettings);
$('#saveSettings').addEventListener('click', saveSettings);
$('#resetSettings').addEventListener('click', resetSettings);

// Drag & Drop handlers
function bindDropzone(dz){
  const input = dz.querySelector('input[type="file"]');
  const img = dz.querySelector('img');
  function setPreview(src){ img.src = src; }
  async function handleFiles(files){
    const file = files && files[0]; if(!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    const cfg = getCfg();
    if(dz.dataset.type === 'news'){
      cfg.newsImgs = cfg.newsImgs || {}; cfg.newsImgs[dz.dataset.id] = dataUrl;
    } else {
      cfg.workImgs = cfg.workImgs || {}; cfg.workImgs[dz.dataset.id] = dataUrl;
    }
    saveCfg(cfg);
    setPreview(dataUrl);
    renderNews();
    renderWorks();
  }
  dz.addEventListener('click', ()=> input.click());
  input.addEventListener('change', (e)=> handleFiles(e.target.files));
  dz.addEventListener('dragover', (e)=>{ e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', ()=> dz.classList.remove('dragover'));
  dz.addEventListener('drop', (e)=>{ e.preventDefault(); dz.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
}
$$('.dropzone').forEach(bindDropzone);

/* ====== Admin: carga de noticias y orden ====== */
let pendingImageDataUrl = '';
const imgInput = $('#newsImage');
if (imgInput) {
  imgInput.addEventListener('change', async (e)=>{
    const f = e.target.files && e.target.files[0];
    if (!f) { pendingImageDataUrl=''; const p=$('#newsImagePrev'); if(p) p.src=''; return; }
    pendingImageDataUrl = await readFileAsDataUrl(f);
    const p = $('#newsImagePrev'); if (p) p.src = pendingImageDataUrl;
  });
}

function fillAdminFormDefaults(){
  const d = new Date().toISOString().slice(0,10);
  const di = $('#newsDate'); if (di) di.value = d;
  buildCategorySelectOptions();
  const sel = $('#newsCatSelect'); if (sel) sel.value = sel.options[0] ? sel.options[0].value : '__new';
  const newCat = $('#newsCatNew'); if (newCat) newCat.style.display = sel && sel.value==='__new' ? '' : 'none';
}

const catSel = $('#newsCatSelect');
if (catSel) {
  catSel.addEventListener('change', (e)=>{
    const isNew = e.target.value === '__new';
    const el = $('#newsCatNew'); if (el) el.style.display = isNew ? '' : 'none';
  });
}

const newsForm = $('#newsForm');
if (newsForm) {
  newsForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const title = $('#newsTitle').value.trim();
    const text = $('#newsText').value.trim();
    const date = $('#newsDate').value;
    const selVal = $('#newsCatSelect').value;
    const cat = selVal === '__new' ? $('#newsCatNew').value.trim() : selVal;
    if (!title || !text || !date || !cat) { alert('Completá todos los campos.'); return; }
    const items = getNews();
    const id = Date.now();
    const item = { id, title, text, date, cat, img: pendingImageDataUrl };
    items.push(item);
    saveNews(items);
    pendingImageDataUrl = '';
    e.target.reset();
    fillAdminFormDefaults();
    const p = $('#newsImagePrev'); if (p) p.src='';
    buildNewsFilters();
    const activeCat = (document.querySelector('#newsFilters .pill.active')||{}).dataset?.cat || 'Todas';
    renderNews(activeCat);
    refreshOrderUI();
    alert('Noticia publicada');
  });
}

function buildCustomOrderList(cfg = getOrderCfg()){
  const listEl = $('#customOrderList'); if (!listEl) return;
  listEl.innerHTML = '';
  const news = getNews().sort((a,b)=> new Date(b.date)-new Date(a.date));
  const latest = news.slice(0,10);
  let orderIds = (cfg.customIds && cfg.customIds.length) ? cfg.customIds.filter(id => latest.some(n => String(n.id)===String(id))) : latest.map(n => n.id);
  latest.forEach(n => { if (!orderIds.some(id => String(id)===String(n.id))) orderIds.push(n.id); });
  listEl.dataset.order = JSON.stringify(orderIds);
  orderIds.forEach((id, idx) => {
    const n = latest.find(x => String(x.id)===String(id));
    if (!n) return;
    const row = document.createElement('div'); row.className='msg';
    row.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div><strong>${idx+1}.</strong> ${n.title} <small style=\"color:var(--muted)\">(${fmt(n.date)})</small></div>
        <div style="display:flex; gap:6px">
          <button class="btn secondary" data-act="up" data-id="${n.id}">↑</button>
          <button class="btn secondary" data-act="down" data-id="${n.id}">↓</button>
        </div>
      </div>
    `;
    listEl.appendChild(row);
  });
  listEl.querySelectorAll('button[data-act]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      let ids = JSON.parse(listEl.dataset.order||'[]').map(String);
      const i = ids.indexOf(String(id));
      if (i < 0) return;
      if (btn.dataset.act==='up' && i>0) { const t=ids[i-1]; ids[i-1]=ids[i]; ids[i]=t; }
      if (btn.dataset.act==='down' && i<ids.length-1) { const t=ids[i+1]; ids[i+1]=ids[i]; ids[i]=t; }
      listEl.dataset.order = JSON.stringify(ids);
      buildCustomOrderList({ ...cfg, customIds: ids });
    });
  });
}

function refreshOrderUI(){
  const cfg = getOrderCfg();
  const radios = document.querySelectorAll('input[name="orderMode"]');
  radios.forEach(r => { r.checked = r.value === cfg.mode; });
  const box = $('#customOrderBox'); if (box) box.style.display = cfg.mode==='custom' ? '' : 'none';
  buildCustomOrderList(cfg);
}

document.querySelectorAll('input[name="orderMode"]').forEach(r => {
  r.addEventListener('change', (e) => {
    const mode = e.target.value;
    const cfg = getOrderCfg();
    saveOrderCfg({ ...cfg, mode });
    refreshOrderUI();
    const activeCat = (document.querySelector('#newsFilters .pill.active')||{}).dataset?.cat || 'Todas';
    renderNews(activeCat);
  });
});

const saveOrderBtn = $('#saveOrderBtn');
if (saveOrderBtn) {
  saveOrderBtn.addEventListener('click', () => {
    const listEl = $('#customOrderList'); if (!listEl) return;
    const ids = JSON.parse(listEl.dataset.order||'[]');
    const cfg = getOrderCfg();
    saveOrderCfg({ ...cfg, mode: 'custom', customIds: ids });
    refreshOrderUI();
    const activeCat = (document.querySelector('#newsFilters .pill.active')||{}).dataset?.cat || 'Todas';
    renderNews(activeCat);
    alert('Orden guardado');
  });
}

/* ====== Init ====== */
function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  applyColorVars(getCfg());
  // Semilla inicial de noticias si no hay datos
  if (getNews().length === 0) { saveNews(NEWS); }
  buildNewsFilters();
  renderNews();
  renderWorks();
  renderFeaturedWorks();
  const now = new Date(); drawCalendar(now.getFullYear(), now.getMonth());
  renderUpcoming();
  renderFeed();
  fillAdminFormDefaults();
  refreshOrderUI();
}
init();

