const LS_KEY = 'song-diary-notes-v2';

export function listNotes() {
  const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  // sort by 'order' then updatedAt desc as fallback
  return arr.sort((a,b)=> (a.order??0)-(b.order??0) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
export function setAllNotes(arr){
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}
export function saveNote(note) {
  const arr = listNotes();
  const idx = arr.findIndex(n => n.id === note.id);
  if (idx >= 0) arr[idx] = note; else { note.order = arr.length; arr.push(note); }
  setAllNotes(arr);
}
export function getNote(id) {
  return listNotes().find(n => n.id === id);
}
export function deleteNote(id) {
  const arr = listNotes().filter(n => n.id !== id);
  // reindex order
  arr.forEach((n,i)=> n.order = i);
  setAllNotes(arr);
}
export function reorderNotes(idsInOrder){
  const arr = listNotes();
  const map = new Map(arr.map(n=>[n.id,n]));
  const newArr = idsInOrder.map((id,i)=> ({...map.get(id), order:i})).filter(Boolean);
  setAllNotes(newArr);
}
export function ensureSample(lang) {
  if (listNotes().length) return false;
  const now = new Date().toISOString();
  const note = {
    id: crypto.randomUUID(),
    title: lang==='th' ? 'วันสดใสในฤดูร้อน' : 'Summer Pop Day',
    penName: 'Vintermom',
    mood: lang==='th' ? 'สดใส 😊' : 'Bright 😊',
    lyrics: '[Intro]\nLa-la sunshine day...\n\n[Hook]\nFeel the rhythm...',
    notes: lang==='th' ? 'ตัวอย่างเพลง Pop สดใส' : 'Sample bright pop song',
    createdAt: now,
    updatedAt: now,
    order: 0
  };
  saveNote(note);
  return true;
}
