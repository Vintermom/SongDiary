import React, { useEffect, useMemo, useState } from 'react';
import { t, getLang, setLang, SECTIONS, KEYS, INSTRUMENTS } from './i18n.js';
import { listNotes, saveNote, deleteNote, getNote, ensureSample } from './storage.js';

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
  function toggleTheme(){ applyTheme(!isDark); }

  return (
    <div className="header">
      <div>
        <div className="brand">{t('appName')}</div>
        <div className="small-muted">Version {APP_VERSION}</div>
      </div>
      <div className="toolbar">
        <select className="select" value={lang} onChange={(e)=>setLang(e.target.value)} aria-label={t('language')}>
          <option value="th">ไทย</option>
          <option value="en">English</option>
        </select>
        <button className="button" onClick={toggleTheme} aria-label={t('theme')}>
          {isDark ? t('light') : t('dark')}
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
  useEffect(() => {
    const isNew = ensureSample(lang);
    setNotes(listNotes());
    if (isNew) toast(t('sampleLoaded'));
  }, [lang]);

  return (
    <div>
      <div className="grid cards">
        {notes.map(n => {
          const created = n.createdAt || n.updatedAt;
          const edited  = n.updatedAt;
          const label   = (!edited || edited === created) ? t('createdAt') : t('lastEdited');
          const when    = new Date((edited || created)).toLocaleString();
          return (
            <div className="card" key={n.id}>
              <div className="title">{lang === 'th' ? (n.title_th || n.title_en) : (n.title_en || n.title_th)}</div>
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
  const [titleTH, setTitleTH] = useState(existing?.title_th || '');
  const [titleEN, setTitleEN] = useState(existing?.title_en || '');
  const [keySig, setKeySig] = useState(existing?.key || 'C');
  const [customKey, setCustomKey] = useState('');
  const [mood, setMood] = useState(existing?.mood || '');
  const [lyricsTH, setLyricsTH] = useState(existing?.lyrics_th || '');
  const [lyricsEN, setLyricsEN] = useState(existing?.lyrics_en || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [section, setSection] = useState('Intro');
  const [instrument, setInstrument] = useState(existing?.instrument || 'Guitar');

  useEffect(()=>{ window.scrollTo({ top:0, behavior:'smooth' }); },[]);

  const timestamp = useMemo(()=> new Date().toLocaleString(), [titleTH, titleEN, lyricsTH, lyricsEN, mood, keySig, instrument, notes]);

  function insertSection() {
    const label = section + (section === 'Solo' ? ` (${instrument})` : '');
    const cursorTarget = lang === 'th' ? [lyricsTH, setLyricsTH] : [lyricsEN, setLyricsEN];
    const [val, setter] = cursorTarget;
    setter(val + (val ? '\n' : '') + label + '\n');
  }

  function onSave(){
    const now = new Date().toISOString();
    const data = {
      id: existing?.id || crypto.randomUUID(),
      title_th: titleTH, title_en: titleEN,
      key: customKey || keySig,
      mood, lyrics_th: lyricsTH, lyrics_en: lyricsEN,
      notes, instrument,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    saveNote(data);
    toast(t('updated'));
    onHome();
  }

  function copyLyrics(){
    const text = lang === 'th' ? lyricsTH : lyricsEN;
    navigator.clipboard.writeText(text);
    toast('Copied');
  }

  function printPDF(){
    const w = window.open('', '_blank');
    const title = lang === 'th' ? (titleTH || titleEN) : (titleEN || titleTH) || 'Untitled';
    const content = lang === 'th' ? lyricsTH : lyricsEN;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        body { font-family: 'Sarabun','Noto Sans Thai', Arial, sans-serif; padding: 24px; }
        h1 { margin: 0 0 8px; }
        .muted { color:#666; font-size:12px; margin-bottom: 16px; }
        pre { white-space: pre-wrap; word-break: break-word; }
        .dev-only { display: none; }
      </style></head><body>
      <h1>${title}</h1>
      <div class="muted">${t('songKey')}: ${customKey || keySig} • ${t('timestamp')}: ${new Date().toLocaleString()}</div>
      <pre>${content.replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</pre>
      </body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  function shareEmail(){
    const subject = encodeURIComponent((lang === 'th' ? titleTH : titleEN) || 'Song Note');
    const body = encodeURIComponent(`${t('songKey')}: ${customKey || keySig}\n${t('mood')}: ${mood}\n\n${lang==='th'?lyricsTH:lyricsEN}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  const keyList = customKey ? [customKey, ...KEYS] : KEYS;

  return (
    <div className="grid" style={{gap:12}}>
      <h2 className="section-title">
        {id ? (lang==='th' ? 'แก้ไขเพลง' : 'Edit Song') : (lang==='th' ? 'เพิ่มเพลง' : 'New Song')}
      </h2>
      <div className="divider" />

      <label>
        {t('songTitle')} (TH)
        <input className="input" value={titleTH} onChange={e=>setTitleTH(e.target.value)} placeholder="วันสดใสในฤดูร้อน" />
      </label>
      <label>
        {t('songTitle')} (EN)
        <input className="input" value={titleEN} onChange={e=>setTitleEN(e.target.value)} placeholder="Summer Pop Day" />
      </label>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
        <label>
          {t('songKey')}
          <select className="select" value={keySig} onChange={e=>setKeySig(e.target.value)}>
            {keyList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <label>
          Custom Key
          <input className="input" value={customKey} onChange={e=>setCustomKey(e.target.value)} placeholder="e.g., C#m" />
        </label>
      </div>

      <label>
        {t('mood')}
        <input className="input" value={mood} onChange={e=>setMood(e.target.value)} placeholder={lang==='th'?'สดใส 😊':'Bright 😊'} />
      </label>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
        <label>
          {t('section')}
          <select className="select" value={section} onChange={e=>setSection(e.target.value)}>
            {SECTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        {section === 'Solo' && (
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
        {t('lyrics')} (TH)
        <textarea className="textarea" value={lyricsTH} onChange={e=>setLyricsTH(e.target.value)} placeholder="พิมพ์เนื้อเพลงภาษาไทยที่นี่..." />
      </label>
      <label>
        {t('lyrics')} (EN)
        <textarea className="textarea" value={lyricsEN} onChange={e=>setLyricsEN(e.target.value)} placeholder="Type English lyrics here..." />
      </label>

      <label>
        {t('notes')}
        <textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder={lang==='th'?'บันทึกส่วนตัว...':'Private notes...'} />
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
