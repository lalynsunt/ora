// ============================================================
// ORA Monetization — tiers, feature access, paywall, pricing by country
// ยังไม่มี payment จริง: ปลดล็อกด้วยรหัส (dev/kiosk placeholder) เตรียม
// โครงพร้อมต่อ Stripe/IAP ภายหลัง
// ============================================================
const MZ = {};

// ---------- Tier & quota config ----------
MZ.TIERS = {
  free:    { rank: 0, aiAskPerDay: 5,  scanPerDay: 2,  integrated: false },
  plus:    { rank: 1, aiAskPerDay: 30, scanPerDay: 5,  integrated: false },
  premium: { rank: 2, aiAskPerDay: 60, scanPerDay: 15, integrated: true },
  vip:     { rank: 3, aiAskPerDay: 999, scanPerDay: 99, integrated: true }
};

// ---------- Pricing by country (แสดงผลเท่านั้น — ยังไม่เก็บเงินจริง) ----------
MZ.PRICING = {
  TH: { cur: "THB", sym: "฿", plus: 129, premium: 249, vip: 349, provider: "PromptPay / บัตร (เร็วๆ นี้)" },
  JP: { cur: "JPY", sym: "¥", plus: 980, premium: 1800, vip: 2500, provider: "Card / PayPay (coming soon)" },
  KR: { cur: "KRW", sym: "₩", plus: 8900, premium: 16000, vip: 22000, provider: "Card (coming soon)" },
  US: { cur: "USD", sym: "$", plus: 6.99, premium: 12.99, vip: 17.99, provider: "Card (coming soon)" },
  GB: { cur: "GBP", sym: "£", plus: 5.99, premium: 10.99, vip: 14.99, provider: "Card (coming soon)" },
  VN: { cur: "VND", sym: "₫", plus: 79000, premium: 149000, vip: 199000, provider: "Momo/Card (coming soon)" },
  ID: { cur: "IDR", sym: "Rp", plus: 49000, premium: 89000, vip: 129000, provider: "GoPay/Card (coming soon)" },
  DEFAULT: { cur: "USD", sym: "$", plus: 4.99, premium: 9.99, vip: 13.99, provider: "Card (coming soon)" }
};
MZ.pricingFor = function (country) { return MZ.PRICING[country] || MZ.PRICING.DEFAULT; };

// ---------- state helpers (อ่าน/เขียนผ่าน object state ของแอป) ----------
MZ.tier = function (state) { return state.tier && MZ.TIERS[state.tier] ? state.tier : "free"; };

MZ.usageToday = function (state) {
  const today = new Date().toISOString().slice(0, 10);
  if (!state.usage || state.usage.d !== today) state.usage = { d: today, aiAsk: 0, scan: 0 };
  return state.usage;
};

// feature: "aiAsk" | "scan" | "integrated"
MZ.can = function (state, feature) {
  const t = MZ.TIERS[MZ.tier(state)];
  const u = MZ.usageToday(state);
  if (feature === "aiAsk") return u.aiAsk < t.aiAskPerDay;
  if (feature === "scan") return u.scan < t.scanPerDay;
  if (feature === "integrated") return t.integrated;
  return true;
};
MZ.consume = function (state, feature) {
  const u = MZ.usageToday(state);
  if (feature === "aiAsk") u.aiAsk++;
  if (feature === "scan") u.scan++;
};

// ---------- Redeem codes (placeholder จนกว่าจะมี payment/kiosk จริง) ----------
// ORA-DEV-PREMIUM = ทีมงานทดสอบ · ORA-KIOSK-xxxx = โครงรอตู้ kiosk (Phase ถัดไป)
MZ.redeem = function (state, code) {
  const c = (code || "").trim().toUpperCase();
  if (c === "ORA-DEV-PLUS") { state.tier = "plus"; return { ok: true, tier: "plus" }; }
  if (c === "ORA-DEV-PREMIUM") { state.tier = "premium"; return { ok: true, tier: "premium" }; }
  if (c === "ORA-DEV-VIP") { state.tier = "vip"; return { ok: true, tier: "vip" }; }
  if (/^ORA-KIOSK-[A-Z0-9]{4,}$/.test(c)) {
    // TODO(kiosk): ตรวจกับ server เมื่อมีตู้จริง — ตอนนี้ให้สิทธิ์ premium 1 วันแบบ local
    state.tier = "premium"; state.kioskUnlockDate = new Date().toISOString().slice(0, 10);
    return { ok: true, tier: "premium", kiosk: true };
  }
  return { ok: false };
};

// ---------- Paywall modal (localized) ----------
MZ.showPaywall = function (state, reason) {
  const p = MZ.pricingFor(I18N.country);
  const fmt = v => p.sym + v.toLocaleString();
  const modal = document.getElementById("modal");
  const t = I18N.t;
  modal.innerHTML = `
    <div class="modal-card">
      <h3>💎 ${t("pay.title")}</h3>
      ${reason ? `<p class="hint">${reason}</p>` : ""}
      <p class="list-line">${t("pay.now")} <b style="color:var(--gold)">${MZ.tier(state).toUpperCase()}</b></p>
      <div class="tier-row"><b>Plus</b> — ${fmt(p.plus)}/mo<br><span class="hint">${t("pay.benefit.plus")}</span></div>
      <div class="tier-row"><b>Premium</b> — ${fmt(p.premium)}/mo<br><span class="hint">${t("pay.benefit.premium")}</span></div>
      <p class="hint" style="margin-top:10px">💳 ${p.provider}</p>
      <p class="hint">${t("pay.soon")}</p>
      <button class="btn-primary" id="pw-close">${t("pay.close")}</button>
    </div>`;
  modal.classList.remove("hidden");
  document.getElementById("pw-close").onclick = () => modal.classList.add("hidden");
};

// ---------- Affiliate / try-on placeholders (Phase 3) ----------
MZ.affiliatePhoneMarketplace = function () {
  // TODO(affiliate): เชื่อมดีลเลอร์เบอร์มงคลจริง — ตอนนี้เป็น placeholder
  return { available: false, message_th: "ตลาดเบอร์มงคล — เร็วๆ นี้", message_en: "Lucky number marketplace — coming soon" };
};
MZ.virtualTryOn = function () {
  // TODO(tryon): ต่อ API virtual hair/makeup try-on ภายหลัง
  return { available: false };
};
