export type Language = 'en' | 'th'

export const translations = {
  en: {
    // Navigation
    'app.title': 'Deboreka Tracker',
    'nav.signOut': 'Sign Out',
    
    // Enhancement Form
    'enhancement.title': 'Add Enhancement',
    'enhancement.part': 'Deboreka Part',
    'enhancement.part.select': 'Select a part',
    'enhancement.count': 'Number of Enhancements',
    'enhancement.count.placeholder': 'Enter count',
    'enhancement.submit': 'Add Enhancement',
    'enhancement.submitting': 'Adding...',
    'enhancement.success': 'Enhancement added successfully!',
    'enhancement.error': 'Failed to add enhancement',
    
    // Parts
    'part.necklace': 'Necklace',
    'part.earring': 'Earring',
    'part.ring': 'Ring',
    'part.belt': 'Belt',
    
    // Scoreboard
    'scoreboard.title': 'Weekly Scoreboard',
    'scoreboard.reset': 'Resets every Sunday',
    'scoreboard.noData': 'No enhancements yet',
    'scoreboard.enhancements': 'enhancements',
    'scoreboard.leaderboard': 'Leaderboard',
    
    // Crowns
    'crowns.title': 'All-Time Crown Champions',
    'crowns.noData': 'No crowns awarded yet',
    'crowns.total': 'Total',
    'crowns.crown': 'crown',
    'crowns.crowns': 'crowns',
    
    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.description': 'Manage and remove fake enhancement data',
    'admin.user': 'User',
    'admin.part': 'Part',
    'admin.count': 'Count',
    'admin.date': 'Date',
    'admin.actions': 'Actions',
    'admin.delete': 'Delete',
    'admin.deleting': 'Deleting...',
    'admin.noData': 'No enhancements found',
    
    // Setup
    'setup.title': 'Welcome!',
    'setup.description': 'Please enter your Black Desert family name',
    'setup.familyName': 'Family Name',
    'setup.familyName.placeholder': 'Enter your family name',
    'setup.submit': 'Continue',
    'setup.saving': 'Saving...',
    
    // Auth
    'auth.signIn': 'Sign in with Google',
    'auth.signingIn': 'Signing in...',
  },
  th: {
    // Navigation
    'app.title': 'ติดตามเดโบเรก้า',
    'nav.signOut': 'ออกจากระบบ',
    
    // Enhancement Form
    'enhancement.title': 'เพิ่มการเสริมพลัง',
    'enhancement.part': 'ชิ้นส่วนเดโบเรก้า',
    'enhancement.part.select': 'เลือกชิ้นส่วน',
    'enhancement.count': 'จำนวนการเสริมพลัง',
    'enhancement.count.placeholder': 'กรอกจำนวน',
    'enhancement.submit': 'เพิ่มการเสริมพลัง',
    'enhancement.submitting': 'กำลังเพิ่ม...',
    'enhancement.success': 'เพิ่มการเสริมพลังสำเร็จ!',
    'enhancement.error': 'เพิ่มการเสริมพลังไม่สำเร็จ',
    
    // Parts
    'part.necklace': 'สร้อยคอ',
    'part.earring': 'ต่างหู',
    'part.ring': 'แหวน',
    'part.belt': 'เข็มขัด',
    
    // Scoreboard
    'scoreboard.title': 'ตารางคะแนนรายสัปดาห์',
    'scoreboard.reset': 'รีเซ็ตทุกวันอาทิตย์',
    'scoreboard.noData': 'ยังไม่มีการเสริมพลัง',
    'scoreboard.enhancements': 'ครั้ง',
    'scoreboard.leaderboard': 'อันดับ',
    
    // Crowns
    'crowns.title': 'แชมป์มงกุฎตลอดกาล',
    'crowns.noData': 'ยังไม่มีการมอบมงกุฎ',
    'crowns.total': 'รวม',
    'crowns.crown': 'มงกุฎ',
    'crowns.crowns': 'มงกุฎ',
    
    // Admin
    'admin.title': 'แผงควบคุมผู้ดูแล',
    'admin.description': 'จัดการและลบข้อมูลการเสริมพลังปลอม',
    'admin.user': 'ผู้ใช้',
    'admin.part': 'ชิ้นส่วน',
    'admin.count': 'จำนวน',
    'admin.date': 'วันที่',
    'admin.actions': 'การดำเนินการ',
    'admin.delete': 'ลบ',
    'admin.deleting': 'กำลังลบ...',
    'admin.noData': 'ไม่พบข้อมูลการเสริมพลัง',
    
    // Setup
    'setup.title': 'ยินดีต้อนรับ!',
    'setup.description': 'กรุณากรอกชื่อครอบครัวใน Black Desert',
    'setup.familyName': 'ชื่อครอบครัว',
    'setup.familyName.placeholder': 'กรอกชื่อครอบครัวของคุณ',
    'setup.submit': 'ดำเนินการต่อ',
    'setup.saving': 'กำลังบันทึก...',
    
    // Auth
    'auth.signIn': 'เข้าสู่ระบบด้วย Google',
    'auth.signingIn': 'กำลังเข้าสู่ระบบ...',
  },
}

export function getTranslation(key: string, lang: Language = 'en'): string {
  // Access the translation directly using the key
  const value = translations[lang][key as keyof typeof translations['en']]
  
  if (value !== undefined) {
    return value
  }
  
  // Fallback to English if translation not found
  const fallback = translations.en[key as keyof typeof translations['en']]
  return fallback || key
}

export function t(key: string, lang: Language = 'en'): string {
  return getTranslation(key, lang)
}

