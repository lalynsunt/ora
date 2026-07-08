// ORA engine smoke tests — รัน: node tests/test-engine.js (จาก root โปรเจกต์)
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "app", "js") + path.sep;

function load(f, name) {
  const src = fs.readFileSync(dir + f, "utf8").replace("const " + name + " = {}", "globalThis." + name + " = {}");
  (0, eval)(src);
}
load("knowledge.js", "K");
load("kb.js", "KB");
load("engine.js", "Engine");
const { K, KB, Engine } = globalThis;

let fail = 0;
function check(name, cond, info) {
  if (cond) console.log("PASS", name);
  else { console.log("FAIL", name, info || ""); fail++; }
}

// 1) มหาทักษา: กาลกิณีตามตำรา
check("kalakini อาทิตย์ = ศุกร์", K.taksaOf("อาทิตย์")["กาลกิณี"] === "ศุกร์");
check("kalakini จันทร์ = อาทิตย์", K.taksaOf("จันทร์")["กาลกิณี"] === "อาทิตย์");
check("kalakini อังคาร = จันทร์", K.taksaOf("อังคาร")["กาลกิณี"] === "จันทร์");
check("kalakini พุธ = อังคาร", K.taksaOf("พุธ")["กาลกิณี"] === "อังคาร");
check("kalakini เสาร์ = พุธ", K.taksaOf("เสาร์")["กาลกิณี"] === "พุธ");
check("kalakini พฤหัสบดี = เสาร์", K.taksaOf("พฤหัสบดี")["กาลกิณี"] === "เสาร์");
check("kalakini ราหู = พฤหัสบดี", K.taksaOf("ราหู")["กาลกิณี"] === "พฤหัสบดี");
check("kalakini ศุกร์ = ราหู", K.taksaOf("ศุกร์")["กาลกิณี"] === "ราหู");

// 2) ดาวประจำวัน + พุธกลางคืน
check("dayPlanet อังคาร (2026-07-07)", K.dayPlanetOf(new Date("2026-07-07T12:00:00"), null) === "อังคาร");
check("พุธกลางวัน", K.dayPlanetOf(new Date("2026-07-08T12:00:00"), 10) === "พุธ");
check("พุธกลางคืน = ราหู", K.dayPlanetOf(new Date("2026-07-08T12:00:00"), 20) === "ราหู");

// 3) โปรไฟล์ + ดวงรายวัน deterministic
const p = Engine.buildProfile({ name: "ทดสอบ", dob: "1995-03-15", birthTime: "08:30" });
check("profile มีดาวเกิด", K.TAKSA.includes(p.birthPlanet), p.birthPlanet);
check("lifePath 1-9", p.lifePath >= 1 && p.lifePath <= 9, p.lifePath);
check("zodiac มีน (15 มี.ค.)", p.zodiac.n === "มีน", p.zodiac.n);
const a = Engine.daily(p, new Date("2026-07-07T09:00:00"));
const b = Engine.daily(p, new Date("2026-07-07T22:00:00"));
check("daily deterministic", JSON.stringify(a.scores) === JSON.stringify(b.scores) && a.affirm === b.affirm);
check("daily scores 2-5", Object.values(a.scores).every(v => v >= 2 && v <= 5), JSON.stringify(a.scores));
check("daily มี position", K.POSITIONS.includes(a.position), a.position);

// 4) เบอร์โทร
const ph = Engine.phone("0812345424");
check("phone ok", ph && ph.pairs.length === 9 && ph.score >= 2 && ph.score <= 10);
check("phone สั้นเกิน = null", Engine.phone("081") === null);
check("phone รับขีดคั่นได้", Engine.phone("081-234-5424").digits === "0812345424");

// 5) ทาโรต์
check("TAROT 22 ใบ", K.TAROT.length === 22, K.TAROT.length);
const cards = Engine.tarotDraw(3, "seed-x");
check("draw 3 ไม่ซ้ำ", new Set(cards.map(c => c.n)).size === 3);
check("seed เดียวกันได้ไพ่เดิม", cards.map(c => c.n).join() === Engine.tarotDraw(3, "seed-x").map(c => c.n).join());

// 6) safety
check("crisis detect", Engine.safetyCheck("ไม่อยากอยู่แล้ว") === "crisis");
check("sensitive detect", Engine.safetyCheck("ขอเลขเด็ดงวดนี้") === "sensitive");
check("ok detect", Engine.safetyCheck("ควรย้ายงานไหม") === "ok");

// 7) rule answer + personalization
check("ruleAnswer มีเนื้อหา", Engine.ruleAnswer(p, "การงาน", "ควรย้ายงานไหม").length > 100);
check("personalization ≤100", Engine.personalization({ dob: "1995-03-15", feedback: [1, 2, 3], askCount: 2 }) <= 100);

// 7.5) ระบบความจำ (memory)
const ms = {};
for (let i = 0; i < 35; i++) Engine.remember(ms, { d: "2026-07-07", q: "เรื่องที่ " + i });
check("memory จำกัด 30 เรื่องล่าสุด", ms.memory.length === 30, ms.memory.length);
check("memory เก็บเรื่องล่าสุดไว้", ms.memory[29].q === "เรื่องที่ 34");
check("memory ตัดเรื่องเก่าสุดทิ้ง", ms.memory[0].q === "เรื่องที่ 5");
check("personalization นับ memory", Engine.personalization({ dob: "1995-03-15", memory: ms.memory }) > Engine.personalization({ dob: "1995-03-15" }));

// 8) ทุกดาวเกิดสร้างผังได้ครบ
for (const bp of K.TAKSA) {
  const t = K.taksaOf(bp);
  check("taksa ครบ (" + bp + ")", Object.keys(t).length === 8 && K.PLANETS[t["กาลกิณี"]] != null);
}

// 9) ทักษาเสวยอายุ
check("SAWOEY_YEARS รวม 108 ปี", Object.values(K.SAWOEY_YEARS).reduce((a, b) => a + b, 0) === 108);
const sw = Engine.sawoey(p, new Date("2026-07-07T12:00:00")); // เกิด 1995 อายุ ~31
check("sawoey มีผล", sw != null && K.TAKSA.includes(sw.planet));
check("sawoey ตำแหน่งถูกต้อง", K.POSITIONS.includes(sw.position));
check("sawoey อายุอยู่ในช่วง", sw.age >= Math.floor(sw.startAge) && sw.age < Math.ceil(sw.endAge), JSON.stringify({ age: sw.age, s: sw.startAge, e: sw.endAge }));
check("sawoey มี theme+next", sw.theme && sw.nextTheme && sw.nextStartYear > 2000);
// เด็กแรกเกิด: ช่วงแรกต้องเป็นดาววันเกิด (บริวาร)
const baby = Engine.buildProfile({ dob: "2026-01-01" });
const swBaby = Engine.sawoey(baby, new Date("2026-07-07T12:00:00"));
check("sawoey แรกเกิด = ดาววันเกิด ตำแหน่งบริวาร", swBaby.planet === baby.birthPlanet && swBaby.position === "บริวาร");

// 10) ลัคนา
check("lagna ไม่มีเวลาเกิด = null", Engine.lagna(new Date("1995-03-15T12:00:00"), null) === null);
const lg = Engine.lagna(new Date("1995-03-15T12:00:00"), "06:30");
check("lagna 06:30 = ราศีสุริยะ (มีน แบบไทยประมาณ)", lg && lg.name === "มีน", lg && lg.name);
const lg2 = Engine.lagna(new Date("1995-03-15T12:00:00"), "08:30");
check("lagna +2ชม. = ขยับ 1 ราศี", lg2 && lg2.name === "เมษ", lg2 && lg2.name);
check("profile มี lagna เมื่อมีเวลาเกิด", p.lagna && K.SIGN_ORDER.includes(p.lagna.name));

// 11) เบอร์แบบละเอียด
const ph3 = Engine.phone("0899515424");
check("phone วิเคราะห์ทุกคู่ (10 หลัก = 9 คู่)", ph3.pairs.length === 9, ph3.pairs.length);
check("phone ท้าย 4 ตัวน้ำหนัก x2", ph3.pairs.filter(x => x.w === 2).length === 3);
check("phone มีเลขเด่น", ph3.dominant && ph3.dominant.info && ph3.dominant.info.p);
check("DIGIT ครบ 0-9", Object.keys(K.DIGIT).length === 10);

// 12) knowledge ใหม่ครบ
check("DAY_TRAITS ครบ 8 ดาว", K.TAKSA.every(pl => K.DAY_TRAITS[pl] && K.DAY_TRAITS[pl].str.length === 3));
check("ZODIAC ละเอียดครบ 12", K.ZODIAC.every(z => z.el && z.ruler && z.str.length === 3 && z.weak.length === 2 && z.tip));
check("SAWOEY_THEME ครบ 8 ตำแหน่ง", K.POSITIONS.every(pos => K.SAWOEY_THEME[pos] && K.SAWOEY_THEME[pos].g));
check("SEASONS ครบ 4", Object.keys(K.SEASONS).length === 4);
check("ROMAN ครบ 22", K.ROMAN.length === 22);

// 13) ruleAnswer ใหม่ต้องลึกและไม่แกล้งเปิดไพ่
const ans2 = Engine.ruleAnswer(p, "การเงิน", "การเงินปีนี้เป็นอย่างไร");
check("ruleAnswer มีพื้นดวง", ans2.includes("พื้นดวง") && ans2.includes("ราศี"));
check("ruleAnswer มีเสวยอายุ", ans2.includes("เสวยอายุ"));
check("ruleAnswer ไม่แกล้งเปิดไพ่", !ans2.includes("ไพ่ที่เปิดให้กับคำถามนี้"));
check("ruleAnswer ยาวพอ (ลึกขึ้น)", ans2.length > 900, ans2.length);

// 14) Knowledge Base (KB)
check("KB entries ≥ 45", KB.ENTRIES.length >= 45, KB.ENTRIES.length);
const requiredCats = ["astrology", "tarot", "numerology", "phone_number", "palmistry", "face_reading", "feng_shui", "personal_color", "fashion", "blood_type", "elements", "year_clash", "remedy", "color_fortune", "hair_color", "psychology", "safety", "accessory", "situation_color", "auspicious_time"];
check("KB ครอบคลุมหมวดที่ต้องการ", requiredCats.every(c => KB.ENTRIES.some(e => e.c === c)),
  requiredCats.filter(c => !KB.ENTRIES.some(e => e.c === c)).join(","));
check("KB.get ทำงาน", KB.get("blood_type", "A") && KB.get("blood_type", "A").i.length > 5);
check("KB.forPrompt กรองตามวัฒนธรรม", KB.forPrompt(["blood_type"], ["Japanese"]).includes("blood_type/A"));
check("KB.forPrompt มี safe language", KB.forPrompt(["safety"], []).includes("ห้ามใช้คำ"));
check("KB disclaimer fallback en", KB.disclaimer("belief", "ja").includes("cultural"));
check("KB disclaimer th", KB.disclaimer("belief", "th").includes("ความเชื่อ"));
check("KB METHOD_CATEGORIES ครบ", ["birthdate", "tarot", "palm", "face", "style", "phone", "blood", "integrated"].every(m => KB.METHOD_CATEGORIES[m] && KB.METHOD_CATEGORIES[m].length));

// 15) bloodPersona
const bpr = Engine.bloodPersona(p, "A");
check("bloodPersona มีครบทุกส่วน", bpr && bpr.beliefNote && bpr.bloodTrait && bpr.synthesis && bpr.caution);
check("bloodPersona กรุ๊ปไม่รู้จัก = null", Engine.bloodPersona(p, "X") === null);

console.log(fail === 0 ? "\n=== ALL TESTS PASSED ===" : "\n=== " + fail + " FAILED ===");
process.exit(fail ? 1 : 0);
