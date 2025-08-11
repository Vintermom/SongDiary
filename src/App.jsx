import React, { useEffect, useMemo, useState } from 'react';
import { t, getLang, setLang, SECTIONS, INSTRUMENTS } from './i18n.js';
import { listNotes, saveNote, deleteNote, getNote, ensureSample, reorderNotes } from './storage.js';

const APP_VERSION = '1.0.0';

function useLang() {
  const [lang, setL] = useState(getLang());
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    const s = localStorage.getItem('theme');
    if (s === 'dark') document.documentElement.classList.add('dark');
  }, []);
  return {
    lang,
    setLang: (v) => { setLang(v); setL(v); },
    t: (key) => t(lang, key)
  };
}

function Header({ langApi, onHome, onNew, query, setQuery }) {
  const { lang, setLang, t } = langApi;
  const [isDark, setIsDark] = React.useState(() =>
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  );
  function applyTheme(dark){
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDark(dark);
  }
  function toggleTheme(){ applyTheme(!isDark); }

  return (
    <div className="header-card">
      <div>
        <div className="brand">{t('appName')}</div>
        <div className="slogan">{t('slogan')} • <span className="small-muted">{t('version')} {APP_VERSION}</span></div>
      </div>
      <div className="toolbar">
        <input className="input" style={{minWidth:200}} placeholder={t('search')} value={query} onChange={e=>setQuery(e.target.value)} />
        <select className="select" value={lang} onChange={(e)=>setLang(e.target.value)} aria-label={t('language')}>
          <option value="th">ไทย</option>
          <option value="en">English</option>
        </select>
        <button className="button" onClick={toggleTheme} aria-label={t('theme')}>
          {isDark ? t('themeLight') : t('themeDark')}
        </button>
        <button className="button primary" onClick={onNew}>{t('addNew')}</button>
        <button className="button" onClick={onHome}>{t('home')}</button>
      </div>
    </div>
  );
}

function Home({ langApi, onEdit }) {
  const { t, lang } = langApi;
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const isNew = ensureSample(lang);
    setNotes(listNotes());
    if (isNew) toast(t('sampleLoaded'));
  }, [lang]);

  const filtered = notes.filter(n => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (n.title||'').toLowerCase().includes(q) || (n.penName||'').toLowerCase().includes(q);
  });

  // Drag & drop
  const [dragId, setDragId] = useState(null);
  function onDragStart(id){ setDragId(id); }
  function onDragOver(e){ e.preventDefault(); }
  function onDrop(targetId){
    if (!dragId || dragId===targetId) return;
    const ids = [...filtered];
    const arr = notes.map(n=>n.id);
    const from = arr.indexOf(dragId);
    const to = arr.indexOf(targetId);
    if (from<0 || to<0) return;
    const newArr = [...arr];
    const [m] = newArr.splice(from,1);
    newArr.splice(to,0,m);
    reorderNotes(newArr);
    setNotes(listNotes());
  }

  return (
    <div>
      <Header langApi={langApi} onHome={()=>{}} onNew={()=>onEdit(null)} query={query} setQuery={setQuery} />
      <div className="grid cards">
        {filtered.map(n => {
          const created = n.createdAt || n.updatedAt;
          const edited  = n.updatedAt;
          const label   = (!edited || edited === created) ? t('createdAt') : t('lastEdited');
          const when    = new Date((edited || created)).toLocaleString();
          return (
            <div className="card" key={n.id} draggable onDragStart={()=>onDragStart(n.id)} onDragOver={onDragOver} onDrop={()=>onDrop(n.id)}>
              <div className="title">
                <span className="handle">☰</span>{' '}
                {n.title} {n.penName ? <span className="small-muted">• {n.penName}</span> : null}
              </div>
              <div className="muted">{label}: {when}</div>
              <div className="nav">
                <button className="button" onClick={()=>onEdit(n.id)}>{t('edit')}</button>
                <button className="button danger" onClick={()=>{ if (confirm(t('confirmDelete'))) { deleteNote(n.id); setNotes(listNotes()); }}}>{t('remove')}</button>
              </div>
            </div>
          );
        })}
      </div>
      <hr className="sep" />
      <button className="button primary" onClick={()=>onEdit(null)}>{t('addNew')}</button>
    </div>
  );
}

function Editor({ langApi, id, onHome }){
  const { t, lang } = langApi;
  const existing = id ? getNote(id) : null;
  const [title, setTitle] = useState(existing?.title || '');
  const [penName, setPenName] = useState(existing?.penName || '');
  const [mood, setMood] = useState(existing?.mood || '');
  const [lyrics, setLyrics] = useState(existing?.lyrics || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [section, setSection] = useState('Intro');
  const [instrument, setInstrument] = useState(existing?.instrument || 'Guitar');

  useEffect(()=>{ window.scrollTo({ top:0, behavior:'smooth' }); },[]);

  const timestamp = useMemo(()=> new Date().toLocaleString(), [title, penName, lyrics, mood, instrument, notes]);

  function insertSection() {
    const special = ['Intro','Solo','Riff'];
    const label = special.includes(section) ? `[${section}: ${instrument}]` : `[${section}]`;
    setLyrics(prev => (prev ? prev + '\n' : '') + label + '\n');
  }

  function onSave(){
    const now = new Date().toISOString();
    const data = {
      id: existing?.id || crypto.randomUUID(),
      title, penName, mood, lyrics, notes, instrument,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      order: existing?.order ?? undefined
    };
    saveNote(data);
    toast(t('updated'));
    onHome();
  }

  function copyLyrics(){
    navigator.clipboard.writeText(lyrics);
    toast('Copied');
  }

  function printPDF(){
    const w = window.open('', '_blank');
    const titleTxt = title || 'Untitled';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${titleTxt}</title>
      <style>
        body { font-family: 'Sarabun','Noto Sans Thai', Arial, sans-serif; padding: 24px; }
        h1 { margin: 0 0 8px; }
        .muted { color:#666; font-size:12px; margin-bottom: 16px; }
        pre { white-space: pre-wrap; word-break: break-word; }
      </style></head><body>
      <h1>${titleTxt}</h1>
      <div class="muted">${t('timestamp')}: ${new Date().toLocaleString()}</div>
      <pre>${(lyrics||'').replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</pre>
      </body></html>`;
    w.document.write(html);
    w.document.close(); w.focus(); w.print();
  }

  function shareEmail(){
    const subject = encodeURIComponent(title || 'Song Note');
    const body = encodeURIComponent(`${t('mood')}: ${mood}\n${t('lyrics')}\n\n${lyrics}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="grid" style={{gap:12}}>
      <div className="header-card" style={{marginTop:4}}>
        <div>
          <div className="brand">{t('editor')}</div>
          <div className="slogan">{t('slogan')} • <span className="small-muted">{t('version')} {APP_VERSION}</span></div>
        </div>
      </div>

      <label>
        {t('songTitle')}
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder={lang==='th'?'ใส่ชื่อเพลง':'Song title'} />
      </label>

      <div className="grid two">
        <label>
          {t('penName')}
          <input className="input" value={penName} onChange={e=>setPenName(e.target.value)} placeholder={lang==='th'?'เช่น นามปากกา':'e.g., pen name'} />
        </label>
        <label>
          {t('mood')}
          <input className="input" value={mood} onChange={e=>setMood(e.target.value)} placeholder={lang==='th'?'เช่น สดใส 😊':'e.g., bright 😊'} />
        </label>
      </div>

      <div className="grid two" style={{alignItems:'end'}}>
        <label>
          {t('section')}
          <select className="select" value={section} onChange={e=>setSection(e.target.value)}>
            {SECTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        {['Intro','Solo','Riff'].includes(section) && (
          <label>
            {t('instrument')}
            <select className="select" value={instrument} onChange={e=>setInstrument(e.target.value)}>
              {INSTRUMENTS.map(i => <option key={i}>{i}</option>)}
            </select>
          </label>
        )}
        <label>
          &nbsp;
          <button className="button" onClick={insertSection}>{t('insert')}</button>
        </label>
      </div>

      <label>
        {t('lyrics')}
        <textarea className="textarea" value={lyrics} onChange={e=>setLyrics(e.target.value)} placeholder={lang==='th'?'พิมพ์เนื้อเพลงที่นี่...':'Type lyrics here...'} />
      </label>

      <label>
        {t('notes')}
        <textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder={lang==='th'?'บันทึกเพิ่มเติม...':'Additional notes...'} />
      </label>

      <div>{t('timestamp')}: {timestamp}</div>

      <div className="toolbar">
        <button className="button" onClick={copyLyrics}>{t('copyLyrics')}</button>
        <button className="button" onClick={printPDF}>{t('savePDF')}</button>
        <button className="button" onClick={()=>window.print()}>{t('print')}</button>
        <button className="button" onClick={shareEmail}>{t('shareEmail')}</button>
        <button className="button primary" onClick={onSave}>{t('save')}</button>
        <button className="button" onClick={onHome}>{t('cancel')}</button>
      </div>
    </div>
  );
}

function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, { position:'fixed', left:'50%', bottom:'24px', transform:'translateX(-50%)', background:'#000', color:'#fff', padding:'10px 14px', borderRadius:'12px', opacity:'0.94', zIndex:9999, boxShadow:'0 6px 24px rgba(0,0,0,.25)' });
  document.body.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 1800);
}

export default function App(){
  const langApi = useLang();
  const [view, setView] = useState('home');
  const [editId, setEditId] = useState(null);

  function goHome(){ setView('home'); setEditId(null); }
  function goNew(){ setView('editor'); setEditId(null); }
  function goEdit(id){ setView('editor'); setEditId(id); }

  return (
    <div className="app">
      {view === 'home' && <Home langApi={langApi} onEdit={goEdit} />}
      {view === 'editor' && <Editor langApi={langApi} id={editId} onHome={goHome} />}
    </div>
  );
}
