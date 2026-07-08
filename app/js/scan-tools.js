// ============================================================
// ORA Scan Tools — image quality check / palm enhancement /
// palm line overlay (placeholder) / face region crops (placeholder)
// ทำงานด้วย canvas จริงในเครื่อง — โครง interface พร้อมสลับเป็น
// CV model จริง (MediaPipe/custom) ภายหลังโดยไม่ต้องแก้ UI
// ============================================================
const ScanTools = {};

ScanTools._img = function (dataUrl) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = dataUrl;
  });
};

// ---------- ตรวจคุณภาพภาพ (ของจริง: ความสว่าง/ความละเอียด/contrast หยาบๆ) ----------
// คืน { ok, score(0-100), issues[] } — issues เป็น key ที่ UI แปลเป็นคำแนะนำ
ScanTools.checkImageQuality = async function (dataUrl) {
  const im = await ScanTools._img(dataUrl);
  const issues = [];
  if (Math.max(im.width, im.height) < 400) issues.push("low_resolution");
  const cv = document.createElement("canvas");
  const W = 64, H = 64;
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  ctx.drawImage(im, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;
  let sum = 0, sum2 = 0;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    sum += y; sum2 += y * y;
  }
  const n = d.length / 4;
  const mean = sum / n;
  const sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
  if (mean < 60) issues.push("too_dark");
  if (mean > 215) issues.push("too_bright");
  if (sd < 22) issues.push("low_contrast"); // ภาพแบน/เบลอ/ฟิลเตอร์จัด มัก contrast ต่ำ
  const score = Math.max(0, Math.min(100, Math.round(100 - issues.length * 30 + sd / 3)));
  return { ok: issues.length === 0, score, issues, mean: Math.round(mean), sd: Math.round(sd) };
};

ScanTools.QUALITY_TIPS = {
  th: {
    low_resolution: "ภาพเล็กเกินไป — ถ่ายใหม่ให้ใกล้ขึ้น/ความละเอียดสูงขึ้น",
    too_dark: "ภาพมืดไป — ถ่ายใต้แสงสว่างหรือใกล้หน้าต่าง",
    too_bright: "ภาพสว่างจ้าเกิน — เลี่ยงแฟลชยิงตรงหรือย้อนแสง",
    low_contrast: "ภาพแบน/ไม่คม — เลี่ยงฟิลเตอร์ ถือกล้องนิ่งๆ พื้นหลังเรียบ"
  },
  en: {
    low_resolution: "Image too small — retake closer / higher resolution",
    too_dark: "Too dark — use brighter light or window light",
    too_bright: "Overexposed — avoid direct flash or backlight",
    low_contrast: "Flat/soft image — avoid filters, hold steady, plain background"
  }
};

// ---------- Palm: ปรับภาพให้เห็นเส้นชัดขึ้น (ของจริง: grayscale + contrast stretch + sharpen) ----------
ScanTools.enhancePalmImage = async function (dataUrl) {
  const im = await ScanTools._img(dataUrl);
  const maxW = 700;
  const s = Math.min(1, maxW / im.width);
  const W = Math.round(im.width * s), H = Math.round(im.height * s);
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  ctx.drawImage(im, 0, 0, W, H);
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  // grayscale + หา min/max เพื่อ contrast stretch
  const g = new Float32Array(W * H);
  let lo = 255, hi = 0;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    g[p] = y;
    if (y < lo) lo = y; if (y > hi) hi = y;
  }
  const range = Math.max(1, hi - lo);
  // sharpen kernel เบาๆ (unsharp แบบง่าย) + stretch
  const out = ctx.createImageData(W, H);
  const od = out.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      let v = g[p];
      if (x > 0 && x < W - 1 && y > 0 && y < H - 1) {
        const lap = 4 * g[p] - g[p - 1] - g[p + 1] - g[p - W] - g[p + W];
        v = g[p] + 0.55 * lap; // เร่งขอบเส้น
      }
      v = ((v - lo) / range) * 255;               // contrast stretch
      v = Math.max(0, Math.min(255, (v - 128) * 1.25 + 128)); // เพิ่ม contrast อีกชั้น
      const q = p * 4;
      od[q] = od[q + 1] = od[q + 2] = v; od[q + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return cv.toDataURL("image/jpeg", 0.9);
};

// ---------- Palm: ตำแหน่งเส้นหลัก ----------
// PLACEHOLDER: คืนเส้นตำแหน่ง "โดยประมาณ" — ไม่ผูกกับรูปทรงมือจริงในภาพ
// เพราะฉะนั้นบังคับให้ทุกเส้นอยู่ใน "โซนปลอดภัยกลางฝ่ามือ" (x:0.25-0.75, y:0.36-0.86)
// เพื่อไม่ให้เส้นล้ำขึ้นไปโซนนิ้ว (มักอยู่เหนือ y~0.32) หรือหลุดขอบภาพ ไม่ว่าสัดส่วนมือในรูปจะเป็นแบบไหน
// TODO(cv): แทนที่ด้วย line-segmentation model จริงที่ยึดจาก landmark จุดกกนิ้ว — interface คงเดิม
ScanTools.detectPalmLines = async function (_dataUrl) {
  return {
    isMock: true,
    lines: [
      { key: "heart", th: "เส้นหัวใจ", color: "#f08bb4", path: [[0.28, 0.42], [0.42, 0.38], [0.58, 0.37], [0.72, 0.40]] },
      { key: "head",  th: "เส้นสมอง",  color: "#5b8fd9", path: [[0.30, 0.50], [0.46, 0.52], [0.60, 0.55], [0.71, 0.59]] },
      { key: "life",  th: "เส้นชีวิต",  color: "#6fd39b", path: [[0.42, 0.44], [0.34, 0.56], [0.31, 0.70], [0.34, 0.84]] },
      { key: "fate",  th: "เส้นวาสนา", color: "#e6c36b", path: [[0.53, 0.84], [0.52, 0.68], [0.51, 0.54], [0.50, 0.44]] }
    ]
  };
};

// วาด overlay เส้นประลงบนภาพ (ใช้ผล detectPalmLines — mock หรือของจริงก็ได้)
ScanTools.generatePalmOverlay = async function (dataUrl, detection) {
  const im = await ScanTools._img(dataUrl);
  const cv = document.createElement("canvas");
  cv.width = im.width; cv.height = im.height;
  const ctx = cv.getContext("2d");
  ctx.drawImage(im, 0, 0);
  ctx.lineWidth = Math.max(2, im.width / 220);
  ctx.setLineDash([10, 7]);
  ctx.font = `bold ${Math.max(13, im.width / 26)}px Anuphan, sans-serif`;
  detection.lines.forEach(L => {
    ctx.strokeStyle = L.color;
    ctx.fillStyle = L.color;
    ctx.beginPath();
    L.path.forEach(([nx, ny], i) => {
      const x = nx * im.width, y = ny * im.height;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    const [lx, ly] = L.path[L.path.length - 1];
    ctx.fillText(L.th, Math.min(lx * im.width + 6, im.width - 90), ly * im.height);
  });
  return cv.toDataURL("image/jpeg", 0.9);
};

// ---------- Face: crop ส่วนใบหน้า ----------
// PLACEHOLDER: crop ตามสัดส่วนมาตรฐานของภาพหน้าตรง (ไม่ใช่ landmark จริง)
// TODO(cv): แทนที่ด้วย face landmark detection — interface คงเดิม
ScanTools.detectFaceRegions = async function (_dataUrl) {
  return {
    isMock: true,
    regions: [
      { key: "forehead", th: "หน้าผาก (ส่วนบน 上停)",  box: [0.20, 0.06, 0.60, 0.22] },
      { key: "brows_eyes", th: "คิ้ว-ดวงตา (監察官)", box: [0.15, 0.28, 0.70, 0.16] },
      { key: "nose_cheeks", th: "จมูก-โหนกแก้ม (審辨官)", box: [0.22, 0.42, 0.56, 0.22] },
      { key: "mouth", th: "ปาก (出納官)", box: [0.28, 0.64, 0.44, 0.14] },
      { key: "chin", th: "คาง (ส่วนล่าง 下停)", box: [0.26, 0.78, 0.48, 0.16] }
    ]
  };
};

ScanTools.cropFaceRegions = async function (dataUrl, detection) {
  const im = await ScanTools._img(dataUrl);
  const crops = [];
  for (const r of detection.regions) {
    const [nx, ny, nw, nh] = r.box;
    const cv = document.createElement("canvas");
    const w = Math.round(nw * im.width), h = Math.round(nh * im.height);
    cv.width = w; cv.height = h;
    cv.getContext("2d").drawImage(im, nx * im.width, ny * im.height, w, h, 0, 0, w, h);
    crops.push({ key: r.key, th: r.th, dataUrl: cv.toDataURL("image/jpeg", 0.85) });
  }
  return crops;
};

// ---------- Virtual try-on (Phase 3 placeholder) ----------
ScanTools.generateVirtualTryOnPreview = async function () {
  return { available: false, todo: "ต่อ API image generation / hair try-on ภายหลัง" };
};
ScanTools.generateHairColorPreview = ScanTools.generateVirtualTryOnPreview;
