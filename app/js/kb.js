// ============================================================
// ORA Knowledge Base — seed จาก 1-knowledge-engineer-ai-ontology-taxonomy
// (knowledge_entries.csv + knowledge_schema.json + safety_tone_guideline.md)
// โครงสร้าง entry: c=category, s=subcategory, i=interpretation,
// o=recommended_output, w=caution, lv=confidence level, bt=belief type,
// cs=culture_scope, loc=localized terms (โดย default เนื้อหาเป็น th)
// ============================================================
const KB = {};

KB.BELIEF_TYPES = {
  EB: "evidence_based", CB: "cultural_belief", EX: "expert_interpretation",
  AP: "app_generated_personalization", SF: "AI_safety"
};

KB.ENTRIES = [
  // ---- astrology ----
  { c: "astrology", s: "thai_natal", i: "พื้นดวงใช้เป็นแผนที่เชิงสัญลักษณ์ของจังหวะชีวิต", o: "ให้ภาพรวม 3 ประเด็น พร้อม action plan และคำถาม follow-up", w: "ไม่ทำนายโรค ความตาย อุบัติเหตุ หรือผลลัพธ์แน่นอน", lv: 2, bt: "CB", cs: ["Thai"] },
  { c: "astrology", s: "western_sun_sign", i: "ราศีอาทิตย์เป็นภาพตัวตนแบบกว้าง ต้องใช้ร่วมกับ moon/rising เพื่อ personalization", o: "สรุปจุดเด่นเชิงบวกและคำแนะนำรายวันแบบไม่ฟันธง", w: "ห้ามเหมารวมบุคลิกจากราศีเดียว", lv: 2, bt: "CB", cs: ["Western", "Global"] },
  { c: "astrology", s: "ascendant", i: "ลัคนาช่วยอ่านภาพที่คนเห็นและวิธีเริ่มต้นสิ่งต่างๆ", o: "ถามความแม่นของเวลาเกิดและอธิบายผลแบบมีเงื่อนไข", w: "เวลาเกิดคลาดเคลื่อนทำให้ผลลัคนาผิดได้", lv: 2, bt: "CB", cs: ["Thai", "Western"] },
  { c: "astrology", s: "element_western", i: "ธาตุเป็น archetype สำหรับแนะนำวิธีบาลานซ์: ไฟ=ลงมือ ดิน=โครงสร้าง ลม=ความคิด น้ำ=ความรู้สึก", o: "ให้คำแนะนำเชิงพฤติกรรมที่ทำได้จริง", w: "ห้ามบอกว่าธาตุหนึ่งเหนือกว่าอีกธาตุ", lv: 2, bt: "CB", cs: ["Western", "Global"] },
  // ---- cards ----
  { c: "tarot", s: "three_card", i: "ไพ่ใช้เป็นเครื่องมือสะท้อนสถานการณ์และทางเลือก", o: "ตอบเป็น insight, choice, next step, follow-up question", w: "ไม่ใช้แทนคำปรึกษากฎหมาย การแพทย์ การเงิน", lv: 2, bt: "CB", cs: ["Western", "Global"] },
  { c: "tarot", s: "oracle", i: "Oracle เหมาะกับคำแนะนำเชิงกำลังใจ", o: "ให้ affirmation + micro action", w: "ไม่อ้างว่าเป็นคำตอบจากสิ่งศักดิ์สิทธิ์แบบรับประกัน", lv: 3, bt: "EX", cs: ["Global"] },
  // ---- numerology ----
  { c: "numerology", s: "life_path", i: "เลขศาสตร์เป็นความเชื่อเรื่องความหมายของตัวเลข", o: "ให้จุดแข็งและจุดพัฒนาเชิงบวก", w: "ไม่รับประกันโชคลาภหรือความสำเร็จ", lv: 2, bt: "CB", cs: ["Global"] },
  { c: "numerology", s: "thai_7_9", i: "เลข 7 ตัว 9 ฐานใช้ดูพื้นดวงและดวงจรเมื่อไม่มีเวลาเกิด", o: "แสดงผลเป็นธีมชีวิตพร้อม action plan", w: "สูตรต่างกันตามสำนัก ต้องระบุแหล่ง", lv: 2, bt: "CB", cs: ["Thai"] },
  { c: "phone_number", s: "pairs", i: "เบอร์โทรเป็น symbolic branding/self-image tool ตามความเชื่อ", o: "เสนอวิธีใช้จุดเด่นและพฤติกรรมประกอบ", w: "ห้ามขายความกลัวหรือบังคับเปลี่ยนเบอร์", lv: 2, bt: "CB", cs: ["Thai", "Chinese"] },
  { c: "car_plate", s: "sum", i: "ทะเบียนรถควรพูดร่วมกับ safety behavior", o: "แนะนำตรวจรถ วางแผนเดินทาง และใช้เลขเป็นกำลังใจ", w: "ห้ามทำนายอุบัติเหตุ", lv: 2, bt: "CB", cs: ["Thai"] },
  // ---- palmistry ----
  { c: "palmistry", s: "major_lines", i: "ลายมือใช้สะท้อนพฤติกรรมและโฟกัสชีวิต ไม่ใช่ชะตาถาวร", o: "แนะนำ habit ที่สอดคล้องกับเส้นหลัก อ่านเส้นหลัก 2-4 จุด", w: "ห้ามทำนายอายุขัยหรือโรคร้าย ห้ามบอกว่าลายมือไม่ดี", lv: 2, bt: "CB", cs: ["Global"] },
  // ---- face reading ----
  { c: "face_reading", s: "face_shape", i: "โหงวเฮ้งใช้เป็น image consulting อย่างให้เกียรติ", o: "แนะนำทรงผม แว่น คอเสื้อ และสีที่เสริมภาพลักษณ์", w: "ห้ามตัดสินคุณค่า บุคลิก หรือวาสนาจากหน้า", lv: 2, bt: "CB", cs: ["Chinese", "Thai"] },
  { c: "face_reading", s: "expression", i: "first impression จากใบหน้ามี bias จึงใช้เพื่อปรับการสื่อสารเท่านั้น", o: "แนะนำยิ้มเบาๆ สีสว่างขึ้น และ posture เปิด", w: "ไม่สรุปนิสัยจริงจากสีหน้าเดียว", lv: 1, bt: "EB", cs: ["Global"] },
  // ---- feng shui / time ----
  { c: "feng_shui", s: "desk_basic", i: "การจัดพื้นที่ช่วยทั้งความรู้สึกควบคุมและ flow ตามความเชื่อ", o: "เสนอ 3 step: เคลียร์โต๊ะ จัดแสง วางเป้าหมายวัน", w: "ไม่รับประกันเงินหรืองานจากฮวงจุ้ย", lv: 2, bt: "CB", cs: ["Chinese", "Thai"] },
  { c: "auspicious_time", s: "start_activity", i: "ฤกษ์ช่วยเพิ่มความมั่นใจในการเริ่มต้น", o: "ให้ 2-3 ตัวเลือกพร้อมข้อควรเตรียม", w: "ไม่ให้ฤกษ์แทนการวางแผนจริง", lv: 2, bt: "CB", cs: ["Thai", "Chinese"] },
  // ---- personal color ----
  { c: "personal_color", s: "warm_undertone", i: "โทนอุ่นใกล้ใบหน้าช่วยให้ภาพรวมดูกลมกลืนสำหรับ warm undertone", o: "base: ivory, camel, olive, warm navy; accent ทอง", w: "personal color เป็น styling framework ไม่ใช่กฎตายตัว", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "personal_color", s: "cool_undertone", i: "โทนเย็นช่วยให้ cool undertone ดูคมและสดใส", o: "base: navy, icy pink, blue-red, charcoal; accent เงิน", w: "ต้องคำนึงถึง preference และ dress code", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "personal_color", s: "neutral_undertone", i: "neutral undertone ใช้ได้ทั้ง warm/cool แต่ควรเลี่ยงสุดโต่ง", o: "แนะนำ taupe, soft white, teal, medium gray", w: "อย่าบอกว่าสีใดห้ามเด็ดขาด", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "personal_color", s: "olive_undertone", i: "olive undertone อาจดูเทาเมื่อเจอสีขาวจัดหรือ pastel บางเฉด", o: "แนะนำ teal/ivory/espresso ตรวจกับแสงธรรมชาติ", w: "ต้องตรวจด้วยภาพจริงและความชอบส่วนตัว", lv: 3, bt: "EX", cs: ["Global"] },
  // ---- fashion ----
  { c: "fashion", s: "interview", i: "สีและความเรียบร้อยช่วยสร้าง first impression ที่น่าเชื่อถือ", o: "blazer navy/charcoal/cream, minimal accessory, รองเท้าสบาย", w: "ไม่รับประกันผลสัมภาษณ์", lv: 1, bt: "EB", cs: ["Global"] },
  { c: "fashion", s: "date", i: "เดตควรเน้นความมั่นใจและความเข้ากับตัวเอง", o: "สีที่ทำให้ผิวสดใสและ accent อ่อนโยน", w: "ไม่สรุปผลความรักจากชุด", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "fashion", s: "presentation", i: "สีที่ชัดและไม่รบกวนกล้องช่วยให้ผู้ชมโฟกัสสาร", o: "base professional + accent ชัดใกล้ใบหน้า เลี่ยงลายเล็กถี่", w: "ต้องคำนึงถึง brand และ lighting", lv: 1, bt: "EB", cs: ["Global"] },
  // ---- blood type ----
  { c: "blood_type", s: "A", i: "A มักถูกเล่าว่ารอบคอบและมีระบบ (ความเชื่อเอเชียตะวันออก)", o: "ชื่นชม planning และแนะนำลด perfectionism", w: "ไม่เหมารวมว่า A ต้องเครียดหรือเจ้าระเบียบ", lv: 2, bt: "CB", cs: ["Japanese", "Korean", "Thai"] },
  { c: "blood_type", s: "B", i: "B มักถูกเล่าว่าอิสระและสร้างสรรค์", o: "แนะนำใช้ freedom พร้อม deadline ที่ชัด", w: "ไม่เหมารวมว่าเอาแต่ใจ", lv: 2, bt: "CB", cs: ["Japanese", "Korean", "Thai"] },
  { c: "blood_type", s: "AB", i: "AB มักถูกเล่าว่ามีหลายมุมมอง", o: "แนะนำใช้ analytical strength และพักก่อนตัดสินใจ", w: "ห้ามเรียกสองบุคลิกหรือแปลก", lv: 2, bt: "CB", cs: ["Japanese", "Korean", "Thai"] },
  { c: "blood_type", s: "O", i: "O มักถูกเล่าว่ามุ่งเป้าและเปิดเผย", o: "แนะนำใช้ภาพใหญ่พร้อมรับฟังรายละเอียดจากทีม", w: "ไม่เหมารวมว่าชอบครอบงำ", lv: 2, bt: "CB", cs: ["Japanese", "Korean", "Thai"] },
  // ---- elements ----
  { c: "elements", s: "wuxing", i: "ธาตุจีน (五行) ใช้กับทิศทางพัฒนา: ไม้=เติบโต ไฟ=พลัง ดิน=มั่นคง ทอง=ระเบียบ น้ำ=ปัญญา", o: "แนะนำสี accent ตามธาตุ + ตั้งเป้าหมายที่สอดคล้อง", w: "ระบุว่าเป็น Wuxing cultural framework", lv: 2, bt: "CB", cs: ["Chinese"] },
  { c: "elements", s: "wuxing_cycle", i: "วงจรธาตุใช้เสนอสมดุล ไม่ใช่ชี้ดีร้าย", o: "ถ้าพลังไฟมาก แนะนำกิจกรรมธาตุน้ำ เช่น slow routine สีสงบ", w: "ไม่กล่าวว่าธาตุข่มกันทำให้โชคร้าย", lv: 2, bt: "CB", cs: ["Chinese"] },
  // ---- year clash (ปีชง) ----
  { c: "year_clash", s: "direct_clash", i: "ปีชงตรงคือสัญญาณให้รอบคอบขึ้นตามความเชื่อไทย-จีน", o: "แนะนำตรวจเอกสาร วางแผนเดินทาง ดูแลสุขภาพทั่วไป และทำบุญ/ไหว้ไท้ส่วยเอี๊ยตามศรัทธา", w: "ไม่สร้างความกลัวหรือบอกว่าจะเกิดเคราะห์แน่นอน", lv: 2, bt: "CB", cs: ["Thai", "Chinese"] },
  { c: "year_clash", s: "kak", i: "ปีคัก (นักษัตรเดียวกับปี) ตีความเป็นปีที่ควรจัดการพลังตัวเองให้ดี", o: "แนะนำพักให้พอ ลดรับภาระเกินตัว ตั้งขอบเขต", w: "ปีคัก/เฮ้ง/ผั่วมี variation ตามสำนัก", lv: 2, bt: "CB", cs: ["Thai", "Chinese"] },
  // ---- remedy / color fortune ----
  { c: "remedy", s: "free_daily", i: "เสริมดวงแบบปลอดภัยควรทำให้ใจนิ่งและพฤติกรรมดีขึ้น", o: "เก็บโต๊ะ 10 นาที ตั้งเจตนา ทำสิ่งดีหนึ่งอย่าง", w: "ห้ามบังคับซื้อของหรือรับประกันผล", lv: 4, bt: "AP", cs: ["Global"] },
  { c: "remedy", s: "before_meeting", i: "การเตรียมตัวคือแกนหลัก สีและพิธีเป็นตัวเสริมใจ", o: "checklist 5 ข้อ + outfit recommendation", w: "ไม่บอกว่าสีเดียวทำให้ชนะการเจรจา", lv: 4, bt: "AP", cs: ["Global"] },
  { c: "color_fortune", s: "personal_vs_lucky", i: "ถ้าสีมงคลขัดกับ personal color ให้ใช้สีมงคลเป็น accent ห่างใบหน้า", o: "ใช้สีมงคลในเล็บ กระเป๋า wallpaper เครื่องประดับ กิ๊บ/ริบบิ้นผม", w: "ไม่บอกว่าต้องเลี่ยงสีใดเด็ดขาดถ้าผู้ใช้ชอบ", lv: 4, bt: "AP", cs: ["Global"] },
  { c: "situation_color", s: "negotiation", i: "สีเข้มกลาง (navy, charcoal, cream, deep brown) มักสื่อความนิ่งและมืออาชีพ", o: "base professional + one accent ตาม undertone/ความเชื่อ", w: "ไม่รับประกันปิดดีล", lv: 1, bt: "EB", cs: ["Global"] },
  { c: "situation_color", s: "calm_day", i: "สีอ่อน contrast ต่ำ (soft blue, sage, gray) ช่วยสร้าง mood สงบสำหรับบางคน", o: "เสื้อ/ของใช้สีสงบ ลด visual clutter", w: "ผลของสีขึ้นกับบริบทและบุคคล", lv: 1, bt: "EB", cs: ["Global"] },
  { c: "accessory", s: "credibility", i: "accessory เรียบช่วยให้ภาพรวมตั้งใจและน่าเชื่อถือ", o: "เลือก 1-2 ชิ้นคุณภาพดี ไม่แย่ง attention", w: "ไม่ผูกคุณค่าคนกับของแพง", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "accessory", s: "date_charm", i: "เสน่ห์ควรมาจากความสบายใจและความเป็นตัวเอง", o: "lip สีสวย texture นุ่ม เครื่องประดับชิ้นเล็ก accent ตาม undertone", w: "ไม่รับประกันความสัมพันธ์", lv: 3, bt: "EX", cs: ["Global"] },
  // ---- hair (สังเคราะห์จาก personal_color + fashion practice) ----
  { c: "hair_color", s: "warm", i: "undertone อุ่นเข้ากับกลุ่มสีผมโทนอุ่น", o: "warm brown, caramel, chestnut, honey brown, copper brown, dark chocolate", w: "ทดลองกับแสงจริง สีจริงขึ้นกับพื้นผมเดิม", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "hair_color", s: "cool", i: "undertone เย็นเข้ากับกลุ่มสีผมโทนเย็น", o: "ash brown, cool dark brown, blue-black, burgundy brown, mushroom brown, soft black", w: "ทดลองกับแสงจริง", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "hair_color", s: "neutral", i: "neutral เลือกได้ทั้งสองโทน ปรับตามบุคลิกและบริบท", o: "milk tea brown, soft chocolate, espresso; ปรับ warm/cool ตามเป้าหมาย", w: "พิจารณา dress code ของอาชีพ", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "hair_color", s: "goal_credible", i: "เป้าหมายความน่าเชื่อถือ → สีสุภาพ", o: "dark brown, soft black, espresso, cool brown — เต็มศีรษะ", w: "ประเทศ/องค์กร conservative ให้เสนอสี practical ก่อน", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "hair_color", s: "goal_charm", i: "เป้าหมายเสน่ห์นุ่มนวล → สีที่ทำให้หน้าสว่าง", o: "milk tea brown, caramel, rose brown, soft chocolate", w: "เลือกตาม undertone ก่อนเสมอ", lv: 3, bt: "EX", cs: ["Global"] },
  { c: "hair_color", s: "goal_standout", i: "เป้าหมายโดดเด่นมั่นใจ → สีมีมิติ", o: "ash beige, burgundy brown, copper brown หรือ highlight/money piece บางส่วน", w: "ถ้าสีเสริมดวงไม่ตรง personal color ให้ใช้เป็น highlight/inner color/accessory แทนย้อมทั้งหัว", lv: 3, bt: "EX", cs: ["Global"] },
  // ---- psychology (evidence layer) ----
  { c: "psychology", s: "communication", i: "การสื่อสารแบบ assertive ช่วยรักษาความสัมพันธ์และขอบเขต", o: "ให้ประโยค I-statement และ deadline response", w: "ไม่ใช้กับสถานการณ์อันตรายที่ต้องแผนความปลอดภัย", lv: 1, bt: "EB", cs: ["Global"] },
  { c: "psychology", s: "emotion_regulation", i: "การจัดการอารมณ์มีหลายจุดแทรกแซงก่อนตอบสนอง", o: "หยุด 90 วินาที หายใจ เขียนสิ่งที่ต้องการจริง", w: "ถ้ามี self-harm หรือ panic รุนแรงให้ขอความช่วยเหลือทันที", lv: 1, bt: "EB", cs: ["Global"] },
  { c: "psychology", s: "cognitive_bias", i: "การตัดสินใจเสี่ยงควรมี checklist และ second opinion", o: "decision matrix + ถามหลักฐานฝั่งตรงข้าม", w: "เรื่องลงทุน/กฎหมายต้องปรึกษาผู้เชี่ยวชาญ", lv: 1, bt: "EB", cs: ["Global"] },
  // ---- safety ----
  { c: "safety", s: "appearance_bias", i: "รูปลักษณ์ไม่ใช่หลักฐานของคุณค่า บุคลิก หรือชะตา", o: "ใช้ภาษาว่า 'ภาพรวมให้ความรู้สึก...' 'หากอยากเสริม...'", w: "ห้ามคำว่า อาภัพ วาสนาไม่ดี หน้าไม่ดี โหงวเฮ้งเสีย", lv: 1, bt: "SF", cs: ["Global"] },
  { c: "safety", s: "high_risk_finance", i: "คำทำนายไม่ควรทำให้ตัดสินใจเสี่ยงทางการเงิน", o: "แนะนำ budget, risk cap, second opinion", w: "ห้ามรับประกันกำไรหรือบอกให้กู้/ลงทุนจากดวง", lv: 1, bt: "SF", cs: ["Global"] },
  { c: "safety", s: "high_risk_health", i: "สุขภาพต้องแยกจากความเชื่อ", o: "แนะนำพักผ่อน ตรวจสุขภาพ และพบแพทย์หากมีอาการ", w: "ห้ามทำนายโรคร้ายหรือบอกวิธีรักษา", lv: 1, bt: "SF", cs: ["Global"] }
];

// ---------- ภาษาปลอดภัย (จาก safety_tone_guideline.md) ----------
KB.SAFE_USE = ["ตามความเชื่อ...", "ตีความได้ว่า...", "มีแนวโน้ม/ธีมที่น่าสังเกต...", "ลองใช้เป็นแนวทางประกอบการตัดสินใจ", "สิ่งที่คุณทำได้วันนี้คือ...", "ถ้าข้อมูลนี้ไม่ตรงกับคุณ ให้ยึดบริบทจริงของคุณเป็นหลัก"];
KB.SAFE_AVOID = ["แม่น 100%", "ต้องเกิดแน่นอน", "ดวงตกหนัก", "ชีวิตจะพัง", "ถ้าไม่แก้จะเกิดเคราะห์", "หน้าไม่ดี", "อาภัพ", "วาสนาไม่ดี", "โหงวเฮ้งเสีย", "เลิกแน่นอน", "นอกใจแน่นอน", "ลงทุนแล้วรวย", "หน้าหมอง", "หน้าแก่", "สีผิวไม่ดี"];

// ---------- Disclaimers ตามประเภท (localized th/en; ภาษาอื่น fallback en) ----------
KB.DISCLAIMERS = {
  belief: {
    th: "ส่วนนี้เป็นการตีความตามความเชื่อและวัฒนธรรม ใช้เป็นแนวทางสะท้อนตัวเอง ไม่ใช่ข้อเท็จจริงหรือการรับประกันผล",
    en: "This section is a cultural/belief-based interpretation for self-reflection — not a fact or a guarantee of outcomes."
  },
  personal_color: {
    th: "คำแนะนำสีเป็นแนวทางด้านภาพลักษณ์และความกลมกลืน ทดลองกับแสงจริงและความชอบของคุณเป็นหลัก",
    en: "Color advice is a styling guideline. Test in real lighting and let your own preference lead."
  },
  coaching: {
    th: "นี่เป็นคำแนะนำทั่วไปเชิงพฤติกรรม ไม่ใช่การวินิจฉัยหรือการบำบัด",
    en: "This is general behavioral guidance, not diagnosis or therapy."
  },
  health: {
    th: "ฉันไม่สามารถวินิจฉัยโรคได้ หากมีอาการหรือกังวล ควรปรึกษาแพทย์/ผู้เชี่ยวชาญสุขภาพ",
    en: "I cannot diagnose illness. If you have symptoms or concerns, please consult a medical professional."
  },
  finance_legal: {
    th: "คำตอบนี้ไม่ใช่คำปรึกษาทางการเงินหรือกฎหมาย ควรปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจสำคัญ",
    en: "This is not financial or legal advice. Consult a qualified professional before important decisions."
  }
};

// ---------- API ----------
KB.byCategory = function (cat) { return KB.ENTRIES.filter(e => e.c === cat); };
KB.get = function (cat, sub) { return KB.ENTRIES.find(e => e.c === cat && e.s === sub) || null; };

KB.disclaimer = function (type, lang) {
  const d = KB.DISCLAIMERS[type] || KB.DISCLAIMERS.belief;
  return d[lang] || d.en || d.th;
};

// สร้าง KNOWLEDGE_CONTEXT block สำหรับ prompt (เลือกเฉพาะหมวดที่เกี่ยว + กรองตามวัฒนธรรม)
KB.forPrompt = function (categories, culturalContext) {
  const ctx = culturalContext || [];
  const rows = KB.ENTRIES.filter(e => {
    if (!categories.includes(e.c)) return false;
    if (!ctx.length) return true;
    return e.cs.includes("Global") || e.cs.some(s => ctx.includes(s));
  });
  if (!rows.length) return "";
  const lines = ["[KNOWLEDGE_CONTEXT — กติกาการตีความจากฐานความรู้ ห้ามขัดแย้งกับข้อมูลนี้]"];
  rows.forEach(e => lines.push(
    `- (${e.c}/${e.s} | ${KB.BELIEF_TYPES[e.bt]} L${e.lv}) ${e.i} → แนวทาง output: ${e.o} | ข้อระวัง: ${e.w}`));
  lines.push(`- ภาษาที่ควรใช้: ${KB.SAFE_USE.join(" / ")}`);
  lines.push(`- ห้ามใช้คำ: ${KB.SAFE_AVOID.join(", ")}`);
  return lines.join("\n");
};

// map หมวดของ reading method → categories ใน KB
KB.METHOD_CATEGORIES = {
  birthdate: ["astrology", "numerology", "elements", "year_clash", "remedy"],
  tarot: ["tarot", "remedy"],
  palm: ["palmistry", "safety", "psychology"],
  face: ["face_reading", "safety", "hair_color", "personal_color", "accessory"],
  style: ["personal_color", "fashion", "hair_color", "situation_color", "color_fortune", "accessory"],
  phone: ["phone_number", "numerology"],
  blood: ["blood_type", "psychology"],
  integrated: ["astrology", "numerology", "tarot", "palmistry", "face_reading", "blood_type", "personal_color", "color_fortune", "elements", "year_clash", "remedy", "psychology", "safety"]
};
