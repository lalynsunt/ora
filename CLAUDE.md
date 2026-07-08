# ORA — หมอดู AI (Solo founder + AI agents, งบ ~0 บาท)

## โปรเจกต์นี้คืออะไร
เว็บแอป PWA ดูดวงภาษาไทย "ORA / พี่หมอโอรา" — เจ้าของทำคนเดียว ใช้ Claude Code เป็นทีม dev/QA/ops ทั้งหมด
- **ห้ามเพิ่ม dependency, build step, framework, หรือ backend** — เป็น static site ล้วน (เปิดไฟล์ก็รันได้) เพื่อให้โฮสต์ฟรีและ AI ดูแลง่าย
- LLM runtime ใช้ **Gemini API free tier** โดยผู้ใช้ใส่ key เอง (เก็บใน localStorage) — ไม่มี server ไม่มี cost

## โครงสร้าง
```
app/
  index.html          — ทุก screen (onboarding, home, ask, tarot, scan, num, set) + #modal กลาง
  css/style.css       — ธีม Purple Mystic, CSS variables บนสุด
  js/knowledge.js     — ตำราศาสตร์ไทย (มหาทักษา, สี, เสวยอายุ, เลขศาสตร์, คู่เลขเบอร์, ทาโรต์ 22 ใบ,
                        ราศีละเอียด, นิสัยรายวันเกิด, ลัคนา, seasonal color, ทรงผม, คำอ่อนไหว)
  js/kb.js            — Knowledge Base จาก 1-knowledge-engineer-ai-ontology-taxonomy (55 entries →
                        condensed) + disclaimers localized + safe/avoid language + KB.forPrompt()
                        แหล่งต้นทาง: C:\Users\rattanos\Documents\Codex\2026-07-08\1-knowledge-engineer-ai-ontology-taxonomy\outputs\
                        (แก้ตำราให้แก้ที่ต้นทางก่อน แล้ว sync มาที่ kb.js)
  js/i18n.js          — 10 ภาษา (th/en full, ที่เหลือ placeholder fallback→en), ประเทศ+cultural context,
                        I18N.t(key,vars)/apply()/detect()/promptDirective()/scoreLabel()
                        UI ใช้ data-i18n (textContent) / data-i18n-html (innerHTML — ใช้เมื่อมี <a> ฯลฯ) /
                        data-i18n-ph (placeholder) — เนื้อหา JS-rendered ต้องเรียก I18N.t() ตรงในทุก render
                        ห้าม hardcode ข้อความไทย/อังกฤษใน render function อีก (นี่คือบั๊กที่เคยเกิด — เปลี่ยนภาษาแล้ว
                        มีแค่บาง label เปลี่ยน) ตำราเนื้อหา 2 ภาษา (K.DAY_TRAITS/K.ZODIAC/K.SAWOEY_THEME/K.LIFEPATH/
                        K.POSITION_THEME ใน knowledge.js) ดึงผ่าน K.L(entry,field)/K.planetName()/K.positionName()/
                        K.elementName() — fallback ไทยเสมอถ้าไม่มี .en หรือไม่มี I18N global (เช่นใน tests)
                        Engine.ruleAnswer/K.TAROT/K.PHONE_PAIRS/KB.* ยังเป็นไทยอย่างเดียว (ตำราต้นฉบับ) —
                        โหมด AI จะตีความเป็นภาษาที่เลือกให้เองผ่าน promptDirective เสมอไม่ว่า FACTS จะเป็นไทย
  js/monetize.js      — tiers (free/plus/premium/vip) + โควตารายวัน + pricing_by_country +
                        paywall modal + redeem code (ORA-DEV-*, ORA-KIOSK-* placeholder)
                        MZ.FREE_MODE = true ตอนนี้ (ช่วง QA เนื้อหา) — ปลดล็อกทุกอย่างฟรี ไม่ผ่าน quota/paywall
                        เปลี่ยนกลับเป็น false บรรทัดเดียวเมื่อพร้อมเปิด monetization จริง (โครง tier ทั้งหมดยังอยู่ครบ)
  js/scan-tools.js    — ตรวจคุณภาพภาพ (จริง), enhance ลายมือ (จริง: contrast+sharpen),
                        palm overlay + face region crops (placeholder ตำแหน่งมาตรฐาน — interface
                        พร้อมสลับ CV model จริง), virtual try-on placeholder
  js/engine.js        — คำนวณดวง (deterministic, seeded RNG) + safety + rule answer + bloodPersona
  js/llm.js           — Gemini chat/vision/image + systemFor() (localized) + buildFacts
                        (FACTS + MEMORY + READING_MODE single/integrated + KNOWLEDGE_CONTEXT จาก KB)
  js/app.js           — UI logic + state (localStorage key: ora_state_v1)
                        state สำคัญ: chat(40), memory(30), lang, country, blood, undertone, tier,
                        usage(โควตารายวัน), consent{palm,face,style} — ห้ามส่งออกนอกเครื่องผู้ใช้
  sw.js, manifest.webmanifest, icon.svg — PWA (แก้ไฟล์ app/ ต้อง bump CACHE เวอร์ชัน)
  assets/tarot/NN.jpg — ภาพไพ่ถาวร 22 ใบ (สร้างจากบัญชี Gemini ที่จ่ายเงิน — ดู TAROT-ART-GUIDE.md) มีครบแล้ว
  assets/icons/*.png  — ไอคอน nav 5 อัน (nav-today/ask/tarot/scan/settings) + category 6 อัน
                        (cat-love/work/money/family/education/heart-small) — cropped จาก icon sheet ต้นฉบับ
                        (Icon.jfif) ด้วย background segmentation + flood-fill transparency, พื้นหลังโปร่งใสแล้ว
                        "ตัวเลข" (numbers) ในแถบเมนูยังไม่มี asset — ใช้ emoji 🔢 (.nav-emoji class) แทน
01-*.md, 02-*.md, 03-*.md — แผนธุรกิจฉบับเต็ม (reference, gitignored)
AI-OPS-PLAYBOOK.md / DEPLOY.md / STORE-ROADMAP.md / TAROT-ART-GUIDE.md — คู่มือ ops
```

## กฎเหล็กของ codebase
1. **LLM ห้ามคำนวณดวงเอง** — ทุกข้อเท็จจริงทางศาสตร์มาจาก `knowledge.js`/`engine.js` แล้วส่งเป็น FACTS ให้ LLM ตีความเท่านั้น (ดู `LLM.buildFacts`)
2. **Deterministic** — ดวงวันเดียวกัน+คนเดียวกันต้องได้ผลเหมือนกันเสมอ (seeded RNG จาก date+dob) ห้ามใช้ `Math.random()` ในการทำนาย
3. **Safety ห้ามถอย** — ห้าม output เรื่องความตาย/โรคร้าย/อุบัติเหตุ/เลขหวย/ชี้นำลงทุน/ฟันธงเลิกรา; คำวิกฤต → โหมด supportive + สายด่วน 1323 (ดู `K.CRISIS_WORDS`, `Engine.safetyCheck`, `LLM.SYSTEM`, `LLM.outputFilter`) — แก้ system prompt ได้แต่ห้ามลบกติกาเหล็ก 7 ข้อ
4. **โทนภาษา** — "พี่หมอโอรา" อบอุ่น ลงท้ายค่ะ/นะคะ เรื่องลบต้องจบด้วยทางออก ห้ามขู่ให้กลัว ทุกหน้ามี disclaimer "เพื่อความบันเทิง/สะท้อนตนเอง"
5. **Privacy** — ข้อมูลอยู่ localStorage เท่านั้น ห้ามเพิ่ม analytics/tracking ที่ส่งข้อมูลออกโดยไม่ได้ตกลงกับเจ้าของโปรเจกต์ก่อน
6. **ห้ามใช้ alert()/confirm() ใน flow หลัก** (บล็อก renderer) — ใช้ inline message; ยกเว้น confirm ตอนลบข้อมูล

## วิธีรัน & ทดสอบ (ทำทุกครั้งก่อนบอกว่าเสร็จ)
```
node --check app/js/*.js                 # syntax ทุกไฟล์ (วนทีละไฟล์บน Windows)
node tests/test-engine.js               # engine smoke tests ต้อง ALL PASSED
npx --yes http-server app -p 8317       # หรือ preview server "ora-app" ใน .claude/launch.json
```
Manual QA ขั้นต่ำ: onboarding → home แสดงสี/คะแนน → ask ตอบได้ (โหมดตำรา) → คำว่า "เลขเด็ด" ต้องโดน safety → ไพ่เลือก 3 ใบเปิดผล → เบอร์ 0899515424 ได้คะแนนสูง → ตั้งค่า/ลบข้อมูลทำงาน

## ตำราที่ verify แล้ว (อย่าแก้โดยไม่มีแหล่งอ้างอิง)
- มหาทักษา: วงลำดับ อาทิตย์→จันทร์→อังคาร→พุธ→เสาร์→พฤหัสบดี→ราหู→ศุกร์, ตำแหน่ง บริวาร…กาลกิณี (ตำแหน่งที่ 8)
- กาลกิณีที่ถูกต้อง: อาทิตย์→ศุกร์(ฟ้า), จันทร์→อาทิตย์(แดง), อังคาร→จันทร์(เหลือง), พุธ→อังคาร(ชมพู), เสาร์→พุธ(เขียว), พฤหัส→เสาร์(ม่วง/ดำ), ราหู→พฤหัส(ส้ม), ศุกร์→ราหู(เทา)
- พุธกลางคืน (18:00–05:59) = ราหู
