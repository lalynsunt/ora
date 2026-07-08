// ============================================================
// ORA i18n — ภาษา/ประเทศ/cultural context
// สถานะ: th, en = full · อีก 8 ภาษา = placeholder (โครงพร้อม เติมคำแปลได้เลย)
// fallback chain: ภาษาที่เลือก → en → th
// ============================================================
const I18N = {};

I18N.LANGS = [
  { code: "th", native: "ไทย", name: "Thai", status: "full" },
  { code: "en", native: "English", name: "English", status: "full" },
  { code: "zh-CN", native: "简体中文", name: "Chinese Simplified", status: "placeholder" },
  { code: "zh-TW", native: "繁體中文", name: "Chinese Traditional", status: "placeholder" },
  { code: "ja", native: "日本語", name: "Japanese", status: "placeholder" },
  { code: "ko", native: "한국어", name: "Korean", status: "placeholder" },
  { code: "vi", native: "Tiếng Việt", name: "Vietnamese", status: "placeholder" },
  { code: "id", native: "Bahasa Indonesia", name: "Indonesian", status: "placeholder" },
  { code: "es", native: "Español", name: "Spanish", status: "placeholder" },
  { code: "fr", native: "Français", name: "French", status: "placeholder" }
];

// ประเทศ → cultural context + สกุลเงิน (ใช้กับ knowledge filter, prompt, pricing)
I18N.COUNTRIES = [
  { code: "TH", th: "ไทย", en: "Thailand", ctx: ["Thai", "Chinese"], cur: "THB", defLang: "th" },
  { code: "CN", th: "จีน", en: "China", ctx: ["Chinese"], cur: "CNY", defLang: "zh-CN" },
  { code: "TW", th: "ไต้หวัน", en: "Taiwan", ctx: ["Chinese"], cur: "TWD", defLang: "zh-TW" },
  { code: "JP", th: "ญี่ปุ่น", en: "Japan", ctx: ["Japanese", "Chinese"], cur: "JPY", defLang: "ja" },
  { code: "KR", th: "เกาหลีใต้", en: "South Korea", ctx: ["Korean", "Chinese"], cur: "KRW", defLang: "ko" },
  { code: "VN", th: "เวียดนาม", en: "Vietnam", ctx: ["Chinese"], cur: "VND", defLang: "vi" },
  { code: "ID", th: "อินโดนีเซีย", en: "Indonesia", ctx: ["Global"], cur: "IDR", defLang: "id" },
  { code: "US", th: "สหรัฐฯ", en: "United States", ctx: ["Western"], cur: "USD", defLang: "en" },
  { code: "GB", th: "สหราชอาณาจักร", en: "United Kingdom", ctx: ["Western"], cur: "GBP", defLang: "en" },
  { code: "FR", th: "ฝรั่งเศส", en: "France", ctx: ["Western"], cur: "EUR", defLang: "fr" },
  { code: "ES", th: "สเปน", en: "Spain", ctx: ["Western"], cur: "EUR", defLang: "es" },
  { code: "OTHER", th: "อื่นๆ / ทั่วโลก", en: "Other / Global", ctx: ["Global"], cur: "USD", defLang: "en" }
];

// ---------- Translation keys (UI หลัก) ----------
I18N.STR = {
  th: {
    "nav.today": "วันนี้", "nav.ask": "ถามดวง", "nav.tarot": "ไพ่", "nav.scan": "สแกน", "nav.num": "ตัวเลข", "nav.set": "ตั้งค่า",
    "onb.tagline": "หมอดู AI ที่ดูจาก \"วันเกิดจริงของคุณ\"\nไม่ใช่คำทำนายเหมารวมตามราศี",
    "onb.lang": "ภาษา / Language", "onb.country": "ประเทศ (เพื่อปรับคำแนะนำให้เข้ากับวัฒนธรรม)",
    "onb.name": "ชื่อเล่นของคุณ", "onb.dob": "วันเดือนปีเกิด (ค.ศ.)",
    "onb.time": "เวลาเกิด", "onb.time.hint": "(ถ้าทราบ — ทำให้แม่นขึ้น โดยเฉพาะคนเกิดวันพุธ)",
    "onb.job": "อาชีพ / สิ่งที่ทำอยู่", "onb.job.hint": "(ไม่บังคับ — ช่วยให้คำแนะนำตรงชีวิตจริง)",
    "onb.blood": "กรุ๊ปเลือด", "onb.blood.hint": "(ไม่บังคับ — ใช้เป็นมุมมองความเชื่อแบบเอเชียตะวันออก)",
    "onb.go": "เปิดดวงของฉัน ✨",
    "onb.privacy": "ข้อมูลเก็บไว้ในเครื่องของคุณเท่านั้น · บริการเพื่อการสะท้อนตนเองและความบันเทิง ไม่ใช่คำแนะนำทางการแพทย์ การเงิน หรือกฎหมาย · เปลี่ยนภาษาได้ภายหลังในหน้าตั้งค่า",
    "ask.mode": "เลือกวิธีดู:", "ask.mode.auto": "อัตโนมัติ", "ask.mode.birth": "วันเกิดล้วน", "ask.mode.tarot": "ไพ่นำ", "ask.mode.num": "เลขศาสตร์", "ask.mode.integrated": "รวมหลายศาสตร์ ⭐",
    "scan.consent.title": "ขอความยินยอมก่อนใช้ภาพ",
    "scan.consent.body": "ภาพของคุณจะถูกย่อในเครื่องและส่งตรงไปยัง Google Gemini เพื่อวิเคราะห์ตามความเชื่อ/การสะท้อนตนเอง/ความบันเทิงเท่านั้น · แอปไม่บันทึกภาพ ไม่ส่งไปที่อื่น และไม่ใช้ระบุตัวตน · วิเคราะห์เสร็จภาพจะถูกทิ้งทันที",
    "scan.consent.keep": "วิเคราะห์แล้วลบภาพทันที (ค่าเริ่มต้น)",
    "scan.consent.ok": "ยินยอม และเริ่มวิเคราะห์", "scan.consent.no": "ยกเลิก",
    "pay.title": "ปลดล็อกความละเอียดเต็มระดับ", "pay.now": "แพ็กเกจของคุณ:",
    "pay.soon": "ระบบชำระเงินกำลังจะเปิด — วันนี้ทดลองใช้ระดับพรีเมียมได้ฟรีด้วยรหัสจากทีมงาน (หน้าตั้งค่า)",
    "pay.benefit.plus": "ถามดวง AI ไม่จำกัด/วัน · สแกนเพิ่ม · รายเดือน",
    "pay.benefit.premium": "ทุกอย่างใน Plus · ลายมือ+โหงวเฮ้งไม่จำกัด · Integrated Reading",
    "pay.close": "ไว้ก่อน",
    "quota.ask": "วันนี้ใช้สิทธิ์ถามดวงโหมด AI ครบแล้ว (โหมดตำรายังใช้ได้ไม่จำกัด)",
    "quota.scan": "วันนี้ใช้สิทธิ์สแกนภาพครบแล้ว",
    "set.lang": "ภาษา / Language", "set.country": "ประเทศ / บริบทวัฒนธรรม",
    "set.astro": "ศาสตร์หลักที่ชอบ", "set.tone": "โทนคำทำนายที่ชอบ",
    "set.tier": "แพ็กเกจ", "set.redeem": "ใส่รหัสปลดล็อก / รหัสจากตู้ ORA",
    "set.blood": "กรุ๊ปเลือด", "set.undertone": "โทนสีผิว (undertone)",
    "common.free": "ฟรี", "common.analyze": "✨ ให้พี่หมอวิเคราะห์", "common.save": "บันทึก",
    "disc.entertain": "เพื่อการสะท้อนตนเองและความบันเทิง ไม่ใช่คำแนะนำทางการแพทย์ การเงิน หรือกฎหมาย"
  },
  en: {
    "nav.today": "Today", "nav.ask": "Ask", "nav.tarot": "Tarot", "nav.scan": "Scan", "nav.num": "Numbers", "nav.set": "Settings",
    "onb.tagline": "An AI fortune guide that reads YOUR real birth chart\n— not generic zodiac blurbs",
    "onb.lang": "Language", "onb.country": "Country (to adapt advice to your culture)",
    "onb.name": "Your nickname", "onb.dob": "Date of birth",
    "onb.time": "Time of birth", "onb.time.hint": "(if known — improves accuracy)",
    "onb.job": "Occupation / what you do", "onb.job.hint": "(optional — makes advice practical)",
    "onb.blood": "Blood type", "onb.blood.hint": "(optional — East Asian cultural lens)",
    "onb.go": "Reveal my chart ✨",
    "onb.privacy": "Your data stays on this device only · For self-reflection & entertainment, not medical, financial or legal advice · You can change language later in Settings",
    "ask.mode": "Reading method:", "ask.mode.auto": "Auto", "ask.mode.birth": "Birth chart only", "ask.mode.tarot": "Tarot-led", "ask.mode.num": "Numerology", "ask.mode.integrated": "Integrated ⭐",
    "scan.consent.title": "Consent required before using your photo",
    "scan.consent.body": "Your photo is downscaled on-device and sent directly to Google Gemini for belief-based / self-reflection / entertainment analysis only · The app never stores it, never sends it elsewhere, never uses it for identification · It is discarded right after analysis",
    "scan.consent.keep": "Analyze then delete immediately (default)",
    "scan.consent.ok": "I consent — analyze", "scan.consent.no": "Cancel",
    "pay.title": "Unlock full-depth readings", "pay.now": "Your plan:",
    "pay.soon": "Payments launching soon — today you can try premium free with a team code (see Settings)",
    "pay.benefit.plus": "Unlimited AI questions/day · more scans · monthly fortune",
    "pay.benefit.premium": "Everything in Plus · unlimited palm & face reading · Integrated Reading",
    "pay.close": "Not now",
    "quota.ask": "Daily AI question limit reached (classic mode is always unlimited)",
    "quota.scan": "Daily scan limit reached",
    "set.lang": "Language", "set.country": "Country / cultural context",
    "set.astro": "Preferred astrology system", "set.tone": "Preferred tone",
    "set.tier": "Plan", "set.redeem": "Redeem code / ORA kiosk code",
    "set.blood": "Blood type", "set.undertone": "Skin undertone",
    "common.free": "Free", "common.analyze": "✨ Analyze", "common.save": "Save",
    "disc.entertain": "For self-reflection & entertainment — not medical, financial or legal advice"
  }
  // zh-CN, zh-TW, ja, ko, vi, id, es, fr: placeholder — เติม key ตามโครง en ได้เลย (fallback → en)
};

// ---------- state ----------
I18N.lang = "th";
I18N.country = "TH";

I18N.detect = function () {
  const device = (navigator.language || "th-TH");
  const two = device.slice(0, 2).toLowerCase();
  const full = device.replace("_", "-");
  let lang = "en";
  if (I18N.STR[full] || I18N.LANGS.some(l => l.code === full)) lang = I18N.LANGS.some(l => l.code === full) ? full : two;
  else if (I18N.LANGS.some(l => l.code === two)) lang = two;
  // เดาประเทศจาก locale region ถ้ามี (suggestion เท่านั้น ผู้ใช้เลือกเองได้เสมอ)
  const region = (full.split("-")[1] || "").toUpperCase();
  const country = I18N.COUNTRIES.some(x => x.code === region) ? region
    : (two === "th" ? "TH" : two === "ja" ? "JP" : two === "ko" ? "KR" : two === "vi" ? "VN" : two === "id" ? "ID" : "OTHER");
  return { device_locale: device, lang, country };
};

I18N.countryInfo = function () {
  return I18N.COUNTRIES.find(c => c.code === I18N.country) || I18N.COUNTRIES[I18N.COUNTRIES.length - 1];
};
I18N.culturalContext = function () { return I18N.countryInfo().ctx; };
I18N.langInfo = function () { return I18N.LANGS.find(l => l.code === I18N.lang) || I18N.LANGS[0]; };
I18N.contentLocale = function () {
  const map = { th: "th-TH", en: "en-US", "zh-CN": "zh-CN", "zh-TW": "zh-TW", ja: "ja-JP", ko: "ko-KR", vi: "vi-VN", id: "id-ID", es: "es-ES", fr: "fr-FR" };
  return map[I18N.lang] || "en-US";
};

// t(key) พร้อม fallback chain: selected → en → th → key เอง
I18N.t = function (key) {
  const cur = I18N.STR[I18N.lang];
  if (cur && cur[key] != null) return cur[key];
  if (I18N.STR.en[key] != null) return I18N.STR.en[key];
  if (I18N.STR.th[key] != null) return I18N.STR.th[key];
  return key;
};
I18N.translationStatus = function () { return I18N.langInfo().status; };

I18N.set = function (lang, country) {
  if (lang) I18N.lang = lang;
  if (country) I18N.country = country;
  I18N.apply();
};

// เติมคำแปลลง DOM: <el data-i18n="key">, placeholder: data-i18n-ph
I18N.apply = function () {
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = I18N.t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = I18N.t(el.dataset.i18nPh); });
  document.documentElement.lang = I18N.lang;
};

// คำสั่งภาษา/วัฒนธรรมสำหรับ prompt builder
I18N.promptDirective = function () {
  const c = I18N.countryInfo();
  const langName = I18N.langInfo().name;
  return [
    `[LOCALE]`,
    `user_selected_language: ${langName} (${I18N.lang}) — ตอบเป็นภาษานี้ทั้งหมด`,
    `user_country: ${c.en} | cultural_context: ${c.ctx.join(", ")} | content_locale: ${I18N.contentLocale()}`,
    `กติกา: ใช้คำศัพท์ที่เป็นธรรมชาติในภาษานั้น ไม่แปลตรงตัว · ศาสตร์ที่ผู้ใช้อาจไม่คุ้น (เช่น มหาทักษา ปีชง โหงวเฮ้ง) ให้อธิบายสั้นๆ 1 ประโยคก่อนใช้ · ตัวอย่างการแต่งตัว/ทรงผม/มารยาท ให้เหมาะกับบริบทประเทศ ${c.en} · โทน: ${I18N.lang === "ja" ? "สุภาพ อ่อนน้อม กระชับแบบญี่ปุ่น" : I18N.lang === "en" ? "warm, coach-like, no Thai particles" : "อบอุ่นแบบพี่สาวไทย ลงท้ายค่ะ/นะคะ"}`
  ].join("\n");
};
