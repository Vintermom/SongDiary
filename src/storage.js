const LS_KEY = 'song-diary-notes-v1';

export function listNotes() {
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
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
    title_th: 'วันสดใสในฤดูร้อน',
    title_en: 'Summer Pop Day',
    key: 'C',
    mood: 'สดใส 😊',
    sections: {
      'Intro': 'แดดอุ่น ๆ กับลมเบา ๆ วันนี้คือวันสดใส',
      'Hook': 'ฮัมไปกับจังหวะใจ Sunshine on my way',
      'Verse 1': 'เช้าสดใส ใจลอยไปกับท้องฟ้า',
      'Verse 2': 'เสียงหัวเราะเบา ๆ ของเธออยู่ในอากาศ',
      'Verse 3': 'เก็บทุกยิ้มไว้ในเพลงของเรา',
      'Solo': 'Guitar solo 8 bars',
      'Outro': 'ให้วันดี ๆ ยังคงดังอยู่ในหัวใจ'
    },
    lyrics_th: 'Intro...\nHook...\nVerse 1...\nVerse 2...\nVerse 3...\nSolo (Guitar)...\nOutro...',
    lyrics_en: 'Intro...\nHook...\nVerse 1...\nVerse 2...\nVerse 3...\nSolo (Guitar)...\nOutro...',
    notes: 'ตัวอย่างเพลง Pop สดใส',
    instrument: 'Guitar',
    createdAt: now,
    updatedAt: now
  };
  saveNote(note);
  return true;
}
