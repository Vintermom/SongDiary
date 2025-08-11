const tr = {
  th: {
    appName: 'จดบันทึก | Song Diary',
    slogan: 'เก็บทุกเมโลดี้ให้เป็นเรื่องราว',
    version: 'Version',
    addNew: '+ เพิ่มเพลง',
    edit: 'แก้ไข',
    remove: 'ลบ',
    lastEdited: 'แก้ไขล่าสุด',
    createdAt: 'บันทึกเพลงเมื่อ',
    home: 'หน้าแรก',
    editor: 'จดบันทึกเพลง',
    songTitle: 'ชื่อเพลง',
    penName: 'นามปากกา',
    mood: 'อารมณ์เพลง',
    section: 'ท่อนเพลง',
    insert: 'แทรก',
    lyrics: 'เนื้อเพลง',
    notes: 'บันทึกเพิ่มเติม',
    timestamp: 'วันเวลาบันทึก',
    copyLyrics: 'คัดลอกเนื้อเพลง',
    savePDF: 'บันทึกเป็น PDF',
    print: 'พิมพ์',
    shareEmail: 'แชร์ไปอีเมล',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    confirmDelete: 'ลบบันทึกนี้หรือไม่?',
    language: 'ภาษา',
    theme: 'โหมดสี',
    themeDark: 'ธีมสีดำ',
    themeLight: 'ธีมสีครีม',
    sampleLoaded: 'สร้างเพลงตัวอย่างแล้ว',
    updated: 'บันทึกสำเร็จ',
    search: 'ค้นหาเพลง...',
    instrument: 'เครื่องดนตรี'
  },
  en: {
    appName: 'Song Diary',
    slogan: 'Capture every melody',
    version: 'Version',
    addNew: '+ New Song',
    edit: 'Edit',
    remove: 'Delete',
    lastEdited: 'Last edited',
    createdAt: 'Created',
    home: 'Home',
    editor: 'Edit Song',
    songTitle: 'Song Title',
    penName: 'Pen name',
    mood: 'Mood',
    section: 'Section',
    insert: 'Insert',
    lyrics: 'Lyrics',
    notes: 'Additional notes',
    timestamp: 'Local timestamp',
    copyLyrics: 'Copy lyrics',
    savePDF: 'Save as PDF',
    print: 'Print',
    shareEmail: 'Share via Email',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Delete this note?',
    language: 'Language',
    theme: 'Theme',
    themeDark: 'Dark Theme',
    themeLight: 'Cream Theme',
    sampleLoaded: 'Sample song created',
    updated: 'Saved',
    search: 'Search songs...',
    instrument: 'Instrument'
  }
};

export function getLang() {
  return localStorage.getItem('lang') || (navigator.language?.startsWith('th') ? 'th' : 'en');
}
export function setLang(lang) { localStorage.setItem('lang', lang); }
export function t(lang, key) { return tr[lang][key] || key; }

export const SECTIONS = ['Intro','Pre-Chorus','Chorus','Verse 1','Verse 2','Verse 3','Bridge','Rap','Riff','Solo','Outro'];
export const INSTRUMENTS = ['Guitar','Piano','Violin','Saxophone','Flute','Synth'];
