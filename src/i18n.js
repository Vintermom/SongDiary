export const tr = {
  th: {
    appName: 'จดบันทึก | Song Diary',
    slogan: 'เก็บบันทึกทุกท่วงทำนอง',
    addNew: '+ เพิ่มเพลงใหม่',
    edit: 'แก้ไข',
    remove: 'ลบ',
    lastEdited: 'แก้ไขล่าสุด',
    createdAt: 'บันทึกเพลงเมื่อ',
    home: 'หน้าแรก',
    editor: 'แก้ไขเพลง',
    songTitle: 'ชื่อเพลง',
    penName: 'นามปากกา',
    mood: 'อารมณ์เพลง',
    section: 'ท่อนเพลง',
    insert: 'แทรก',
    lyrics: 'เนื้อเพลง',
    notes: 'บันทึกเพิ่มเติม',
    timestamp: 'วัน–เวลาบันทึก (Local)',
    copyLyrics: 'คัดลอกเนื้อเพลง',
    savePDF: 'บันทึกเป็น PDF',
    print: 'พิมพ์',
    shareEmail: 'แชร์ไปอีเมล',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    confirmDelete: 'ลบบันทึกนี้หรือไม่?',
    language: 'ภาษา',
    theme: 'ธีม',
    light: 'ธีมสีครีม',
    dark: 'ธีมสีดำ',
    sampleLoaded: 'สร้างเพลงตัวอย่างแล้ว',
    updated: 'บันทึกแล้ว',
    instrument: 'เครื่องดนตรี',
    search: 'ค้นหาเพลง...'
  },
  en: {
    appName: 'Song Diary',
    slogan: 'Capture Every Melody',
    addNew: '+ New Song',
    edit: 'Edit',
    remove: 'Delete',
    lastEdited: 'Last edited',
    createdAt: 'Created',
    home: 'Home',
    editor: 'Edit Song',
    songTitle: 'Title',
    penName: 'Pen name',
    mood: 'Mood',
    section: 'Section',
    insert: 'Insert',
    lyrics: 'Lyrics',
    notes: 'Additional notes',
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
    light: 'Cream theme',
    dark: 'Dark theme',
    sampleLoaded: 'Sample song created',
    updated: 'Saved',
    instrument: 'Instrument',
    search: 'Search songs...'
  }
};

export function getLang() {
  return localStorage.getItem('lang') || (navigator.language?.startsWith('th') ? 'th' : 'en');
}
export function setLang(lang) {
  localStorage.setItem('lang', lang);
}
export function t(lang, key) { return tr[lang][key] || key; }

// Sections (added Pre-Chorus, Bridge, Rap, Riff; use generic 'Verse')
export const SECTIONS = ['Intro','Pre-Chorus','Verse','Bridge','Rap','Hook','Solo','Riff','Outro'];
export const INSTRUMENTS = ['Guitar','Piano','Violin','Saxophone','Flute','Synth','Drums','Bass'];
