const LS_KEY='song-diary-notes-v2';
export function listNotes(){ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }
export function saveNote(note){ const arr=listNotes(); const i=arr.findIndex(n=>n.id===note.id); if(i>=0) arr[i]=note; else arr.unshift(note); localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
export function getNote(id){ return listNotes().find(n=>n.id===id); }
export function deleteNote(id){ const arr=listNotes().filter(n=>n.id!==id); localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
export function ensureSample(){ if(listNotes().length) return false; const now=new Date().toISOString(); const note={ id:crypto.randomUUID(), title:'วันสดใสในฤดูร้อน', penName:'Vinter', mood:'สดใส', lyrics:'Intro — Riff (Guitar)\nHook\nVerse 1\nPre-Chorus\nHook\nVerse 2\nBridge\nRap\nSolo (Guitar)\nOutro', notes:'ตัวอย่างเพลง Pop สดใส', updatedAt:now }; saveNote(note); return true; }
