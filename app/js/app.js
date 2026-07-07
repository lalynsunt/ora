// ============================================================
// ORA App — UI + state (localStorage เท่านั้น ไม่มี server)
// ============================================================
(function () {
  const $ = id => document.getElementById(id);
  const SKEY = "ora_state_v1";

  let state = loadState();
  let profile = null;
  let chatHistory = [];   // {role:"user"|"bot", text}
  let askCategory = null;
  let tarotPicked = [];

  function loadState() {
    try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return {}; }
  }
  function saveState() { localStorage.setItem(SKEY, JSON.stringify(state)); }

  // บันทึกข้อความแชทลง state (ความจำถาวรของพี่หมอ — อยู่ในเครื่องผู้ใช้เท่านั้น)
  function pushChat(role, text) {
    chatHistory.push({ role, text });
    state.chat = chatHistory.slice(-40);
    saveState();
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // markdown แบบเบา: **bold** และขึ้นบรรทัด
  function md(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  }

  // ---------- navigation ----------
  const screens = ["home", "ask", "tarot", "scan", "num", "set"];
  function show(name) {
    $("scr-onboard").classList.add("hidden");
    screens.forEach(s => $("scr-" + s).classList.toggle("hidden", s !== name));
    document.querySelectorAll("#nav button").forEach(b =>
      b.classList.toggle("active", b.dataset.scr === name));
    $("nav").classList.remove("hidden");
    if (name === "home") renderHome();
    if (name === "ask") renderAskNote();
    if (name === "tarot") renderTarot();
    if (name === "scan") renderScan();
    if (name === "num") renderNum();
    if (name === "set") renderSettings();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("#nav button").forEach(b =>
    b.addEventListener("click", () => show(b.dataset.scr)));

  // ---------- onboarding ----------
  $("ob-go").addEventListener("click", () => {
    const dob = $("ob-dob").value;
    if (!dob) {
      $("ob-dob").style.outline = "2px solid #e07070";
      $("ob-dob").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    state.name = $("ob-name").value.trim();
    state.dob = dob;
    state.birthTime = $("ob-time").value || null;
    state.job = $("ob-job").value.trim() || null;
    saveState();
    boot();
  });

  function boot() {
    if (!state.dob) {
      $("scr-onboard").classList.remove("hidden");
      $("nav").classList.add("hidden");
      return;
    }
    profile = Engine.buildProfile(state);
    chatHistory = state.chat || [];
    show("home");
  }

  // ---------- feedback widget ----------
  function fbWidget(context) {
    return `<div class="fb-row" data-ctx="${context}">
      <button class="fb-btn" data-v="แม่นมาก">😍 แม่นมาก</button>
      <button class="fb-btn" data-v="ค่อนข้างตรง">🙂 ค่อนข้างตรง</button>
      <button class="fb-btn" data-v="เฉยๆ">😐 เฉยๆ</button>
      <button class="fb-btn" data-v="ไม่ตรง">🙅 ไม่ตรง</button>
    </div>`;
  }
  document.addEventListener("click", e => {
    const btn = e.target.closest(".fb-btn");
    if (!btn) return;
    const row = btn.parentElement;
    row.querySelectorAll(".fb-btn").forEach(b => b.classList.remove("sel"));
    btn.classList.add("sel");
    state.feedback = state.feedback || [];
    state.feedback.push({ ctx: row.dataset.ctx, v: btn.dataset.v, t: Date.now() });
    // ผูก feedback เข้ากับความจำล่าสุด — พี่หมอจะรู้ว่าคำทำนายเรื่องไหนตรง/ไม่ตรง
    if (row.dataset.ctx === "ask" && state.memory && state.memory.length) {
      state.memory[state.memory.length - 1].fb = btn.dataset.v;
    }
    saveState();
    if (!row.nextElementSibling || !row.nextElementSibling.classList.contains("fb-thanks")) {
      row.insertAdjacentHTML("afterend",
        `<p class="fb-thanks">ขอบคุณค่ะ 💛 ยิ่งบอก ยิ่งปรับให้เฉพาะตัวคุณมากขึ้น</p>`);
    }
  });

  // ---------- HOME: ดวงวันนี้ ----------
  function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }
  function renderHome() {
    const today = new Date();
    $("home-date").textContent = today.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const d = Engine.daily(profile, today);
    const c = profile.colors;
    $("home-content").innerHTML = `
      <div class="hero">
        <div class="greet">สวัสดีค่ะ ${esc(profile.name)} 🌅</div>
        <div class="overall">${stars(d.overall)}</div>
        <div class="theme-t">✨ ${esc(d.theme.t)}</div>
        <div class="theme-d">${esc(Engine.dailyText(profile, d))}</div>
      </div>
      <div class="scores">
        ${Object.entries(d.scores).map(([k, v]) =>
          `<div class="score-item"><div class="k">${k}</div><div class="v">${stars(v)}</div></div>`).join("")}
      </div>
      <div class="card">
        <h3>🎨 สีของคุณ (ตามผังมหาทักษาวัน${esc(profile.birthPlanet)})</h3>
        <div class="color-row">
          <span class="color-pill"><span class="dot" style="background:${c.power.hex}"></span>อำนาจ-การงาน: ${esc(c.power.color)}</span>
          <span class="color-pill"><span class="dot" style="background:${c.luck.hex}"></span>โชคลาภ-เสน่ห์: ${esc(c.luck.color)}</span>
          <span class="color-pill"><span class="dot" style="background:${c.avoid.hex}"></span>ควรเลี่ยง: ${esc(c.avoid.color)}</span>
        </div>
        <p class="hint" style="margin-top:8px">👗 วันนี้ลองหยิบเสื้อผ้าหรือ accessory โทน${esc(c.power.color)} เสริมความมั่นใจ ✨</p>
      </div>
      <div class="card">
        <h3>✅ ควรทำวันนี้</h3>
        ${d.dos.map(x => `<p class="list-line">• ${esc(x)}</p>`).join("")}
        <h3 style="margin-top:12px">⚠️ ควรเลี่ยงวันนี้</h3>
        ${d.donts.map(x => `<p class="list-line">• ${esc(x)}</p>`).join("")}
      </div>
      <div class="card affirm">💬 "${esc(d.affirm)}"</div>
      ${baseChartCard()}
      <div class="card">
        <p class="hint center">คำทำนายวันนี้ตรงกับคุณแค่ไหน?</p>
        ${fbWidget("daily:" + d.dateStr)}
      </div>`;
  }

  // การ์ดพื้นดวง: วันเกิด ราศี ลัคนา เลขชีวิต + จังหวะชีวิต (ทักษาเสวยอายุ)
  function baseChartCard() {
    const day = K.DAY_TRAITS[profile.birthPlanet];
    const z = profile.zodiac;
    const sw = Engine.sawoey(profile, new Date());
    const gradeColor = sw && (sw.theme.g.startsWith("ดี") ? "var(--good)" : sw.theme.g === "ท้าทาย" ? "var(--warn)" : "var(--muted)");
    return `
      <div class="card">
        <h3>🧬 พื้นดวงของคุณ</h3>
        <div class="chips" style="margin-bottom:10px">
          <span class="chip static">☀️ วัน${esc(profile.birthPlanet)}</span>
          <span class="chip static">♈ ราศี${esc(z.n)} · ธาตุ${esc(z.el)}</span>
          ${profile.lagna ? `<span class="chip static">⬆️ ลัคนา~${esc(profile.lagna.name)}</span>` : ""}
          <span class="chip static">🔢 เลขชีวิต ${profile.lifePath}</span>
        </div>
        <p class="list-line"><b style="color:var(--gold)">${esc(day.t)}</b> — ${esc(day.d)}</p>
        <p class="list-line" style="margin-top:8px"><b>จุดแข็ง:</b> ${day.str.map(s => "• " + esc(s)).join(" ")}</p>
        <p class="list-line"><b>รู้ทันตัวเอง:</b> ${day.weak.map(s => "• " + esc(s)).join(" ")}</p>
        <p class="list-line"><b>สายงานที่เสริมดวง:</b> ${esc(day.job)}</p>
        ${profile.lagna ? `<p class="hint">ลัคนาคำนวณโดยประมาณจากเวลาเกิด (แบบเรือนชั่วยาม)</p>` : `<p class="hint">💡 เพิ่มเวลาเกิดในหน้าตั้งค่า เพื่อดูลัคนาโดยประมาณ</p>`}
        ${sw ? `
        <div class="period-box">
          <h3 style="margin-top:12px">🌊 จังหวะชีวิตช่วงนี้ (ทักษาเสวยอายุ)</h3>
          <p class="list-line">อายุ ${Math.floor(sw.startAge)}–${Math.floor(sw.endAge)} ปี: <b style="color:var(--gold)">${esc(sw.theme.t)}</b> (ดาว${esc(sw.planet)}เสวยอายุ)</p>
          <p class="list-line">โทนช่วงนี้: <b style="color:${gradeColor}">${esc(sw.theme.g)}</b> — ${esc(sw.theme.d)}</p>
          <p class="list-line">⏭️ ช่วงถัดไป: <b>${esc(sw.nextTheme.t)}</b> (โทน${esc(sw.nextTheme.g)}) เริ่มราวปี พ.ศ. ${sw.nextStartYear + 543} (อายุ ${Math.floor(sw.endAge)} ปี)</p>
        </div>` : ""}
      </div>`;
  }

  // ---------- ASK ----------
  function renderAskNote() {
    $("ask-mode-note").innerHTML = state.apiKey
      ? `🤖 <b>โหมด AI เปิดอยู่</b> — พี่หมอโอราจะถามรายละเอียดเพิ่มก่อนทำนาย เพื่อคำตอบที่ตรงชีวิตคุณจริงๆ`
      : `📖 ตอนนี้เป็นโหมดตำรา (rule-based) — เปิด<b>โหมด AI ฟรี</b>ได้ในหน้าตั้งค่า เพื่อให้พี่หมอโอราคุยโต้ตอบและเจาะคำถามของคุณได้`;
    // แสดงประวัติแชทเดิม (ความจำถาวร) หรือทักทายครั้งแรก
    if ($("chat-box").childElementCount === 0) {
      if (chatHistory.length) {
        chatHistory.forEach(m => appendMsg(m.role === "user" ? "user" : "bot", m.text));
      } else {
        appendMsg("bot", `สวัสดีค่ะ ${profile.name} 💛 พี่หมอโอราค่ะ\nเลือกหมวดด้านบน หรือพิมพ์คำถามที่อยากรู้มาได้เลยนะคะ เช่น "ควรย้ายงานไหม" "ความสัมพันธ์นี้ควรไปต่อไหม"`);
      }
    }
  }
  document.querySelectorAll("#ask-cats .chip").forEach(ch =>
    ch.addEventListener("click", () => {
      document.querySelectorAll("#ask-cats .chip").forEach(c => c.classList.remove("sel"));
      ch.classList.add("sel");
      askCategory = ch.dataset.cat;
      $("ask-text").focus();
    }));

  function appendMsg(role, text, typing) {
    const div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "user" : "bot") + (typing ? " typing" : "");
    div.innerHTML = md(text);
    $("chat-box").appendChild(div);
    $("chat-box").scrollTop = $("chat-box").scrollHeight;
    return div;
  }

  $("ask-send").addEventListener("click", sendAsk);
  $("ask-text").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAsk(); }
  });

  async function sendAsk() {
    const text = $("ask-text").value.trim();
    if (!text) return;
    $("ask-text").value = "";
    appendMsg("user", text);
    pushChat("user", text);
    state.askCount = (state.askCount || 0) + 1;
    // จดลงสมุดความจำของพี่หมอ (ใช้เชื่อมโยงการทำนายครั้งถัดไป)
    Engine.remember(state, {
      d: new Date().toISOString().slice(0, 10),
      cat: askCategory || null,
      q: text.slice(0, 100)
    });
    saveState();

    // safety ก่อนทุกอย่าง
    const safety = Engine.safetyCheck(text);
    if (safety === "crisis") {
      const m = LLM.CRISIS_MSG;
      appendMsg("bot", m); pushChat("bot", m);
      return;
    }
    if (safety === "sensitive") {
      const m = "เรื่องนี้พี่หมอขอไม่ทำนายแบบฟันธงนะคะ 🙏 เพราะเป็นเรื่องที่ควรใช้ข้อมูลจริงจากผู้เชี่ยวชาญโดยตรง (แพทย์/ผู้เชี่ยวชาญการเงิน)\n\nแต่ถ้าอยากดู**พลังใจและจังหวะชีวิต**ช่วงนี้เพื่อเตรียมตัวให้พร้อม พี่หมอดูให้ได้ค่ะ ลองเล่าความรู้สึกหรือสิ่งที่กังวลมาได้เลยนะคะ";
      appendMsg("bot", m); pushChat("bot", m);
      return;
    }

    const q = (askCategory ? `[หมวด: ${askCategory}] ` : "") + text;

    if (state.apiKey) {
      const typingEl = appendMsg("bot", "พี่หมอกำลังเปิดผังดวงของคุณ...", true);
      try {
        const facts = LLM.buildFacts(profile, { job: state.job, tone: state.tone, memory: state.memory });
        const history = chatHistory.slice(-10).map(m => ({ role: m.role, text: m.text }));
        history[history.length - 1] = { role: "user", text: q };
        const reply = await LLM.chat(state.apiKey, facts, history);
        typingEl.remove();
        appendMsg("bot", reply);
        pushChat("bot", reply);
        $("chat-box").insertAdjacentHTML("beforeend",
          `<div style="margin:4px 0 10px">${fbWidget("ask")}</div>`);
      } catch (err) {
        typingEl.remove();
        appendMsg("bot", "ขอโทษค่ะ เชื่อมต่อ AI ไม่สำเร็จ (" + esc(err.message) + ")\nตรวจสอบ API key ในหน้าตั้งค่า หรือลองใหม่อีกครั้งนะคะ — ระหว่างนี้พี่หมอตอบแบบตำราให้ก่อนค่ะ 🙏\n\n" + Engine.ruleAnswer(profile, askCategory, text));
      }
    } else {
      const reply = Engine.ruleAnswer(profile, askCategory, text);
      appendMsg("bot", reply);
      pushChat("bot", reply);
      $("chat-box").insertAdjacentHTML("beforeend",
        `<div style="margin:4px 0 10px">${fbWidget("ask")}</div>`);
    }
  }

  // ---------- TAROT ----------
  function renderTarot() {
    tarotPicked = [];
    $("tarot-content").innerHTML = `
      <div class="card">
        <p class="list-line">ตั้งจิตนึกถึงเรื่องที่อยากรู้ แล้วเลือกไพ่ <b>3 ใบ</b> ค่ะ 🙏</p>
        <div class="tarot-fan">
          ${Array.from({ length: 12 }, (_, i) => `<div class="tcard" data-i="${i}">✦</div>`).join("")}
        </div>
        <p class="hint center" id="tarot-status">เลือกแล้ว 0/3 ใบ</p>
      </div>
      <div id="tarot-result"></div>`;
    document.querySelectorAll(".tcard").forEach(el =>
      el.addEventListener("click", () => pickCard(el)));
  }

  function pickCard(el) {
    if (el.classList.contains("picked") || tarotPicked.length >= 3) return;
    el.classList.add("picked");
    el.textContent = "✓";
    tarotPicked.push(el.dataset.i);
    $("tarot-status").textContent = `เลือกแล้ว ${tarotPicked.length}/3 ใบ`;
    if (tarotPicked.length === 3) revealTarot();
  }

  // หน้าไพ่ SVG สไตล์ Art Nouveau วินเทจ — พื้นงาช้าง ซุ้มโค้ง ลายเถาทอง เลขโรมัน
  function tarotSVG(card) {
    const idx = K.TAROT.indexOf(card);
    const roman = K.ROMAN[idx] || "";
    return `<svg viewBox="0 0 220 360" xmlns="http://www.w3.org/2000/svg" class="tface">
      <defs>
        <radialGradient id="tsky${idx}" cx="50%" cy="30%" r="90%">
          <stop offset="0%" stop-color="#43307c"/><stop offset="55%" stop-color="#2b1d58"/><stop offset="100%" stop-color="#1a1038"/>
        </radialGradient>
        <linearGradient id="tiv${idx}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f3e9d0"/><stop offset="100%" stop-color="#e6d5ae"/>
        </linearGradient>
      </defs>
      <!-- การ์ดพื้นงาช้างวินเทจ -->
      <rect x="2" y="2" width="216" height="356" rx="16" fill="url(#tiv${idx})" stroke="#b3924a" stroke-width="2.5"/>
      <rect x="9" y="9" width="202" height="342" rx="12" fill="none" stroke="#c9a94f" stroke-width="1" opacity="0.7"/>
      <!-- เลขโรมัน + ดอกจันข้าง -->
      <text x="110" y="33" text-anchor="middle" fill="#6d5218" font-size="19" font-family="Georgia,serif" letter-spacing="3">${roman}</text>
      <text x="58" y="31" text-anchor="middle" fill="#b3924a" font-size="10">✦</text>
      <text x="162" y="31" text-anchor="middle" fill="#b3924a" font-size="10">✦</text>
      <!-- ซุ้มภาพโค้งแบบนูโว -->
      <path d="M 26 78 Q 26 48 56 43 Q 110 30 164 43 Q 194 48 194 78 L 194 290 L 26 290 Z"
            fill="url(#tsky${idx})" stroke="#a3812f" stroke-width="2.5"/>
      <path d="M 32 80 Q 32 54 58 49 Q 110 37 162 49 Q 188 54 188 80 L 188 284 L 32 284 Z"
            fill="none" stroke="#e6c36b" stroke-width="0.8" opacity="0.5"/>
      <!-- ดาวประดับในภาพ -->
      <circle cx="55" cy="95" r="1.4" fill="#e6c36b" opacity="0.9"/>
      <circle cx="168" cy="88" r="1.1" fill="#fff" opacity="0.8"/>
      <circle cx="150" cy="245" r="1.3" fill="#b18cff" opacity="0.9"/>
      <circle cx="68" cy="255" r="1" fill="#e6c36b" opacity="0.8"/>
      <circle cx="110" cy="72" r="1.2" fill="#fff" opacity="0.7"/>
      <!-- ลายเถาไม้เลื้อยสองข้าง -->
      <path d="M 40 96 C 52 130 34 160 46 195 C 54 222 38 252 46 276" fill="none" stroke="#c9a94f" stroke-width="1.2" opacity="0.55"/>
      <path d="M 180 96 C 168 130 186 160 174 195 C 166 222 182 252 174 276" fill="none" stroke="#c9a94f" stroke-width="1.2" opacity="0.55"/>
      <circle cx="46" cy="140" r="2" fill="#c9a94f" opacity="0.6"/>
      <circle cx="174" cy="140" r="2" fill="#c9a94f" opacity="0.6"/>
      <circle cx="42" cy="230" r="2" fill="#c9a94f" opacity="0.6"/>
      <circle cx="178" cy="230" r="2" fill="#c9a94f" opacity="0.6"/>
      <!-- รัศมีหลังสัญลักษณ์ -->
      <circle cx="110" cy="168" r="58" fill="rgba(230,195,107,0.09)" stroke="#e6c36b" stroke-width="1" opacity="0.9"/>
      <circle cx="110" cy="168" r="68" fill="none" stroke="#e6c36b" stroke-width="0.8" opacity="0.4" stroke-dasharray="2 6"/>
      <text x="110" y="112" text-anchor="middle" fill="#e6c36b" font-size="9" opacity="0.85" letter-spacing="4">✦ ✧ ✦</text>
      <!-- สัญลักษณ์ประจำไพ่ -->
      <text x="110" y="190" text-anchor="middle" font-size="62">${card.e}</text>
      <text x="110" y="268" text-anchor="middle" fill="#e6c36b" font-size="9" opacity="0.85" letter-spacing="4">✧ ✦ ✧</text>
      <!-- ชื่อไพ่บนพื้นงาช้าง -->
      <text x="110" y="315" text-anchor="middle" fill="#4a3510" font-size="15" font-weight="bold" font-family="Anuphan,sans-serif">${esc(card.th)}</text>
      <text x="110" y="338" text-anchor="middle" fill="#6d5218" font-size="11" font-family="Georgia,serif" letter-spacing="2">· ${esc(card.n.toUpperCase())} ·</text>
      <!-- ดอกไม้มุมการ์ด -->
      <text x="20" y="24" text-anchor="middle" fill="#b3924a" font-size="11">❧</text>
      <text x="200" y="24" text-anchor="middle" fill="#b3924a" font-size="11" transform="scale(-1,1) translate(-400,0)">❧</text>
      <text x="20" y="352" text-anchor="middle" fill="#b3924a" font-size="11" transform="scale(1,-1) translate(0,-704)">❧</text>
      <text x="200" y="352" text-anchor="middle" fill="#b3924a" font-size="11" transform="scale(-1,-1) translate(-400,-704)">❧</text>
    </svg>`;
  }

  async function revealTarot() {
    // seed จากตำแหน่งที่ผู้ใช้เลือก + เวลา — ผู้ใช้มีส่วนกำหนดผลจริง
    const seed = tarotPicked.join("-") + "|" + Date.now();
    const cards = Engine.tarotDraw(3, seed);
    const labels = ["อดีต / รากของเรื่อง", "ปัจจุบัน", "แนวโน้มข้างหน้า"];
    let html = `<div class="card"><h3>🎴 ไพ่ของคุณ</h3>
      <div class="tface-row">${cards.map(c => `<div class="tface-wrap">${tarotSVG(c)}</div>`).join("")}</div>` +
      cards.map((c, i) => `
        <div class="tres">
          <div class="tname">${esc(labels[i])} — ${c.e} ${esc(c.n)} (${esc(c.th)})</div>
          <p>${esc(c.m)}</p>
          <p>💡 ${esc(c.adv)}</p>
        </div>`).join("") +
      `<div id="tarot-ai"></div>
       <p class="hint center" style="margin-top:10px">ผลไพ่ตรงใจแค่ไหน?</p>${fbWidget("tarot")}</div>`;
    $("tarot-result").innerHTML = html;
    $("tarot-result").scrollIntoView({ behavior: "smooth" });

    if (state.apiKey) {
      $("tarot-ai").innerHTML = `<p class="hint">🤖 พี่หมอโอรากำลังตีความไพ่ทั้งสามใบร่วมกับดวงของคุณ...</p>`;
      try {
        const facts = LLM.buildFacts(profile, { cards, job: state.job, tone: state.tone, memory: state.memory });
        const reply = await LLM.chat(state.apiKey, facts,
          [{ role: "user", text: "ช่วยตีความไพ่ทั้ง 3 ใบนี้ร่วมกัน (อดีต-ปัจจุบัน-แนวโน้ม) ให้เชื่อมโยงกับดวงพื้นฐานของฉัน แบบกระชับ" }]);
        $("tarot-ai").innerHTML = `<div class="msg bot" style="max-width:100%">${md(reply)}</div>`;
      } catch (e) {
        $("tarot-ai").innerHTML = `<p class="hint">เชื่อมต่อ AI ไม่สำเร็จ — อ่านความหมายรายใบด้านบนได้เลยค่ะ</p>`;
      }
    } else {
      $("tarot-ai").innerHTML = `<p class="hint">💡 เปิดโหมด AI ในหน้าตั้งค่า เพื่อให้พี่หมอโอราตีความไพ่ทั้งสามใบ "เชื่อมโยงกัน" เฉพาะดวงคุณ</p>`;
    }
  }

  // ---------- NUMBERS ----------
  function renderNum() {
    const lp = K.LIFEPATH[profile.lifePath];
    $("num-lifepath").innerHTML = `
      <div class="num-score">${profile.lifePath}</div>
      <p class="list-line"><b style="color:var(--gold)">${esc(lp.t)}</b></p>
      <p class="list-line">${esc(lp.d)}</p>`;
    $("num-result").innerHTML = "";
  }
  $("num-go").addEventListener("click", () => {
    const r = Engine.phone($("num-phone").value);
    if (!r) { $("num-result").innerHTML = `<p class="hint">กรุณาใส่เบอร์ให้ครบ (9–10 หลัก) ค่ะ</p>`; return; }
    const cls = s => s > 0 ? "good" : (s < 0 ? "low" : "mid");
    const tail = r.pairs.filter(p => p.w === 2);
    const head = r.pairs.filter(p => p.w === 1);
    $("num-result").innerHTML = `
      <div class="num-score">${r.score}/10</div>
      <p class="list-line">ผลรวมทั้งเบอร์: <b>${r.sum}</b>${r.sumGood ? ` — <span style="color:var(--good)">${esc(r.sumGood)}</span>` : " — พลังกลางๆ ไม่ส่งเสริมไม่ฉุดรั้ง"}</p>
      ${r.dominant ? `<p class="list-line">🌟 <b>เลขเด่นประจำเบอร์: ${r.dominant.d}</b> (มี ${r.dominant.n} ตัว) — พลังดาว${esc(r.dominant.info.p)} "${esc(r.dominant.info.t)}": ${esc(r.dominant.info.d)}</p>` : ""}
      <p class="list-line" style="margin-top:10px"><b>🔥 คู่เลขท้าย 4 ตัว (อิทธิพลแรงสุด — น้ำหนัก ×2):</b></p>
      ${tail.map(p => `<div class="pair-line"><span class="pair-badge ${cls(p.s)}">${p.pair}</span><span>${esc(p.t)}</span></div>`).join("")}
      <p class="list-line" style="margin-top:10px"><b>คู่เลขส่วนหน้า:</b></p>
      ${head.map(p => `<div class="pair-line"><span class="pair-badge ${cls(p.s)}">${p.pair}</span><span>${esc(p.t)}</span></div>`).join("")}
      <p class="hint" style="margin-top:8px">หลักการอ่าน: เลขแต่ละตัวถือพลังดาว (1=อาทิตย์ 2=จันทร์ 3=อังคาร 4=พุธ 5=พฤหัสฯ 6=ศุกร์ 7=เสาร์ 8=ราหู 9=เกตุ) — คู่เลขคือการส่งพลังร่วมกันของสองดาว ตำแหน่งท้ายเบอร์มีอิทธิพลต่อผู้ใช้มากที่สุด</p>
      <p class="disclaimer">การวิเคราะห์ตามตำราเลขศาสตร์ เพื่อความบันเทิงและความสบายใจ — เบอร์ไม่ได้กำหนดชีวิต ความตั้งใจของคุณต่างหากค่ะ</p>
      ${fbWidget("phone")}`;
  });

  // ---------- SCAN: ลายมือ / โหงวเฮ้ง / โทนสี-สไตล์ (Gemini vision) ----------
  let scanKind = "palm";
  let scanImage = null; // {base64, mime}
  const SCAN_DESC = {
    palm: "🖐️ <b>อ่านลายมือ</b> — กางฝ่ามือข้างที่ถนัด ถ่ายตรงๆ ใต้แสงสว่าง ให้เห็นเส้นชัดทั้งฝ่ามือ พี่หมอจะอ่านเส้นชีวิต สมอง หัวใจ วาสนา และธาตุประจำมือ",
    face: "👤 <b>ดูโหงวเฮ้ง</b> — ถ่ายหน้าตรง ไม่ใส่ฟิลเตอร์ แสงสว่างสม่ำเสมอ พี่หมอจะดูสามส่วนใบหน้า จุดเด่นเชิงโหงวเฮ้ง พร้อมแนะทรงผมเสริมดวงตามรูปหน้า",
    style: "👗 <b>วิเคราะห์โทนสีประจำตัว</b> — ถ่ายหน้าตรงใต้แสงธรรมชาติ ไม่แต่งฟิลเตอร์ พี่หมอจะประเมิน Warm/Cool tone และ Season ของคุณ แล้วผสมกับสีมงคลประจำดวง เป็นคู่มือแต่งตัว+ทรงผมเฉพาะตัว"
  };

  function renderScan() {
    const hasKey = !!state.apiKey;
    $("scan-gate").classList.toggle("hidden", hasKey);
    $("scan-main").classList.toggle("hidden", !hasKey);
    if (hasKey) $("scan-desc").innerHTML = SCAN_DESC[scanKind];
  }
  $("scan-goto-set").addEventListener("click", () => show("set"));
  document.querySelectorAll(".scan-kinds .chip").forEach(ch =>
    ch.addEventListener("click", () => {
      document.querySelectorAll(".scan-kinds .chip").forEach(c => c.classList.remove("sel"));
      ch.classList.add("sel");
      scanKind = ch.dataset.kind;
      scanImage = null;
      $("scan-preview-wrap").classList.add("hidden");
      $("scan-result").innerHTML = "";
      $("scan-desc").innerHTML = SCAN_DESC[scanKind];
    }));
  $("scan-pick").addEventListener("click", () => $("scan-file").click());
  $("scan-file").addEventListener("change", () => {
    const file = $("scan-file").files[0];
    if (!file) return;
    // ย่อรูปในเครื่อง (สูงสุด 768px) ก่อนส่ง — เร็วขึ้นและลดข้อมูลที่ออกจากเครื่อง
    const img = new Image();
    img.onload = () => {
      const max = 768;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(img.width * scale);
      cv.height = Math.round(img.height * scale);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      const dataUrl = cv.toDataURL("image/jpeg", 0.85);
      scanImage = { base64: dataUrl.split(",")[1], mime: "image/jpeg" };
      $("scan-preview").src = dataUrl;
      $("scan-preview-wrap").classList.remove("hidden");
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
  $("scan-go").addEventListener("click", async () => {
    if (!scanImage || !state.apiKey) return;
    $("scan-result").innerHTML = `<div class="card"><p class="hint">🔮 พี่หมอกำลังเพ่งพิจารณาภาพของคุณ... (10–20 วินาที)</p></div>`;
    try {
      const facts = LLM.buildFacts(profile, { job: state.job, tone: state.tone, memory: state.memory });
      const reply = await LLM.vision(state.apiKey, scanKind, scanImage.base64, scanImage.mime, facts);
      $("scan-result").innerHTML = `<div class="card"><div class="msg bot" style="max-width:100%">${md(reply)}</div>
        <p class="hint center" style="margin-top:8px">ผลวิเคราะห์ตรงใจแค่ไหน?</p>${fbWidget("scan:" + scanKind)}</div>`;
      Engine.remember(state, { d: new Date().toISOString().slice(0, 10), cat: "สแกน-" + scanKind, q: "วิเคราะห์" + (scanKind === "palm" ? "ลายมือ" : scanKind === "face" ? "โหงวเฮ้ง" : "โทนสี") });
      saveState();
      scanImage = null; // ไม่เก็บภาพไว้ในหน่วยความจำต่อ
      $("scan-result").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      $("scan-result").innerHTML = `<div class="card"><p class="hint">ขอโทษค่ะ วิเคราะห์ไม่สำเร็จ (${esc(err.message)}) — ตรวจสอบ API key หรือลองรูปที่เล็กลง/ชัดขึ้นอีกครั้งนะคะ</p></div>`;
    }
  });

  // ---------- SETTINGS ----------
  function renderSettings() {
    const s = Engine.personalization(state);
    $("pscore-bar").style.width = s + "%";
    $("pscore-text").textContent = `${s}/100 — ` + (s < 40
      ? "เพิ่มเวลาเกิด อาชีพ หรือให้ feedback หลังคำทำนาย เพื่อให้ดวงเฉพาะตัวขึ้น"
      : s < 70 ? "กำลังดี! ยิ่งถาม-ยิ่งให้ feedback ระบบยิ่งรู้จักคุณ" : "ดวงของคุณเฉพาะตัวมากแล้วค่ะ ✨");
    $("set-key").value = state.apiKey || "";
    $("set-key-status").textContent = state.apiKey ? "✅ โหมด AI เปิดใช้งานอยู่" : "ยังไม่ได้ใส่ key — ใช้โหมดตำราอยู่";
    $("set-tone").value = state.tone || "";
    const memN = (state.memory || []).length;
    $("set-memory").textContent = memN
      ? `ตอนนี้พี่หมอจำเรื่องที่เคยคุยไว้ ${memN} เรื่อง — จะถูกใช้เชื่อมโยงคำทำนายครั้งถัดไป`
      : "ยังไม่มีบทสนทนาให้จำ — ลองถามดวงดูสิคะ";
    $("set-profile").textContent =
      `${state.name || "-"} · เกิด ${state.dob}${state.birthTime ? " เวลา " + state.birthTime : ""} · วัน${profile.birthPlanet} · ราศี${profile.zodiac.n} · เลขชีวิต ${profile.lifePath}${state.job ? " · " + state.job : ""}`;
  }
  $("set-key-save").addEventListener("click", () => {
    state.apiKey = $("set-key").value.trim() || null;
    saveState(); renderSettings();
  });
  $("set-tone").addEventListener("change", () => {
    state.tone = $("set-tone").value || null; saveState(); renderSettings();
  });
  $("set-clear-memory").addEventListener("click", () => {
    state.chat = []; state.memory = [];
    chatHistory = [];
    saveState();
    $("chat-box").innerHTML = "";
    renderSettings();
  });
  $("set-edit").addEventListener("click", () => {
    $("ob-name").value = state.name || "";
    $("ob-dob").value = state.dob || "";
    $("ob-time").value = state.birthTime || "";
    $("ob-job").value = state.job || "";
    screens.forEach(s => $("scr-" + s).classList.add("hidden"));
    $("nav").classList.add("hidden");
    $("scr-onboard").classList.remove("hidden");
  });
  $("set-wipe").addEventListener("click", () => {
    if (confirm("ลบข้อมูลทั้งหมด (โปรไฟล์, feedback, API key) ออกจากเครื่องนี้?")) {
      localStorage.removeItem(SKEY);
      state = {}; chatHistory = []; profile = null;
      location.reload();
    }
  });

  // ---------- มือถือ: เลื่อนช่องกรอกให้พ้นแป้นพิมพ์เสมอ ----------
  document.addEventListener("focusin", e => {
    if (e.target.matches("input, textarea, select")) {
      // รอแป้นพิมพ์เปิดก่อน แล้วเลื่อนช่องมากลางจอ
      setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  });
  if (window.visualViewport) {
    // จอมองเห็นเปลี่ยนขนาด (แป้นพิมพ์เปิด/ปิด) → เลื่อนช่องที่กำลังพิมพ์กลับมาให้เห็น
    window.visualViewport.addEventListener("resize", () => {
      const el = document.activeElement;
      if (el && el.matches("input, textarea")) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      }
    });
  }

  // ---------- PWA ----------
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  boot();
})();
