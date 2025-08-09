import React,{useEffect,useState}from'react';
import'./theme.css';import{t,getLang,setLang}from'./i18n.js';import{list,save,del,sample}from'./storage.js';
export default function App(){const[lang,_setL]=useState(getLang());const[items,setItems]=useState([]);
useEffect(()=>{if(sample()){} setItems(list());},[]);
const setL=l=>{setLang(l);_setL(l)};
return(<div className="app">
  <div className="header">
    <div className="brand">{t(lang,'appName')}</div>
    <div>
      <select onChange={e=>setL(e.target.value)} defaultValue={lang}><option value="th">ไทย</option><option value="en">English</option></select>
      <button className="button primary" onClick={()=>{const n={id:crypto.randomUUID(),title:'New song',updatedAt:new Date().toISOString()};save(n);setItems(list());}}>+ Add</button>
    </div>
  </div>
  <div className="grid cards">
    {items.map(n=>(<div className="card" key={n.id}>
      <div style={{fontWeight:700}}>{n.title}</div>
      <div style={{fontSize:12,opacity:.7}}>{t(lang,'lastEdited')}: {new Date(n.updatedAt).toLocaleString()}</div>
      <div><button className="button" onClick={()=>{del(n.id);setItems(list());}}>{t(lang,'remove')}</button></div>
    </div>))}
  </div>
</div>);}
