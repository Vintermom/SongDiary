const LS_KEY = 'song-diary-notes-v2'; // bump to v2 for new shape

export function listNotes() {
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
}
export function overwriteOrder(newArr){
  localStorage.setItem(LS_KEY, JSON.stringify(newArr));
}
export function saveNote(note) {
  const arr = listNotes();
  const idx = arr.findIndex(n => n.id === note.id);
  if (idx >= 0) arr[idx] = note; else arr.unshift(note);
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}
export function getNote(id) {
  return listNotes().find(n => n.id === id);
}
export function deleteNote(id) {
  const arr = listNotes().filter(n => n.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}
export function ensureSample(lang) {
  if (listNotes().length) return false;
  const now = new Date().toISOString();
  const note = {
    id: crypto.randomUUID(),
    title: 'วันสดใสในฤดูร้อน / Summer Pop Day',
    penName: 'Vintermom',
    mood: 'สดใส 😊',
    lyrics: '[Intro]\nแดดอุ่น ๆ กับลมเบา ๆ วันนี้คือวันสดใส\n\n[Hook]\nฮัมไปกับจังหวะใจ Sunshine on my way\n\n[Verse]\nเช้าสดใส ใจลอยไปกับท้องฟ้า',
    notes: 'ตัวอย่างเพลง Pop สดใส',
    createdAt: now,
    updatedAt: now
  };
  saveNote(note);
  return true;
}
