// Date-triggered canvas scenes adapted from the supplied Holiday Calendar motion spec.
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - clamp(t), 5);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const random = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

function glow(g, x, y, radius, color, alpha) {
  const gradient = g.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(1, rgba(color, 0));
  g.fillStyle = gradient;
  g.beginPath();
  g.arc(x, y, radius, 0, TAU);
  g.fill();
}

const WIDTH = 584;
const SCENE_HEIGHT = 264;
const flakes = Array.from({ length: 110 }, (_, i) => ({
  x: random(i), phase: random(i + 50), speed: 0.35 + random(i + 90) * 0.75,
  depth: random(i + 130), sway: random(i + 170),
}));

function ambient(g, t, alpha) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  glow(g, 300, 40, 260, [70, 200, 215], 0.16 * alpha);
  glow(g, 470, 90, 200, [90, 110, 255], 0.12 * alpha);
  for (let k = 0; k < 30; k++) {
    const u = k / 29;
    g.strokeStyle = rgba(mix([60, 210, 190], [110, 120, 255], u), (0.035 + 0.065 * Math.sin(Math.PI * u)) * alpha);
    g.lineWidth = 1.35;
    g.beginPath();
    for (let x = -20; x <= WIDTH + 20; x += 12) {
      const y = 94 + u * 42 * Math.sin(x * 0.006 + t * 0.5 + 1) + 30 * Math.sin(x * 0.009 - t * 0.7 + u * 2.2) + 15 * Math.sin(x * 0.021 + t * 1.1 + u * 4);
      if (x === -20) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}

function snow(g, t, alpha, height, width, density = 1) {
  if (alpha < 0.01) return;
  g.save();
  flakes.forEach((flake, i) => {
    if (i / flakes.length > density) return;
    const z = flake.depth;
    const radius = z > 0.9 ? 7 + z * 5 : 1.2 + z * 2.6;
    const fall = t * (46 + flake.speed * 70) * (0.6 + z * 0.8);
    const y = ((flake.phase * height + fall) % (height + 30)) - 15;
    const x = ((flake.x * width + Math.sin(t * (0.6 + flake.sway) + i) * (10 + z * 16) + t * 8) % (width + 30)) - 15;
    if (z > 0.9) glow(g, x, y, radius * 2.2, [235, 244, 255], 0.14 * alpha);
    else {
      g.fillStyle = rgba([240, 247, 255], (0.35 + z * 0.6) * alpha);
      g.beginPath(); g.arc(x, y, radius, 0, TAU); g.fill();
    }
  });
  g.restore();
}

const palette = [[255, 196, 92], [255, 110, 150], [110, 220, 255], [255, 244, 220], [190, 150, 255], [255, 150, 70]];
const burstX = [0.72, 0.3, 0.52, 0.14, 0.86, 0.42, 0.64, 0.24];
const bursts = Array.from({ length: 8 }, (_, k) => ({
  at: 0.36 + k * 0.36, x: burstX[k] * WIDTH, y: 64 + random(k + 17) * 64,
  color: palette[k % palette.length], count: 40 + (k * 7) % 12, power: 0.8 + random(k + 71) * 0.5,
}));

function fireworks(g, elapsed, alpha) {
  const t = elapsed % 4.8;
  let flash = 0;
  g.save();
  g.globalCompositeOperation = 'lighter';
  glow(g, 292, 260, 300, [90, 70, 45], 0.12 * alpha);
  bursts.forEach((burst, k) => {
    const d = t - burst.at;
    if (d < 0 && d > -0.42) {
      const u = 1 + d / 0.42;
      const y = lerp(SCENE_HEIGHT + 10, burst.y, easeOut(u));
      const x = burst.x + Math.sin(u * 9 + k) * 3;
      g.strokeStyle = rgba([255, 236, 200], 0.8 * alpha); g.lineWidth = 2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26 * (1 - u) + 6); g.stroke();
      glow(g, x, y, 10, [255, 236, 200], 0.7 * alpha);
    }
    if (d < 0 || d >= 1.7) return;
    const life = d / 1.7;
    flash += Math.exp(-d / 0.22);
    glow(g, burst.x, burst.y, 180 * easeOut(d / 0.3), burst.color, 0.4 * (1 - life) * alpha * Math.exp(-d * 2));
    for (let i = 0; i < burst.count; i++) {
      const angle = (i / burst.count) * TAU + random(k * 31 + i) * 0.25;
      const speed = (170 + random(k * 53 + i) * 150) * burst.power * (i % 3 ? 1 : 0.55);
      const drag = 2.6;
      const travel = (1 - Math.exp(-drag * d)) / drag;
      const x = burst.x + Math.cos(angle) * speed * travel;
      const y = burst.y + Math.sin(angle) * speed * travel + 26 * d * d;
      const flicker = 0.6 + 0.4 * Math.sin(d * 38 + i * 2.3);
      const opacity = Math.pow(1 - life, 1.4) * flicker * alpha;
      const trailT = Math.max(0, d - 0.15);
      const x0 = burst.x + (Math.cos(angle) * speed * (1 - Math.exp(-drag * trailT))) / drag;
      const y0 = burst.y + (Math.sin(angle) * speed * (1 - Math.exp(-drag * trailT))) / drag + 26 * trailT ** 2;
      g.strokeStyle = rgba(mix([255, 255, 255], burst.color, clamp(d * 2.2)), opacity);
      g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke();
      if (i % 4 === 0) glow(g, x, y, 7, burst.color, opacity * 0.7);
    }
  });
  g.restore();
  return Math.min(1, flash);
}

const lanternOrder = [5, 0, 8, 3, 10, 1, 6, 9, 2, 7, 4];
const lanternData = lanternOrder.map((column, i) => ({
  x: (column + 0.5 + (random(i + 3) - 0.5) * 0.6) / 11,
  depth: random(i + 23), speed: 14 + random(i + 43) * 22, phase: random(i + 63),
})).sort((a, b) => a.depth - b.depth);

function lanterns(g, elapsed, alpha) {
  const t = elapsed % 11;
  g.save();
  g.globalCompositeOperation = 'lighter';
  glow(g, 292, 300, 330, [255, 70, 30], 0.2 * alpha);
  glow(g, 120, 220, 180, [255, 150, 40], 0.1 * alpha);
  lanternData.forEach((lantern, i) => {
    const scale = 0.5 + lantern.depth * 1.1;
    const width = 22 * scale, height = 28 * scale;
    const rise = lantern.speed * t * (0.6 + lantern.depth) + (70 + lantern.phase * 150) * (1 - Math.exp(-t * 1.6));
    const y = SCENE_HEIGHT + 30 + lantern.phase * 60 - rise;
    const x = lantern.x * WIDTH + Math.sin(t * 0.8 + i * 1.7) * 10 * scale;
    if (y < -40) return;
    const opacity = alpha * (0.55 + 0.45 * lantern.depth) * clamp((SCENE_HEIGHT + 20 - y) / 40);
    glow(g, x, y, height * 2.4, [255, 120, 40], 0.3 * opacity);
    const gradient = g.createLinearGradient(0, y - height / 2, 0, y + height / 2);
    gradient.addColorStop(0, rgba([230, 50, 30], opacity));
    gradient.addColorStop(0.55, rgba([255, 120, 40], opacity));
    gradient.addColorStop(1, rgba([255, 214, 120], opacity));
    g.fillStyle = gradient; g.beginPath(); g.roundRect(x - width / 2, y - height / 2, width, height, width * 0.42); g.fill();
    glow(g, x, y + height * 0.18, width * 0.7, [255, 240, 190], 0.9 * opacity * (0.8 + 0.2 * Math.sin(t * 5 + i)));
    g.fillStyle = rgba([120, 20, 14], opacity);
    g.fillRect(x - width * 0.26, y - height / 2 - 2 * scale, width * 0.52, 3 * scale);
    g.fillRect(x - width * 0.26, y + height / 2 - scale, width * 0.52, 3 * scale);
    g.strokeStyle = rgba([255, 200, 120], 0.7 * opacity); g.lineWidth = 1; g.beginPath();
    g.moveTo(x, y + height / 2 + 2 * scale); g.lineTo(x + Math.sin(t * 2 + i) * 2, y + height / 2 + 12 * scale); g.stroke();
  });
  for (let i = 0; i < 26; i++) {
    const phase = (t * (0.12 + random(i + 300) * 0.14) + random(i + 330)) % 1;
    const x = random(i + 360) * WIDTH + Math.sin(t + i) * 8;
    const y = SCENE_HEIGHT - phase * SCENE_HEIGHT;
    g.fillStyle = rgba([255, 200, 120], Math.sin(Math.PI * phase) * 0.7 * alpha);
    g.beginPath(); g.arc(x, y, 1.2, 0, TAU); g.fill();
  }
  g.restore();
}

const snowLumps = [[-1, .34], [-.72, .62], [-.42, .86], [-.1, 1], [.22, .94], [.5, .74], [.76, .5], [1, .3]];
function snowCap(g, x, y, progress, alpha) {
  const radius = 24;
  const theta = 1.02 * (0.3 + 0.7 * progress);
  const gain = 0.4 + 0.6 * progress;
  g.save(); g.globalAlpha = alpha * clamp(progress * 6);
  const path = () => {
    g.beginPath();
    snowLumps.forEach(([offset, size]) => {
      const angle = -Math.PI / 2 + offset * theta;
      const r = (3 + 4.6 * size) * gain;
      const arcRadius = radius + r * 0.5 - 1.4;
      const px = x + Math.cos(angle) * arcRadius, py = y + Math.sin(angle) * arcRadius;
      g.moveTo(px + r, py); g.arc(px, py, r, 0, TAU);
    });
    g.moveTo(x + Math.cos(-Math.PI / 2 - theta) * radius, y + Math.sin(-Math.PI / 2 - theta) * radius);
    g.arc(x, y, radius + 2.2 * gain, -Math.PI / 2 - theta, -Math.PI / 2 + theta);
    g.arc(x, y, radius - 1 - 3 * gain, -Math.PI / 2 + theta, -Math.PI / 2 - theta, true);
    g.closePath();
  };
  g.shadowColor = 'rgba(20,40,110,.45)'; g.shadowBlur = 8; g.shadowOffsetY = 3;
  const gradient = g.createLinearGradient(0, y - radius - 10, 0, y - radius + 10);
  gradient.addColorStop(0, '#fff'); gradient.addColorStop(.6, '#eef4ff'); gradient.addColorStop(1, '#c9dafb');
  g.fillStyle = gradient; path(); g.fill();
  g.shadowColor = 'transparent'; g.globalCompositeOperation = 'source-atop';
  glow(g, x - 6, y - radius - 6 * progress, 12, [255, 255, 255], .9);
  g.restore();
}

/** Render one frame. Effects begin only after the user selects a matching holiday. */
export function renderHolidayScene(sceneCanvas, overlayCanvas, elapsed, event, reducedMotion = false) {
  const panel = sceneCanvas.parentElement;
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  for (const canvas of [sceneCanvas, overlayCanvas]) {
    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }
  const scaleX = rect.width / WIDTH;
  const scaleY = rect.height / 648;
  const scene = sceneCanvas.getContext('2d');
  const overlay = overlayCanvas.getContext('2d');
  if (!scene || !overlay) return;
  scene.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
  overlay.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
  scene.clearRect(0, 0, WIDTH, 648);
  overlay.clearRect(0, 0, WIDTH, 648);
  const t = reducedMotion ? 1.25 : elapsed;
  ambient(scene, t, event ? 0.18 : 0.62);
  let flash = 0;
  if (event?.scene === 'snow') {
    glow(scene, 430, 30, 240, [120, 160, 255], .2);
    snow(scene, t, 1, SCENE_HEIGHT, WIDTH, 1);
    snow(overlay, t, .62, 648, WIDTH, .38);
    snowCap(overlay, 364, 520, smooth(.7, 2.9, t), 1);
  } else if (event?.scene === 'fireworks') {
    flash = fireworks(scene, t, 1);
  } else if (event?.scene === 'lanterns') {
    lanterns(scene, t, 1);
  }
  panel.style.setProperty('--calendar-flash', String(flash));
}
