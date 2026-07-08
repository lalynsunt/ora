// ============================================================
// ORA LLM Layer — "พี่หมอโอรา" (Gemini API free tier)
// หน้าที่: ตีความ+เรียบเรียงจาก facts ที่ engine คำนวณแล้วเท่านั้น
// ============================================================
const LLM = {};

LLM.MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"]; // ลองตามลำดับ
LLM.IMAGE_MODELS = ["gemini-3-pro-image-preview", "gemini-2.5-flash-image", "gemini-2.5-flash-image-preview"]; // Nano Banana

// gemini-2.5 มี "โทเคนคิด" ภายในที่กินโควตา maxOutputTokens — ต้องปิด ไม่งั้นคำตอบถูกตัดกลางคัน
LLM.genConfig = function (model, maxTokens) {
  const cfg = { temperature: 0.8, maxOutputTokens: maxTokens };
  if (model.startsWith("gemini-2.5-flash") && !model.includes("image")) {
    cfg.thinkingConfig = { thinkingBudget: 0 };
  }
  return cfg;
};

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
- โครงสร้างคำตอบทำนายเต็ม (ใช้หัวข้อย่อยเป็น markdown bold ทุกหัวข้อ เพื่อให้อ่านง่ายแม้เนื้อหายาว):
  **🔮 ภาพรวม** (สรุปสถานการณ์เชื่อมกับ FACTS 3-4 ประโยค) →
  **✨ มุมที่ดวงสนับสนุน** (อธิบายละเอียดว่าทำไม อ้างอิงจุดไหนของ FACTS บ้าง อย่างน้อย 2 ประเด็นย่อย) →
  **⚠️ มุมที่ควรระวัง** (พร้อมเหตุผลและทางออกเชิงปฏิบัติของแต่ละจุด อย่างน้อย 2 ประเด็นย่อย) →
  **🧭 ถ้าเจาะแยกมุม** (ขยายความตามหมวดที่เกี่ยวข้องกับคำถาม เช่น การงาน/การเงิน/ความรัก/สุขภาพใจ — เลือกเฉพาะมุมที่เกี่ยวกับคำถามจริง 2-3 มุม อธิบายแต่ละมุมอย่างเป็นรูปธรรม ไม่ใช่แค่ 1 ประโยค) →
  **✅ แผนลงมือทำ** (4-5 ข้อ แบ่งเป็นระยะสั้น "ทำวันนี้/สัปดาห์นี้" และระยะถัดไป "1 เดือนข้างหน้า" ให้ทำได้จริงเป็นรูปธรรม ไม่ใช่คำแนะนำกว้างๆ) →
  **💭 คำถามชวนคิด** 1-2 ข้อที่ช่วยให้ผู้ใช้ทบทวนตัวเอง →
  ปิดด้วยประโยคให้กำลังใจที่เชื่อมกับเนื้อหาจริง (ไม่ใช่ประโยคสำเร็จรูปทั่วไป)
- ความยาว (เพิ่มความลึกจากเดิมประมาณเท่าตัว): บทสนทนาทั่วไปควรมีเนื้อหาราว 500-900 คำ อ่านจบใน 3-4 นาที ให้รายละเอียดและเหตุผลประกอบมากพอ ไม่ตอบสั้นห้วนเกินไป ส่วนการวิเคราะห์เชิงลึก (ลายมือ โหงวเฮ้ง โทนสี, integrated reading) ต้องละเอียดครบทุกหัวข้อ 900-1500 คำ ใช้ markdown หัวข้อ/ตัวหนา/bullet ได้เต็มที่เพื่อให้อ่านง่ายแม้เนื้อหายาว
- ทุกหัวข้อควรมีตัวอย่างประกอบหรือเหตุผลเชื่อมโยงกับ FACTS จริง ห้ามเขียนลอยๆ แบบทั่วไปที่ใช้กับใครก็ได้ (ต้องรู้สึกว่าเขียนเฉพาะสำหรับผู้ใช้คนนี้)
- ห้ามตอบเป็นแค่คำเกริ่นว่า "กำลังจะวิเคราะห์" — ต้องส่งเนื้อหาวิเคราะห์จริงครบถ้วนในข้อความเดียวเสมอ ห้ามตัดจบกลางคันเพราะคิดว่ายาวเกินไป — ความละเอียดคือสิ่งที่ผู้ใช้ต้องการ
- จบด้วยบรรทัด: "🌸 เพื่อการสะท้อนตนเองนะคะ การตัดสินใจสำคัญใช้ข้อมูลจริงประกอบด้วยเสมอ"`;

// System prompt แบบ localized: persona + safety เดิม + คำสั่งภาษา/วัฒนธรรม
LLM.systemFor = function () {
  return LLM.SYSTEM + "\n\n" + I18N.promptDirective();
};

// สร้าง FACTS จาก engine (โครงสร้างชัด ให้ LLM ตีความอย่างเดียว)
// extra.methods: ["birthdate"|"tarot"|"palm"|"face"|"style"|"phone"|"blood"] หรือ ["integrated"]
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
  if (extra && extra.undertone) {
    const kbH = KB.get("hair_color", extra.undertone);
    lines.push(`โทนสีผิว (undertone) ที่ผู้ใช้ระบุ: ${extra.undertone}${kbH ? ` — สีผมที่เข้ากัน: ${kbH.o}` : ""}`);
  }
  if (extra && extra.phone) lines.push(`ผลวิเคราะห์เบอร์โทร: คะแนน ${extra.phone.score}/10, ผลรวม ${extra.phone.sum}${extra.phone.sumGood ? " (" + extra.phone.sumGood + ")" : ""}, คู่เลขท้าย: ` + extra.phone.pairs.map(p => `${p.pair}=${p.t}`).join("; "));
  if (extra && extra.memory && extra.memory.length) {
    lines.push(`[MEMORY — เรื่องที่ผู้ใช้เคยคุยกับพี่หมอไว้ก่อนหน้า (ล่าสุดอยู่ล่างสุด)]`);
    extra.memory.slice(-6).forEach(m =>
      lines.push(`- ${m.d}${m.cat ? " [" + m.cat + "]" : ""}: "${m.q}"${m.fb ? ` (feedback ของผู้ใช้ต่อคำทำนายครั้งนั้น: ${m.fb})` : ""}`));
  }
  if (extra && extra.blood) {
    const kbB = KB.get("blood_type", extra.blood);
    if (kbB) lines.push(`กรุ๊ปเลือด (มุมมองความเชื่อเอเชียตะวันออก): ${extra.blood} — ${kbB.i} | แนวทาง: ${kbB.o} | ระวัง: ${kbB.w}`);
  }
  // ---- โหมดการอ่าน: ศาสตร์เดียว vs รวมหลายศาสตร์ ----
  const methods = (extra && extra.methods && extra.methods.length) ? extra.methods : ["integrated"];
  const single = methods.length === 1 && methods[0] !== "integrated";
  if (single) {
    lines.push(`[READING_MODE] single-method: ใช้เฉพาะศาสตร์ "${methods[0]}" เท่านั้น — ห้ามดึงศาสตร์อื่นมาปน ตอบให้จบสมบูรณ์ในศาสตร์เดียว ห้ามชวนใช้ศาสตร์อื่นแทรกระหว่างคำตอบ`);
  } else {
    lines.push(`[READING_MODE] integrated: รวมหลายศาสตร์ — ทุก insight ต้องระบุที่มา ("จากวันเกิด...", "จากไพ่...", "จากลายมือ...") สรุปจุดที่หลายศาสตร์สอดคล้องกัน (บอกจำนวนศาสตร์ที่ชี้ตรงกัน) ถ้าขัดแย้งให้เสนอเป็นหลายมุมมองไม่ฟันธง ปิดท้ายด้วย Integrated Advice + action plan 7 วัน`);
  }
  // ---- Knowledge context จากฐานความรู้ (กติกาการตีความ) ----
  const cats = methods.reduce((a, m) => a.concat(KB.METHOD_CATEGORIES[m] || []), []);
  const kbCtx = KB.forPrompt([...new Set(cats)], I18N.culturalContext());
  if (kbCtx) lines.push(kbCtx);
  lines.push(`[DISCLAIMER ที่ต้องปิดท้ายคำตอบ] ${KB.disclaimer("belief", I18N.lang)}`);
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
            systemInstruction: { parts: [{ text: LLM.systemFor() }] },
            contents,
            generationConfig: LLM.genConfig(model, 8192)
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
  palm: `วิเคราะห์ภาพฝ่ามือนี้ตามศาสตร์หัตถศาสตร์ (ลายมือ) อย่างละเอียดครบทุกหัวข้อ 900-1500 คำ ในข้อความเดียว — สังเกตจากภาพจริงแล้ววิเคราะห์เลย ห้ามตอบแค่คำเกริ่น:
1. รูปมือ+นิ้ว → ธาตุประจำมือ (ดิน/ลม/ไฟ/น้ำ) และนิสัยพื้นฐาน
2. เส้นชีวิต: ความยาว-โค้ง-ลึก → พลังชีวิต ความแข็งแรง (ห้ามทำนายอายุขัย)
3. เส้นสมอง: ความยาว-ทิศทาง → วิธีคิด ตัดสินใจ
4. เส้นหัวใจ: จุดเริ่ม-ปลายเส้น → นิสัยความรัก การแสดงออกทางใจ
5. เส้นวาสนา (ถ้าเห็น): ความชัด → เส้นทางการงาน-ความมั่นคง ช่วงชีวิตที่เด่น
6. เนิน/จุดพิเศษที่สังเกตเห็น
สรุป: จุดแข็ง 3 ข้อ, สิ่งที่ควรพัฒนา 2 ข้อ (โทนบวก), คำแนะนำเชื่อมโยงกับ FACTS ดวงพื้นฐาน
ถ้าภาพไม่ใช่ฝ่ามือหรือไม่ชัดพอ ให้บอกตรงๆ และแนะวิธีถ่ายใหม่ (กางฝ่ามือ แสงสว่าง ถ่ายตรง) ห้ามเดา`,
  face: `วิเคราะห์ภาพใบหน้านี้ตามหลักโหงวเฮ้งจีน (面相) อย่างละเอียดครบทุกหัวข้อ 900-1500 คำ ในข้อความเดียว:

**1. สามส่วนใบหน้า (三停 ซานถิง)** — วัดสัดส่วนจากภาพจริง:
- ส่วนบน (หน้าผากถึงคิ้ว) = วัยเยาว์ 15-30 ปี, สติปัญญา, บุญเก่า-ต้นทุนชีวิต
- ส่วนกลาง (คิ้วถึงปลายจมูก) = วัยทำงาน 31-50 ปี, การงาน, ทรัพย์
- ส่วนล่าง (ใต้จมูกถึงคาง) = บั้นปลาย 51+ ปี, บริวาร, ความมั่นคง
ระบุว่าส่วนไหนเด่น/ด้อยกว่ากัน และตามตำราหมายถึงช่วงชีวิตไหนรุ่งหรือต้องสร้างเอง เพราะอะไร

**2. ห้าอวัยวะหลัก (五官 อู่กวน)** — วิเคราะห์ทีละจุดจากภาพจริง โดยแต่ละจุดให้บอกตรงๆ ว่า "ดีตามตำราเพราะอะไร" หรือ "ตำราว่าควรเสริมเพราะอะไร + วิธีเสริมที่ทำได้จริง":
- คิ้ว (保壽官 ดูอายุวัฒนะ-พี่น้อง-อารมณ์): ความหนา ทรง ระยะห่างจากตา
- ดวงตา (監察官 ดูอำนาจ-สติปัญญา-จิตใจ): ขนาด ประกาย หางตา
- จมูก (審辨官 ดูทรัพย์-การงาน กลางหน้าคือ "ภูเขาเงิน"): สันจมูก ปลายจมูก ปีกจมูก
- ปาก (出納官 ดูวาจา-โชคลาภ-เสน่ห์): ทรง มุมปาก ริมฝีปาก
- หู (采聽官 ดูบุญวาสนา-สุขภาพ ถ้าเห็นในภาพ): ขนาด ติ่งหู
**3. จุดพิเศษที่เห็นในภาพ**: โหนกแก้ม (อำนาจ), คาง (บริวาร-บั้นปลาย), หน้าผาก (ต้นทุนชีวิต), ไฝ/ตำแหน่งเด่น (ถ้ามี)
**4. รูปหน้าตามธาตุจีน** (ทอง=เหลี่ยม, ไม้=ยาว, น้ำ=กลม, ไฟ=แหลม, ดิน=หนา) → นิสัยตามธาตุ + ทรงผมที่เสริมโหงวเฮ้งรูปหน้านี้ (ชาย/หญิงตามที่เห็น)
**5. สรุป**: จุดแข็งโหงวเฮ้ง 3 ข้อ (อ้างตำแหน่งบนหน้า), จุดที่ตำราแนะให้เสริม 2 ข้อพร้อมวิธี (เช่น เล็มคิ้ว ยิ้มยกมุมปาก ทรงผมเปิดหน้าผาก) และเชื่อมโยงกับ FACTS ดวงพื้นฐาน

กติกา: วิจารณ์ตามตำราได้ตรงไปตรงมาทั้งจุดดีและจุดด้อย แต่ห้ามตัดสินความสวย-หล่อ ห้ามพูดเรื่องน้ำหนัก/สีผิว/อายุเชิงลบ ทุกจุดด้อยต้องจบด้วยวิธีเสริมที่ทำได้จริง ถ้าภาพไม่ใช่ใบหน้าตรงหรือมืดเกิน ให้ขอถ่ายใหม่อย่างสุภาพ`,
  style: `วิเคราะห์ภาพนี้เพื่อทำ Seasonal Color Analysis (วิเคราะห์โทนสีประจำตัว) อย่างละเอียดครบทุกหัวข้อ 900-1500 คำ ในข้อความเดียว — ประเมินจากภาพจริงแล้ววิเคราะห์เลย ห้ามตอบแค่คำเกริ่น:
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
            systemInstruction: { parts: [{ text: LLM.systemFor() }] },
            contents,
            generationConfig: LLM.genConfig(model, 8192)
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

// ---------- สร้างภาพไพ่ด้วย Gemini image model (Nano Banana) ----------
// คืนค่า dataURL ของภาพ หรือ throw ถ้าสร้างไม่ได้ (ผู้เรียกต้อง fallback เป็น SVG)
LLM.genImage = async function (apiKey, prompt) {
  let lastErr = null;
  for (const model of LLM.IMAGE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"] }
          })
        }
      );
      if (!res.ok) { lastErr = new Error("HTTP " + res.status); continue; }
      const data = await res.json();
      const parts = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content ? data.candidates[0].content.parts || [] : [];
      const img = parts.find(p => (p.inlineData && p.inlineData.data) || (p.inline_data && p.inline_data.data));
      if (img) {
        const d = img.inlineData || img.inline_data;
        return `data:${d.mimeType || d.mime_type || "image/png"};base64,${d.data}`;
      }
      lastErr = new Error("no image in response");
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("image generation failed");
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
// ข้อความวิกฤต — localize ตามภาษา + แสดงสายด่วนไทย 1323 เฉพาะเมื่อประเทศคือไทย (เบอร์นี้ใช้ได้เฉพาะในไทย)
// ประเทศอื่นแนะนำติดต่อสายด่วน/บริการฉุกเฉินในพื้นที่แทน เพื่อไม่ให้ข้อมูลผิดบริบท
LLM.crisisMsg = function () {
  const isThai = I18N.lang === "th";
  const thaiHotline = I18N.country === "TH" || I18N.lang === "th";
  if (isThai) {
    return `พี่หมอขอหยุดเรื่องดวงไว้ก่อนนะคะ เพราะสิ่งที่สำคัญที่สุดตอนนี้คือใจของคุณค่ะ 💛

สิ่งที่คุณรู้สึกอยู่มันหนักจริงๆ และการที่คุณพิมพ์ออกมาได้คือความกล้าหาญมากแล้วนะคะ คุณไม่จำเป็นต้องผ่านช่วงนี้คนเดียว

📞 **สายด่วนสุขภาพจิต 1323** (ฟรี ตลอด 24 ชั่วโมง) มีคนพร้อมรับฟังคุณเสมอค่ะ
หรือคุยกับคนที่คุณไว้ใจสักคนคืนนี้ก็ได้นะคะ

พี่หมออยู่ตรงนี้ ถ้าอยากพิมพ์ระบายต่อ พี่หมอรับฟังค่ะ`;
  }
  return `Let's pause the fortune-telling for a moment — what matters most right now is you. 💛

What you're feeling sounds really heavy, and just being able to type it out took real courage. You don't have to get through this alone.

📞 ${thaiHotline ? "**Thailand Mental Health Hotline: 1323** (free, 24/7)" : "Please reach out to a local crisis line, mental health service, or emergency number in your area"} — someone is ready to listen.
Or talk to someone you trust tonight, if that feels possible.

I'm here too. If you want to keep typing, I'm listening.`;
};
// ยังคง property เดิมไว้เพื่อความเข้ากันได้ (เผื่อโค้ดอื่นอ้างอิงตรงๆ) — เป็นค่าเริ่มต้นภาษาไทย
Object.defineProperty(LLM, "CRISIS_MSG", { get() { return LLM.crisisMsg(); } });
