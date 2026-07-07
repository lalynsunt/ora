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
    hasTime: hour != null,
    colors: {
      power: K.PLANETS[taksa["เดช"]],   powerPlanet: taksa["เดช"],
      luck:  K.PLANETS[taksa["ศรี"]],   luckPlanet: taksa["ศรี"],
      avoid: K.PLANETS[taksa["กาลกิณี"]], avoidPlanet: taksa["กาลกิณี"]
    }
  };
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
  return { dateStr: dstr, todayPlanet, position, theme, scores, overall, dos, donts, affirm };
};

// ข้อความรายวันแบบ rule-based (ใช้เมื่อไม่มี AI key — และเป็น facts ให้ AI ตอนมี key)
Engine.dailyText = function (profile, d) {
  const posLine = d.position === "กาลกิณี"
    ? `วันนี้ดาว${d.todayPlanet}เป็นกาลกิณีในผังดวงของคุณ — ไม่ใช่วันร้าย แต่เป็นวันที่ควรใช้สติมากกว่าความเร็ว ${d.theme.d}`
    : `วันนี้ดาว${d.todayPlanet}สถิตตำแหน่ง "${d.position}" ของคุณ — ${d.theme.t}: ${d.theme.d}`;
  return posLine;
};

// ---------- วิเคราะห์เบอร์โทร ----------
Engine.phone = function (number) {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 9) return null;
  const sum = digits.split("").reduce((a, b) => a + Number(b), 0);
  const pairs = [];
  // วิเคราะห์คู่เลข 4 ตัวท้าย (ส่วนที่ถือว่ามีอิทธิพลสุดตามตำราเบอร์)
  const tail = digits.slice(-4);
  for (let i = 0; i < 3; i++) {
    const p = tail.slice(i, i + 2);
    const info = K.PHONE_PAIRS[p];
    pairs.push({ pair: p, s: info ? info.s : 0, t: info ? info.t : "คู่เลขพลังกลางๆ ไม่ส่งเสริมไม่ฉุดรั้ง" });
  }
  const pairScore = pairs.reduce((a, p) => a + p.s, 0); // -3..+6
  const sumGood = K.PHONE_SUM_GOOD[sum];
  let score = 5 + pairScore + (sumGood ? 2 : 0);
  score = Math.max(2, Math.min(10, score));
  return { digits, sum, sumGood: sumGood || null, pairs, score };
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
Engine.ruleAnswer = function (profile, category, question) {
  const today = new Date();
  const d = Engine.daily(profile, today);
  const cards = Engine.tarotDraw(1, question + d.dateStr);
  const c = cards[0];
  const lp = K.LIFEPATH[profile.lifePath];
  return [
    `🔮 **ภาพรวมของเรื่องนี้**`,
    `จากผังวันเกิด: คุณเป็น${lp.t} (เลขชีวิต ${profile.lifePath}) — ${Engine.dailyText(profile, d)}`,
    ``,
    `${c.e} **ไพ่ที่เปิดให้กับคำถามนี้: ${c.n} (${c.th})**`,
    `${c.m}`,
    ``,
    `✅ **คำแนะนำ**: ${c.adv}`,
    ``,
    `💡 อยากได้คำตอบที่เจาะบริบทของคุณจริงๆ (มีการถามรายละเอียดกลับ) — เปิดโหมด AI ในหน้าตั้งค่า ใช้ Gemini API key ฟรี`,
    ``,
    `⚖️ คำทำนายเพื่อการสะท้อนตนเองและความบันเทิง การตัดสินใจสำคัญควรใช้ข้อมูลจริงประกอบ`
  ].join("\n");
};
