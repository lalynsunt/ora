// ORA engine smoke tests — รัน: node tests/test-engine.js (จาก root โปรเจกต์)
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "app", "js") + path.sep;

function load(f, name) {
  const src = fs.readFileSync(dir + f, "utf8").replace("const " + name + " = {}", "globalThis." + name + " = {}");
  (0, eval)(src);
}
load("knowledge.js", "K");
load("engine.js", "Engine");
const { K, Engine } = globalThis;

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
check("phone ok", ph && ph.pairs.length === 3 && ph.score >= 2 && ph.score <= 10);
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

console.log(fail === 0 ? "\n=== ALL TESTS PASSED ===" : "\n=== " + fail + " FAILED ===");
process.exit(fail ? 1 : 0);
