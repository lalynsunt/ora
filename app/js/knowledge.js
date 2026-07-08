// ============================================================
// ORA Knowledge Base — ศาสตร์ดั้งเดิม (rule-based, deterministic)
// ห้ามให้ LLM คำนวณข้อมูลในไฟล์นี้เอง — LLM มีหน้าที่ตีความเท่านั้น
// ============================================================
const K = {};

// ---------- มหาทักษา (ลำดับวงทักษา) ----------
K.TAKSA = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "เสาร์", "พฤหัสบดี", "ราหู", "ศุกร์"];
K.POSITIONS = ["บริวาร", "อายุ", "เดช", "ศรี", "มูละ", "อุตสาหะ", "มนตรี", "กาลกิณี"];
K.POSITION_EN = { "บริวาร": "Retinue", "อายุ": "Self", "เดช": "Authority", "ศรี": "Fortune", "มูละ": "Foundation", "อุตสาหะ": "Perseverance", "มนตรี": "Mentor", "กาลกิณี": "Challenge" };
K.positionName = function (th) { return (typeof I18N !== "undefined" && I18N.lang === "en") ? (K.POSITION_EN[th] || th) : th; };

K.PLANETS = {
  "อาทิตย์":  { color: "แดง",              hex: "#e05353" },
  "จันทร์":   { color: "เหลืองนวล / ขาวครีม", hex: "#f2d16b" },
  "อังคาร":   { color: "ชมพู",             hex: "#f08bb4" },
  "พุธ":      { color: "เขียว",             hex: "#4caf7d" },
  "เสาร์":    { color: "ม่วงเข้ม / ดำ",      hex: "#7e5aa2" },
  "พฤหัสบดี": { color: "ส้ม / แสด",         hex: "#ef9f4b" },
  "ราหู":     { color: "เทาควันบุหรี่",       hex: "#8b95a1" },
  "ศุกร์":    { color: "ฟ้า / น้ำเงิน",       hex: "#5b8fd9" }
};

K.POSITION_THEME = {
  "บริวาร":  { t: "วันของคนรอบตัว", d: "ครอบครัว เพื่อน ทีมงานเด่น มีเรื่องให้ดูแลกันหรือได้รับน้ำใจดีๆ", mod: { work: 1, love: 1, money: 0, mind: 0 },
    en: { t: "Day of the People Around You", d: "Family, friends, and teammates take the spotlight — expect either caring for others or receiving kindness." } },
  "อายุ":    { t: "วันของตัวคุณเอง", d: "เหมาะกับการดูแลสุขภาพกายใจ จัดระเบียบชีวิต ทำอะไรเพื่อตัวเองบ้าง", mod: { work: 0, love: 0, money: 0, mind: 2 },
    en: { t: "Day of Self", d: "Good for tending to your health, organizing your life, and doing something for yourself." } },
  "เดช":     { t: "วันแห่งอำนาจบารมี", d: "งานเด่น การเจรจา การนำเสนอ และความเป็นผู้นำได้ผลดีเป็นพิเศษ", mod: { work: 2, love: 0, money: 1, mind: 1 },
    en: { t: "Day of Authority", d: "Work, negotiation, presenting, and leadership all perform especially well today." } },
  "ศรี":     { t: "วันแห่งโชคลาภเสน่ห์", d: "การเงินและเสน่ห์เปล่งประกาย เหมาะเริ่มสิ่งมงคล เจรจาเรื่องเงิน หรือนัดพบคนพิเศษ", mod: { work: 1, love: 2, money: 2, mind: 1 },
    en: { t: "Day of Fortune & Charm", d: "Finances and charisma shine — great day to start something auspicious, negotiate money, or meet someone special." } },
  "มูละ":    { t: "วันแห่งความมั่นคง", d: "เหมาะกับเรื่องทรัพย์สิน การออม ของเก่า และการวางรากฐานระยะยาว", mod: { work: 1, love: 0, money: 2, mind: 0 },
    en: { t: "Day of Stability", d: "Good for property matters, savings, old belongings, and laying long-term foundations." } },
  "อุตสาหะ": { t: "วันแห่งความเพียร", d: "งานที่ทุ่มเทต่อเนื่องจะเริ่มเห็นผล ค่อยๆ ทำ ค่อยๆ ได้ อย่าใจร้อน", mod: { work: 2, love: 0, money: 1, mind: 0 },
    en: { t: "Day of Perseverance", d: "Sustained effort starts to pay off — take it step by step, no need to rush." } },
  "มนตรี":   { t: "วันแห่งผู้สนับสนุน", d: "ผู้ใหญ่ เจ้านาย หรือคนมีประสบการณ์พร้อมช่วยเหลือ เข้าหาขอคำปรึกษาได้ผลดี", mod: { work: 2, love: 1, money: 1, mind: 1 },
    en: { t: "Day of Mentors", d: "Elders, bosses, or experienced people are ready to help — a good day to ask for advice." } },
  "กาลกิณี": { t: "วันพลังงานท้าทาย", d: "ใจเย็นเป็นพิเศษ เลี่ยงการตัดสินใจเรื่องใหญ่ ทบทวนให้รอบคอบ — ผ่านไปได้ด้วยสติ", mod: { work: -1, love: -1, money: -1, mind: -1 },
    en: { t: "Day of Challenging Energy", d: "Stay extra calm today, avoid big decisions, and double-check the details — mindfulness will carry you through." } }
};

// วันเกิด → ดาวประจำวัน (พุธกลางคืน 18:00–05:59 = ราหู)
K.dayPlanetOf = function (date, birthTimeHour) {
  const names = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  let p = names[date.getDay()];
  if (p === "พุธ" && birthTimeHour != null && (birthTimeHour >= 18 || birthTimeHour < 6)) p = "ราหู";
  return p;
};

// สร้างผังทักษาของเจ้าชะตา: ตำแหน่ง → ดาว
K.taksaOf = function (birthPlanet) {
  const idx = K.TAKSA.indexOf(birthPlanet);
  const map = {};
  K.POSITIONS.forEach((pos, i) => { map[pos] = K.TAKSA[(idx + i) % 8]; });
  return map;
};

// ---------- เลขศาสตร์วันเกิด (Life Path 1–9) ----------
K.LIFEPATH = {
  1: { t: "ผู้นำโดยกำเนิด", d: "มีความมุ่งมั่น กล้าตัดสินใจ ชอบเริ่มต้นสิ่งใหม่ เหมาะกับงานที่ได้นำและสร้างเอง จุดพัฒนา: ฝึกรับฟังมุมมองคนอื่นให้มากขึ้น พลังของคุณจะยิ่งได้รับการสนับสนุน",
    en: "The Born Leader — driven, decisive, loves starting new things, thrives when leading or building. Growth edge: practice listening to other perspectives more — your power will earn even more support." },
  2: { t: "นักประสานสัมพันธ์", d: "อ่อนโยน เข้าใจคน เป็นที่พึ่งทางใจของคนรอบข้าง เก่งงานที่ต้องร่วมมือ จุดพัฒนา: กล้าบอกความต้องการของตัวเองบ้าง ความเกรงใจมากไปทำให้เหนื่อยคนเดียว",
    en: "The Connector — gentle, understanding, an emotional anchor for people around them, great at collaborative work. Growth edge: speak up about your own needs sometimes — too much consideration for others just tires you out alone." },
  3: { t: "นักสื่อสารเจ้าเสน่ห์", d: "มีความคิดสร้างสรรค์ พูดเก่ง เข้าสังคมเก่ง เหมาะกับงานสื่อสาร ศิลปะ การตลาด จุดพัฒนา: โฟกัสให้จบทีละเรื่อง พลังความคิดที่กระจายคือของขวัญที่ต้องจัดระเบียบ",
    en: "The Charming Communicator — creative, well-spoken, socially skilled, suited to communications, art, marketing. Growth edge: focus on finishing one thing at a time — your scattered creative energy is a gift that needs organizing." },
  4: { t: "ผู้สร้างรากฐาน", d: "ขยัน ละเอียด มีระบบ ไว้ใจได้ ความสำเร็จของคุณมาจากความสม่ำเสมอ จุดพัฒนา: อนุญาตให้ตัวเองยืดหยุ่นและพักบ้าง ความสมบูรณ์แบบไม่ต้อง 100% ทุกวัน",
    en: "The Foundation Builder — hardworking, meticulous, systematic, dependable; your success comes from consistency. Growth edge: allow yourself flexibility and rest — you don't need to be 100% perfect every day." },
  5: { t: "นักผจญภัยรักอิสระ", d: "ปรับตัวไว รักการเปลี่ยนแปลง เรียนรู้เร็ว เหมาะกับงานที่หลากหลาย ได้เดินทาง จุดพัฒนา: สร้างวินัยเล็กๆ ที่ทำทุกวัน อิสระที่มีโครงสร้างคืออิสระที่ยั่งยืน",
    en: "The Free-Spirited Adventurer — adapts fast, loves change, learns quickly, suited to varied and travel-heavy work. Growth edge: build a small daily discipline — structured freedom is freedom that lasts." },
  6: { t: "ผู้โอบอุ้มดูแล", d: "รักครอบครัว มีความรับผิดชอบสูง รสนิยมดี คนรอบตัวรู้สึกอบอุ่นเมื่ออยู่ใกล้ จุดพัฒนา: ดูแลตัวเองให้เท่ากับที่ดูแลคนอื่น การรักตัวเองไม่ใช่ความเห็นแก่ตัว",
    en: "The Nurturer — family-oriented, highly responsible, great taste; people feel warm around you. Growth edge: care for yourself as much as you care for others — self-love isn't selfishness." },
  7: { t: "นักคิดผู้ลึกซึ้ง", d: "ชอบวิเคราะห์ ใฝ่รู้ มีโลกภายในที่ลึก เหมาะกับงานวิชาการ วิจัย หรือสายจิตวิญญาณ จุดพัฒนา: เปิดใจแบ่งปันความคิดกับคนที่ไว้ใจ ความลึกของคุณมีค่าเกินกว่าจะเก็บไว้คนเดียว",
    en: "The Deep Thinker — analytical, curious, a rich inner world, suited to academia, research, or spiritual work. Growth edge: open up and share your thoughts with people you trust — your depth is too valuable to keep entirely to yourself." },
  8: { t: "นักบริหารพลังทรัพย์", d: "มีหัวการค้า มองภาพใหญ่เก่ง มีพลังดึงดูดความสำเร็จทางวัตถุ จุดพัฒนา: วัดความสำเร็จด้วยความสุขควบคู่ตัวเลข แล้วพลังของเลข 8 จะสมดุลที่สุด",
    en: "The Resource Manager — business-minded, sees the big picture, naturally draws material success. Growth edge: measure success by happiness alongside the numbers — that's when 8's power finds true balance." },
  9: { t: "ผู้ให้ผู้มีบารมี", d: "ใจกว้าง มีเมตตา มีเสน่ห์แบบผู้ใหญ่ คนเคารพนับถือ เหมาะกับงานที่ได้ช่วยเหลือผู้คน จุดพัฒนา: เรียนรู้ที่จะปล่อยวางสิ่งที่ควบคุมไม่ได้ ความเมตตาต่อตัวเองสำคัญที่สุด",
    en: "The Generous Elder — big-hearted, compassionate, a respected mature charisma, suited to helping others. Growth edge: learn to let go of what you can't control — compassion for yourself matters most." }
};

// ---------- วิเคราะห์เบอร์โทรศัพท์ (คู่เลข) ----------
// score: +2 ดีมาก +1 ดี 0 กลาง -1 ควรระวัง (โทนบวก ไม่ขู่)
K.PHONE_PAIRS = {
  "15": { s: 2, t: "เมตตามหานิยม ผู้ใหญ่เอ็นดู มีคนสนับสนุน" }, "51": { s: 2, t: "เสน่ห์ผู้ใหญ่ ได้รับความช่วยเหลือ อบอุ่น" },
  "24": { s: 2, t: "เลขค้าขาย การเงินคล่อง เจรจาเก่ง" }, "42": { s: 2, t: "หัวการค้า มีโชคเรื่องเงินจากการสื่อสาร" },
  "36": { s: 1, t: "มีเสน่ห์ทางสังคม ศิลปะ ความคิดสร้างสรรค์" }, "63": { s: 1, t: "อ่อนโยน เป็นที่รัก งานบริการ-ศิลปะเด่น" },
  "45": { s: 2, t: "ปัญญาเฉียบ ผู้ใหญ่ให้โอกาส เหมาะสายวิชาการ-บริหาร" }, "54": { s: 2, t: "ฉลาดรอบคอบ วางแผนเก่ง งานมั่นคง" },
  "56": { s: 2, t: "โชคด้านความรักและการเงิน คนเมตตา" }, "65": { s: 2, t: "เสน่ห์แรง มีโชคจากเพศตรงข้าม/คู่ค้า" },
  "89": { s: 2, t: "ก้าวหน้าเร็ว มีอำนาจ เงินเข้าไว เหมาะสายบริหาร" }, "98": { s: 2, t: "บารมีสูง งานใหญ่ เงินก้อน" },
  "78": { s: 1, t: "ขยันได้ทรัพย์ สำเร็จจากความเพียร" }, "87": { s: 1, t: "อดทนเก่ง ผลตอบแทนมาช้าแต่มั่นคง" },
  "46": { s: 1, t: "การเงินมั่นคง มีทรัพย์สะสม" }, "64": { s: 1, t: "รอบคอบเรื่องเงิน เก็บออมเก่ง" },
  "19": { s: 1, t: "ผู้นำที่มีบารมี กล้าตัดสินใจ" }, "91": { s: 1, t: "ความสำเร็จจากความกล้า จังหวะชีวิตเปิด" },
  "28": { s: 1, t: "การเงินจากหุ้นส่วน-เครือข่าย" }, "82": { s: 1, t: "คนช่วยเรื่องเงิน มีพันธมิตรดี" },
  "13": { s: -1, t: "พลังงานพลิกผัน — เสริมด้วยสติและแผนสำรอง จะกลายเป็นความยืดหยุ่น" },
  "31": { s: -1, t: "อารมณ์ศิลปินแรง — ฝึกสื่อสารตรงๆ จะลดความเข้าใจผิด" },
  "27": { s: -1, t: "คิดมากอ่อนไหว — หาเวลาพักใจ พลังนี้ใช้ดีคือความเข้าอกเข้าใจคน" },
  "72": { s: -1, t: "แบกความรู้สึกคนอื่นเก่ง — ตั้งขอบเขตให้ตัวเองบ้าง" },
  "38": { s: -1, t: "ใจร้อนกล้าเสี่ยง — ถ้ามีเบรกที่ดี กลายเป็นพลังบุกเบิก" },
  "83": { s: -1, t: "พลังแรงต้องมีทิศทาง — วางเป้าชัดแล้วพุ่งทีเดียว" },
  "03": { s: -1, t: "สื่อสารคลาดเคลื่อนง่าย — ย้ำข้อตกลงเป็นลายลักษณ์อักษรช่วยได้มาก" },
  "30": { s: -1, t: "พูดไวคิดไว — เว้นจังหวะก่อนตอบ เสน่ห์จะเพิ่มทันที" },
  "07": { s: -1, t: "เจออุปสรรคเป็นครู — ความสำเร็จของคุณจะลึกและแน่นกว่าคนอื่น" },
  "70": { s: -1, t: "จังหวะชีวิตช้าแต่ชัวร์ — อย่าเทียบกับใคร เดินตามจังหวะตัวเอง" }
};
K.PHONE_SUM_GOOD = { 15: "เสน่ห์เมตตา", 19: "อำนาจก้าวหน้า", 23: "สื่อสารเป็นเงิน", 24: "การเงินคล่องตัว", 36: "สังคมอุปถัมภ์", 40: "หัวใจนักสู้ มีชั้นเชิง", 41: "ปัญญา-บารมี", 42: "ค้าขายรุ่ง", 44: "พลังบุกเบิก", 45: "ปัญญาบารมีสูง", 46: "ทรัพย์มั่นคง", 50: "จิตใจดี คนช่วยเหลือ", 51: "ผู้ใหญ่เมตตา", 54: "สติปัญญา ผลงานเด่น", 55: "โชคผู้ใหญ่-ต่างชาติ", 56: "เสน่ห์-การเงินดี", 59: "โชคจากความสามารถ", 63: "เสน่ห์สังคม", 64: "การเงินสมดุล", 65: "โชคลาภ-ความรัก" };

// ---------- ทาโรต์ (Major Arcana 22 ใบ) ----------
K.TAROT = [
  { n: "The Fool", th: "จุดเริ่มต้นใหม่", e: "🌱", m: "การเริ่มต้นด้วยใจเปิดกว้าง โอกาสใหม่กำลังมา", adv: "กล้าก้าวแรกได้ แต่เตรียมข้อมูลพื้นฐานให้พร้อมก่อนกระโดด" },
  { n: "The Magician", th: "ผู้สร้างสรรค์", e: "✨", m: "คุณมีเครื่องมือและความสามารถครบแล้ว", adv: "ลงมือทำสิ่งที่คิดไว้ — จังหวะนี้ทักษะของคุณพร้อมใช้งาน" },
  { n: "The High Priestess", th: "ญาณหยั่งรู้", e: "🌙", m: "คำตอบอยู่ในใจคุณอยู่แล้ว ฟังสัญชาตญาณ", adv: "ยังไม่ต้องรีบตัดสินใจ เก็บข้อมูลเงียบๆ แล้วฟังเสียงข้างใน" },
  { n: "The Empress", th: "ความอุดมสมบูรณ์", e: "🌸", m: "ช่วงเวลาแห่งการเติบโต ความรัก และผลลัพธ์งอกงาม", adv: "ดูแลตัวเองดีๆ สิ่งที่หว่านไว้กำลังออกดอก" },
  { n: "The Emperor", th: "ความมั่นคงมีระบบ", e: "🏛️", m: "ความสำเร็จมาจากโครงสร้างและวินัย", adv: "จัดระบบ วางแผน ตั้งกติกาให้ชัด แล้วสิ่งต่างๆ จะเข้าที่" },
  { n: "The Hierophant", th: "ครูผู้ชี้ทาง", e: "📿", m: "คำแนะนำจากผู้มีประสบการณ์จะมีค่ามาก", adv: "ปรึกษาผู้ใหญ่หรือผู้เชี่ยวชาญก่อนตัดสินใจ อย่าเดินคนเดียว" },
  { n: "The Lovers", th: "ทางเลือกของหัวใจ", e: "💞", m: "ความสัมพันธ์และการเลือกที่ต้องใช้ทั้งใจและเหตุผล", adv: "เลือกสิ่งที่ตรงกับคุณค่าที่คุณยึดถือจริงๆ ไม่ใช่แค่ที่สบายใจชั่วคราว" },
  { n: "The Chariot", th: "ชัยชนะจากความมุ่งมั่น", e: "🏇", m: "เดินหน้าเต็มกำลัง ควบคุมทิศทางได้ด้วยตัวเอง", adv: "โฟกัสเป้าหมายเดียว พลังคุณช่วงนี้แรงพอจะฝ่าอุปสรรค" },
  { n: "Strength", th: "พลังใจอันอ่อนโยน", e: "🦁", m: "ความแข็งแกร่งที่แท้คือความสงบและอดทน", adv: "เอาชนะสถานการณ์ด้วยความนุ่มนวล ไม่ใช่การปะทะ" },
  { n: "The Hermit", th: "การใคร่ครวญ", e: "🏮", m: "ช่วงเวลาที่ควรถอยมาหนึ่งก้าวเพื่อเห็นภาพชัด", adv: "ให้เวลาตัวเองคิดเงียบๆ คำตอบจะชัดขึ้นเมื่อใจนิ่ง" },
  { n: "Wheel of Fortune", th: "วงล้อแห่งโชคชะตา", e: "🎡", m: "จังหวะชีวิตกำลังหมุนเปลี่ยน ประตูใหม่กำลังเปิด", adv: "เตรียมตัวให้พร้อมรับความเปลี่ยนแปลง มันมาพร้อมโอกาส" },
  { n: "Justice", th: "ความสมดุลยุติธรรม", e: "⚖️", m: "ผลลัพธ์จะสะท้อนการกระทำ ความจริงจะปรากฏ", adv: "ตัดสินใจด้วยข้อมูลและความเป็นธรรม ตรงไปตรงมาคือทางที่ชนะ" },
  { n: "The Hanged Man", th: "มุมมองใหม่", e: "🙃", m: "การหยุดรอที่มีความหมาย — เห็นสิ่งเดิมในมุมใหม่", adv: "ถ้าฝืนไม่ไป ลองหยุดแล้วมองกลับหัว อาจพบทางที่ไม่เคยเห็น" },
  { n: "Death", th: "การเปลี่ยนผ่าน", e: "🦋", m: "บทเก่ากำลังจบเพื่อให้บทใหม่เริ่มต้น (การเปลี่ยนแปลง ไม่ใช่เรื่องร้าย)", adv: "ปล่อยสิ่งที่หมดหน้าที่แล้วอย่างขอบคุณ พื้นที่ว่างคือที่ของสิ่งใหม่" },
  { n: "Temperance", th: "ความพอดี", e: "🕊️", m: "ความสำเร็จมาจากการผสมผสานอย่างสมดุล ไม่สุดโต่ง", adv: "ค่อยเป็นค่อยไป ปรับทีละนิด อย่าหักดิบหรือเทหมดหน้าตัก" },
  { n: "The Devil", th: "พันธนาการที่มองไม่เห็น", e: "⛓️", m: "มีบางสิ่งรั้งคุณไว้ — นิสัย ความกลัว หรือความสัมพันธ์ที่ไม่สมดุล", adv: "ตั้งคำถามว่าอะไรที่คุณ 'ติด' อยู่ทั้งที่รู้ว่าไม่ดีกับตัวเอง การเห็นมันคือก้าวแรกของอิสรภาพ" },
  { n: "The Tower", th: "การเปลี่ยนแปลงฉับพลัน", e: "⚡", m: "โครงสร้างเก่าที่ไม่มั่นคงกำลังถูกเขย่า เพื่อสร้างใหม่ให้แข็งแรงกว่า", adv: "อะไรที่พังให้พัง อย่าฝืนซ่อมของที่ควรสร้างใหม่ — คุณแข็งแรงพอ" },
  { n: "The Star", th: "ความหวัง", e: "⭐", m: "แสงสว่างหลังพายุ ความหวังที่รอมานานกำลังส่งสัญญาณตอบกลับ", adv: "เชื่อมั่นและทำต่อไป ช่วงนี้เหมาะกับการเยียวยาและตั้งเป้าใหม่" },
  { n: "The Moon", th: "ความไม่ชัดเจน", e: "🌕", m: "สถานการณ์ยังมีหมอก อย่าเพิ่งเชื่อทุกอย่างที่เห็น", adv: "ชะลอการตัดสินใจใหญ่ ตรวจสอบข้อเท็จจริงก่อน ความชัดเจนกำลังมา" },
  { n: "The Sun", th: "ความสำเร็จเบิกบาน", e: "☀️", m: "พลังบวกเต็มเปี่ยม ความสำเร็จและความสุขอย่างเปิดเผย", adv: "เดินหน้าเต็มที่ แชร์ความสุขกับคนรอบข้าง ช่วงนี้คุณคือแสงแดด" },
  { n: "Judgement", th: "การตื่นรู้", e: "📯", m: "ช่วงเวลาทบทวนอดีตเพื่อยกระดับตัวเอง การให้อภัยและเริ่มใหม่", adv: "สรุปบทเรียนจากที่ผ่านมา แล้วตอบ 'เสียงเรียก' ข้างในที่ชวนให้โตขึ้น" },
  { n: "The World", th: "ความสมบูรณ์", e: "🌍", m: "วัฏจักรหนึ่งกำลังจบอย่างงดงาม ความสำเร็จที่ครบถ้วน", adv: "ฉลองความสำเร็จ แล้วมองหาเวทีที่ใหญ่ขึ้น — คุณพร้อมแล้ว" }
];

// ---------- ราศีสากล (ละเอียด: ธาตุ ดาวเจ้าเรือน จุดแข็ง จุดอ่อน) ----------
// ---------- ตัวช่วยดึงเนื้อหาตามภาษา (fallback ไทยเสมอถ้าไม่มี .en หรือฟิลด์นั้นไม่ได้แปล) ----------
// ใช้กับ entry ที่มี sub-object `en` เช่น K.DAY_TRAITS[x], K.ZODIAC[i], K.SAWOEY_THEME[x]
K.L = function (entry, field) {
  if (!entry) return "";
  if (typeof I18N !== "undefined" && I18N.lang === "en" && entry.en && entry.en[field] !== undefined) {
    return entry.en[field];
  }
  return entry[field];
};
// ชื่อดาว/ธาตุแบบสั้น (ไม่ใช่ entry object) — ใช้แยกจาก K.L
K.planetName = function (th) { return (typeof I18N !== "undefined" && I18N.lang === "en") ? (K.PLANET_EN[th] || th) : th; };
K.elementName = function (th) { return (typeof I18N !== "undefined" && I18N.lang === "en") ? (K.ELEMENT_EN[th] || th) : th; };

// ---------- ชื่อภาษาอังกฤษของดาว/ธาตุ (ใช้ประกอบ display เมื่อ I18N.lang เป็น en) ----------
K.PLANET_EN = { "อาทิตย์": "Sun", "จันทร์": "Moon", "อังคาร": "Mars", "พุธ": "Mercury", "เสาร์": "Saturn", "พฤหัสบดี": "Jupiter", "ราหู": "Rahu", "ศุกร์": "Venus" };
K.ELEMENT_EN = { "ดิน": "Earth", "น้ำ": "Water", "ไฟ": "Fire", "ลม": "Air" };

K.ZODIAC = [
  { n: "มังกร", from: [12, 22], to: [1, 19], el: "ดิน", ruler: "เสาร์", tr: "อดทน มีเป้าหมาย รับผิดชอบสูง",
    str: ["วินัยและความทะเยอทะยานสูง", "วางแผนระยะยาวเก่ง", "ยิ่งกดดันยิ่งแกร่ง"], weak: ["เครียดง่าย ปล่อยวางยาก", "เอางานนำชีวิตจนลืมพัก"], tip: "เหมาะงานบริหาร โครงการระยะยาว อสังหาฯ",
    en: { n: "Capricorn", tr: "Patient, goal-driven, highly responsible",
      str: ["Strong discipline and ambition", "Excellent long-term planning", "Grows stronger under pressure"], weak: ["Stresses easily, hard to let go", "Lets work take over, forgets to rest"], tip: "Suited to management, long-term projects, real estate" } },
  { n: "กุมภ์", from: [1, 20], to: [2, 18], el: "ลม", ruler: "เสาร์", tr: "หัวก้าวหน้า รักอิสระ มีเอกลักษณ์",
    str: ["ความคิดสร้างสรรค์ล้ำ", "มีอุดมการณ์ เพื่อนฝูงกว้าง", "มองเทรนด์ล่วงหน้าขาด"], weak: ["ดื้อเชิงความคิด", "ดูเย็นชาเมื่อไม่อิน"], tip: "เหมาะนวัตกรรม เทคโนโลยี งานสังคม",
    en: { n: "Aquarius", tr: "Progressive, independent, distinctive",
      str: ["Highly original thinking", "Idealistic with a wide social circle", "Spots trends ahead of everyone"], weak: ["Stubborn in ideas", "Can seem detached when uninterested"], tip: "Suited to innovation, technology, social impact work" } },
  { n: "มีน", from: [2, 19], to: [3, 20], el: "น้ำ", ruler: "พฤหัสบดี", tr: "อ่อนโยน จินตนาการสูง เข้าใจคนเก่ง",
    str: ["จินตนาการและศิลปะในตัวสูง", "เข้าใจความรู้สึกคนลึกซึ้ง", "ปรับตัวเข้ากับทุกสถานการณ์"], weak: ["ใจอ่อน ถูกขอความช่วยเหลือเสมอ", "เพ้อฝันจนลืมลงมือ"], tip: "เหมาะศิลปะ งานเยียวยา งานช่วยเหลือผู้คน",
    en: { n: "Pisces", tr: "Gentle, deeply imaginative, empathetic",
      str: ["Strong artistic imagination", "Deep emotional understanding of others", "Adapts to any situation"], weak: ["Soft-hearted, often asked for help", "Daydreams instead of taking action"], tip: "Suited to the arts, healing work, helping professions" } },
  { n: "เมษ", from: [3, 21], to: [4, 19], el: "ไฟ", ruler: "อังคาร", tr: "กล้าลุย จริงใจ พลังงานสูง",
    str: ["กล้าเริ่มก่อนใคร", "ตัดสินใจไว ตรงไปตรงมา", "ฟื้นตัวจากความผิดหวังเร็ว"], weak: ["ใจร้อน รอไม่เก่ง", "เบื่อง่ายถ้าไม่ท้าทาย"], tip: "เหมาะงานบุกเบิก สตาร์ทอัพ งานแข่งขัน",
    en: { n: "Aries", tr: "Bold, sincere, high energy",
      str: ["First to take the leap", "Fast, straightforward decisions", "Bounces back quickly from setbacks"], weak: ["Impatient, dislikes waiting", "Gets bored without a challenge"], tip: "Suited to pioneering work, startups, competitive fields" } },
  { n: "พฤษภ", from: [4, 20], to: [5, 20], el: "ดิน", ruler: "ศุกร์", tr: "มั่นคง อบอุ่น รสนิยมดี",
    str: ["การเงินแน่น สะสมทรัพย์เก่ง", "อดทน ทำอะไรทำจริง", "รสนิยมด้านความงาม-อาหารเยี่ยม"], weak: ["ดื้อเงียบ เปลี่ยนยาก", "ติดความสบายเดิมๆ"], tip: "เหมาะการเงิน อาหาร ความงาม งานที่ต้องความสม่ำเสมอ",
    en: { n: "Taurus", tr: "Stable, warm, great taste",
      str: ["Solid finances, good at saving", "Patient and thorough in everything", "Excellent taste in beauty and food"], weak: ["Quietly stubborn, resists change", "Attached to comfort and routine"], tip: "Suited to finance, food, beauty, work needing consistency" } },
  { n: "เมถุน", from: [5, 21], to: [6, 20], el: "ลม", ruler: "พุธ", tr: "สื่อสารเก่ง ปรับตัวไว ความคิดไว",
    str: ["เจรจาและขายเก่งที่สุดในจักรราศี", "เรียนรู้เร็ว หลากหลาย", "มีมุกมีเสน่ห์ในวงสนทนา"], weak: ["จับจด ทำหลายอย่างไม่จบ", "สองอารมณ์ เปลี่ยนใจไว"], tip: "เหมาะการตลาด สื่อสาร การขาย งานที่หลากหลาย",
    en: { n: "Gemini", tr: "Great communicator, adaptable, quick-witted",
      str: ["Best negotiator/seller of the zodiac", "Learns fast across many topics", "Witty and charming in conversation"], weak: ["Scattered, leaves things unfinished", "Moody, changes mind quickly"], tip: "Suited to marketing, communications, sales, varied work" } },
  { n: "กรกฎ", from: [6, 21], to: [7, 22], el: "น้ำ", ruler: "จันทร์", tr: "ใส่ใจ ดูแลเก่ง ผูกพันครอบครัว",
    str: ["ดูแลปกป้องคนที่รักสุดตัว", "สัญชาตญาณแม่น อ่านบรรยากาศเก่ง", "จำรายละเอียดของคนสำคัญได้หมด"], weak: ["ขี้น้อยใจ เก็บเรื่องเล็กมาคิด", "ยึดติดอดีต"], tip: "เหมาะงานดูแลคน อาหาร อสังหาฯ ธุรกิจครอบครัว",
    en: { n: "Cancer", tr: "Caring, nurturing, family-bonded",
      str: ["Fiercely protective of loved ones", "Sharp instincts, reads a room well", "Remembers every detail about people who matter"], weak: ["Easily hurt, dwells on small things", "Holds onto the past"], tip: "Suited to caregiving, food, real estate, family business" } },
  { n: "สิงห์", from: [7, 23], to: [8, 22], el: "ไฟ", ruler: "อาทิตย์", tr: "มั่นใจ มีเสน่ห์ผู้นำ ใจกว้าง",
    str: ["บารมีผู้นำโดยธรรมชาติ", "ใจกว้าง ดูแลลูกน้องเก่ง", "เปล่งประกายบนเวที-ที่สาธารณะ"], weak: ["ถือเกียรติ ไม่ชอบเสียหน้า", "ต้องการคำชื่นชมเป็นพลังงาน"], tip: "เหมาะผู้นำองค์กร งานเวที บันเทิง แบรนด์ส่วนตัว",
    en: { n: "Leo", tr: "Confident, charismatic leader, generous",
      str: ["Natural leadership presence", "Generous, takes great care of their team", "Shines on stage and in public"], weak: ["Values pride, hates losing face", "Needs recognition as fuel"], tip: "Suited to leadership, performance, entertainment, personal branding" } },
  { n: "กันย์", from: [8, 23], to: [9, 22], el: "ดิน", ruler: "พุธ", tr: "ละเอียด วิเคราะห์เก่ง จริงจังกับงาน",
    str: ["ตาไวเห็นจุดผิดที่คนอื่นมองข้าม", "ระบบระเบียบดีเยี่ยม", "พึ่งพาได้ งานเนี้ยบ"], weak: ["จู้จี้กับตัวเองเกินไป", "กังวลล่วงหน้า"], tip: "เหมาะงานวิเคราะห์ บัญชี สุขภาพ งานคุณภาพ",
    en: { n: "Virgo", tr: "Meticulous, analytical, dedicated to work",
      str: ["Spots errors others miss", "Excellent systems and organization", "Reliable, polished work"], weak: ["Overly self-critical", "Worries ahead of time"], tip: "Suited to analysis, accounting, health, quality-focused work" } },
  { n: "ตุลย์", from: [9, 23], to: [10, 22], el: "ลม", ruler: "ศุกร์", tr: "รักความยุติธรรม มีเสน่ห์ สังคมดี",
    str: ["ประสานสิบทิศ คนรักทั้งสองฝ่าย", "รสนิยมและบุคลิกดูดีเป็นธรรมชาติ", "มองหลายมุมอย่างเป็นธรรม"], weak: ["ลังเลตัดสินใจช้า", "กลัวความขัดแย้งจนอึดอัดเอง"], tip: "เหมาะงานประสาน กฎหมาย แฟชั่น การทูต",
    en: { n: "Libra", tr: "Justice-loving, charming, socially skilled",
      str: ["Mediates well, liked by both sides", "Naturally good taste and presence", "Weighs multiple perspectives fairly"], weak: ["Slow, hesitant decisions", "Avoids conflict to the point of discomfort"], tip: "Suited to mediation, law, fashion, diplomacy" } },
  { n: "พิจิก", from: [10, 23], to: [11, 21], el: "น้ำ", ruler: "อังคาร", tr: "ลึกซึ้ง มุ่งมั่น อ่านคนเก่ง",
    str: ["โฟกัสลึกจนถึงแก่นทุกเรื่องที่สนใจ", "อ่านเจตนาคนขาด", "รักจริงทุ่มสุดตัว"], weak: ["หวงและระแวงเมื่อไม่มั่นคง", "ให้อภัยยาก"], tip: "เหมาะงานสืบสวน วิจัย จิตวิทยา การเงินเชิงลึก",
    en: { n: "Scorpio", tr: "Deep, determined, reads people well",
      str: ["Digs to the core of anything they focus on", "Reads people's true intentions", "Loves fully once committed"], weak: ["Possessive and wary when insecure", "Slow to forgive"], tip: "Suited to investigation, research, psychology, deep finance" } },
  { n: "ธนู", from: [11, 22], to: [12, 21], el: "ไฟ", ruler: "พฤหัสบดี", tr: "มองโลกกว้าง ตรงไปตรงมา รักการเรียนรู้",
    str: ["วิสัยทัศน์กว้าง เห็นภาพใหญ่", "อารมณ์ดี พาคนรอบข้างมีความหวัง", "กล้าเสี่ยงอย่างมีหลักการ"], weak: ["ปากไวเกินใจคิด", "เบื่อพันธะผูกมัด"], tip: "เหมาะต่างประเทศ การศึกษา สายวิชาการ ท่องเที่ยว",
    en: { n: "Sagittarius", tr: "Big-picture thinker, blunt, loves learning",
      str: ["Sees the big picture clearly", "Upbeat, brings hope to people around them", "Takes calculated risks bravely"], weak: ["Speaks before thinking", "Gets restless with commitment"], tip: "Suited to international work, education, academia, travel" } }
];
K.zodiacOf = function (m, d) {
  for (const z of K.ZODIAC) {
    const [fm, fd] = z.from, [tm, td] = z.to;
    if ((m === fm && d >= fd) || (m === tm && d <= td)) return z;
  }
  return K.ZODIAC[0];
};

// ---------- คลังคำแนะนำรายวัน ----------
K.DO_POOL = [
  "เคลียร์งานค้างชิ้นที่เล็กที่สุดก่อน — โมเมนตัมจะพาไปเอง",
  "ทักหาคนที่รอคำตอบจากคุณ ความสัมพันธ์จะดีขึ้นทันตา",
  "จดสิ่งที่ขอบคุณ 3 อย่างก่อนนอน",
  "เดินเร็ว 15 นาที ให้พลังงานในตัวหมุนเวียน",
  "ทบทวนรายรับ-รายจ่ายสัปดาห์นี้สั้นๆ",
  "จัดโต๊ะทำงานให้โล่งขึ้น 1 มุม พลังงานใหม่จะไหลเข้า",
  "ชมคนใกล้ตัวอย่างจริงใจ 1 ครั้ง",
  "ดื่มน้ำให้มากกว่าเมื่อวาน ร่างกายคือฐานของดวง",
  "อ่านหรือฟังอะไรที่ให้ความรู้ 20 นาที",
  "ตอบข้อความ/อีเมลที่ดองไว้ให้จบ",
  "วางแผนพรุ่งนี้ก่อนนอน 5 นาที",
  "ยิ้มให้คนแปลกหน้า 1 ครั้ง — เสน่ห์เริ่มจากตรงนี้"
];
K.DONT_POOL = [
  "เลี่ยงการตอบข้อความสำคัญตอนอารมณ์ขุ่น — พิมพ์ไว้ก่อน ส่งพรุ่งนี้",
  "เลี่ยงการตัดสินใจเรื่องเงินก้อนใหญ่แบบเร่งรีบ",
  "เลี่ยงการเปรียบเทียบตัวเองกับคนใน social ยามดึก",
  "เลี่ยงการรับปากสิ่งที่ยังไม่แน่ใจ ขอเวลาคิดได้เสมอ",
  "เลี่ยงการพูดเรื่องคนอื่นลับหลัง วันนี้เสียงสะท้อนไวเป็นพิเศษ",
  "เลี่ยงคาเฟอีนหลังบ่ายสาม ใจที่นิ่งคือโชคของวันพรุ่งนี้",
  "เลี่ยงการเปิดหลายงานพร้อมกัน โฟกัสทีละอย่าง",
  "เลี่ยงการเก็บความไม่พอใจไว้เงียบๆ สื่อสารดีๆ ได้ผลกว่า"
];
K.AFFIRM = [
  "เสียงของฉันมีน้ำหนัก เมื่อฉันพูดจากความตั้งใจจริง",
  "ฉันเติบโตขึ้นทุกวัน แม้ในวันที่มองไม่เห็นผล",
  "สิ่งดีๆ กำลังเดินทางมาหาฉัน ในจังหวะที่เหมาะสม",
  "ฉันเลือกตอบสนองอย่างสงบ ต่อสิ่งที่ควบคุมไม่ได้",
  "ความพยายามของฉันไม่เคยสูญเปล่า มันสะสมอยู่เสมอ",
  "ฉันคู่ควรกับความรักและความสำเร็จ",
  "วันนี้ฉันจะใจดีกับตัวเองอีกนิด",
  "อุปสรรคคือครู ไม่ใช่กำแพง",
  "ฉันดึงดูดผู้คนและโอกาสที่ดีเข้ามาในชีวิต",
  "ความสงบในใจฉัน คือพลังที่แท้จริง"
];

// ---------- นิสัยพื้นฐานตามวันเกิด (ตำราโหราไทย) ----------
K.DAY_TRAITS = {
  "อาทิตย์":  { t: "ผู้นำผู้ทระนง", d: "เชื่อมั่นในตัวเอง รักศักดิ์ศรี ใจถึงพึ่งได้ มีบารมีให้คนเกรงใจตั้งแต่เกิด", str: ["ความเป็นผู้นำ กล้าตัดสินใจ", "จริงใจ ตรงไปตรงมา", "รับผิดชอบสูง เป็นที่พึ่งของคนรอบตัว"], weak: ["ใจร้อน ไม่ชอบให้ใครขัด", "ถือเกียรติจนบางครั้งเสียโอกาส"], job: "งานบริหาร ราชการ เจ้าของกิจการ งานที่ได้นำ",
    en: { t: "The Proud Leader", d: "Self-assured, values dignity, dependable — carries a natural authority people respect from the start.", str: ["Leadership, decisive under pressure", "Sincere and straightforward", "Highly responsible, a rock for others"], weak: ["Quick temper, dislikes being contradicted", "Pride sometimes costs an opportunity"], job: "Management, government, business ownership, leadership roles" } },
  "จันทร์":   { t: "ผู้อ่อนโยนละมุนใจ", d: "ละเอียดอ่อน เข้าใจความรู้สึกคน ช่างจดจำ มีเสน่ห์แบบนุ่มนวลที่คนอยากเข้าใกล้", str: ["มนุษยสัมพันธ์และความเมตตา", "จินตนาการดี ใส่ใจรายละเอียด", "ประนีประนอมเก่ง"], weak: ["อ่อนไหวง่าย เก็บเรื่องเล็กมาคิด", "ตัดสินใจตามอารมณ์เมื่อใจไม่นิ่ง"], job: "งานดูแลคน บริการ ศิลปะ งานสร้างสรรค์",
    en: { t: "The Gentle Soul", d: "Sensitive, deeply attuned to others' feelings, a great memory, with a soft charm people are drawn to.", str: ["Warm people skills and compassion", "Imaginative, detail-oriented", "Great at smoothing things over"], weak: ["Sensitive, dwells on small things", "Decides emotionally when unsettled"], job: "Caregiving, service, art, creative work" } },
  "อังคาร":   { t: "นักสู้ผู้ไม่ยอมแพ้", d: "ขยัน อดทน กล้าได้กล้าเสีย พลังงานสูง เจออุปสรรคแล้วยิ่งฮึด", str: ["ลงมือจริง ไม่กลัวงานหนัก", "กล้าเผชิญหน้า ปกป้องคนของตัวเอง", "ฟื้นตัวไว"], weak: ["วู่วาม ปะทะตรงเกินไป", "ใจร้อนเรื่องผลลัพธ์"], job: "งานที่ใช้พลัง วิศวกรรม กีฬา งานภาคสนาม ตำรวจ-ทหาร",
    en: { t: "The Relentless Fighter", d: "Hardworking, resilient, bold, high energy — obstacles only fuel more determination.", str: ["Hands-on, unafraid of hard work", "Faces things head-on, protective of their own", "Bounces back fast"], weak: ["Impulsive, confronts too directly", "Impatient for results"], job: "Physically active work, engineering, sports, fieldwork, military/police" } },
  "พุธ":      { t: "นักเจรจาผู้ปราดเปรื่อง", d: "ฉลาด ปฏิภาณไว พูดเก่ง ปรับตัวเยี่ยม เรียนรู้อะไรใหม่ได้เร็วกว่าคนทั่วไป", str: ["การสื่อสารและการค้า", "ไหวพริบแก้ปัญหาเฉพาะหน้า", "เข้าได้กับคนทุกวงการ"], weak: ["เบื่อง่าย จับหลายอย่างพร้อมกัน", "พูดไวจนบางครั้งเกินใจคิด"], job: "ค้าขาย การตลาด สื่อสาร ครู นักเขียน ล่าม",
    en: { t: "The Sharp Negotiator", d: "Clever, quick-witted, a natural talker, adapts easily, and picks up new things faster than most.", str: ["Communication and trade", "Quick on their feet solving problems", "Fits in with any crowd"], weak: ["Gets bored, juggles too much at once", "Speaks before thinking sometimes"], job: "Trade, marketing, communications, teaching, writing, interpreting" } },
  "เสาร์":    { t: "ผู้หนักแน่นดั่งขุนเขา", d: "อดทนที่สุดใน 7 วัน รับผิดชอบ ไว้ใจได้ ชีวิตมักลำบากก่อนสบายและสำเร็จแบบยั่งยืน", str: ["ความเพียรและวินัย", "บริหารจัดการ ควบคุมงานใหญ่ได้", "นิ่งในวิกฤต"], weak: ["เก็บความเครียดไว้คนเดียว", "ดูเข้มจนคนไม่กล้าเข้าหา"], job: "ที่ดิน ก่อสร้าง กฎหมาย งานระยะยาวที่ต้องความอึด",
    en: { t: "The Mountain", d: "The most patient of the seven days, dependable and responsible — life is often hard before it becomes stable and lastingly successful.", str: ["Perseverance and discipline", "Can manage and run large operations", "Calm under crisis"], weak: ["Bottles up stress alone", "Can seem too intense to approach"], job: "Real estate, construction, law, long-haul work requiring endurance" } },
  "พฤหัสบดี": { t: "ปราชญ์ผู้มีคุณธรรม", d: "ปัญญาดี ใฝ่ธรรม น่าเชื่อถือ ผู้ใหญ่รักเอ็นดู มักได้เป็นที่ปรึกษาของคนรอบตัว", str: ["ความรู้และวิจารณญาณ", "ความน่าเชื่อถือ ผู้คนไว้วางใจ", "สอนและถ่ายทอดเก่ง"], weak: ["ยึดหลักการจนดูดื้อ", "คาดหวังมาตรฐานสูงกับคนอื่น"], job: "ครู ที่ปรึกษา ผู้พิพากษา การเงิน-การธนาคาร ศาสนา",
    en: { t: "The Virtuous Sage", d: "Wise, principled, trustworthy, favored by elders — often ends up as the advisor among their circle.", str: ["Knowledge and sound judgment", "Trustworthy, people rely on them", "Great at teaching and passing on knowledge"], weak: ["Can seem stubborn about principles", "Holds others to high standards"], job: "Teaching, consulting, law/judiciary, banking-finance, religious work" } },
  "ราหู":     { t: "ผู้ทรงเสน่ห์ลึกลับ (พุธกลางคืน)", d: "ลึกซึ้ง กล้าแตกต่าง อ่านเกมขาด ชีวิตพลิกผันแต่ทุกครั้งที่พลิกมักขึ้นสูงกว่าเดิม", str: ["ปรับตัวเก่งในทุกสถานการณ์", "มองทะลุสิ่งที่คนอื่นมองไม่เห็น", "เสน่ห์เฉพาะตัวแรง"], weak: ["อารมณ์ขึ้นลงเป็นคลื่น", "เบื่อกรอบและกติกา"], job: "งานกลางคืน ต่างประเทศ เทคโนโลยี งานสายมู ธุรกิจแนวใหม่",
    en: { t: "The Mysterious Charmer (Night-born Mercury)", d: "Deep, unafraid to be different, reads situations sharply — life takes sharp turns, but each turn tends to lead somewhere higher.", str: ["Adapts well to any situation", "Sees what others miss", "Strong, distinctive personal charisma"], weak: ["Moods rise and fall like waves", "Chafes against rules and structure"], job: "Night-shift work, overseas work, technology, spiritual/mystic field, new ventures" } },
  "ศุกร์":    { t: "ศิลปินเจ้าเสน่ห์", d: "รักสวยรักงาม รสนิยมดี การเงินคล่อง มีเสน่ห์ดึงดูดทั้งผู้คนและโชคลาภ", str: ["เสน่ห์และรสนิยม", "เจรจานุ่มนวลได้ใจคน", "หาเงินเก่งจากความคิดสร้างสรรค์"], weak: ["ใจอ่อนเรื่องความรัก", "ใช้จ่ายตามอารมณ์เมื่อเครียด"], job: "ศิลปะ บันเทิง ความงาม แฟชั่น การเงิน งานบริการหรู",
    en: { t: "The Charming Artist", d: "Loves beauty, great taste, good with money, and naturally draws both people and fortune.", str: ["Charm and good taste", "Wins people over with a gentle approach", "Earns well through creativity"], weak: ["Soft-hearted in love", "Spends emotionally under stress"], job: "Arts, entertainment, beauty, fashion, finance, premium service work" } }
};

// ---------- ลัคนาโดยประมาณ (เรือนชั่วยาม: รุ่งเช้า 06:00 = ราศีสุริยะ, ขยับราศีละ 2 ชม.) ----------
K.SIGN_ORDER = ["เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุลย์", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน"];
// ขอบเขตราศีแบบไทย (นิรายนะ โดยประมาณ): [เดือน, วัน] ที่เริ่มราศี
K.SIDEREAL_START = [
  [1, 14, "มังกร"], [2, 13, "กุมภ์"], [3, 14, "มีน"], [4, 13, "เมษ"],
  [5, 14, "พฤษภ"], [6, 14, "เมถุน"], [7, 15, "กรกฎ"], [8, 17, "สิงห์"],
  [9, 17, "กันย์"], [10, 17, "ตุลย์"], [11, 16, "พิจิก"], [12, 16, "ธนู"]
];
K.zodiacByName = function (n) { return K.ZODIAC.find(z => z.n === n) || null; };

// ---------- ทักษาเสวยอายุ (มหาทักษา: รอบ 108 ปี เริ่มจากดาววันเกิด) ----------
K.SAWOEY_YEARS = { "อาทิตย์": 6, "จันทร์": 15, "อังคาร": 8, "พุธ": 17, "เสาร์": 10, "พฤหัสบดี": 19, "ราหู": 12, "ศุกร์": 21 };
// gradeKey: ตัวช่วยเลือกสี UI ที่ไม่ผูกภาษา (great|good|neutral|challenge) — ห้ามใช้ g (ข้อความแสดงผล) มาตัดสินสีอีกต่อไป
K.SAWOEY_THEME = {
  "บริวาร":  { g: "ปานกลาง-อบอุ่น", gradeKey: "neutral", t: "ช่วงสร้างฐานผู้คน", d: "ครอบครัว ทีมงาน มิตรสหายเข้ามามีบทบาท ทั้งช่วยเหลือและให้เราดูแล ความสำเร็จช่วงนี้มาจาก 'การมีพวก' อย่าทำอะไรคนเดียว",
    en: { g: "Moderate-Warm", t: "Community-Building Period", d: "Family, teammates, and friends play a bigger role — sometimes helping you, sometimes needing your care. Success now comes from having people with you, not going it alone." } },
  "อายุ":    { g: "ฟื้นฟู", gradeKey: "neutral", t: "ช่วงกลับมาหาตัวเอง", d: "เหมาะดูแลสุขภาพกายใจ เรียนรู้เพิ่ม ปรับพื้นฐานชีวิต ผลลัพธ์ภายนอกอาจไม่หวือหวา แต่สิ่งที่ซ่อมแซมช่วงนี้คือทุนของช่วงถัดไป",
    en: { g: "Restorative", t: "Return-to-Self Period", d: "Good for tending health, learning, and resetting your foundation. External results may look quiet, but what you repair now becomes capital for the next period." } },
  "เดช":     { g: "ดีมาก", gradeKey: "great", t: "ช่วงรุ่งเรืองอำนาจบารมี", d: "หน้าที่การงาน ชื่อเสียง ตำแหน่ง เด่นชัดที่สุด เหมาะรับงานใหญ่ ขยายกิจการ สร้างเครดิต ชื่อของคุณจะถูกจดจำจากสิ่งที่ทำช่วงนี้",
    en: { g: "Excellent", t: "Peak Authority Period", d: "Career, reputation, and status are at their most visible. Great time to take on big responsibilities, expand, and build credibility — what you do now is what people will remember." } },
  "ศรี":     { g: "ดีมาก", gradeKey: "great", t: "ช่วงโชคลาภสิริมงคล", d: "การเงิน ความรัก และสิ่งมงคลไหลเข้า เหมาะเริ่มต้นสิ่งที่ใฝ่ฝัน แต่งงาน ลงทุนที่ศึกษามาดี เก็บเกี่ยวผลของความพยายามเก่า",
    en: { g: "Excellent", t: "Fortune & Blessings Period", d: "Money, love, and good fortune flow in. Great time to start something you've dreamed of, marry, or invest (with proper research) — this is the harvest of past effort." } },
  "มูละ":    { g: "ดี-มั่นคง", gradeKey: "good", t: "ช่วงลงหลักปักฐาน", d: "ทรัพย์สินถาวร บ้าน ที่ดิน เงินออม มรดกตกทอด เด่น เหมาะสะสมความมั่นคงระยะยาวมากกว่าเสี่ยงระยะสั้น",
    en: { g: "Good-Stable", t: "Foundation-Laying Period", d: "Fixed assets, property, savings, and inheritance come into focus. Better to build long-term stability than chase short-term risk." } },
  "อุตสาหะ": { g: "เหนื่อยแต่สะสม", gradeKey: "neutral", t: "ช่วงหว่านไถ", d: "ทุกอย่างต้องแลกด้วยความเพียร ผลตอบแทนมาช้าแต่สะสมเป็นฐานแน่น อย่าเทียบกับใครและอย่าหยุดกลางทาง — คนที่ผ่านช่วงนี้ได้จะรับผลเต็มในช่วงถัดไป",
    en: { g: "Effortful but Building", t: "Sowing Period", d: "Everything now takes real effort — the payoff is slow but builds a solid base. Don't compare yourself to others, and don't stop halfway; those who push through reap fully in the next period." } },
  "มนตรี":   { g: "ดี", gradeKey: "good", t: "ช่วงผู้ใหญ่อุปถัมภ์", d: "มีคนคอยเปิดทาง เจ้านาย ผู้ใหญ่ หรือผู้มีประสบการณ์พร้อมสนับสนุน เหมาะขอโอกาส เรียนต่อ ขยับสายงาน เข้าหาผู้ใหญ่ให้มาก",
    en: { g: "Good", t: "Mentorship Period", d: "People are ready to open doors for you — bosses, elders, experienced mentors. Good time to ask for opportunities, continue studying, or make a career move. Reach out to mentors more." } },
  "กาลกิณี": { g: "ท้าทาย", gradeKey: "challenge", t: "ช่วงบททดสอบ", d: "อุปสรรคเข้ามาให้ฝึกความรอบคอบ ระวังเอกสาร สัญญา คนหลอกลวง และสุขภาพ ทำทุกอย่างช้าลงหนึ่งจังหวะ ทำบุญเสริมกำลังใจ — ช่วงนี้ผ่านไปได้เสมอ และช่วงถัดไปจะสว่างขึ้นชัดเจน",
    en: { g: "Challenging", t: "Testing Period", d: "Obstacles show up to sharpen your caution — watch documents, contracts, scams, and health. Slow everything down by one notch; a small act of kindness helps morale. This period always passes, and the next one brightens clearly." } }
};

// ---------- เลขรายตัวตามดาว (เลขศาสตร์เบอร์โทร) ----------
K.DIGIT = {
  "0": { p: "ความว่าง", t: "อิสระ-ไร้กรอบ", d: "เสริมพลังเลขข้างเคียงให้แรงขึ้น แต่ถ้ามากไปทำให้จับต้องยาก ล่องลอย" },
  "1": { p: "อาทิตย์", t: "ผู้นำ-อำนาจ", d: "ความเชื่อมั่น ความเป็นหัวหน้า การเริ่มต้น เหมาะคนอยากมีอำนาจตัดสินใจ" },
  "2": { p: "จันทร์", t: "เสน่ห์นุ่มนวล", d: "ความละเอียดอ่อน เมตตา ผู้คนเอ็นดู เหมาะงานติดต่อผู้คน งานบริการ" },
  "3": { p: "อังคาร", t: "นักสู้-พลังลุย", d: "ความกล้า ขยัน พลังสูง แรงและเร็ว — ดีเมื่อมีเลขปัญญาคุม ระวังวู่วามถ้าซ้ำมาก" },
  "4": { p: "พุธ", t: "สื่อสาร-การค้า", d: "การเจรจา ค้าขาย ไหวพริบ ความคล่องตัว เหมาะนักขาย นักพูด นักเรียน" },
  "5": { p: "พฤหัสบดี", t: "ปัญญา-ผู้ใหญ่เมตตา", d: "ความรู้ ความน่าเชื่อถือ ผู้ใหญ่สนับสนุน เหมาะครู ที่ปรึกษา ผู้บริหาร" },
  "6": { p: "ศุกร์", t: "การเงิน-ความรัก-ศิลปะ", d: "เสน่ห์ โชคทางการเงิน ความรัก ความงาม เหมาะสายบันเทิง การเงิน ค้าขายของสวยงาม" },
  "7": { p: "เสาร์", t: "อดทน-หนักแน่น", d: "ความเพียร ความอึด สำเร็จแบบเหนื่อยก่อนได้ — มีบ้างดี (สร้างวินัย) มากไปชีวิตหนัก" },
  "8": { p: "ราหู", t: "ลาภลอย-ผันผวน", d: "โชคแบบก้าวกระโดด เงินไหลแรง สายมูเตลู — พลังแรงทั้งบวกและลบ ต้องมีเลขมงคลประกบ" },
  "9": { p: "เกตุ", t: "สิ่งศักดิ์สิทธิ์คุ้มครอง", d: "แคล้วคลาด ผู้ใหญ่คุ้มครอง ความสำเร็จเหนือคาด เลขมงคลที่คนไทยนิยมสูงสุด" }
};

// ---------- เลขโรมันไพ่ทาโรต์ ----------
K.ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

// ---------- Seasonal Color Analysis (โทนสีผิว 4 ฤดู) ----------
K.SEASONS = {
  "Spring":  { th: "สปริง (Warm สว่างสดใส)", tone: "Warm Tone", skin: "ผิวโทนเหลืองทอง สว่าง ใส", best: "ครีม พีช คอรัล ส้มอ่อน เขียวใบไม้อ่อน ทองสว่าง ฟ้าเทอร์ควอยซ์", avoid: "ดำสนิท เทาหม่น สีหม่นทึบ", makeup: "โทนพีช-คอรัล ทองชิมเมอร์" },
  "Summer":  { th: "ซัมเมอร์ (Cool อ่อนโยน)", tone: "Cool Tone", skin: "ผิวโทนชมพูอมฟ้า สว่างนวล", best: "พาสเทล ฟ้าหม่น ลาเวนเดอร์ ชมพูกุหลาบ เทาอ่อน ขาวออฟไวท์", avoid: "ส้มจัด ทองเหลืองเข้ม สีร้อนแรง", makeup: "โทนชมพูกุหลาบ-เบอร์รี่อ่อน เงินนวล" },
  "Autumn":  { th: "ออทัมน์ (Warm ลึกอบอุ่น)", tone: "Warm Tone", skin: "ผิวโทนเหลืองทอง เข้มอมน้ำผึ้ง", best: "น้ำตาล คาราเมล เขียวขี้ม้า ส้มอิฐ มัสตาร์ด ทองแดง ครีมเข้ม", avoid: "พาสเทลจ๋า ฟ้าสดใส ชมพูช็อกกิ้ง", makeup: "โทนน้ำตาลส้ม-เทอร์ราคอตต้า ทองด้าน" },
  "Winter":  { th: "วินเทอร์ (Cool คมชัด)", tone: "Cool Tone", skin: "ผิวโทนชมพูอมฟ้า คอนทราสต์เข้มชัด", best: "ดำ ขาวจั๊วะ แดงเชอร์รี่ น้ำเงินเข้ม ม่วงเข้ม มรกต เงิน", avoid: "เอิร์ธโทนหม่น ส้มอิฐ เบจซีด", makeup: "โทนแดงเบอร์รี่-พลัม เงินวิบวับ" }
};

// ---------- ทรงผมตามรูปหน้า ----------
K.HAIR = {
  "รูปไข่": "ได้เกือบทุกทรง — เลือกตามไลฟ์สไตล์และเส้นผมได้เลย ทรงที่โชว์โครงหน้า (รวบ, เปิดหน้าผาก) จะยิ่งเสริมความสง่า",
  "กลม": "เพิ่มวอลลุ่มด้านบน ผมยาวประบ่าไล่เลเยอร์ หรือหน้าม้าปัดข้าง ช่วยยืดสัดส่วนหน้า — เลี่ยงบ๊อบสั้นตรงเสมอคางและหน้าม้าหนาตรง",
  "เหลี่ยม": "ปลายผมโค้งซอฟต์เลเยอร์ หน้าม้าบางโปร่ง ผมยาวคลื่นเบาๆ ช่วยลดเหลี่ยมกราม — เลี่ยงตัดตรงเป๊ะและเปิดกรามชัด",
  "ยาว": "หน้าม้า (ตรงหรือปัด) + วอลลุ่มด้านข้าง ช่วยย่นสัดส่วน — เลี่ยงผมยาวตรงแนบหน้าไม่มีหน้าม้า",
  "หัวใจ": "วอลลุ่มช่วงคางถึงปลายผม บ๊อบยาว หรือคลื่นปลาย ช่วยถ่วงสมดุลคางเรียว — เลี่ยงวอลลุ่มบนหัวเยอะ"
};

// ---------- คำที่ต้องเข้าโหมด supportive (safety) ----------
// คำเฝ้าระวัง: ครอบคลุมทั้งไทย+อังกฤษ เพราะผู้ใช้พิมพ์ได้ทุกภาษาไม่ว่า UI จะตั้งเป็นภาษาไหน
K.CRISIS_WORDS = ["ฆ่าตัวตาย", "อยากตาย", "ไม่อยากอยู่", "ทำร้ายตัวเอง", "จบชีวิต",
  "suicide", "kill myself", "want to die", "end my life", "self harm", "self-harm", "hurt myself"];
K.SENSITIVE_WORDS = ["มะเร็ง", "โรคร้าย", "เนื้องอก", "ตั้งครรภ์", "แท้ง", "หวย", "เลขเด็ด", "พนัน", "หุ้นตัวไหน", "เหรียญไหน",
  "cancer", "tumor", "pregnant", "pregnancy", "miscarriage", "lottery", "gambling", "which stock", "which coin", "which crypto"];
