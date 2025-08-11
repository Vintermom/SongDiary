const tr = {
  th: {
    appName: 'จดบันทึก | Song Diary',
    addNew: '+ จดบันทึกเพลงใหม่',
    edit: 'แก้ไข',
    remove: 'ลบ',
    lastEdited: 'แก้ไขล่าสุด',
    createdAt: 'บันทึกเพลงเมื่อ',
    home: 'หน้าแรก',
    editor: 'เพิ่ม/แก้ไขเพลง (โหมดโปร)',
    songTitle: 'ชื่อเพลง',
    songKey: 'คีย์เพลง',
    mood: 'อารมณ์เพลง (เช่น 😊 / 🎧)',
    section: 'ท่อนเพลง',
    insert: 'แทรก',
    lyrics: 'เนื้อเพลง',
    notes: 'บันทึกของเพลง (ส่วนตัว)',
    timestamp: 'วัน–เวลาบันทึก (Local)',
    copyLyrics: 'คัดลอกเนื้อเพลง',
    savePDF: 'บันทึกเป็น PDF',
    print: 'พิมพ์',
    shareEmail: 'แชร์ไปอีเมล',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    confirmDelete: 'ลบบันทึกนี้หรือไม่?',
    language: 'ภาษา',
    theme: 'โหมดสี',
    light: 'ครีม–น้ำตาล',
    dark: 'อบอุ่น–ดำ',
    sampleLoaded: 'สร้างเพลงตัวอย่างแล้ว',
    updated: 'อัปเดตแล้ว',
    instrument: 'เครื่องดนตรี (Solo)'
  },
  en: {
    appName: 'Song Diary',
    addNew: '+ New Song Note',
    edit: 'Edit',
    remove: 'Delete',
    lastEdited: 'Last edited',
    createdAt: 'Created',
    home: 'Home',
    editor: 'Add/Edit Song (Pro Mode)',
    songTitle: 'Song Title',
    songKey: 'Song Key',
    mood: 'Mood (e.g., 😊 / 🎧)',
    section: 'Section',
    insert: 'Insert',
    lyrics: 'Lyrics',
    notes: 'Notes (private)',
    timestamp: 'Local Timestamp',
    copyLyrics: 'Copy Lyrics',
    savePDF: 'Save as PDF',
    print: 'Print',
    shareEmail: 'Share via Email',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Delete this note?',
    language: 'Language',
    theme: 'Theme',
    light: 'Cream–Brown',
    dark: 'Warm–Black',
    sampleLoaded: 'Sample song created',
    updated: 'Updated',
    instrument: 'Instrument (Solo)'
  }
};

export function getLang() {
  return localStorage.getItem('lang') || (navigator.language?.startsWith('th') ? 'th' : 'en');
}
export function setLang(lang) {
  localStorage.setItem('lang', lang);
}
export function t(lang, key) { return tr[lang][key] || key; }
export const SECTIONS = ['Intro','Hook','Verse 1','Verse 2','Verse 3','Solo','Outro'];
export const KEYS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','Bm','Em'];
export const INSTRUMENTS = ['Guitar','Piano','Violin','Saxophone','Flute','Synth'];
