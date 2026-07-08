// ============================================================
// ORA i18n — ภาษา/ประเทศ/cultural context
// สถานะ: th, en = full · อีก 8 ภาษา = placeholder (โครงพร้อม เติมคำแปลได้เลย)
// fallback chain: ภาษาที่เลือก → en → th
// ============================================================
const I18N = {};

// ป้ายคะแนนรายวัน (key ภายในของ Engine.daily().scores เป็นไทยเสมอ — แปลเฉพาะตอนแสดงผล)
I18N.SCORE_LABEL = { th: { "งาน": "งาน", "เงิน": "เงิน", "ความรัก": "ความรัก", "จิตใจ": "จิตใจ" },
  en: { "งาน": "Career", "เงิน": "Money", "ความรัก": "Love", "จิตใจ": "Mind" } };
I18N.scoreLabel = function (th) { return (I18N.SCORE_LABEL[I18N.lang] && I18N.SCORE_LABEL[I18N.lang][th]) || I18N.SCORE_LABEL.en[th] || th; };

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
    "disc.entertain": "เพื่อการสะท้อนตนเองและความบันเทิง ไม่ใช่คำแนะนำทางการแพทย์ การเงิน หรือกฎหมาย",

    // ---- home / daily fortune ----
    "home.greet": "สวัสดีค่ะ {name} 🌅",
    "home.lucky.title": "🌈 สีนำโชควันนี้",
    "home.lucky.ruledBy": "พลังดาว{planet}ปกครองวันนี้ — วันนี้ตรงกับตำแหน่ง \"{position}\" ในดวงคุณ",
    "home.lucky.avoidNote": "💡 วันนี้ตรงกับวันกาลกิณีของคุณพอดี — ใส่สีนี้เป็น accent เล็กๆ (เล็บ/เครื่องประดับ) พอได้ แต่เลี่ยงใช้เป็นเสื้อผ้าชุดใหญ่ วันนี้เน้นสติมากกว่าสีสัน",
    "home.lucky.wearNote": "👗 ลองใส่เสื้อผ้าหรือ accessory โทนนี้เสริมพลังวันนี้ได้เลยค่ะ ✨",
    "home.permcolor.title": "🎨 สีประจำตัว (คงที่ทุกวัน — ตามผังมหาทักษาวัน{planet})",
    "home.permcolor.power": "อำนาจ-การงาน", "home.permcolor.luck": "โชคลาภ-เสน่ห์", "home.permcolor.avoid": "ควรเลี่ยง",
    "home.permcolor.note": "สีชุดนี้เป็นสีเดิมทุกวันตามตำแหน่งเดช/ศรี/กาลกิณีในดวงคุณ — ต่างจาก \"สีนำโชควันนี้\" ด้านบนที่เปลี่ยนไปตามวันที่ปกครองแต่ละวัน",
    "home.dos": "✅ ควรทำวันนี้", "home.donts": "⚠️ ควรเลี่ยงวันนี้",
    "home.feedback.prompt": "คำทำนายวันนี้ตรงกับคุณแค่ไหน?",
    "home.base.title": "🧬 พื้นดวงของคุณ",
    "home.base.strength": "จุดแข็ง:", "home.base.selfaware": "รู้ทันตัวเอง:", "home.base.career": "สายงานที่เสริมดวง:",
    "home.base.lagnaKnown": "ลัคนาคำนวณโดยประมาณจากเวลาเกิด (แบบเรือนชั่วยาม)",
    "home.base.lagnaUnknown": "💡 เพิ่มเวลาเกิดในหน้าตั้งค่า เพื่อดูลัคนาโดยประมาณ",
    "home.period.title": "🌊 จังหวะชีวิตช่วงนี้ (ทักษาเสวยอายุ)",
    "home.period.range": "อายุ {start}–{end} ปี:",
    "home.period.tone": "โทนช่วงนี้:",
    "home.period.next": "⏭️ ช่วงถัดไป:",
    "home.blood.title": "🩸 นิสัยจากกรุ๊ปเลือด {blood} × วันเกิด",
    "home.blood.side1": "มุมกรุ๊ปเลือด:", "home.blood.side2": "มุมวันเกิด:", "home.blood.synthesis": "ภาพรวมสามมุม:", "home.blood.advice": "✅ แนวทางใช้:",

    // ---- feedback widget ----
    "fb.great": "😍 แม่นมาก", "fb.ok": "🙂 ค่อนข้างตรง", "fb.meh": "😐 เฉยๆ", "fb.miss": "🙅 ไม่ตรง",
    "fb.thanks": "ขอบคุณค่ะ 💛 ยิ่งบอก ยิ่งปรับให้เฉพาะตัวคุณมากขึ้น",

    // ---- ask screen ----
    "ask.title": "💬 ห้องพี่หมอโอรา",
    "ask.note.ai": "🤖 <b>โหมด AI เปิดอยู่</b> — พี่หมอโอราจะถามรายละเอียดเพิ่มก่อนทำนาย เพื่อคำตอบที่ตรงชีวิตคุณจริงๆ",
    "ask.note.classic": "📖 ตอนนี้เป็นโหมดตำรา (rule-based) — เปิด<b>โหมด AI ฟรี</b>ได้ในหน้าตั้งค่า เพื่อให้พี่หมอโอราคุยโต้ตอบและเจาะคำถามของคุณได้",
    "ask.hello": "สวัสดีค่ะ {name} 💛 พี่หมอโอราค่ะ\nเลือกหมวดด้านบน หรือพิมพ์คำถามที่อยากรู้มาได้เลยนะคะ เช่น \"ควรย้ายงานไหม\" \"ความสัมพันธ์นี้ควรไปต่อไหม\"",
    "ask.input.placeholder": "พิมพ์คำถามของคุณ เช่น ควรย้ายงานไหม...",
    "ask.thinking": "พี่หมอกำลังเปิดผังดวงของคุณ...",
    "ask.error": "ขอโทษค่ะ เชื่อมต่อ AI ไม่สำเร็จ ({err})\nตรวจสอบ API key ในหน้าตั้งค่า หรือลองใหม่อีกครั้งนะคะ — ระหว่างนี้พี่หมอตอบแบบตำราให้ก่อนค่ะ 🙏",
    "ask.sensitive": "เรื่องนี้พี่หมอขอไม่ทำนายแบบฟันธงนะคะ 🙏 เพราะเป็นเรื่องที่ควรใช้ข้อมูลจริงจากผู้เชี่ยวชาญโดยตรง (แพทย์/ผู้เชี่ยวชาญการเงิน)\n\nแต่ถ้าอยากดู**พลังใจและจังหวะชีวิต**ช่วงนี้เพื่อเตรียมตัวให้พร้อม พี่หมอดูให้ได้ค่ะ ลองเล่าความรู้สึกหรือสิ่งที่กังวลมาได้เลยนะคะ",
    "ask.upsell": "💎 อยากเห็นมุมที่หลายศาสตร์ชี้ตรงกัน? ลองโหมด \"รวมหลายศาสตร์\" ได้จากเมนูด้านบน",
    "ask.upsell.close": "ปิด",
    "cat.love": "ความรัก", "cat.work": "การงาน", "cat.money": "การเงิน", "cat.family": "ครอบครัว", "cat.education": "การเรียน", "cat.overview": "ภาพรวม",

    // ---- tarot ----
    "tarot.title": "🎴 ไพ่ทาโรต์",
    "tarot.instruction": "ตั้งจิตนึกถึงเรื่องที่อยากรู้ แล้วเลือกไพ่ <b>3 ใบ</b> ค่ะ 🙏",
    "tarot.picked": "เลือกแล้ว {n}/3 ใบ",
    "tarot.yourCards": "🎴 ไพ่ของคุณ",
    "tarot.drawing": "🎨 กำลังวาดภาพไพ่ของคุณด้วย AI... (ภาพจะค่อยๆ ปรากฏ ใช้ครั้งแรกครั้งเดียว)",
    "tarot.feedback.prompt": "ผลไพ่ตรงใจแค่ไหน?",
    "tarot.interpreting": "🤖 พี่หมอโอรากำลังตีความไพ่ทั้งสามใบร่วมกับดวงของคุณ...",
    "tarot.aiFailed": "เชื่อมต่อ AI ไม่สำเร็จ — อ่านความหมายรายใบด้านบนได้เลยค่ะ",
    "tarot.aiHint": "💡 เปิดโหมด AI ในหน้าตั้งค่า เพื่อให้พี่หมอโอราตีความไพ่ทั้งสามใบ \"เชื่อมโยงกัน\" เฉพาะดวงคุณ",
    "tarot.label.past": "อดีต / รากของเรื่อง", "tarot.label.present": "ปัจจุบัน", "tarot.label.future": "แนวโน้มข้างหน้า",

    // ---- numbers ----
    "num.title": "🔢 ศาสตร์ตัวเลข", "num.lifepath.title": "เลขศาสตร์วันเกิดของคุณ", "num.phone.title": "วิเคราะห์เบอร์โทรศัพท์",
    "num.phone.placeholder": "เช่น 0812345678", "num.phone.go": "วิเคราะห์เบอร์นี้",
    "num.phone.invalid": "กรุณาใส่เบอร์ให้ครบ (9–10 หลัก) ค่ะ",
    "num.phone.sum": "ผลรวมทั้งเบอร์:", "num.phone.sumNeutral": "พลังกลางๆ ไม่ส่งเสริมไม่ฉุดรั้ง",
    "num.phone.dominant": "🌟 เลขเด่นประจำเบอร์: {digit} (มี {n} ตัว) — พลังดาว{planet} \"{trait}\": {desc}",
    "num.phone.tailTitle": "🔥 คู่เลขท้าย 4 ตัว (อิทธิพลแรงสุด — น้ำหนัก ×2):",
    "num.phone.headTitle": "คู่เลขส่วนหน้า:",
    "num.phone.principle": "หลักการอ่าน: เลขแต่ละตัวถือพลังดาว (1=อาทิตย์ 2=จันทร์ 3=อังคาร 4=พุธ 5=พฤหัสฯ 6=ศุกร์ 7=เสาร์ 8=ราหู 9=เกตุ) — คู่เลขคือการส่งพลังร่วมกันของสองดาว ตำแหน่งท้ายเบอร์มีอิทธิพลต่อผู้ใช้มากที่สุด",
    "num.phone.goalPrompt": "🎯 อยากได้เบอร์ที่เสริมเป้าหมายไหน? (แนะนำ pattern ตามความเชื่อ — เบอร์ปัจจุบันของคุณใช้ได้เสมอ ไม่จำเป็นต้องเปลี่ยน)",
    "num.phone.goalPairs": "คู่เลขที่ตำรานิยมสำหรับ{goal}:",
    "num.phone.disclaimer": "การวิเคราะห์ตามตำราเลขศาสตร์ (belief-based numerology) เพื่อความบันเทิงและความสบายใจ — ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์ เบอร์ไม่ได้กำหนดชีวิต ความตั้งใจของคุณต่างหากค่ะ",
    "num.goal.career": "การงาน-ผู้บริหาร", "num.goal.money": "การเงิน-ค้าขาย", "num.goal.love": "ความรัก", "num.goal.charm": "เสน่ห์-การเจรจา", "num.goal.support": "ผู้ใหญ่สนับสนุน",

    // ---- scan ----
    "scan.title": "🔮 ศาสตร์จากภาพ",
    "scan.gate.title": "ฟีเจอร์นี้ใช้โหมด AI",
    "scan.gate.body": "การอ่านลายมือ โหงวเฮ้ง และวิเคราะห์โทนสีผิว ต้องใช้ AI วิเคราะห์ภาพ — เปิดใช้ฟรีโดยใส่ Gemini API key ในหน้าตั้งค่า (กดขอ key ฟรีได้ที่ aistudio.google.com/apikey)",
    "scan.gate.go": "ไปหน้าตั้งค่า",
    "scan.pick": "📷 ถ่ายรูป / เลือกรูป",
    "scan.disclaimer": "ภาพถูกย่อในเครื่องคุณและส่งตรงไปยัง Google Gemini เพื่อวิเคราะห์เท่านั้น — แอปไม่บันทึกหรือส่งภาพไปที่อื่น วิเคราะห์เสร็จภาพไม่ถูกเก็บ",
    "scan.kind.palm": "🖐️ ลายมือ", "scan.kind.face": "👤 โหงวเฮ้ง", "scan.kind.style": "👗 โทนสี-สไตล์",
    "scan.desc.palm": "🖐️ <b>อ่านลายมือ</b> — กางฝ่ามือข้างที่ถนัด ถ่ายตรงๆ ใต้แสงสว่าง ให้เห็นเส้นชัดทั้งฝ่ามือ พี่หมอจะอ่านเส้นชีวิต สมอง หัวใจ วาสนา และธาตุประจำมือ",
    "scan.desc.face": "👤 <b>ดูโหงวเฮ้ง</b> — ถ่ายหน้าตรง ไม่ใส่ฟิลเตอร์ แสงสว่างสม่ำเสมอ พี่หมอจะดูสามส่วนใบหน้า จุดเด่นเชิงโหงวเฮ้ง พร้อมแนะทรงผมเสริมดวงตามรูปหน้า",
    "scan.desc.style": "👗 <b>วิเคราะห์โทนสีประจำตัว</b> — ถ่ายหน้าตรงใต้แสงธรรมชาติ ไม่แต่งฟิลเตอร์ พี่หมอจะประเมิน Warm/Cool tone และ Season ของคุณ แล้วผสมกับสีมงคลประจำดวง เป็นคู่มือแต่งตัว+ทรงผมเฉพาะตัว",
    "scan.quality.title": "🔍 คุณภาพภาพ: {score}/100",
    "scan.quality.note": "ยังวิเคราะห์ได้ แต่ภาพที่ดีขึ้น = คำตอบละเอียดขึ้น — พี่หมอจะไม่เดาในส่วนที่มองไม่เห็น",
    "scan.palm.title": "🖐️ ภาพลายมือของคุณ", "scan.palm.original": "ต้นฉบับ", "scan.palm.enhanced": "ปรับเส้นชัดขึ้น",
    "scan.palm.overlayCaption": "ตำแหน่งเส้นหลัก", "scan.palm.overlayApprox": "โดยประมาณ (ตำแหน่งมาตรฐาน — ระบบชี้ตำแหน่งจริงจะมาในรุ่นถัดไป)",
    "scan.analyzing": "🔮 พี่หมอกำลังเพ่งพิจารณาภาพของคุณ... (10–20 วินาที)",
    "scan.faceCropNote": "ตำแหน่ง crop เป็นสัดส่วนมาตรฐานของภาพหน้าตรง",
    "scan.faceCropNoteApprox": " (ระบบชี้ตำแหน่งจริงจะมาในรุ่นถัดไป)",
    "scan.feedback.prompt": "ผลวิเคราะห์ตรงใจแค่ไหน?",
    "scan.failed": "ขอโทษค่ะ วิเคราะห์ไม่สำเร็จ ({err}) — ตรวจสอบ API key หรือลองรูปที่เล็กลง/ชัดขึ้นอีกครั้งนะคะ",

    // ---- settings ----
    "set.title": "⚙️ ตั้งค่า", "set.pscore.title": "ระดับความเฉพาะตัวของดวงคุณ",
    "set.pscore.low": "เพิ่มเวลาเกิด อาชีพ หรือให้ feedback หลังคำทำนาย เพื่อให้ดวงเฉพาะตัวขึ้น",
    "set.pscore.mid": "กำลังดี! ยิ่งถาม-ยิ่งให้ feedback ระบบยิ่งรู้จักคุณ",
    "set.pscore.high": "ดวงของคุณเฉพาะตัวมากแล้วค่ะ ✨",
    "set.ai.title": "🤖 โหมด AI — พี่หมอโอราคุยได้จริง",
    "set.ai.hint": "ใส่ Gemini API key (ขอฟรีที่ <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">aistudio.google.com/apikey</a>) — key เก็บในเครื่องคุณเท่านั้น ไม่ถูกส่งไปที่อื่นนอกจาก Google",
    "set.ai.save": "บันทึก key", "set.ai.on": "✅ โหมด AI เปิดใช้งานอยู่", "set.ai.off": "ยังไม่ได้ใส่ key — ใช้โหมดตำราอยู่",
    "set.quota.free": "โหมดทดสอบ QA — ใช้ได้ทุกฟีเจอร์ไม่จำกัด 🎉",
    "set.quota.used": "วันนี้ใช้:", "set.quota.needPremium": "ต้อง Premium",
    "set.tone.title": "โทนคำทำนายที่ชอบ",
    "set.tone.opt.direct": "ตรงไปตรงมา ชัดๆ", "set.tone.opt.gentle": "นุ่มนวล ให้กำลังใจ",
    "set.tone.opt.analytic": "ละเอียด เชิงวิเคราะห์", "set.tone.opt.brief": "กระชับ สั้นๆ",
    "set.memory.title": "🧠 ความทรงจำของพี่หมอ",
    "set.memory.has": "ตอนนี้พี่หมอจำเรื่องที่เคยคุยไว้ {n} เรื่อง — จะถูกใช้เชื่อมโยงคำทำนายครั้งถัดไป",
    "set.memory.empty": "ยังไม่มีบทสนทนาให้จำ — ลองถามดวงดูสิคะ",
    "set.memory.note": "พี่หมอจำเรื่องที่คุยกันไว้ในเครื่องของคุณเท่านั้น (สูงสุด 30 เรื่องล่าสุด) เพื่อให้คำทำนายต่อเนื่องและใส่ใจขึ้น — ไม่ถูกส่งไปเก็บที่ไหน",
    "set.memory.clear": "ล้างความทรงจำแชท (เริ่มคุยใหม่)",
    "set.profile.title": "ข้อมูลของฉัน", "set.profile.edit": "แก้ไขข้อมูลเกิด", "set.profile.wipe": "ลบข้อมูลทั้งหมดออกจากเครื่องนี้",
    "set.profile.summary": "{name} · เกิด {dob}{timeSuffix} · วัน{planet} · ราศี{zodiac} · เลขชีวิต {lp}{jobSuffix}",
    "set.wipeConfirm": "ลบข้อมูลทั้งหมด (โปรไฟล์, feedback, API key) ออกจากเครื่องนี้?",
    "set.footer.disclaimer": "ORA เป็นบริการเพื่อความบันเทิงและการสะท้อนตนเอง<br>ไม่ใช่คำแนะนำทางการแพทย์ การเงิน หรือกฎหมาย",
    "set.astro.auto": "— อัตโนมัติตามประเทศ —",
    "set.undertone.auto": "— ไม่ทราบ (ให้ AI ดูจากรูปในแท็บสแกน) —",
    "set.ai.keyph": "วาง API key ที่นี่",
    "onb.name.ph": "เช่น พลอย", "onb.job.ph": "เช่น พนักงานการตลาด, เจ้าของร้านกาแฟ"
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
    "disc.entertain": "For self-reflection & entertainment — not medical, financial or legal advice",

    // ---- home / daily fortune ----
    "home.greet": "Hi {name} 🌅",
    "home.lucky.title": "🌈 Today's Lucky Color",
    "home.lucky.ruledBy": "{planet}'s energy rules today — today lands on the \"{position}\" position in your chart",
    "home.lucky.avoidNote": "💡 Today happens to be your caution (กาลกิณี) day — fine as a small accent (nails/accessory), but skip it as a full outfit today. Focus on mindfulness over color.",
    "home.lucky.wearNote": "👗 Try wearing this tone today to boost the day's energy ✨",
    "home.permcolor.title": "🎨 Your Permanent Colors (fixed daily — from your Mahataksa chart, {planet} birth day)",
    "home.permcolor.power": "Power-Career", "home.permcolor.luck": "Luck-Charm", "home.permcolor.avoid": "Avoid",
    "home.permcolor.note": "These stay the same every day based on your chart's power/luck/avoid positions — unlike \"Today's Lucky Color\" above, which changes with the ruling planet of the day.",
    "home.dos": "✅ Do today", "home.donts": "⚠️ Avoid today",
    "home.feedback.prompt": "How accurate was today's reading?",
    "home.base.title": "🧬 Your Birth Chart",
    "home.base.strength": "Strengths:", "home.base.selfaware": "Know yourself:", "home.base.career": "Careers that suit you:",
    "home.base.lagnaKnown": "Ascendant is an approximation from your birth time (Thai hour-house method)",
    "home.base.lagnaUnknown": "💡 Add your birth time in Settings to see an approximate ascendant",
    "home.period.title": "🌊 Current Life Phase (Taksa planetary period)",
    "home.period.range": "Age {start}–{end}:",
    "home.period.tone": "This period's tone:",
    "home.period.next": "⏭️ Next period:",
    "home.blood.title": "🩸 Personality: Blood Type {blood} × Birth Day",
    "home.blood.side1": "Blood type angle:", "home.blood.side2": "Birth day angle:", "home.blood.synthesis": "Combined view:", "home.blood.advice": "✅ How to use this:",

    // ---- feedback widget ----
    "fb.great": "😍 Spot on", "fb.ok": "🙂 Fairly close", "fb.meh": "😐 Meh", "fb.miss": "🙅 Not really",
    "fb.thanks": "Thank you 💛 the more you tell me, the more personal it gets",

    // ---- ask screen ----
    "ask.title": "💬 Ask Sister Ora",
    "ask.note.ai": "🤖 <b>AI mode is on</b> — Ora will ask a few follow-up questions before reading, so the answer truly fits your life",
    "ask.note.classic": "📖 You're in classic mode (rule-based) — turn on <b>free AI mode</b> in Settings so Ora can chat and dig into your question",
    "ask.hello": "Hi {name} 💛 it's Sister Ora\nPick a category above, or just type what's on your mind — like \"should I change jobs\" or \"is this relationship worth continuing\"",
    "ask.input.placeholder": "Type your question, e.g. should I change jobs...",
    "ask.thinking": "Ora is opening up your chart...",
    "ask.error": "Sorry, couldn't reach the AI ({err})\nCheck your API key in Settings, or try again — meanwhile here's a classic-mode reading 🙏",
    "ask.sensitive": "I won't give a definite prediction on this one 🙏 — it's something that really needs a real expert (doctor / financial advisor).\n\nBut if you'd like to look at your **energy and life rhythm** right now to help you prepare, I can do that — tell me how you're feeling or what's worrying you.",
    "ask.upsell": "💎 Want to see where multiple methods agree? Try \"Integrated\" mode from the menu above",
    "ask.upsell.close": "Dismiss",
    "cat.love": "Love", "cat.work": "Career", "cat.money": "Money", "cat.family": "Family", "cat.education": "Study", "cat.overview": "Overview",

    // ---- tarot ----
    "tarot.title": "🎴 Tarot",
    "tarot.instruction": "Focus on what you want to know, then choose <b>3 cards</b> 🙏",
    "tarot.picked": "{n}/3 cards chosen",
    "tarot.yourCards": "🎴 Your Cards",
    "tarot.drawing": "🎨 AI is painting your cards... (appears gradually, only happens once per card)",
    "tarot.feedback.prompt": "How well did this reading resonate?",
    "tarot.interpreting": "🤖 Ora is weaving all three cards together with your chart...",
    "tarot.aiFailed": "Couldn't reach the AI — you can still read each card's meaning above",
    "tarot.aiHint": "💡 Turn on AI mode in Settings so Ora can interpret all three cards together, tailored to your chart",
    "tarot.label.past": "Past / Root", "tarot.label.present": "Present", "tarot.label.future": "Emerging Trend",

    // ---- numbers ----
    "num.title": "🔢 Numbers", "num.lifepath.title": "Your Life Path Number", "num.phone.title": "Phone Number Analysis",
    "num.phone.placeholder": "e.g. 0812345678", "num.phone.go": "Analyze this number",
    "num.phone.invalid": "Please enter a full number (9–10 digits)",
    "num.phone.sum": "Full number sum:", "num.phone.sumNeutral": "Neutral energy — neither boosts nor drains",
    "num.phone.dominant": "🌟 Dominant digit: {digit} ({n} occurrences) — {planet}'s energy \"{trait}\": {desc}",
    "num.phone.tailTitle": "🔥 Last-4-digit pairs (strongest influence — 2× weight):",
    "num.phone.headTitle": "Leading digit pairs:",
    "num.phone.principle": "How to read it: each digit carries a planetary energy (1=Sun 2=Moon 3=Mars 4=Mercury 5=Jupiter 6=Venus 7=Saturn 8=Rahu 9=Ketu) — a pair blends two planets' energy, and the tail end of the number matters most.",
    "num.phone.goalPrompt": "🎯 Want a number pattern for a specific goal? (belief-based suggestion — your current number works fine, no need to change it)",
    "num.phone.goalPairs": "Traditionally favored pairs for {goal}:",
    "num.phone.disclaimer": "Based on belief-based numerology, for entertainment and peace of mind — not a scientific fact. Your number doesn't decide your life; your intention does.",
    "num.goal.career": "Career / Leadership", "num.goal.money": "Money / Business", "num.goal.love": "Love", "num.goal.charm": "Charm / Negotiation", "num.goal.support": "Mentor Support",

    // ---- scan ----
    "scan.title": "🔮 Image Readings",
    "scan.gate.title": "This feature needs AI mode",
    "scan.gate.body": "Palm, face, and skin-tone reading need AI image analysis — turn it on free with a Gemini API key in Settings (get a free key at aistudio.google.com/apikey)",
    "scan.gate.go": "Go to Settings",
    "scan.pick": "📷 Take / choose photo",
    "scan.disclaimer": "Your photo is downscaled on-device and sent directly to Google Gemini for analysis only — the app never stores or forwards it elsewhere; it's discarded right after analysis",
    "scan.kind.palm": "🖐️ Palm", "scan.kind.face": "👤 Face Reading", "scan.kind.style": "👗 Color & Style",
    "scan.desc.palm": "🖐️ <b>Palm Reading</b> — spread your dominant hand, shoot straight-on in good light, showing the full palm clearly. Ora will read the life, head, heart, fate lines and your hand's element",
    "scan.desc.face": "👤 <b>Face Reading</b> — face the camera directly, no filters, even lighting. Ora will read the three facial zones, key features, and suggest a hairstyle that suits your face shape",
    "scan.desc.style": "👗 <b>Personal Color Analysis</b> — face the camera in natural light, no filters. Ora will assess your warm/cool undertone and season, then blend it with your lucky colors into a personal styling + hairstyle guide",
    "scan.quality.title": "🔍 Image quality: {score}/100",
    "scan.quality.note": "Still analyzable, but a better photo means a more detailed reading — Ora won't guess what she can't see",
    "scan.palm.title": "🖐️ Your Palm", "scan.palm.original": "Original", "scan.palm.enhanced": "Line-enhanced",
    "scan.palm.overlayCaption": "Main line positions", "scan.palm.overlayApprox": "approximate (standard reference positions — real detection is coming in a future update)",
    "scan.analyzing": "🔮 Ora is studying your photo closely... (10–20 seconds)",
    "scan.faceCropNote": "Crop positions are standard proportions for a front-facing photo",
    "scan.faceCropNoteApprox": " (real landmark detection is coming in a future update)",
    "scan.feedback.prompt": "How accurate did this feel?",
    "scan.failed": "Sorry, analysis failed ({err}) — check your API key or try a smaller/clearer photo",

    // ---- settings ----
    "set.title": "⚙️ Settings", "set.pscore.title": "How personalized is your reading",
    "set.pscore.low": "Add your birth time, occupation, or give feedback after readings to make it more personal",
    "set.pscore.mid": "Nice progress! The more you ask and give feedback, the better Ora knows you",
    "set.pscore.high": "Your chart is highly personalized now ✨",
    "set.ai.title": "🤖 AI Mode — chat with the real Sister Ora",
    "set.ai.hint": "Paste a Gemini API key (get one free at <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">aistudio.google.com/apikey</a>) — the key stays on this device only, never sent anywhere but Google",
    "set.ai.save": "Save key", "set.ai.on": "✅ AI mode is on", "set.ai.off": "No key yet — using classic mode",
    "set.quota.free": "QA testing mode — everything unlocked 🎉",
    "set.quota.used": "Used today:", "set.quota.needPremium": "Needs Premium",
    "set.tone.title": "Preferred tone",
    "set.tone.opt.direct": "Direct and clear", "set.tone.opt.gentle": "Gentle and encouraging",
    "set.tone.opt.analytic": "Detailed and analytical", "set.tone.opt.brief": "Short and brief",
    "set.memory.title": "🧠 Ora's Memory",
    "set.memory.has": "Ora currently remembers {n} past topics — used to connect future readings",
    "set.memory.empty": "No conversations remembered yet — try asking something",
    "set.memory.note": "Ora only remembers conversations stored on this device (last 30 topics), to make readings feel continuous and thoughtful — never uploaded anywhere",
    "set.memory.clear": "Clear chat memory (start fresh)",
    "set.profile.title": "My Info", "set.profile.edit": "Edit birth info", "set.profile.wipe": "Delete all data from this device",
    "set.profile.summary": "{name} · born {dob}{timeSuffix} · {planet} day · {zodiac} · life path {lp}{jobSuffix}",
    "set.wipeConfirm": "Delete all data (profile, feedback, API key) from this device?",
    "set.footer.disclaimer": "ORA is for entertainment and self-reflection<br>not medical, financial, or legal advice",
    "set.astro.auto": "— Auto by country —",
    "set.undertone.auto": "— Unknown (let AI read it from your scan photo) —",
    "set.ai.keyph": "Paste your API key here",
    "onb.name.ph": "e.g. Alex", "onb.job.ph": "e.g. marketing manager, cafe owner"
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

// t(key, vars) พร้อม fallback chain: selected → en → th → key เอง
// vars: { name: "..." } แทนที่ {name} ในข้อความ — ใช้แทนการต่อ string เอง (โครงสร้างประโยคต่างกันตามภาษา)
I18N.t = function (key, vars) {
  const cur = I18N.STR[I18N.lang];
  let s = (cur && cur[key] != null) ? cur[key]
    : (I18N.STR.en[key] != null) ? I18N.STR.en[key]
    : (I18N.STR.th[key] != null) ? I18N.STR.th[key]
    : key;
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
};
I18N.translationStatus = function () { return I18N.langInfo().status; };

I18N.set = function (lang, country) {
  if (lang) I18N.lang = lang;
  if (country) I18N.country = country;
  I18N.apply();
};

// เติมคำแปลลง DOM: <el data-i18n="key"> (textContent), data-i18n-html="key" (innerHTML — ใช้เมื่อมี markup เช่น <a>), placeholder: data-i18n-ph
I18N.apply = function () {
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = I18N.t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = I18N.t(el.dataset.i18nHtml); });
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
