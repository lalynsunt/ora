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
  const screens = ["home", "ask", "tarot", "num", "set"];
  function show(name) {
    $("scr-onboard").classList.add("hidden");
    screens.forEach(s => $("scr-" + s).classList.toggle("hidden", s !== name));
    document.querySelectorAll("#nav button").forEach(b =>
      b.classList.toggle("active", b.dataset.scr === name));
    $("nav").classList.remove("hidden");
    if (name === "home") renderHome();
    if (name === "ask") renderAskNote();
    if (name === "tarot") renderTarot();
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
      <div class="card">
        <p class="hint center">คำทำนายวันนี้ตรงกับคุณแค่ไหน?</p>
        ${fbWidget("daily:" + d.dateStr)}
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

  async function revealTarot() {
    // seed จากตำแหน่งที่ผู้ใช้เลือก + เวลา — ผู้ใช้มีส่วนกำหนดผลจริง
    const seed = tarotPicked.join("-") + "|" + Date.now();
    const cards = Engine.tarotDraw(3, seed);
    const labels = ["อดีต / รากของเรื่อง", "ปัจจุบัน", "แนวโน้มข้างหน้า"];
    let html = `<div class="card"><h3>🎴 ไพ่ของคุณ</h3>` +
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
    $("num-result").innerHTML = `
      <div class="num-score">${r.score}/10</div>
      <p class="list-line">ผลรวมทั้งเบอร์: <b>${r.sum}</b>${r.sumGood ? ` — <span style="color:var(--good)">${esc(r.sumGood)}</span>` : " — พลังกลางๆ"}</p>
      <p class="list-line" style="margin-top:8px"><b>คู่เลขท้าย 4 ตัว (ส่วนที่มีอิทธิพลสุด):</b></p>
      ${r.pairs.map(p => `<div class="pair-line"><span class="pair-badge ${cls(p.s)}">${p.pair}</span><span>${esc(p.t)}</span></div>`).join("")}
      <p class="disclaimer">การวิเคราะห์ตามตำราเลขศาสตร์ เพื่อความบันเทิงและความสบายใจ — เบอร์ไม่ได้กำหนดชีวิต ความตั้งใจของคุณต่างหากค่ะ</p>
      ${fbWidget("phone")}`;
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

  // ---------- PWA ----------
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  boot();
})();
