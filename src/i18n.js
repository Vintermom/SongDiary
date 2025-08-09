export const tr={th:{appName:'จดบันทึก | Song Diary',addNew:'+ จดบันทึกเพลงใหม่',edit:'แก้ไข',remove:'ลบ',lastEdited:'แก้ไขล่าสุด',home:'หน้าแรก'},
en:{appName:'Song Diary',addNew:'+ New Song Note',edit:'Edit',remove:'Delete',lastEdited:'Last edited',home:'Home'}};
export const t=(lang,key)=>tr[lang][key]||key;
export const getLang=()=>localStorage.getItem('lang')||(navigator.language?.startsWith('th')?'th':'en');
export const setLang=(l)=>localStorage.setItem('lang',l);
