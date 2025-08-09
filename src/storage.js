const KEY='song-diary-notes-v1';
export const list=()=>JSON.parse(localStorage.getItem(KEY)||'[]');
export const save=(n)=>{const a=list();const i=a.findIndex(x=>x.id===n.id);if(i>=0)a[i]=n;else a.unshift(n);localStorage.setItem(KEY,JSON.stringify(a));};
export const del=(id)=>localStorage.setItem(KEY,JSON.stringify(list().filter(n=>n.id!==id)));
export const sample=()=>{if(list().length)return false;save({id:crypto.randomUUID(),title:'Summer Pop Day',updatedAt:new Date().toISOString()});return true;};
