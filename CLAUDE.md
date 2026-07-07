# ORA — หมอดู AI (Solo founder + AI agents, งบ ~0 บาท)

## โปรเจกต์นี้คืออะไร
เว็บแอป PWA ดูดวงภาษาไทย "ORA / พี่หมอโอรา" — เจ้าของทำคนเดียว ใช้ Claude Code เป็นทีม dev/QA/ops ทั้งหมด
- **ห้ามเพิ่ม dependency, build step, framework, หรือ backend** — เป็น static site ล้วน (เปิดไฟล์ก็รันได้) เพื่อให้โฮสต์ฟรีและ AI ดูแลง่าย
- LLM runtime ใช้ **Gemini API free tier** โดยผู้ใช้ใส่ key เอง (เก็บใน localStorage) — ไม่มี server ไม่มี cost

## โครงสร้าง
```
app/
  index.html          — ทุก screen (onboarding, home, ask, tarot, num, set)
  css/style.css       — ธีม Modern Mystic (navy+gold), CSS variables บนสุด
  js/knowledge.js     — ตำราศาสตร์ทั้งหมด (มหาทักษา, สี, เลขศาสตร์, คู่เลขเบอร์, ทาโรต์ 22 ใบ, ราศี, คลังคำแนะนำ, คำอ่อนไหว)
  js/engine.js        — คำนวณดวง (deterministic, seeded RNG) + safety check + rule-based answer
  js/llm.js           — เรียก Gemini + system prompt "พี่หมอโอรา" + output filter
  js/app.js           — UI logic + state (localStorage key: ora_state_v1)
                        state สำคัญ: chat (แชท 40 ข้อความล่าสุด), memory (สมุดความจำ 30 เรื่อง
                        ล่าสุด: {d, cat, q, fb}) — ส่งเข้า LLM.buildFacts เป็นส่วน [MEMORY]
                        เพื่อให้พี่หมอจำเรื่องเก่าและถามไถ่ต่อเนื่องได้ ห้ามส่งไปเก็บนอกเครื่องผู้ใช้
  sw.js, manifest.webmanifest, icon.svg — PWA
01-*.md, 02-*.md, 03-*.md — แผนธุรกิจฉบับเต็ม (reference)
AI-OPS-PLAYBOOK.md    — วิธีใช้ AI agents บริหารทุกอย่าง
DEPLOY.md             — ขั้นตอน deploy ฟรี (GitHub Pages)
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
