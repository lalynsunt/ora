// ============================================================
// ORA LLM Layer — "พี่หมอโอรา" (Gemini API free tier)
// หน้าที่: ตีความ+เรียบเรียงจาก facts ที่ engine คำนวณแล้วเท่านั้น
// ============================================================
const LLM = {};

LLM.MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"]; // ลองตามลำดับ

LLM.SYSTEM = `คุณคือ "พี่หมอโอรา" หมอดู AI หญิงผู้อบอุ่น แม่นเรื่องศาสตร์ดวงชะตา และจริงใจ
บุคลิก: เหมือนพี่สาวใจดีที่เก่งโหราศาสตร์ พูดไทยเป็นธรรมชาติ ลงท้าย "ค่ะ/นะคะ" ไม่ทางการเกินไป ไม่หวานเลี่ยน

กติกาเหล็ก (ห้ามละเมิดเด็ดขาด):
1. ใช้ข้อมูลดวงจาก FACTS ที่ให้มาเท่านั้น ห้ามคำนวณดวง/สี/เลขเองใหม่ ห้ามแต่งตำแหน่งดาวเพิ่ม
2. ห้ามทำนายเรื่อง: ความตาย อายุขัย โรคร้ายแรง อุบัติเหตุ การตั้งครรภ์ ผลหวย/การพนัน และห้ามชี้นำการลงทุนเฉพาะเจาะจง (ห้ามบอกให้ซื้อ/ขายอะไร)
3. ห้ามฟันธงชะตาแบบสุดโต่ง เช่น "เลิกกันแน่นอน" "เจ๊งแน่" — เสนอเป็นแนวโน้ม+ทางเลือกเสมอ
4. เรื่องลบให้พูดแบบมีทางออกเสมอ ห้ามขู่ให้กลัว
5. ถ้าผู้ใช้อยู่ในภาวะทุกข์หนักหรือพูดถึงการทำร้ายตัวเอง ให้หยุดทำนาย เปลี่ยนเป็นรับฟัง ให้กำลังใจ และแนะนำสายด่วนสุขภาพจิต 1323
6. การตัดสินใจสำคัญ (งาน เงิน ความสัมพันธ์ สุขภาพ) ให้ย้ำว่าดวงคือมุมมองประกอบ ผู้ใช้คือคนเลือกเอง
7. ห้ามวิจารณ์รูปลักษณ์เชิงลบ ห้ามตัดสินเพศ/ศาสนา/เชื้อชาติ

วิธีทำงาน:
- ถ้าคำถามยังขาดบริบทสำคัญ ให้ถามกลับสั้นๆ 1-2 ข้อก่อน (เช่น สถานการณ์ตอนนี้ ตัวเลือกที่มี กังวลอะไรสุด) แล้วค่อยทำนายเต็มเมื่อได้คำตอบ
- ถ้ามีส่วน [MEMORY] ให้ใช้แสดงความใส่ใจแบบธรรมชาติ: เมื่อเรื่องใหม่เกี่ยวข้องกับเรื่องเก่า ให้เชื่อมโยง ("เกี่ยวกับเรื่อง...ที่เคยคุยกันไหมคะ") หรือถามไถ่ความคืบหน้าเป็นครั้งคราว ("เรื่อง...ที่ถามไว้ เป็นอย่างไรบ้างคะ") — ห้ามท่องรายการความจำทั้งหมด และห้ามยัดเยียดถ้าไม่เกี่ยวกับคำถามปัจจุบัน
- ถ้า [MEMORY] บอกว่าผู้ใช้เคยให้ feedback ว่า "ไม่ตรง" ในเรื่องใด ให้ระมัดระวังโทนเรื่องนั้นเป็นพิเศษและถามบริบทเพิ่มก่อน
- เวลาทำนาย ให้อ้างอิง FACTS โดยระบุที่มา เช่น "จากผังวันเกิดของคุณ..." "ไพ่ที่คุณได้..." "เลขชีวิตของคุณ..."
- ถ้า FACTS หลายศาสตร์ชี้ทางเดียวกัน ให้บอกว่าสอดคล้องกัน ถ้าขัดกันให้ตีความเป็นสองมุมมอง ไม่ฟันธง
- โครงสร้างคำตอบทำนายเต็ม: ภาพรวม → มุมที่ดวงสนับสนุน → มุมที่ควรระวัง (พร้อมทางออก) → คำแนะนำลงมือทำ 2-3 ข้อ → คำถามชวนคิด 1 ข้อ → ปิดด้วยประโยคให้กำลังใจ
- ความยาวพอดี อ่านจบใน 1-2 นาที ใช้ markdown หัวข้อ/ตัวหนาได้
- จบด้วยบรรทัด: "🌸 เพื่อการสะท้อนตนเองนะคะ การตัดสินใจสำคัญใช้ข้อมูลจริงประกอบด้วยเสมอ"`;

// สร้าง FACTS จาก engine (โครงสร้างชัด ให้ LLM ตีความอย่างเดียว)
LLM.buildFacts = function (profile, extra) {
  const d = Engine.daily(profile, new Date());
  const sw = Engine.sawoey(profile, new Date());
  const lp = K.LIFEPATH[profile.lifePath];
  const day = K.DAY_TRAITS[profile.birthPlanet];
  const z = profile.zodiac;
  const lines = [
    `[FACTS — คำนวณโดยระบบ ห้ามแก้ไข]`,
    `ชื่อผู้ใช้: ${profile.name}`,
    `วันเกิด: วัน${profile.birthPlanet} — ${day.t}: ${day.d} | จุดแข็ง: ${day.str.join(", ")} | จุดอ่อน: ${day.weak.join(", ")} | งานที่เหมาะ: ${day.job}`,
    `ราศี${z.n} ธาตุ${z.el} (เจ้าเรือน: ดาว${z.ruler}) — จุดแข็ง: ${z.str.join(", ")} | จุดอ่อน: ${z.weak.join(", ")} | เหมาะกับ: ${z.tip}`,
    profile.lagna ? `ลัคนาโดยประมาณ (เรือนชั่วยามจากเวลาเกิด): ราศี${profile.lagna.name}` : `ลัคนา: ไม่ทราบ (ผู้ใช้ไม่ได้ระบุเวลาเกิด)`,
    `เลขชีวิต (เลขศาสตร์วันเกิด): ${profile.lifePath} — ${lp.t}: ${lp.d}`,
    `สีมงคลประจำตัว: สีอำนาจ(เดช)=${profile.colors.power.color}, สีโชคลาภ(ศรี)=${profile.colors.luck.color}, สีที่ควรเลี่ยง(กาลกิณี)=${profile.colors.avoid.color}`,
    sw ? `จังหวะชีวิต (ทักษาเสวยอายุ): อายุ ${Math.floor(sw.startAge)}–${Math.floor(sw.endAge)} อยู่ช่วงดาว${sw.planet}เสวยอายุ ตำแหน่ง${sw.position} — ${sw.theme.t} โทน${sw.theme.g}: ${sw.theme.d} | ช่วงถัดไป: ${sw.nextTheme.t} (โทน${sw.nextTheme.g}) เริ่มราวปี พ.ศ. ${sw.nextStartYear + 543}` : ``,
    `ดวงวันนี้ (มหาทักษา): ดาว${d.todayPlanet}อยู่ตำแหน่ง "${d.position}" — ${d.theme.t}: ${d.theme.d}`,
    `คะแนนวันนี้: งาน ${d.scores.งาน}/5, เงิน ${d.scores.เงิน}/5, ความรัก ${d.scores.ความรัก}/5, จิตใจ ${d.scores.จิตใจ}/5`
  ];
  if (extra && extra.cards && extra.cards.length) {
    lines.push(`ไพ่ทาโรต์ที่ผู้ใช้เปิดได้: ` + extra.cards.map((c, i) =>
      `[${i + 1}] ${c.n} (${c.th}) — ความหมาย: ${c.m} คำแนะนำประจำไพ่: ${c.adv}`).join(" | "));
  }
  if (extra && extra.job) lines.push(`อาชีพ/บริบทชีวิต: ${extra.job}`);
  if (extra && extra.tone) lines.push(`โทนที่ผู้ใช้ชอบ: ${extra.tone}`);
  if (extra && extra.phone) lines.push(`ผลวิเคราะห์เบอร์โทร: คะแนน ${extra.phone.score}/10, ผลรวม ${extra.phone.sum}${extra.phone.sumGood ? " (" + extra.phone.sumGood + ")" : ""}, คู่เลขท้าย: ` + extra.phone.pairs.map(p => `${p.pair}=${p.t}`).join("; "));
  if (extra && extra.memory && extra.memory.length) {
    lines.push(`[MEMORY — เรื่องที่ผู้ใช้เคยคุยกับพี่หมอไว้ก่อนหน้า (ล่าสุดอยู่ล่างสุด)]`);
    extra.memory.slice(-6).forEach(m =>
      lines.push(`- ${m.d}${m.cat ? " [" + m.cat + "]" : ""}: "${m.q}"${m.fb ? ` (feedback ของผู้ใช้ต่อคำทำนายครั้งนั้น: ${m.fb})` : ""}`));
  }
  return lines.join("\n");
};

// เรียก Gemini API (key ของผู้ใช้เอง เก็บใน localStorage เครื่องผู้ใช้เท่านั้น)
LLM.chat = async function (apiKey, facts, history) {
  const contents = [
    { role: "user", parts: [{ text: facts + "\n\n(ข้อมูลด้านบนคือ FACTS ของผู้ใช้คนนี้ ใช้ประกอบการสนทนาทั้งหมด)" }] },
    { role: "model", parts: [{ text: "รับทราบค่ะ พี่หมอโอราพร้อมดูดวงจาก FACTS นี้แล้วค่ะ" }] },
    ...history.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }))
  ];
  let lastErr = null;
  for (const model of LLM.MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: LLM.SYSTEM }] },
            contents,
            generationConfig: { temperature: 0.8, maxOutputTokens: 1200 }
          })
        }
      );
      if (!res.ok) { lastErr = new Error("HTTP " + res.status); continue; }
      const data = await res.json();
      const text = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map(p => p.text || "").join("")
        : null;
      if (text) return LLM.outputFilter(text);
      lastErr = new Error("empty response");
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("LLM call failed");
};

// ---------- Gemini Vision: ลายมือ / โหงวเฮ้ง / โทนสีผิว-สไตล์ ----------
LLM.SCAN_PROMPTS = {
  palm: `วิเคราะห์ภาพฝ่ามือนี้ตามศาสตร์หัตถศาสตร์ (ลายมือ) อย่างละเอียด:
1. รูปมือ+นิ้ว → ธาตุประจำมือ (ดิน/ลม/ไฟ/น้ำ) และนิสัยพื้นฐาน
2. เส้นชีวิต: ความยาว-โค้ง-ลึก → พลังชีวิต ความแข็งแรง (ห้ามทำนายอายุขัย)
3. เส้นสมอง: ความยาว-ทิศทาง → วิธีคิด ตัดสินใจ
4. เส้นหัวใจ: จุดเริ่ม-ปลายเส้น → นิสัยความรัก การแสดงออกทางใจ
5. เส้นวาสนา (ถ้าเห็น): ความชัด → เส้นทางการงาน-ความมั่นคง ช่วงชีวิตที่เด่น
6. เนิน/จุดพิเศษที่สังเกตเห็น
สรุป: จุดแข็ง 3 ข้อ, สิ่งที่ควรพัฒนา 2 ข้อ (โทนบวก), คำแนะนำเชื่อมโยงกับ FACTS ดวงพื้นฐาน
ถ้าภาพไม่ใช่ฝ่ามือหรือไม่ชัดพอ ให้บอกตรงๆ และแนะวิธีถ่ายใหม่ (กางฝ่ามือ แสงสว่าง ถ่ายตรง) ห้ามเดา`,
  face: `วิเคราะห์ภาพใบหน้านี้ตามศาสตร์โหงวเฮ้ง อย่างระมัดระวังและสุภาพ:
1. สามส่วนใบหน้า (บน=หน้าผาก/วัยเยาว์-สติปัญญา, กลาง=คิ้วตาจมูก/วัยทำงาน-ทรัพย์, ล่าง=ปากคาง/บั้นปลาย-ความมั่นคง) — ส่วนไหนเด่น หมายถึงอะไร
2. หน้าผาก คิ้ว ดวงตา จมูก ปาก คาง — จุดเด่นเชิงโหงวเฮ้งทีละจุด
3. ระบุรูปหน้า (รูปไข่/กลม/เหลี่ยม/ยาว/หัวใจ) → แนะนำทรงผมเสริมโหงวเฮ้งตามรูปหน้า
สรุป: เสน่ห์เด่น 3 ข้อ, วิธีเสริมโหงวเฮ้งด้วยบุคลิก-ทรงผม-รอยยิ้ม (ทำได้จริง), เชื่อมโยงกับ FACTS
กติกาเข้มพิเศษ: ทุกการตีความต้องเป็นกลางหรือบวกเท่านั้น ห้ามตัดสินสวย-ไม่สวย ห้ามพูดถึงน้ำหนัก สีผิวเชิงลบ อายุ หรือตำหนิใดๆ ถ้าภาพไม่ใช่ใบหน้าตรงๆ หรือมืดเกิน ให้ขอถ่ายใหม่อย่างสุภาพ`,
  style: `วิเคราะห์ภาพนี้เพื่อทำ Seasonal Color Analysis (วิเคราะห์โทนสีประจำตัว):
1. ประเมิน undertone ผิวจากภาพ: Warm (เหลืองทอง) หรือ Cool (ชมพูอมฟ้า) + ระดับความสว่าง-ความคมชัดของสีผม/ตา/ผิวโดยรวม
2. สรุปเป็น Season: Spring (warm สว่าง) / Summer (cool อ่อนโยน) / Autumn (warm ลึก) / Winter (cool คมชัด) — อธิบายเหตุผล
3. แนะนำ: สีเสื้อผ้าที่เหมาะ 5-6 สี, สีที่ควรเลี่ยง 2-3 สี, โทนเมคอัพ, สีเครื่องประดับ (ทอง/เงิน)
4. สำคัญที่สุด: ผสมผลนี้กับสีมงคลใน FACTS (เดช/ศรี) → เลือกสีที่ "ทั้งถูกโฉลกดวงและถูกโทนผิว" แนะนำชุดไปทำงาน 1 ชุด + ออกเดท 1 ชุด
5. ถ้าเห็นใบหน้า: ระบุรูปหน้า → ทรงผมที่เสริมทั้งบุคลิกและดวง
หมายเหตุท้ายคำตอบ: บอกว่าการประเมินจากภาพถ่ายมีผลจากแสง อาจคลาดเคลื่อน ควรลองเทียบผ้าจริงใต้แสงธรรมชาติ
ถ้าภาพมืด/ติดฟิลเตอร์จัด ให้ขอภาพใหม่ใต้แสงธรรมชาติ ไม่แต่งฟิลเตอร์`
};

// เรียก Gemini พร้อมรูปภาพ (รูปส่งตรงจากเครื่องผู้ใช้ → Google เท่านั้น ไม่ผ่าน/ไม่เก็บที่อื่น)
LLM.vision = async function (apiKey, kind, base64Data, mimeType, facts) {
  const prompt = LLM.SCAN_PROMPTS[kind];
  const contents = [{
    role: "user",
    parts: [
      { text: facts + "\n\n" + prompt },
      { inline_data: { mime_type: mimeType, data: base64Data } }
    ]
  }];
  let lastErr = null;
  for (const model of LLM.MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: LLM.SYSTEM }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1600 }
          })
        }
      );
      if (!res.ok) { lastErr = new Error("HTTP " + res.status); continue; }
      const data = await res.json();
      const text = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map(p => p.text || "").join("")
        : null;
      if (text) return LLM.outputFilter(text);
      lastErr = new Error("empty response");
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("vision call failed");
};

// safety ชั้นสุดท้ายฝั่ง client — กรองคำต้องห้ามที่อาจหลุดมา
LLM.outputFilter = function (text) {
  const banned = [/คุณจะตาย/g, /จะเสียชีวิต/g, /เลิกกันแน่นอน/g, /หย่าแน่นอน/g, /เจ๊งแน่นอน/g, /ซื้อหุ้น\S*เลย/g];
  let flagged = false;
  for (const b of banned) if (b.test(text)) flagged = true;
  if (flagged) {
    return "ขอโทษด้วยนะคะ คำตอบเมื่อกี้มีถ้อยคำที่ไม่เหมาะสมหลุดมา พี่หมอขอปรับใหม่ค่ะ 🙏\n\nช่วยกดส่งคำถามอีกครั้งได้ไหมคะ หรือเล่ารายละเอียดเพิ่มอีกนิด พี่หมอจะดูให้ใหม่อย่างระมัดระวังค่ะ";
  }
  return text;
};

// ข้อความโหมด supportive เมื่อพบสัญญาณวิกฤต
LLM.CRISIS_MSG = `พี่หมอขอหยุดเรื่องดวงไว้ก่อนนะคะ เพราะสิ่งที่สำคัญที่สุดตอนนี้คือใจของคุณค่ะ 💛

สิ่งที่คุณรู้สึกอยู่มันหนักจริงๆ และการที่คุณพิมพ์ออกมาได้คือความกล้าหาญมากแล้วนะคะ คุณไม่จำเป็นต้องผ่านช่วงนี้คนเดียว

📞 **สายด่วนสุขภาพจิต 1323** (ฟรี ตลอด 24 ชั่วโมง) มีคนพร้อมรับฟังคุณเสมอค่ะ
หรือคุยกับคนที่คุณไว้ใจสักคนคืนนี้ก็ได้นะคะ

พี่หมออยู่ตรงนี้ ถ้าอยากพิมพ์ระบายต่อ พี่หมอรับฟังค่ะ`;
