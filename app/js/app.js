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

  // ---------- i18n init: state → I18N (หรือ detect จาก device เป็น suggestion) ----------
  const det = I18N.detect();
  state.deviceLocale = det.device_locale;
  I18N.lang = state.lang || det.lang;
  I18N.country = state.country || det.country;

  function fillLangSelect(sel, val) {
    sel.innerHTML = I18N.LANGS.map(l =>
      `<option value="${l.code}">${l.native}${l.status === "placeholder" ? " *" : ""}</option>`).join("");
    sel.value = val;
  }
  function fillCountrySelect(sel, val) {
    sel.innerHTML = I18N.COUNTRIES.map(c =>
      `<option value="${c.code}">${I18N.lang === "th" ? c.th : c.en}</option>`).join("");
    sel.value = val;
  }
  fillLangSelect($("ob-lang"), I18N.lang);
  fillCountrySelect($("ob-country"), I18N.country);
  $("ob-lang").addEventListener("change", () => {
    I18N.set($("ob-lang").value, null);
    fillCountrySelect($("ob-country"), $("ob-country").value); // ชื่อประเทศเปลี่ยนภาษาตาม
  });
  $("ob-country").addEventListener("change", () => { I18N.country = $("ob-country").value; });

  // ---------- Modal helpers (consent ฯลฯ) ----------
  function showModal(html) {
    const m = $("modal");
    m.innerHTML = `<div class="modal-card">${html}</div>`;
    m.classList.remove("hidden");
    return m;
  }
  function hideModal() { $("modal").classList.add("hidden"); }

  // consent ก่อนใช้ภาพ (จำการยินยอมรายประเภทไว้ใน state.consent)
  function askConsent(kind) {
    return new Promise(resolve => {
      state.consent = state.consent || {};
      if (state.consent[kind]) return resolve(true);
      showModal(`
        <h3>🔒 ${I18N.t("scan.consent.title")}</h3>
        <p class="list-line" style="font-size:.9rem">${I18N.t("scan.consent.body")}</p>
        <p class="hint">✓ ${I18N.t("scan.consent.keep")}</p>
        <button class="btn-primary" id="cs-ok">${I18N.t("scan.consent.ok")}</button>
        <button class="btn-ghost" id="cs-no">${I18N.t("scan.consent.no")}</button>`);
      $("cs-ok").onclick = () => { state.consent[kind] = Date.now(); saveState(); hideModal(); resolve(true); };
      $("cs-no").onclick = () => { hideModal(); resolve(false); };
    });
  }

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
    state.blood = $("ob-blood").value || null;
    state.lang = $("ob-lang").value;
    state.country = $("ob-country").value;
    I18N.set(state.lang, state.country);
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
    I18N.apply();
    show("home");
  }

  // ---------- feedback widget ----------
  // หมายเหตุ: ค่า data-v เก็บเป็นภาษาไทยคงที่เสมอ (ใช้เป็น value ภายใน/ผูกกับ memory) — ป้ายที่เห็นเท่านั้นที่ localize
  function fbWidget(context) {
    return `<div class="fb-row" data-ctx="${context}">
      <button class="fb-btn" data-v="แม่นมาก">${I18N.t("fb.great")}</button>
      <button class="fb-btn" data-v="ค่อนข้างตรง">${I18N.t("fb.ok")}</button>
      <button class="fb-btn" data-v="เฉยๆ">${I18N.t("fb.meh")}</button>
      <button class="fb-btn" data-v="ไม่ตรง">${I18N.t("fb.miss")}</button>
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
        `<p class="fb-thanks">${I18N.t("fb.thanks")}</p>`);
    }
  });

  // ---------- HOME: ดวงวันนี้ ----------
  function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }
  function renderHome() {
    const today = new Date();
    $("home-date").textContent = today.toLocaleDateString(I18N.contentLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const d = Engine.daily(profile, today);
    const c = profile.colors;
    const planetTH = d.todayPlanet, birthPlanetTH = profile.birthPlanet;
    $("home-content").innerHTML = `
      <div class="hero">
        <div class="greet">${esc(I18N.t("home.greet", { name: profile.name }))}</div>
        <div class="overall">${stars(d.overall)}</div>
        <div class="theme-t">✨ ${esc(K.L(d.theme, "t"))}</div>
        <div class="theme-d">${esc(Engine.dailyText(profile, d))}</div>
      </div>
      <div class="scores">
        ${Object.entries(d.scores).map(([k, v]) =>
          `<div class="score-item"><div class="k">${esc(I18N.scoreLabel(k))}</div><div class="v">${stars(v)}</div></div>`).join("")}
      </div>
      <div class="card lucky-today-card">
        <h3>${I18N.t("home.lucky.title")}</h3>
        <div class="lucky-today-row">
          <span class="dot dot-lg" style="background:${d.todayColor.hex}"></span>
          <div>
            <div class="lucky-today-name">${esc(d.todayColor.color)}</div>
            <div class="hint">${esc(I18N.t("home.lucky.ruledBy", { planet: K.planetName(planetTH), position: K.positionName(d.position) }))}</div>
          </div>
        </div>
        ${d.isAvoidDay
          ? `<p class="hint" style="margin-top:8px">${I18N.t("home.lucky.avoidNote")}</p>`
          : `<p class="hint" style="margin-top:8px">${I18N.t("home.lucky.wearNote")}</p>`}
      </div>
      <div class="card">
        <h3>${esc(I18N.t("home.permcolor.title", { planet: K.planetName(birthPlanetTH) }))}</h3>
        <div class="color-row">
          <span class="color-pill"><span class="dot" style="background:${c.power.hex}"></span>${I18N.t("home.permcolor.power")}: ${esc(c.power.color)}</span>
          <span class="color-pill"><span class="dot" style="background:${c.luck.hex}"></span>${I18N.t("home.permcolor.luck")}: ${esc(c.luck.color)}</span>
          <span class="color-pill"><span class="dot" style="background:${c.avoid.hex}"></span>${I18N.t("home.permcolor.avoid")}: ${esc(c.avoid.color)}</span>
        </div>
        <p class="hint" style="margin-top:8px">${I18N.t("home.permcolor.note")}</p>
      </div>
      <div class="card">
        <h3>${I18N.t("home.dos")}</h3>
        ${d.dos.map(x => `<p class="list-line">• ${esc(x)}</p>`).join("")}
        <h3 style="margin-top:12px">${I18N.t("home.donts")}</h3>
        ${d.donts.map(x => `<p class="list-line">• ${esc(x)}</p>`).join("")}
      </div>
      <div class="card affirm">💬 "${esc(d.affirm)}"</div>
      ${baseChartCard()}
      ${bloodCard()}
      <div class="card">
        <p class="hint center">${I18N.t("home.feedback.prompt")}</p>
        ${fbWidget("daily:" + d.dateStr)}
      </div>`;
  }

  // การ์ดพื้นดวง: วันเกิด ราศี ลัคนา เลขชีวิต + จังหวะชีวิต (ทักษาเสวยอายุ)
  function baseChartCard() {
    const day = K.DAY_TRAITS[profile.birthPlanet];
    const z = profile.zodiac;
    const sw = Engine.sawoey(profile, new Date());
    // gradeColor ต้องอิง gradeKey (ไม่ผูกภาษา) ห้ามเทียบ string ภาษาไทยตรงๆ อีกต่อไป
    const gradeColor = sw && ({ great: "var(--good)", good: "var(--good)", challenge: "var(--warn)" }[sw.theme.gradeKey] || "var(--muted)");
    const zName = K.L(z, "n") || z.n;
    return `
      <div class="card">
        <h3>${I18N.t("home.base.title")}</h3>
        <div class="chips" style="margin-bottom:10px">
          <span class="chip static">☀️ ${esc(K.planetName(profile.birthPlanet))}</span>
          <span class="chip static">♈ ${esc(zName)} · ${esc(K.elementName(z.el))}</span>
          ${profile.lagna ? `<span class="chip static">⬆️ ${esc(K.L(K.zodiacByName(profile.lagna.name), "n") || profile.lagna.name)}</span>` : ""}
          <span class="chip static">🔢 ${profile.lifePath}</span>
        </div>
        <p class="list-line"><b style="color:var(--gold)">${esc(K.L(day, "t"))}</b> — ${esc(K.L(day, "d"))}</p>
        <p class="list-line" style="margin-top:8px"><b>${I18N.t("home.base.strength")}</b> ${(K.L(day, "str") || day.str).map(s => "• " + esc(s)).join(" ")}</p>
        <p class="list-line"><b>${I18N.t("home.base.selfaware")}</b> ${(K.L(day, "weak") || day.weak).map(s => "• " + esc(s)).join(" ")}</p>
        <p class="list-line"><b>${I18N.t("home.base.career")}</b> ${esc(K.L(day, "job"))}</p>
        ${profile.lagna ? `<p class="hint">${I18N.t("home.base.lagnaKnown")}</p>` : `<p class="hint">${I18N.t("home.base.lagnaUnknown")}</p>`}
        ${sw ? `
        <div class="period-box">
          <h3 style="margin-top:12px">${I18N.t("home.period.title")}</h3>
          <p class="list-line">${I18N.t("home.period.range", { start: Math.floor(sw.startAge), end: Math.floor(sw.endAge) })} <b style="color:var(--gold)">${esc(K.L(sw.theme, "t"))}</b> (${esc(K.planetName(sw.planet))})</p>
          <p class="list-line">${I18N.t("home.period.tone")} <b style="color:${gradeColor}">${esc(K.L(sw.theme, "g"))}</b> — ${esc(K.L(sw.theme, "d"))}</p>
          <p class="list-line">${I18N.t("home.period.next")} <b>${esc(K.L(sw.nextTheme, "t"))}</b> (${esc(K.L(sw.nextTheme, "g"))}) ${sw.nextStartYear + 543} (${Math.floor(sw.endAge)})</p>
        </div>` : ""}
      </div>`;
  }

  // การ์ดนิสัยจากกรุ๊ปเลือด+วันเกิด (belief layer — ระบุชัด) — เนื้อหาจาก KB ยังเป็นไทยเท่านั้น (ตำราต้นทาง), ป้าย label localize แล้ว
  function bloodCard() {
    if (!state.blood) return "";
    const bp = Engine.bloodPersona(profile, state.blood);
    if (!bp) return "";
    return `
      <div class="card">
        <h3>${esc(I18N.t("home.blood.title", { blood: bp.blood }))}</h3>
        <p class="hint">✨ ${esc(bp.beliefNote)}</p>
        <p class="list-line"><b>${I18N.t("home.blood.side1")}</b> ${esc(bp.bloodTrait)}</p>
        <p class="list-line"><b>${I18N.t("home.blood.side2")}</b> ${esc(bp.dayTrait)}</p>
        <p class="list-line"><b>${I18N.t("home.blood.synthesis")}</b> ${esc(bp.synthesis)}</p>
        <p class="list-line">${I18N.t("home.blood.advice")} ${esc(bp.growth)}</p>
      </div>`;
  }

  // ---------- ASK ----------
  function renderAskNote() {
    $("ask-mode-note").innerHTML = state.apiKey ? I18N.t("ask.note.ai") : I18N.t("ask.note.classic");
    // แสดงประวัติแชทเดิม (ความจำถาวร) หรือทักทายครั้งแรก
    if ($("chat-box").childElementCount === 0) {
      if (chatHistory.length) {
        chatHistory.forEach(m => appendMsg(m.role === "user" ? "user" : "bot", m.text));
      } else {
        appendMsg("bot", I18N.t("ask.hello", { name: profile.name }));
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
      const m = I18N.t("ask.sensitive");
      appendMsg("bot", m); pushChat("bot", m);
      return;
    }

    const q = (askCategory ? `[หมวด: ${askCategory}] ` : "") + text;

    // ---- โหมดการอ่าน: ศาสตร์เดียว / รวมหลายศาสตร์ ----
    const sel = $("ask-method").value;
    let methods;
    if (sel === "integrated") {
      if (!MZ.can(state, "integrated")) { MZ.showPaywall(state, I18N.t("pay.benefit.premium")); return; }
      methods = ["integrated"];
    } else if (sel === "auto") methods = ["integrated"];
    else if (sel === "numerology") methods = ["phone"];
    else methods = [sel]; // birthdate | tarot

    if (state.apiKey) {
      // โควตา AI รายวันตาม tier — โหมดตำราไม่จำกัดเสมอ
      if (!MZ.can(state, "aiAsk")) {
        appendMsg("bot", "🕐 " + I18N.t("quota.ask"));
        const reply = Engine.ruleAnswer(profile, askCategory, text);
        appendMsg("bot", reply); pushChat("bot", reply);
        MZ.showPaywall(state, I18N.t("quota.ask"));
        return;
      }
      MZ.consume(state, "aiAsk"); saveState();
      const typingEl = appendMsg("bot", I18N.t("ask.thinking"), true);
      try {
        const facts = LLM.buildFacts(profile, { job: state.job, tone: state.tone, memory: state.memory, blood: state.blood, methods });
        const history = chatHistory.slice(-10).map(m => ({ role: m.role, text: m.text }));
        history[history.length - 1] = { role: "user", text: q };
        const reply = await LLM.chat(state.apiKey, facts, history);
        typingEl.remove();
        appendMsg("bot", reply);
        pushChat("bot", reply);
        $("chat-box").insertAdjacentHTML("beforeend",
          `<div style="margin:4px 0 10px">${fbWidget("ask")}</div>`);
        // upsell เงียบๆ หลังจบ single-method (หลักการ: ศาสตร์เดียวต้องจบสมบูรณ์ ไม่ยัดเยียด)
        if (methods.length === 1 && methods[0] !== "integrated" && !state.upsellOff) {
          $("chat-box").insertAdjacentHTML("beforeend",
            `<div class="upsell-card">${esc(I18N.t("ask.upsell"))} <button class="fb-btn" onclick="this.parentElement.remove()">${esc(I18N.t("ask.upsell.close"))}</button></div>`);
        }
      } catch (err) {
        typingEl.remove();
        appendMsg("bot", I18N.t("ask.error", { err: err.message }) + "\n\n" + Engine.ruleAnswer(profile, askCategory, text));
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
        <p class="list-line">${I18N.t("tarot.instruction")}</p>
        <div class="tarot-fan">
          ${Array.from({ length: 12 }, (_, i) => `<div class="tcard" data-i="${i}">✦</div>`).join("")}
        </div>
        <p class="hint center" id="tarot-status">${esc(I18N.t("tarot.picked", { n: 0 }))}</p>
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
    $("tarot-status").textContent = I18N.t("tarot.picked", { n: tarotPicked.length });
    if (tarotPicked.length === 3) revealTarot();
  }

  // ---------- ภาพไพ่ ----------
  // ลำดับการหา: 1) รูปถาวรใน assets/tarot/ (สร้างจากบัญชี Gemini ที่จ่ายเงิน ฝังในแอป)
  //             2) cache ที่เคย generate ในเครื่อง  3) generate ด้วย key ผู้ใช้  4) SVG
  const TAROT_ASSET = i => "assets/tarot/" + String(i).padStart(2, "0") + ".jpg";
  const TIMG_KEY = i => "ora_tarot_img_v1_" + i;
  function getTarotImg(idx) { try { return localStorage.getItem(TIMG_KEY(idx)); } catch (e) { return null; } }
  // ตรวจว่ามีรูปถาวรไหม (โหลดจริงเพื่อกัน 404) แล้ว callback ด้วย path หรือ null
  function probeAsset(idx, cb) {
    const im = new Image();
    im.onload = () => cb(TAROT_ASSET(idx));
    im.onerror = () => cb(null);
    im.src = TAROT_ASSET(idx);
  }

  // ย่อภาพที่ generate มาให้เล็กพอเก็บ localStorage (~40-80KB/ใบ)
  function shrinkDataURL(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const W = 320, H = 512;
        const cv = document.createElement("canvas");
        cv.width = W; cv.height = H;
        const ctx = cv.getContext("2d");
        const s = Math.max(W / img.width, H / img.height); // cover-crop
        const dw = img.width * s, dh = img.height * s;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        resolve(cv.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function tarotImgPrompt(card) {
    return `Vintage Art Nouveau tarot card illustration: "${card.n}" from the major arcana. ` +
      `Alphonse Mucha style, ornate flowing linework, muted gold, deep purple and ivory parchment palette, ` +
      `mystical celestial atmosphere with delicate stars, elegant symbolic composition representing: ${card.m}. ` +
      `Portrait orientation 2:3. Full-bleed artwork only — absolutely NO text, NO letters, NO numbers, NO border frame.`;
  }

  // อัปเดตการ์ดบนจอ: รูปถาวร → cache → generate (ทีละใบ กันชนโควตา) → คง SVG
  function upgradeTarotFaces(cards) {
    const needGen = [];
    let pending = cards.length;
    cards.forEach(card => {
      const idx = K.TAROT.indexOf(card);
      probeAsset(idx, path => {
        if (path) {
          const wrap = document.querySelector(`.tface-wrap[data-idx="${idx}"]`);
          if (wrap) wrap.innerHTML = tarotSVG(card, path);
        } else if (!getTarotImg(idx)) {
          needGen.push(card);
        }
        if (--pending === 0 && needGen.length && state.apiKey) genTarotImages(needGen);
      });
    });
  }

  async function genTarotImages(cards) {
    for (const card of cards) {
      const idx = K.TAROT.indexOf(card);
      if (getTarotImg(idx)) continue;
      try {
        const raw = await LLM.genImage(state.apiKey, tarotImgPrompt(card));
        const small = await shrinkDataURL(raw);
        try { localStorage.setItem(TIMG_KEY(idx), small); } catch (e) { /* เต็ม — ใช้ครั้งนี้เฉยๆ */ }
        const wrap = document.querySelector(`.tface-wrap[data-idx="${idx}"]`);
        if (wrap) wrap.innerHTML = tarotSVG(card, small);
      } catch (e) { /* สร้างไม่ได้ — คง SVG เดิมไว้ */ }
    }
  }

  // หน้าไพ่ SVG สไตล์ Art Nouveau วินเทจ — พื้นงาช้าง ซุ้มโค้ง ลายเถาทอง เลขโรมัน
  // ถ้ามีภาพ AI (imgHref) จะแสดงภาพในซุ้มแทนสัญลักษณ์
  function tarotSVG(card, imgHref) {
    const idx = K.TAROT.indexOf(card);
    const roman = K.ROMAN[idx] || "";
    const arch = "M 26 78 Q 26 48 56 43 Q 110 30 164 43 Q 194 48 194 78 L 194 290 L 26 290 Z";
    const artwork = imgHref
      ? `<clipPath id="tclip${idx}"><path d="${arch}"/></clipPath>
         <image href="${imgHref}" x="26" y="30" width="168" height="260" preserveAspectRatio="xMidYMid slice" clip-path="url(#tclip${idx})"/>
         <path d="${arch}" fill="none" stroke="#a3812f" stroke-width="2.5"/>`
      : `<circle cx="55" cy="95" r="1.4" fill="#e6c36b" opacity="0.9"/>
         <circle cx="168" cy="88" r="1.1" fill="#fff" opacity="0.8"/>
         <circle cx="150" cy="245" r="1.3" fill="#b18cff" opacity="0.9"/>
         <circle cx="68" cy="255" r="1" fill="#e6c36b" opacity="0.8"/>
         <circle cx="110" cy="72" r="1.2" fill="#fff" opacity="0.7"/>
         <path d="M 40 96 C 52 130 34 160 46 195 C 54 222 38 252 46 276" fill="none" stroke="#c9a94f" stroke-width="1.2" opacity="0.55"/>
         <path d="M 180 96 C 168 130 186 160 174 195 C 166 222 182 252 174 276" fill="none" stroke="#c9a94f" stroke-width="1.2" opacity="0.55"/>
         <circle cx="46" cy="140" r="2" fill="#c9a94f" opacity="0.6"/>
         <circle cx="174" cy="140" r="2" fill="#c9a94f" opacity="0.6"/>
         <circle cx="42" cy="230" r="2" fill="#c9a94f" opacity="0.6"/>
         <circle cx="178" cy="230" r="2" fill="#c9a94f" opacity="0.6"/>
         <circle cx="110" cy="168" r="58" fill="rgba(230,195,107,0.09)" stroke="#e6c36b" stroke-width="1" opacity="0.9"/>
         <circle cx="110" cy="168" r="68" fill="none" stroke="#e6c36b" stroke-width="0.8" opacity="0.4" stroke-dasharray="2 6"/>
         <text x="110" y="112" text-anchor="middle" fill="#e6c36b" font-size="9" opacity="0.85" letter-spacing="4">✦ ✧ ✦</text>
         <text x="110" y="190" text-anchor="middle" font-size="62">${card.e}</text>
         <text x="110" y="268" text-anchor="middle" fill="#e6c36b" font-size="9" opacity="0.85" letter-spacing="4">✧ ✦ ✧</text>`;
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
      <!-- ซุ้มภาพโค้งแบบนูโว: พื้นม่วง + ภาพ AI (ถ้ามี) หรือลายสัญลักษณ์ -->
      <path d="${arch}" fill="url(#tsky${idx})" stroke="#a3812f" stroke-width="2.5"/>
      ${artwork}
      <path d="M 32 80 Q 32 54 58 49 Q 110 37 162 49 Q 188 54 188 80 L 188 284 L 32 284 Z"
            fill="none" stroke="#e6c36b" stroke-width="0.8" opacity="0.5"/>
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
    const labels = [I18N.t("tarot.label.past"), I18N.t("tarot.label.present"), I18N.t("tarot.label.future")];
    // หมายเหตุ: ความหมายไพ่ (c.n/c.th/c.m/c.adv) มาจาก K.TAROT ยังเป็นไทยเท่านั้น (ตำราต้นทาง 22 ใบ) —
    // โหมด AI จะตีความเป็นภาษาที่เลือกให้เองผ่าน I18N.promptDirective ในทุกกรณี
    let html = `<div class="card"><h3>${I18N.t("tarot.yourCards")}</h3>
      <div class="tface-row">${cards.map(c => {
        const ci = K.TAROT.indexOf(c);
        return `<div class="tface-wrap" data-idx="${ci}">${tarotSVG(c, getTarotImg(ci))}</div>`;
      }).join("")}</div>
      ${state.apiKey && cards.some(c => !getTarotImg(K.TAROT.indexOf(c))) ? `<p class="hint center">${I18N.t("tarot.drawing")}</p>` : ""}` +
      cards.map((c, i) => `
        <div class="tres">
          <div class="tname">${esc(labels[i])} — ${c.e} ${esc(c.n)} (${esc(c.th)})</div>
          <p>${esc(c.m)}</p>
          <p>💡 ${esc(c.adv)}</p>
        </div>`).join("") +
      `<div id="tarot-ai"></div>
       <p class="hint center" style="margin-top:10px">${I18N.t("tarot.feedback.prompt")}</p>${fbWidget("tarot")}</div>`;
    $("tarot-result").innerHTML = html;
    $("tarot-result").scrollIntoView({ behavior: "smooth" });
    upgradeTarotFaces(cards); // รูปถาวรในแอป → cache → generate เบื้องหลัง

    if (state.apiKey) {
      $("tarot-ai").innerHTML = `<p class="hint">${I18N.t("tarot.interpreting")}</p>`;
      try {
        const facts = LLM.buildFacts(profile, { cards, job: state.job, tone: state.tone, memory: state.memory });
        const reply = await LLM.chat(state.apiKey, facts,
          [{ role: "user", text: "ช่วยตีความไพ่ทั้ง 3 ใบนี้ร่วมกัน (อดีต-ปัจจุบัน-แนวโน้ม) ให้เชื่อมโยงกับดวงพื้นฐานของฉัน แบบละเอียด" }]);
        $("tarot-ai").innerHTML = `<div class="msg bot" style="max-width:100%">${md(reply)}</div>`;
      } catch (e) {
        $("tarot-ai").innerHTML = `<p class="hint">${I18N.t("tarot.aiFailed")}</p>`;
      }
    } else {
      $("tarot-ai").innerHTML = `<p class="hint">${I18N.t("tarot.aiHint")}</p>`;
    }
  }

  // ---------- NUMBERS ----------
  function renderNum() {
    const lp = K.LIFEPATH[profile.lifePath];
    // LIFEPATH.en เป็น string เดี่ยว "หัวข้อ — รายละเอียด" (ไม่ใช่ {t,d} เหมือนที่อื่น) จึงแยกด้วย " — "
    const titleLine = I18N.lang === "en" && typeof lp.en === "string" ? lp.en.split(" — ")[0] : lp.t;
    const bodyLine = I18N.lang === "en" && typeof lp.en === "string" ? lp.en.split(" — ").slice(1).join(" — ") : lp.d;
    $("num-lifepath").innerHTML = `
      <div class="num-score">${profile.lifePath}</div>
      <p class="list-line"><b style="color:var(--gold)">${esc(titleLine)}</b></p>
      <p class="list-line">${esc(bodyLine)}</p>`;
    $("num-result").innerHTML = "";
  }
  $("num-go").addEventListener("click", () => {
    const r = Engine.phone($("num-phone").value);
    if (!r) { $("num-result").innerHTML = `<p class="hint">${I18N.t("num.phone.invalid")}</p>`; return; }
    const cls = s => s > 0 ? "good" : (s < 0 ? "low" : "mid");
    const tail = r.pairs.filter(p => p.w === 2);
    const head = r.pairs.filter(p => p.w === 1);
    $("num-result").innerHTML = `
      <div class="num-score">${r.score}/10</div>
      <p class="list-line">${I18N.t("num.phone.sum")} <b>${r.sum}</b>${r.sumGood ? ` — <span style="color:var(--good)">${esc(r.sumGood)}</span>` : " — " + I18N.t("num.phone.sumNeutral")}</p>
      ${r.dominant ? `<p class="list-line">${esc(I18N.t("num.phone.dominant", { digit: r.dominant.d, n: r.dominant.n, planet: K.planetName(r.dominant.info.p), trait: r.dominant.info.t, desc: r.dominant.info.d }))}</p>` : ""}
      <p class="list-line" style="margin-top:10px"><b>${I18N.t("num.phone.tailTitle")}</b></p>
      ${tail.map(p => `<div class="pair-line"><span class="pair-badge ${cls(p.s)}">${p.pair}</span><span>${esc(p.t)}</span></div>`).join("")}
      <p class="list-line" style="margin-top:10px"><b>${I18N.t("num.phone.headTitle")}</b></p>
      ${head.map(p => `<div class="pair-line"><span class="pair-badge ${cls(p.s)}">${p.pair}</span><span>${esc(p.t)}</span></div>`).join("")}
      <p class="hint" style="margin-top:8px">${I18N.t("num.phone.principle")}</p>
      <div class="card2-box">
        <p class="list-line"><b>${I18N.t("num.phone.goalPrompt")}</b></p>
        <div class="chips" id="phone-goals">
          ${Object.keys(PHONE_GOALS).map(g => `<button class="chip" data-goal="${g}">${I18N.t("num.goal." + g)}</button>`).join("")}
        </div>
        <div id="phone-goal-result"></div>
      </div>
      <p class="disclaimer">${I18N.t("num.phone.disclaimer")}</p>
      ${fbWidget("phone")}`;
    document.querySelectorAll("#phone-goals .chip").forEach(ch =>
      ch.addEventListener("click", () => {
        document.querySelectorAll("#phone-goals .chip").forEach(c => c.classList.remove("sel"));
        ch.classList.add("sel");
        const goalKey = ch.dataset.goal;
        const goalLabel = I18N.t("num.goal." + goalKey);
        const pairs = PHONE_GOALS[goalKey];
        const aff = MZ.affiliatePhoneMarketplace();
        $("phone-goal-result").innerHTML = `
          <p class="list-line" style="margin-top:8px"><b>${esc(I18N.t("num.phone.goalPairs", { goal: goalLabel }))}</b> ${pairs.map(p =>
            `<span class="pair-badge good" style="margin:2px">${p}</span>`).join(" ")}</p>
          <p class="hint">${pairs.map(p => K.PHONE_PAIRS[p] ? `${p} = ${K.PHONE_PAIRS[p].t}` : "").filter(Boolean).join(" · ")}</p>
          <button class="btn-ghost" disabled>🛍️ ${esc(I18N.lang === "th" ? aff.message_th : aff.message_en)}</button>`;
      }));
  });

  // pattern เบอร์ตามเป้าหมาย (จากตาราง K.PHONE_PAIRS — belief-based) — key ภายในคงที่ไม่ผูกภาษา ป้ายมาจาก i18n key num.goal.*
  const PHONE_GOALS = {
    career: ["89", "98", "19", "91", "45", "54"],
    money: ["24", "42", "46", "64", "89", "98"],
    love: ["56", "65", "36", "63", "15"],
    charm: ["15", "51", "36", "63", "24"],
    support: ["15", "51", "45", "54"]
  };

  // ---------- SCAN: ลายมือ / โหงวเฮ้ง / โทนสี-สไตล์ (Gemini vision) ----------
  let scanKind = "palm";
  let scanImage = null; // {base64, mime}
  function scanDesc(kind) { return I18N.t("scan.desc." + kind); }

  function renderScan() {
    const hasKey = !!state.apiKey;
    $("scan-gate").classList.toggle("hidden", hasKey);
    $("scan-main").classList.toggle("hidden", !hasKey);
    if (hasKey) $("scan-desc").innerHTML = scanDesc(scanKind);
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
      $("scan-desc").innerHTML = scanDesc(scanKind);
    }));
  $("scan-pick").addEventListener("click", async () => {
    const ok = await askConsent(scanKind); // consent localized ก่อนแตะรูปเสมอ
    if (ok) $("scan-file").click();
  });
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
      scanImage = { base64: dataUrl.split(",")[1], mime: "image/jpeg", dataUrl };
      $("scan-preview").src = dataUrl;
      $("scan-preview-wrap").classList.remove("hidden");
      URL.revokeObjectURL(img.src);
      prepScanExtras(dataUrl); // ตรวจคุณภาพ + (ลายมือ) ปรับภาพ/overlay
    };
    img.src = URL.createObjectURL(file);
  });

  // ตรวจคุณภาพภาพ + สำหรับลายมือ: แสดง ก่อน/หลังปรับ + เส้นตำแหน่งโดยประมาณ
  async function prepScanExtras(dataUrl) {
    $("scan-result").innerHTML = "";
    const qtips = ScanTools.QUALITY_TIPS[I18N.lang] || ScanTools.QUALITY_TIPS.en;
    let html = "";
    try {
      const q = await ScanTools.checkImageQuality(dataUrl);
      html += `<div class="card"><h3>${esc(I18N.t("scan.quality.title", { score: q.score }))} ${q.ok ? "✓" : ""}</h3>`;
      if (!q.ok) {
        html += q.issues.map(i => `<p class="list-line">⚠️ ${esc(qtips[i] || i)}</p>`).join("");
        html += `<p class="hint">${I18N.t("scan.quality.note")}</p>`;
      }
      html += `</div>`;
      if (scanKind === "palm") {
        const enhanced = await ScanTools.enhancePalmImage(dataUrl);
        const det = await ScanTools.detectPalmLines(dataUrl);
        const overlay = await ScanTools.generatePalmOverlay(enhanced, det);
        html += `
          <div class="card"><h3>${I18N.t("scan.palm.title")}</h3>
            <div class="palm-compare">
              <figure><img src="${dataUrl}" alt="${esc(I18N.t("scan.palm.original"))}"><figcaption>${I18N.t("scan.palm.original")}</figcaption></figure>
              <figure><img src="${enhanced}" alt="${esc(I18N.t("scan.palm.enhanced"))}"><figcaption>${I18N.t("scan.palm.enhanced")}</figcaption></figure>
            </div>
            <figure class="palm-overlay"><img src="${overlay}" alt="${esc(I18N.t("scan.palm.overlayCaption"))}">
              <figcaption>${I18N.t("scan.palm.overlayCaption")}${det.isMock ? I18N.t("scan.palm.overlayApprox") : ""}</figcaption></figure>
          </div>`;
      }
    } catch (e) { /* เครื่องมือภาพล้ม — ไม่ขวางการวิเคราะห์ */ }
    $("scan-result").innerHTML = html;
  }
  $("scan-go").addEventListener("click", async () => {
    if (!scanImage || !state.apiKey) return;
    if (!MZ.can(state, "scan")) { MZ.showPaywall(state, I18N.t("quota.scan")); return; }
    MZ.consume(state, "scan"); saveState();
    const old = document.getElementById("scan-ai-result");
    if (old) old.remove();
    $("scan-result").insertAdjacentHTML("beforeend",
      `<div class="card" id="scan-ai-result"><p class="hint">${I18N.t("scan.analyzing")}</p></div>`);
    try {
      const facts = LLM.buildFacts(profile, { job: state.job, tone: state.tone, memory: state.memory, blood: state.blood, methods: [scanKind] });
      const reply = await LLM.vision(state.apiKey, scanKind, scanImage.base64, scanImage.mime, facts);
      // สำหรับโหงวเฮ้ง: แนบ crop ส่วนใบหน้าประกอบคำอธิบาย (ตำแหน่งมาตรฐาน — รอ landmark จริง)
      let cropsHtml = "";
      if (scanKind === "face") {
        try {
          const det = await ScanTools.detectFaceRegions(scanImage.dataUrl);
          const crops = await ScanTools.cropFaceRegions(scanImage.dataUrl, det);
          cropsHtml = `<div class="face-crops">` + crops.map(c =>
            `<figure><img src="${c.dataUrl}" alt="${esc(c.th)}"><figcaption>${esc(c.th)}</figcaption></figure>`).join("") +
            `</div><p class="hint">${I18N.t("scan.faceCropNote")}${det.isMock ? I18N.t("scan.faceCropNoteApprox") : ""}</p>`;
        } catch (e) { /* crop ไม่ได้ก็ข้าม */ }
      }
      document.getElementById("scan-ai-result").innerHTML = `${cropsHtml}<div class="msg bot" style="max-width:100%">${md(reply)}</div>
        <p class="hint center" style="margin-top:8px">${I18N.t("scan.feedback.prompt")}</p>${fbWidget("scan:" + scanKind)}`;
      Engine.remember(state, { d: new Date().toISOString().slice(0, 10), cat: "สแกน-" + scanKind, q: "วิเคราะห์" + (scanKind === "palm" ? "ลายมือ" : scanKind === "face" ? "โหงวเฮ้ง" : "โทนสี") });
      saveState();
      scanImage = null; // ไม่เก็บภาพไว้ในหน่วยความจำต่อ
      $("scan-result").scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      $("scan-result").innerHTML = `<div class="card"><p class="hint">${esc(I18N.t("scan.failed", { err: err.message }))}</p></div>`;
    }
  });

  // ---------- SETTINGS ----------
  function renderSettings() {
    const s = Engine.personalization(state);
    $("pscore-bar").style.width = s + "%";
    $("pscore-text").textContent = `${s}/100 — ` + (s < 40
      ? I18N.t("set.pscore.low")
      : s < 70 ? I18N.t("set.pscore.mid") : I18N.t("set.pscore.high"));
    $("set-key").value = state.apiKey || "";
    $("set-key-status").textContent = state.apiKey ? I18N.t("set.ai.on") : I18N.t("set.ai.off");
    // ---- ภาษา/ประเทศ ----
    fillLangSelect($("set-lang"), I18N.lang);
    fillCountrySelect($("set-country"), I18N.country);
    $("set-lang-status").textContent = I18N.translationStatus() === "placeholder"
      ? `* ${I18N.langInfo().native} — content shows in English for now; AI mode can still reply in this language` : "";
    // ---- tier/quota ----
    const tierName = MZ.FREE_MODE ? "FREE QA" : MZ.tier(state).toUpperCase();
    $("set-tier-name").textContent = tierName;
    const tcfg = MZ.TIERS[MZ.tier(state)];
    const u = MZ.usageToday(state);
    $("set-quota").textContent = MZ.FREE_MODE
      ? I18N.t("set.quota.free")
      : `${I18N.t("set.quota.used")} AI ${u.aiAsk}/${tcfg.aiAskPerDay} · ${I18N.t("nav.scan")} ${u.scan}/${tcfg.scanPerDay} · Integrated: ${tcfg.integrated ? "✓" : I18N.t("set.quota.needPremium")}`;
    // ---- prefs ----
    $("set-astro").value = state.astroSystem || "";
    $("set-blood").value = state.blood || "";
    $("set-undertone").value = state.undertone || "";
    $("set-tone").value = state.tone || "";
    const memN = (state.memory || []).length;
    $("set-memory").textContent = memN
      ? I18N.t("set.memory.has", { n: memN })
      : I18N.t("set.memory.empty");
    $("set-profile").textContent = I18N.t("set.profile.summary", {
      name: state.name || "-", dob: state.dob,
      timeSuffix: state.birthTime ? (I18N.lang === "en" ? " at " + state.birthTime : " เวลา " + state.birthTime) : "",
      planet: K.planetName(profile.birthPlanet), zodiac: K.L(profile.zodiac, "n") || profile.zodiac.n, lp: profile.lifePath,
      jobSuffix: state.job ? " · " + state.job : ""
    });
  }
  $("set-key-save").addEventListener("click", () => {
    state.apiKey = $("set-key").value.trim() || null;
    saveState(); renderSettings();
  });
  $("set-lang").addEventListener("change", () => {
    state.lang = $("set-lang").value; I18N.set(state.lang, null);
    saveState(); renderSettings();
  });
  $("set-country").addEventListener("change", () => {
    state.country = $("set-country").value; I18N.set(null, state.country);
    saveState(); renderSettings();
  });
  $("set-code-go").addEventListener("click", () => {
    const r = MZ.redeem(state, $("set-code").value);
    $("set-code-status").textContent = r.ok
      ? `✅ ${r.tier.toUpperCase()} ${r.kiosk ? "(kiosk)" : ""}`
      : (I18N.lang === "en" ? "Invalid code" : "รหัสไม่ถูกต้องค่ะ");
    if (r.ok) { saveState(); renderSettings(); }
  });
  $("set-astro").addEventListener("change", () => { state.astroSystem = $("set-astro").value || null; saveState(); });
  $("set-blood").addEventListener("change", () => { state.blood = $("set-blood").value || null; saveState(); });
  $("set-undertone").addEventListener("change", () => { state.undertone = $("set-undertone").value || null; saveState(); });
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
    if (confirm(I18N.t("set.wipeConfirm"))) {
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
