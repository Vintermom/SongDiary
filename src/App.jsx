import React,{useEffect,useMemo,useRef,useState} from 'react';
import { t,getLang,setLang,SECTIONS,INSTRUMENTS } from './i18n.js';
import { listNotes,saveNote,deleteNote,getNote,ensureSample } from './storage.js';
import pkg from '../package.json';

function useLang(){const [lang,setL]=useState(getLang());useEffect(()=>{document.documentElement.lang=lang;},[lang]);useEffect(()=>{const s=localStorage.getItem('theme');if(s==='dark')document.documentElement.classList.add('dark');},[]);return{lang,setLang:(v)=>{setLang(v);setL(v);},t:(k)=>t(lang,k)};}

function Header({langApi,onHome,onNew,onSearch,query}){
  const {lang,setLang,t}=langApi;
  const theme=document.documentElement.classList.contains('dark')?'dark':'light';
  function toggle(){document.documentElement.classList.toggle('dark');localStorage.setItem('theme',document.documentElement.classList.contains('dark')?'dark':'light');}
  return(<div className="header">
    <div className="toolbar">
      <input className="input" style={{minWidth:180}} placeholder={t('search')} value={query} onChange={e=>onSearch(e.target.value)}/>
      <select className="select" value={lang} onChange={e=>setLang(e.target.value)} aria-label={t('language')}><option value="th">ไทย</option><option value="en">English</option></select>
      <button className="button" onClick={toggle} aria-label={t('theme')}>{theme==='dark'?t('light'):t('dark')}</button>
      <button className="button primary" onClick={onNew}>{t('addNew')}</button>
      <button className="button" onClick={onHome}>{t('home')}</button>
    </div>
  </div>);
}

function Home({langApi,onEdit,query}){
  const {t}=langApi;const [notes,setNotes]=useState([]);const dragItem=useRef(null);
  useEffect(()=>{const created=ensureSample();setNotes(listNotes());if(created)toast(t('sampleLoaded'));},[]);
  const filtered=notes.filter(n=>(n.title||'').toLowerCase().includes(query.toLowerCase())||(n.penName||'').toLowerCase().includes(query.toLowerCase()));
  function onDragStart(e,id){dragItem.current=id;e.currentTarget.classList.add('dragging');e.dataTransfer.effectAllowed='move';}
  function onDragEnd(e){e.currentTarget.classList.remove('dragging');dragItem.current=null;}
  function onDrop(e,id){e.preventDefault();const fromId=dragItem.current;if(!fromId||fromId===id)return;const arr=[...notes];const fromIdx=arr.findIndex(n=>n.id===fromId);const toIdx=arr.findIndex(n=>n.id===id);const [moved]=arr.splice(fromIdx,1);arr.splice(toIdx,0,moved);arr.forEach(n=>saveNote(n));setNotes(arr);}
  function onDragOver(e){e.preventDefault();}
  return(<div>
    <div className="grid cards">{filtered.map(n=>(<div className="card" key={n.id} draggable onDragStart={(e)=>onDragStart(e,n.id)} onDragEnd={onDragEnd} onDrop={(e)=>onDrop(e,n.id)} onDragOver={onDragOver}>
      <div className="title">{n.title}</div>
      <div className="muted">{t('lastEdited')}: {new Date(n.updatedAt).toLocaleString(undefined,{timeZoneName:'short'})} ({Intl.DateTimeFormat().resolvedOptions().timeZone})</div>
      <div className="muted">{n.penName||''}</div>
      <div className="nav"><button className="button" onClick={()=>onEdit(n.id)}>{t('edit')}</button><button className="button danger" onClick={()=>{if(confirm(t('confirmDelete'))){deleteNote(n.id);setNotes(listNotes());}}}>{t('remove')}</button></div>
    </div>))}</div>
    <hr className="sep"/>
    <button className="button primary" onClick={()=>onEdit(null)}>{t('addNew')}</button>
  </div>);
}

function Editor({langApi,id,onHome}){
  const {t}=langApi;const existing=id?getNote(id):null;
  const [title,setTitle]=useState(existing?.title||'');const [penName,setPenName]=useState(existing?.penName||'');const [mood,setMood]=useState(existing?.mood||'');const [lyrics,setLyrics]=useState(existing?.lyrics||'');const [notes,setNotes]=useState(existing?.notes||'');
  const [section,setSection]=useState('Intro');const [introType,setIntroType]=useState('Normal');const [instrument,setInstrument]=useState('Guitar');
  useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'});},[]);
  const timestamp=useMemo(()=>{const d=new Date();const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;const s=d.toLocaleString(undefined,{timeZoneName:'short'});return `${s} (${tz})`;},[title,penName,lyrics,mood,notes,section,introType,instrument]);
  function insertSection(){let label=section;if(section==='Intro'){if(introType==='Riff')label=`[Intro - Riff (${instrument})]`;else if(introType==='Instrument')label=`[Intro - Instrument (${instrument})]`;else label='[Intro]';}else if(section==='Solo'){label=`[Solo (${instrument})]`;}else{label=`[${section}]`;} setLyrics(prev=>(prev?prev+'\n':'')+label+'\n');}
  function onSave(){const now=new Date().toISOString();const data={id:existing?.id||crypto.randomUUID(),title,penName,mood,lyrics,notes,updatedAt:now};saveNote(data);showModal(t('updated'));onHome();}
  function copyLyrics(){navigator.clipboard.writeText(lyrics);toast('Copied');}
  function printPDF(){const w=window.open('','_blank');const titleTxt=title||'Untitled';const html=`<!doctype html><html><head><meta charset="utf-8"><title>${titleTxt}</title><style>body{font-family:'Sarabun','Noto Sans Thai',Arial,sans-serif;padding:24px;}h1{margin:0 0 8px;}.muted{color:#666;font-size:12px;margin-bottom:16px;}pre{white-space:pre-wrap;word-break:break-word;}</style></head><body><h1>${titleTxt}</h1><div class="muted">${t('timestamp')}: ${new Date().toLocaleString(undefined,{timeZoneName:'short'})} (${Intl.DateTimeFormat().resolvedOptions().timeZone})</div><pre>${(lyrics||'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]))}</pre></body></html>`;w.document.write(html);w.document.close();w.focus();w.print();}
  function shareEmail(){const subject=encodeURIComponent(title||'Song Note');const body=encodeURIComponent(`${t('mood')}: ${mood}\n\n${lyrics}`);window.location.href=`mailto:?subject=${subject}&body=${body}`;}
  return(<div className="grid" style={{gap:12}}>
    <div className="badge hide-on-print">{t('editor')}</div>
    <label>{t('songTitle')}<input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="เช่น วันสดใสในฤดูร้อน"/></label>
    <label>{t('penName')}<input className="input" value={penName} onChange={e=>setPenName(e.target.value)} placeholder="เช่น Vinter"/></label>
    <label>{t('mood')}<input className="input" value={mood} onChange={e=>setMood(e.target.value)} placeholder="สดใส / เศร้า / แร็ป ..."/></label>
    <div className="grid" style={{gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
      <label>{t('section')}<select className="select" value={section} onChange={e=>setSection(e.target.value)}>{SECTIONS.map(s=><option key={s}>{s}</option>)}</select></label>
      {section==='Intro'&&(<label>{t('introDetail')}<select className="select" value={introType} onChange={e=>setIntroType(e.target.value)}><option>Normal</option><option>Riff</option><option>Instrument</option></select></label>)}
      {((section==='Intro'&&introType!=='Normal')||section==='Solo')?(<label>เครื่องดนตรี<select className="select" value={instrument} onChange={e=>setInstrument(e.target.value)}>{INSTRUMENTS.map(i=><option key={i}>{i}</option>)}</select></label>):<label>&nbsp;<button className="button" onClick={insertSection}>{t('insert')}</button></label>}
      {((section==='Intro'&&introType!=='Normal')||section==='Solo')&&(<label>&nbsp;<button className="button" onClick={insertSection}>{t('insert')}</button></label>)}
    </div>
    <label>{t('lyrics')}<textarea className="textarea" value={lyrics} onChange={e=>setLyrics(e.target.value)} placeholder="พิมพ์เนื้อเพลงที่นี่..."/></label>
    <label>{t('notes')}<textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="บันทึกเพิ่มเติม..."/></label>
    <div>{t('timestamp')}: {timestamp}</div>
    <div className="toolbar"><button className="button" onClick={copyLyrics}>{t('copyLyrics')}</button><button className="button" onClick={printPDF}>{t('savePDF')}</button><button className="button" onClick={()=>window.print()}>{t('print')}</button><button className="button" onClick={shareEmail}>{t('shareEmail')}</button><button className="button primary" onClick={onSave}>{t('save')}</button><button className="button" onClick={onHome}>{t('cancel')}</button></div>
  </div>);
}

function toast(msg){const el=document.createElement('div');el.textContent=msg;el.className='toast';document.body.appendChild(el);setTimeout(()=>el.remove(),1800);}
function showModal(msg){let m=document.getElementById('modal');if(!m){m=document.createElement('div');m.id='modal';m.className='modal';m.innerHTML='<div class="box" id="modal-box"></div>';document.body.appendChild(m);}m.querySelector('#modal-box').textContent=msg;m.classList.add('show');setTimeout(()=>m.classList.remove('show'),1200);}

export default function App(){const langApi=useLang();const [view,setView]=useState('home');const [editId,setEditId]=useState(null);const [query,setQuery]=useState('');
  return(<div className="app">
    <div className="brand-card">
      <div className="title">Song Diary | บันทึกเพลง</div>
      <div className="subtitle">Capture Every Melody | เก็บบันทึกทุกท่วงทำนอง</div>
      <div className="version">Version {pkg.version}</div>
    </div>
    <Header langApi={langApi} onHome={()=>{setView('home');setEditId(null);}} onNew={()=>{setView('editor');setEditId(null);}} onSearch={setQuery} query={query}/>
    {view==='home'&&<Home langApi={langApi} onEdit={(id)=>{setView('editor');setEditId(id);}} query={query}/>}
    {view==='editor'&&<Editor langApi={langApi} id={editId} onHome={()=>{setView('home');setEditId(null);}}/>}
  </div>);
}