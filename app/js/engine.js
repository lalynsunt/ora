// ============================================================
// ORA Fortune Engine — คำนวณดวงแบบ rule-based + deterministic
// ผลลัพธ์วันเดียวกัน+คนเดียวกัน = เหมือนกันเสมอ (consistency)
// ============================================================
const Engine = {};

// ---------- seeded RNG (mulberry32) ----------
Engine.hash = function (str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
};
Engine.rng = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
Engine.pick = function (rng, arr, n) {
  const idx = arr.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, n).map(i => arr[i]);
};

// ---------- โปรไฟล์เจ้าชะตา ----------
Engine.buildProfile = function (state) {
  const dob = new Date(state.dob + "T12:00:00");
  const hour = state.birthTime ? parseInt(state.birthTime.split(":")[0], 10) : null;
  const birthPlanet = K.dayPlanetOf(dob, hour);
  const taksa = K.taksaOf(birthPlanet);
  const digits = state.dob.replace(/-/g, "").split("").map(Number);
  let lp = digits.reduce((a, b) => a + b, 0);
  while (lp > 9) lp = String(lp).split("").reduce((a, b) => a + Number(b), 0);
  return {
    name: state.name || "คุณ",
    dob, birthPlanet, taksa,
    lifePath: lp,
    zodiac: K.zodiacOf(dob.getMonth() + 1, dob.getDate()),
    lagna: Engine.lagna(dob, state.birthTime),
    hasTime: hour != null,
    colors: {
      power: K.PLANETS[taksa["เดช"]],   powerPlanet: taksa["เดช"],
      luck:  K.PLANETS[taksa["ศรี"]],   luckPlanet: taksa["ศรี"],
      avoid: K.PLANETS[taksa["กาลกิณี"]], avoidPlanet: taksa["กาลกิณี"]
    }
  };
};

// ---------- ราศีแบบไทย (นิรายนะ โดยประมาณ) ----------
Engine.siderealSign = function (m, d) {
  const md = m * 100 + d;
  let sign = "ธนู"; // ก่อน 14 ม.ค. คือธนู (ต่อจากปีก่อน)
  for (const [bm, bd, name] of K.SIDEREAL_START) {
    if (md >= bm * 100 + bd) sign = name;
  }
  return sign;
};

// ---------- ลัคนาโดยประมาณ (เรือนชั่วยาม: 06:00 = ราศีสุริยะ, ราศีละ 2 ชม.) ----------
Engine.lagna = function (dob, birthTimeStr) {
  if (!birthTimeStr) return null;
  const [h, mi] = birthTimeStr.split(":").map(Number);
  const sunSign = Engine.siderealSign(dob.getMonth() + 1, dob.getDate());
  const baseIdx = K.SIGN_ORDER.indexOf(sunSign);
  const steps = Math.floor((((h + (mi || 0) / 60) - 6 + 24) % 24) / 2);
  const name = K.SIGN_ORDER[(baseIdx + steps) % 12];
  return { name, approx: true };
};

// ---------- ทักษาเสวยอายุ (รอบ 108 ปี เริ่มจากดาววันเกิด) ----------
// ตอบ: ตอนนี้อยู่ช่วงดาวไหน โทนดี/ร้าย ถึงอายุเท่าไหร่ ช่วงถัดไปเริ่มปีไหน
Engine.sawoey = function (profile, date) {
  const age = (date - profile.dob) / (365.25 * 24 * 3600 * 1000);
  const idx = K.TAKSA.indexOf(profile.birthPlanet);
  let start = 0;
  for (let i = 0; i < 16; i++) {
    const planet = K.TAKSA[(idx + i) % 8];
    const yrs = K.SAWOEY_YEARS[planet];
    if (age < start + yrs) {
      const position = K.POSITIONS[i % 8];        // ผังทักษาเริ่มที่ดาววันเกิด = บริวาร
      const nextPlanet = K.TAKSA[(idx + i + 1) % 8];
      const nextPosition = K.POSITIONS[(i + 1) % 8];
      return {
        planet, position, theme: K.SAWOEY_THEME[position],
        startAge: start, endAge: start + yrs, age: Math.floor(age),
        nextPlanet, nextPosition, nextTheme: K.SAWOEY_THEME[nextPosition],
        nextStartYear: profile.dob.getFullYear() + start + yrs
      };
    }
    start += yrs;
  }
  return null; // เกิน 108 ปี (ไม่น่าเกิดขึ้น)
};

// ---------- ดวงรายวัน ----------
Engine.daily = function (profile, date) {
  const dstr = date.toISOString().slice(0, 10);
  const rng = Engine.rng(Engine.hash(dstr + "|" + profile.dob.toISOString().slice(0, 10)));
  const todayPlanet = K.dayPlanetOf(date, null);
  // วันนี้เป็นตำแหน่งอะไรในผังทักษาของเจ้าชะตา
  let position = "อายุ";
  for (const pos of K.POSITIONS) if (profile.taksa[pos] === todayPlanet) { position = pos; break; }
  const theme = K.POSITION_THEME[position];

  const clamp = v => Math.max(2, Math.min(5, v));
  const noise = () => Math.floor(rng() * 2); // 0 หรือ 1
  const scores = {
    งาน: clamp(3 + theme.mod.work + noise() - (rng() < 0.3 ? 1 : 0)),
    เงิน: clamp(3 + theme.mod.money + noise() - (rng() < 0.3 ? 1 : 0)),
    ความรัก: clamp(3 + theme.mod.love + noise() - (rng() < 0.3 ? 1 : 0)),
    จิตใจ: clamp(3 + theme.mod.mind + noise() - (rng() < 0.3 ? 1 : 0))
  };
  const dos = Engine.pick(rng, K.DO_POOL, 2);
  const donts = Engine.pick(rng, K.DONT_POOL, 2);
  const affirm = Engine.pick(rng, K.AFFIRM, 1)[0];
  const overall = clamp(Math.round((scores.งาน + scores.เงิน + scores.ความรัก + scores.จิตใจ) / 4));
  // สีนำโชคของวันนี้ = สีดาวที่ปกครองวันนี้ (แยกจากสีประจำตัว/เดช-ศรี-กาลกิณี ซึ่งคงที่ทุกวัน)
  const todayColor = K.PLANETS[todayPlanet];
  const isAvoidDay = position === "กาลกิณี";
  return { dateStr: dstr, todayPlanet, position, theme, scores, overall, dos, donts, affirm, todayColor, isAvoidDay };
};

// ข้อความรายวันแบบ rule-based (ใช้เมื่อไม่มี AI key — และเป็น facts ให้ AI ตอนมี key)
// หมายเหตุ: facts ที่ป้อนเข้า LLM (LLM.buildFacts) ยังคงเป็นภาษาไทยเสมอโดยตั้งใจ (ดาต้าดิบ)
// ส่วนนี้ (Engine.dailyText) คือข้อความที่ผู้ใช้ "เห็นตรงๆ" ในโหมดตำรา จึงต้อง localize
Engine.dailyText = function (profile, d) {
  const planet = K.planetName(d.todayPlanet);
  const themeD = K.L(d.theme, "d");
  const themeT = K.L(d.theme, "t");
  const en = typeof I18N !== "undefined" && I18N.lang === "en";
  if (d.position === "กาลกิณี") {
    return en
      ? `Today's ruling planet ${planet} lands on your challenge (กาลกิณี) day — not a bad day, just one that calls for mindfulness over speed. ${themeD}`
      : `วันนี้ดาว${planet}เป็นกาลกิณีในผังดวงของคุณ — ไม่ใช่วันร้าย แต่เป็นวันที่ควรใช้สติมากกว่าความเร็ว ${themeD}`;
  }
  return en
    ? `Today's ruling planet ${planet} sits in your "${K.positionName(d.position)}" position — ${themeT}: ${themeD}`
    : `วันนี้ดาว${planet}สถิตตำแหน่ง "${d.position}" ของคุณ — ${themeT}: ${themeD}`;
};

// ---------- วิเคราะห์เบอร์โทร (ละเอียด: ทุกคู่เลข + เลขเด่นบอกนิสัยเจ้าของ) ----------
Engine.phone = function (number) {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 9) return null;
  const sum = digits.split("").reduce((a, b) => a + Number(b), 0);

  // วิเคราะห์ทุกคู่เลขติดกันทั้งเบอร์ — 4 ตัวท้ายน้ำหนักสองเท่า (ส่วนที่ส่งผลสุดตามตำรา)
  const pairs = [];
  for (let i = 0; i < digits.length - 1; i++) {
    const p = digits.slice(i, i + 2);
    const inTail = i >= digits.length - 4;
    const info = K.PHONE_PAIRS[p];
    let s, t;
    if (info) { s = info.s; t = info.t; }
    else {
      const a = K.DIGIT[p[0]], b = K.DIGIT[p[1]];
      s = 0;
      t = `พลัง${a.t} (${a.p}) ผสม ${b.t} (${b.p}) — โทนกลาง เสริมกันตามบริบทการใช้`;
    }
    pairs.push({ pair: p, s, t, w: inTail ? 2 : 1 });
  }
  const weighted = pairs.reduce((acc, p) => acc + p.s * p.w, 0);   // ช่วงโดยประมาณ -20..+28
  const sumGood = K.PHONE_SUM_GOOD[sum];
  let score = Math.round(5.5 + weighted * 0.35 + (sumGood ? 1 : 0));
  score = Math.max(2, Math.min(10, score));

  // เลขเด่น (ปรากฏบ่อยสุด) = พลังประจำตัวเจ้าของเบอร์
  const freq = {};
  for (const d of digits) freq[d] = (freq[d] || 0) + 1;
  let topDigit = digits[0];
  for (const d in freq) if (freq[d] > freq[topDigit]) topDigit = d;
  const dominant = freq[topDigit] >= 2 ? { d: topDigit, n: freq[topDigit], info: K.DIGIT[topDigit] } : null;

  return { digits, sum, sumGood: sumGood || null, pairs, score, dominant };
};

// ---------- ทาโรต์ ----------
Engine.tarotDraw = function (n, seedStr) {
  const rng = Engine.rng(Engine.hash(seedStr || String(Date.now())));
  return Engine.pick(rng, K.TAROT, n);
};

// ---------- ความทรงจำของพี่หมอ (เก็บในเครื่องผู้ใช้เท่านั้น) ----------
Engine.remember = function (state, rec) {
  state.memory = state.memory || [];
  state.memory.push(rec);
  if (state.memory.length > 30) state.memory = state.memory.slice(-30); // จำ 30 เรื่องล่าสุด
};

// ---------- โปรไฟล์นิสัย: กรุ๊ปเลือด (cultural belief) + วันเกิด (เลขศาสตร์/โหรา) ----------
// คืน sections พร้อมป้ายว่าส่วนไหนเป็นความเชื่อ ส่วนไหนเป็น coaching
Engine.bloodPersona = function (profile, bloodType) {
  const kbB = KB.get("blood_type", bloodType);
  if (!kbB) return null;
  const day = K.DAY_TRAITS[profile.birthPlanet];
  const lp = K.LIFEPATH[profile.lifePath];
  return {
    blood: bloodType,
    beliefNote: "ความเชื่อเรื่องกรุ๊ปเลือดกับนิสัยเป็นวัฒนธรรมเอเชียตะวันออก (ญี่ปุ่น/เกาหลี/ไทย) — ใช้เป็นมุมมองสะท้อนตัวเอง ไม่ใช่ข้อเท็จจริงทางวิทยาศาสตร์",
    bloodTrait: kbB.i,          // มุมความเชื่อ
    bloodAdvice: kbB.o,         // แนวทางใช้
    dayTrait: day.t + " — " + day.d,
    lifePathTrait: lp.t,
    synthesis: `มุมกรุ๊ปเลือด: ${kbB.i} · มุมวันเกิด: คุณมีพื้น${day.t} · มุมเลขชีวิต ${profile.lifePath}: ${lp.t} — จุดที่น่าสนใจคือการใช้จุดแข็งจากทั้งสามมุมพร้อมกัน`,
    growth: kbB.o,
    caution: kbB.w
  };
};

// ---------- Personalization Score ----------
Engine.personalization = function (state) {
  let s = 20; // มีวันเกิด
  if (state.birthTime) s += 10;
  if (state.name) s += 5;
  if (state.tone) s += 5;
  if (state.job) s += 10;
  const fb = (state.feedback || []).length;
  s += Math.min(25, fb * 3);
  const q = (state.askCount || 0);
  s += Math.min(15, q * 3);
  s += Math.min(10, ((state.memory || []).length) * 2);
  if (state.apiKey) s += 10;
  return Math.min(100, s);
};

// ---------- ตรวจคำถามอ่อนไหว ----------
Engine.safetyCheck = function (text) {
  const t = (text || "").toLowerCase();
  for (const w of K.CRISIS_WORDS) if (t.includes(w)) return "crisis";
  for (const w of K.SENSITIVE_WORDS) if (t.includes(w)) return "sensitive";
  return "ok";
};

// ---------- คำตอบ rule-based สำหรับ "ถามดวง" (fallback ไม่มี AI) ----------
// หลัก: พื้นดวง (วันเกิด+ราศี+เลขชีวิต) → จังหวะชีวิต (เสวยอายุ) → เจาะหมวด (ผังทักษา) → action
Engine.ruleAnswer = function (profile, category, question) {
  const today = new Date();
  const d = Engine.daily(profile, today);
  const sw = Engine.sawoey(profile, today);
  const lp = K.LIFEPATH[profile.lifePath];
  const day = K.DAY_TRAITS[profile.birthPlanet];
  const z = profile.zodiac;

  // เจาะหมวด: ดูดาวประจำตำแหน่งทักษาที่เกี่ยวกับเรื่องนั้น
  const domainMap = {
    "ความรัก":   { pos: "ศรี",    label: "เสน่ห์-ความรัก" },
    "การเงิน":   { pos: "ศรี",    label: "โชคลาภการเงิน" },
    "การงาน":   { pos: "เดช",    label: "อำนาจการงาน" },
    "ครอบครัว": { pos: "บริวาร", label: "คนรอบตัว-ครอบครัว" },
    "การเรียน":  { pos: "มนตรี",  label: "ผู้สนับสนุน-วิชาความรู้" },
    "ภาพรวมชีวิต": { pos: "อายุ", label: "ตัวตน-พื้นชีวิต" }
  };
  const dm = domainMap[category] || domainMap["ภาพรวมชีวิต"];
  const domPlanet = profile.taksa[dm.pos];
  const domColor = K.PLANETS[domPlanet].color;
  const domTheme = K.POSITION_THEME[dm.pos];

  // จังหวะปี: โทนช่วงเสวยอายุ + จะเปลี่ยนเมื่อไหร่
  const yearLine = sw
    ? `ช่วงอายุ ${Math.floor(sw.startAge)}–${Math.floor(sw.endAge)} ปี คุณอยู่ใน "${sw.theme.t}" (ดาว${sw.planet}เสวยอายุ ตำแหน่ง${sw.position}) โทนช่วงนี้: **${sw.theme.g}** — ${sw.theme.d}\n\nช่วงถัดไปเริ่มราวปี ${sw.nextStartYear + 543} (พ.ศ.) อายุ ${Math.floor(sw.endAge)} ปี จะเข้า "${sw.nextTheme.t}" โทน${sw.nextTheme.g} — ${sw.nextTheme.d}`
    : "";
  const isChallenge = sw && sw.theme.gradeKey === "challenge";

  // เช็คว่าพื้นดวง (นิสัยวันเกิด) กับจังหวะเสวยอายุ ชี้ไปทางเดียวกันไหม (สร้าง consistency signal เบาๆ)
  const agree = sw && (sw.theme.gradeKey === "great" || sw.theme.gradeKey === "good");

  return [
    `🧬 **พื้นดวงของคุณ (จากวันเกิดจริง)**`,
    `คุณเกิดวัน${profile.birthPlanet} — ${day.t}: ${day.d}`,
    `จุดแข็งประจำตัว: ${day.str.join(" · ")}`,
    `จุดที่ควรรู้ทันตัวเอง: ${day.weak.join(" · ")}`,
    `ราศี${z.n} ธาตุ${z.el} (ดาว${z.ruler}เป็นเจ้าเรือน) — ${z.tr}`,
    `จุดแข็งจากราศี: ${z.str.join(" · ")} · จุดที่ต้องระวัง: ${z.weak.join(" · ")}`,
    `สายงาน/บริบทที่เสริมดวงคุณ: ${z.tip}`,
    `เลขชีวิต ${profile.lifePath} — ${lp.t}: ${lp.d}`,
    ``,
    `🌊 **จังหวะชีวิตช่วงนี้ (ทักษาเสวยอายุ)**`,
    yearLine,
    agree ? `\n✨ สัญญาณที่สอดคล้องกัน: ทั้งพื้นดวงและจังหวะช่วงอายุตอนนี้ชี้ไปทางบวกด้วยกัน — ช่วงนี้เหมาะจะใช้จุดแข็งของคุณอย่างเต็มที่` : ``,
    ``,
    `🔎 **เจาะเรื่อง${category || "ที่ถาม"}**`,
    `คำถามของคุณ: "${question}"`,
    `ดาวประจำตำแหน่ง${dm.pos} (${dm.label}) ในดวงคุณคือ **ดาว${domPlanet}** — ${domTheme.t}: ${domTheme.d}`,
    `วันนี้${Engine.dailyText(profile, d)}`,
    `เคล็ดเสริมเรื่องนี้: ใช้โทนสี${domColor}ในวันสำคัญของเรื่องนี้ (นัดหมาย เจรจา ตัดสินใจ) และเลี่ยงสี${profile.colors.avoid.color} (กาลกิณีของคุณ) ในวันที่รู้สึกไม่มั่นใจ`,
    ``,
    `⚠️ **มุมที่ควรระวัง**`,
    `${day.weak[0]} คือจุดบอดของคนวัน${profile.birthPlanet} โดยเฉพาะเรื่องแบบนี้ — ทางออก: ตั้งสติก่อนตอบสนอง 1 ลมหายใจก่อนเสมอ`,
    isChallenge ? `ช่วงจังหวะชีวิตตอนนี้เป็นโทนท้าทาย (${sw.theme.t}) — ทำทุกอย่างช้าลงหนึ่งจังหวะ ตรวจเอกสาร-ข้อตกลงซ้ำสองรอบ ก่อนตัดสินใจเรื่องใหญ่ในช่วงนี้` : `จุดที่ต้องระวังจากราศี: ${z.weak[1] || z.weak[0]} — รู้ทันไว้ก่อนจะช่วยได้มาก`,
    ``,
    `✅ **แผนลงมือทำ**`,
    `**ทำวันนี้/สัปดาห์นี้:**`,
    `1. ใช้จุดแข็ง "${z.str[0]}" ของคุณนำในเรื่องนี้ — มันคือทุนที่คุณมีอยู่แล้ว`,
    `2. เขียนสิ่งที่ต้องการจากเรื่องนี้ให้ชัด 1 บรรทัดก่อนนอนคืนนี้ ความชัดของใจคือจุดเริ่มของดวงที่ดี`,
    `3. ${domTheme.mod && domTheme.mod.mind < 0 ? "พักใจสัก 10 นาทีก่อนตัดสินใจอะไรที่เกี่ยวกับเรื่องนี้" : "ลงมือทำขั้นแรกที่เล็กที่สุดของเรื่องนี้ภายใน 24 ชั่วโมง"}`,
    `**1 เดือนข้างหน้า:**`,
    `4. สังเกตว่าเรื่อง "${category || "นี้"}" คลี่คลายไปทางไหนทุกสัปดาห์ แล้วปรับแผนตามจริง ไม่ใช่ตามที่หวังไว้แต่แรก`,
    `5. ใช้สายงาน/บริบทที่เหมาะกับคุณ (${z.tip}) เป็นเข็มทิศเวลาต้องเลือกระหว่างทางเลือกหลายทาง`,
    ``,
    `💭 **ชวนคิด:** ถ้าไม่ต้องกลัวอะไรเลย คุณจะตัดสินใจเรื่องนี้อย่างไร — คำตอบตรงนั้นมักบอกสิ่งที่ใจคุณต้องการจริงๆ`,
    ``,
    `🎴 อยากได้สัญญาณเฉพาะของคำถามนี้เพิ่มอีกมุม ไปที่แท็บ "ไพ่" เลือกไพ่ด้วยมือคุณเอง แล้วกลับมาเล่าได้เลยค่ะ · หรือเปิด**โหมด AI ฟรี**ในหน้าตั้งค่า พี่หมอจะซักรายละเอียดเพิ่มและตอบเจาะลึกเฉพาะสถานการณ์ของคุณกว่านี้มาก`,
    ``,
    `⚖️ คำทำนายเพื่อการสะท้อนตนเองและความบันเทิง การตัดสินใจสำคัญควรใช้ข้อมูลจริงประกอบเสมอ`
  ].join("\n");
};
