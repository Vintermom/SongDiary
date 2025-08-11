import React, { useEffect, useMemo, useState } from 'react';
import { t, getLang, setLang, SECTIONS, INSTRUMENTS, tr } from './i18n.js';
import { listNotes, saveNote, deleteNote, getNote, ensureSample, overwriteOrder } from './storage.js';

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

function Header({ langApi, onHome, onNew }) {
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
  return (
    <div>
      <div className="header-card">
        <div className="brand">{lang==='th' ? 'จดบันทึก | Song Diary' : 'Song Diary'}</div>
        <div className="slogan">{tr[lang].slogan}</div>
        <div className="small-muted">Version {APP_VERSION}</div>
      </div>
      <div className="header" style={{gap:12, justifyContent:'space-between'}}>
        <div className="toolbar">
          <select className="select" value={lang} onChange={(e)=>setLang(e.target.value)} aria-label={t('language')}>
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
          <button className="button" onClick={()=>applyTheme(!isDark)} aria-label={t('theme')}>
            {isDark ? t('light') : t('dark')}
          </button>
        </div>
        <div className="toolbar">
          <button className="button primary" onClick={onNew}>{t('addNew')}</button>
          <button className="button" onClick={onHome}>{t('home')}</button>
        </div>
      </div>
    </div>
  );
}

function Home({ langApi, onEdit }) {
  const { t, lang } = langApi;
  const [notes, setNotes] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const isNew = ensureSample(lang);
    setNotes(listNotes());
    if (isNew) toast(t('sampleLoaded'));
  }, [lang]);

  function onDragStart(e, idx){
    e.dataTransfer.setData('text/plain', String(idx));
    e.currentTarget.classList.add('dragging');
  }
  function onDragEnd(e){
    e.currentTarget.classList.remove('dragging');
  }
  function onDragOver(e){ e.preventDefault(); }
  function onDrop(e, idx){
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(from) || from === idx) return;
    const arr = [...notes];
    const [moved] = arr.splice(from,1);
    arr.splice(idx,0,moved);
    overwriteOrder(arr);
    setNotes(arr);
  }

  const filtered = notes.filter(n => {
    const title = n.title || n.title_th || n.title_en || '';
    const pen = n.penName || '';
    const hay = (title + ' ' + pen).toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="searchbar">
        <input className="input" placeholder={t('search')} value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="grid cards">
        {filtered.map((n, idx) => {
          const created = n.createdAt || n.updatedAt;
          const edited  = n.updatedAt;
          const label   = (!edited || edited === created) ? t('createdAt') : t('lastEdited');
          const when    = new Date((edited || created)).toLocaleString();
          const title = n.title || (lang === 'th' ? (n.title_th || n.title_en) : (n.title_en || n.title_th));
          return (
            <div className="card"
              key={n.id}
              draggable
              onDragStart={(e)=>onDragStart(e, idx)}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={(e)=>onDrop(e, idx)}
            >
              <div className="title">{title}</div>
              <div className="muted">{label}: {when}</div>
              {n.penName && <div className="muted">{t('penName')}: {n.penName}</div>}
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
  const [title, setTitle] = useState(existing?.title || existing?.title_th || existing?.title_en || '');
  const [penName, setPenName] = useState(existing?.penName || '');
  const [mood, setMood] = useState(existing?.mood || '');
  const [lyrics, setLyrics] = useState(existing?.lyrics || existing?.lyrics_th || existing?.lyrics_en || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [section, setSection] = useState('Intro');
  const [instrument, setInstrument] = useState(existing?.instrument || 'Guitar');
  const [saved, setSaved] = useState(false);

  useEffect(()=>{ window.scrollTo({ top:0, behavior:'smooth' }); },[]);

  const timestamp = useMemo(()=> new Date().toLocaleString(), [title, lyrics, mood, instrument, notes, penName]);

  function insertSection() {
    let label = `[${section}]`;
    if (section === 'Intro' || section === 'Solo' || section === 'Riff') {
      label = `[${section}: ${instrument}]`;
    }
    setLyrics(prev => (prev ? prev + '\n\n' : '') + label + '\n');
  }

  function onSave(){
    const now = new Date().toISOString();
    const data = {
      id: existing?.id || crypto.randomUUID(),
      title,
      title_th: title, // keep legacy
      title_en: title,
      penName,
      mood,
      lyrics,
      notes,
      instrument,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    saveNote(data);
    setSaved(true);
    setTimeout(()=>setSaved(false), 1300);
    onHome();
  }

  function copyLyrics(){
    navigator.clipboard.writeText(lyrics);
    toast('Copied');
  }

  function printPDF(){
    const w = window.open('', '_blank');
    const titleOut = title || 'Untitled';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${titleOut}</title>
      <style>
        body { font-family: 'Sarabun','Noto Sans Thai', Arial, sans-serif; padding: 24px; }
        h1 { margin: 0 0 8px; }
        .muted { color:#666; font-size:12px; margin-bottom: 16px; }
        pre { white-space: pre-wrap; word-break: break-word; }
      </style></head><body>
      <h1>${titleOut}</h1>
      <div class="muted">${t('timestamp')}: ${new Date().toLocaleString()}</div>
      <pre>${(lyrics||'').replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</pre>
      </body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function shareEmail(){
    const subject = encodeURIComponent(title || 'Song Note');
    const body = encodeURIComponent(`${t('penName')}: ${penName}\n${t('mood')}: ${mood}\n\n${lyrics}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="grid" style={{gap:12}}>
      <h2 className="section-title">{t('editor')}</h2>
      <div className="divider" />

      <label>
        {t('songTitle')}
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder={lang==='th'?'เช่น ฤดูฝนแรก':'e.g., First Rain'} />
      </label>

      <label>
        {t('penName')}
        <input className="input" value={penName} onChange={e=>setPenName(e.target.value)} placeholder={lang==='th'?'เช่น นามปากกาของคุณ':'e.g., your alias'} />
      </label>

      <label>
        {t('mood')}
        <input className="input" value={mood} onChange={e=>setMood(e.target.value)} placeholder={lang==='th'?'สดใส':'Bright'} />
      </label>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
        <label>
          {t('section')}
          <select className="select" value={section} onChange={e=>setSection(e.target.value)}>
            {SECTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        {(section === 'Intro' || section === 'Solo' || section === 'Riff') && (
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

      {saved && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="box">
            <div style={{fontWeight:700, marginBottom:8}}>{t('updated')}</div>
            <button className="button" onClick={()=>setSaved(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, { position:'fixed', left:'50%', bottom:'24px', transform:'translateX(-50%)', background:'#000', color:'#fff', padding:'10px 14px', borderRadius:'999px', opacity:'0.9', zIndex:9999 });
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
      <Header langApi={langApi} onHome={goHome} onNew={goNew} />
      {view === 'home' && <Home langApi={langApi} onEdit={goEdit} />}
      {view === 'editor' && <Editor langApi={langApi} id={editId} onHome={goHome} />}
    </div>
  );
}
