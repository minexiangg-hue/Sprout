// Sprout A3 feature-animation series — shared base (design tokens, engine, assets).
// Assembled into self-contained HTML files by build.mjs. All on-screen copy is English.

export const SHARED_CSS = /* css */ `
@font-face {
  font-family: "Inter";
  src: url(data:font/woff2;base64,__INTER_B64__) format("woff2");
  font-weight: 100 900;
  font-display: block;
}
:root {
  --ink: #26382d;
  --muted: #859084;
  --line: #e6e9df;
  --paper: #fbfcf8;
  --green: #456d39;
  --green-deep: #2f4d27;
  --panel: #f5f7ef;
  --accent: #ffbb54;
  --purple: #9080aa; --purple-bg: #f0edf7;
  --apricot: #ad8c6d; --apricot-bg: #f9f0e6;
  --leaf: #7b9161;   --leaf-bg: #edf3e4;
  --blue: #6e8da3;   --blue-bg: #eaf1f5;
  --r8: 8px; --r11: 11px; --r14: 14px; --r18: 18px;
  --sh-rest: 0 5px 20px #4a693507;
  --sh-hover: 0 16px 40px #27401c0d;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: "Inter", system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.65;
  overflow: hidden;
}
#viewport { position: fixed; inset: 0; background: var(--paper); }
#stage {
  position: absolute; left: 50%; top: 50%;
  width: 1280px; height: 720px;
  transform: translate(-50%, -50%);
  transform-origin: center;
  overflow: hidden;
  background: var(--paper);
  animation: stage-in 0.3s ease-out both;
}
@keyframes stage-in { from { opacity: 0; } to { opacity: 1; } }
#stage > * { position: absolute; }
.ic { display: inline-block; vertical-align: middle; flex-shrink: 0; }

/* ---- shared components ---- */
.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r14);
  box-shadow: var(--sh-rest);
}
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: var(--r14); }
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--green); color: #fff; border: 0; border-radius: var(--r8);
  padding: 10px 18px; font: 600 13px "Inter", system-ui, sans-serif;
  box-shadow: 0 3px 0 var(--green-deep);
  white-space: nowrap;
}
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid var(--line); border-radius: 999px; background: #fff;
  padding: 4px 12px; font: 600 11px "Inter", system-ui, sans-serif; color: var(--muted);
}
.rail {
  width: 56px; background: var(--panel); border-right: 1px solid var(--line);
  display: flex; flex-direction: column; align-items: center; padding: 14px 0; gap: 10px;
}
.rail .rail-btn {
  width: 38px; height: 38px; border-radius: var(--r11);
  display: grid; place-items: center; color: var(--muted); background: transparent;
  border: 1px solid transparent;
}
.rail .rail-btn.active { background: #fff; border-color: var(--line); color: var(--green); box-shadow: var(--sh-rest); }
.tile {
  border-radius: var(--r11); border: 1px solid var(--line);
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  font: 600 13px "Inter", system-ui, sans-serif; box-shadow: var(--sh-rest);
}
.tile .no {
  width: 22px; height: 22px; border-radius: 7px; display: grid; place-items: center;
  color: #fff; font: 700 11px "Inter", system-ui, sans-serif;
}
.tile.k-purple { background: var(--purple-bg); color: var(--purple); }
.tile.k-purple .no { background: var(--purple); }
.tile.k-apricot { background: var(--apricot-bg); color: var(--apricot); }
.tile.k-apricot .no { background: var(--apricot); }
.tile.k-leaf { background: var(--leaf-bg); color: var(--leaf); }
.tile.k-leaf .no { background: var(--leaf); }
.tile.k-blue { background: var(--blue-bg); color: var(--blue); }
.tile.k-blue .no { background: var(--blue); }
.codewin {
  background: #fff; border: 1px solid var(--line); border-radius: var(--r14);
  box-shadow: var(--sh-hover); overflow: hidden; display: flex; flex-direction: column;
}
.codewin .cw-head {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: var(--panel); border-bottom: 1px solid var(--line);
  font: 600 11px "Inter", system-ui, sans-serif; color: var(--muted);
}
.codewin .cw-head .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); }
.codewin pre {
  flex: 1; padding: 12px 14px; overflow: hidden;
  font: 400 10.5px/1.7 ui-monospace, "Cascadia Code", Consolas, monospace;
  color: var(--ink); white-space: pre;
}
.codewin pre .cm { color: var(--muted); }
.codewin pre .kw { color: var(--green); font-weight: 600; }
.codewin pre .st { color: var(--apricot); }
.codewin pre .fn { color: var(--blue); }
.slogan {
  left: 50%; top: 50%; transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  background: #fff; border: 1px solid var(--line); border-radius: var(--r18);
  box-shadow: var(--sh-hover); padding: 34px 52px; text-align: center;
}
.slogan .sl-brand {
  display: flex; align-items: center; gap: 8px;
  font: 600 11px "Inter", system-ui, sans-serif; letter-spacing: 2.5px; color: var(--muted);
}
.slogan h2 {
  font: 750 34px/1.25 "Inter", system-ui, sans-serif; letter-spacing: -0.6px; color: var(--ink);
}
.cursor {
  width: 22px; height: 22px; pointer-events: none; z-index: 60;
  filter: drop-shadow(0 2px 3px #27401c33);
}

/* ---- debug / control chrome (never visible with ?record=1) ---- */
#hud {
  position: fixed; left: 10px; bottom: 10px; z-index: 90;
  font: 400 10px/1.5 ui-monospace, Consolas, monospace; color: var(--muted);
  background: #ffffffee; border: 1px solid var(--line); border-radius: var(--r8);
  padding: 6px 9px; max-width: 430px; white-space: pre-wrap; word-break: break-all;
}
#bar {
  position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 91;
  display: flex; align-items: center; gap: 8px;
  background: #fffffff2; border: 1px solid var(--line); border-radius: 999px;
  box-shadow: var(--sh-hover); padding: 7px 12px;
  font: 500 11px "Inter", system-ui, sans-serif; color: var(--ink);
  transition: opacity 0.25s ease-out;
}
#bar.fade { opacity: 0; pointer-events: none; }
#bar button {
  border: 1px solid var(--line); background: #fff; color: var(--ink);
  border-radius: 999px; padding: 4px 11px; font: 600 11px "Inter", system-ui, sans-serif;
  cursor: pointer;
}
#bar button:hover { background: var(--panel); }
#bar button.on { background: var(--green); border-color: var(--green); color: #fff; }
#bar input {
  width: 52px; border: 1px solid var(--line); border-radius: var(--r8);
  padding: 3px 6px; font: 500 11px "Inter", system-ui, sans-serif; color: var(--ink);
}
#bar .sep { width: 1px; height: 16px; background: var(--line); }
body.record #hud, body.record #bar { display: none; }
@media (prefers-reduced-motion: reduce) {
  #stage { animation: none; }
}
`;

// Inline lucide icons (ISC license — see https://lucide.dev/license). stroke-width 2, round caps.
export const ENGINE_ASSETS_JS = /* js */ `
const ICONS = {
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  code: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  folder: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  settings: '<path d="M14 17H5"/><path d="M19 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  gamepad: '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  wifioff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>'
};
function icon(name, size = 20, sw = 2) {
  return '<svg class="ic" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
}
function mascot(mood, w) {
  const mouth = mood === 'thinking'
    ? '<ellipse cx="122" cy="147" rx="5" ry="4" fill="#24392e"/>'
    : '<path d="M110 145q12 16 24 0" fill="none" stroke="#24392e" stroke-width="4" stroke-linecap="round"/>';
  return '<svg width="' + w + '" height="' + w + '" viewBox="0 0 240 240" role="img" aria-label="Sprout, a green creation sprite with sprout ears">' +
    '<ellipse cx="124" cy="217" rx="68" ry="11" fill="#24392e" opacity=".10"/>' +
    '<path d="M111 65C76 61 59 38 64 17c33-1 55 15 55 43M121 60c0-37 21-53 48-47 0 28-16 49-44 51" fill="#356d49"/>' +
    '<path d="M67 143c-33-5-40 14-30 25 10 9 20 4 37-7m100-27c35-9 46 4 37 18-7 11-19 10-36 0" fill="#a6d765" stroke="#2c4837" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M86 190l-8 23c4 9 24 10 31 0l4-16m31-4 8 22c9 7 26 1 26-6l-11-23" fill="#82b84e" stroke="#2c4837" stroke-width="4"/>' +
    '<path d="M49 130c-1-49 20-75 71-75s78 28 76 76c-2 45-24 69-76 69s-69-24-71-70" fill="#c0e98c" stroke="#2c4837" stroke-width="4"/>' +
    '<path d="M68 103c9-26 26-34 48-35" fill="none" stroke="#e2f6c1" stroke-width="9" stroke-linecap="round"/>' +
    '<ellipse cx="84" cy="146" rx="13" ry="7" fill="#ed9e88" opacity=".8"/>' +
    '<ellipse cx="161" cy="146" rx="13" ry="7" fill="#ed9e88" opacity=".8"/>' +
    '<ellipse cx="94" cy="123" rx="6" ry="9" fill="#24392e"/>' +
    '<ellipse cx="148" cy="123" rx="6" ry="9" fill="#24392e"/>' + mouth +
    '<path d="m186 78 5-12m9 23 12-3" stroke="#6a9655" stroke-width="4" stroke-linecap="round"/>' +
    '</svg>';
}
const CURSOR_SVG = '<svg class="cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6.5 1.5L9 19 5 3z" fill="#26382d" stroke="#fbfcf8" stroke-width="1.6" stroke-linejoin="round"/></svg>';
`;

export const ENGINE_JS = /* js */ `
'use strict';
/* Sprout A3 timeline engine: one rAF clock, declarative beats, full-timeline scaling. */
const Q = new URLSearchParams(location.search);
const qnum = (k, d) => { const v = parseFloat(Q.get(k)); return Number.isFinite(v) && v > 0 ? v : d; };
const BASE = SCENE.base;
const DUR = Math.min(600, qnum('duration', BASE));
const SPEED = Math.min(10, qnum('speed', 1));
const RECORD = Q.get('record') === '1';
const T = DUR / BASE;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BEATS = SCENE.beats;
const TOTAL = BEATS.reduce((m, b) => Math.max(m, b.start + b.dur), 0) * T;
if (RECORD) document.body.classList.add('record');

const stage = document.getElementById('stage');
function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
}
addEventListener('resize', fit); fit();

let t = 0, playing = !(REDUCED && !RECORD), lastStamp = performance.now(), finished = false;
const animStart = performance.now();
const actual = BEATS.map(() => ({}));
const win = i => [BEATS[i].start * T, (BEATS[i].start + BEATS[i].dur) * T];

function cross(prev, next, prevStamp, stamp) {
  BEATS.forEach((b, i) => {
    const [s, e] = win(i);
    for (const [kind, edge] of [['start', s], ['end', e]]) {
      if (prev < edge && next >= edge && actual[i][kind] === undefined) {
        const hit = prevStamp + (edge - prev) / (next - prev) * (stamp - prevStamp);
        actual[i][kind] = +(((hit - animStart) / 1000).toFixed(4));
      }
    }
  });
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const eo = p => 1 - Math.pow(1 - p, 3);
const eio = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const seg = (v, s, e) => clamp((v - s) / (e - s));
const H = {
  T, DUR, SPEED, REDUCED, clamp, lerp, eo, eio, seg, icon, mascot,
  B(i) { const [s, e] = win(i); return { s, e, p: seg(t, s, e) }; },
  float(amp = 6, period = 2.6, phase = 0) { return REDUCED ? 0 : Math.sin((t / period + phase) * Math.PI * 2) * amp; },
  typed(text, p) { return text.slice(0, Math.floor(clamp(p) * text.length)); },
  $(sel) { return stage.querySelector(sel); },
  $all(sel) { return stage.querySelectorAll(sel); }
};

let hudEl = null, barEl = null, lastMove = performance.now(), barHover = false;
function buildChrome() {
  if (RECORD) return;
  hudEl = document.createElement('div'); hudEl.id = 'hud'; document.body.appendChild(hudEl);
  barEl = document.createElement('div'); barEl.id = 'bar';
  const play = document.createElement('button'); play.id = 'bar-play'; play.textContent = 'Pause';
  play.onclick = () => setPlaying(!playing);
  const replay = document.createElement('button'); replay.textContent = 'Replay';
  replay.onclick = () => { t = 0; finished = false; actual.forEach(a => { delete a.start; delete a.end; }); setPlaying(true); };
  barEl.append(play, replay);
  const sep1 = document.createElement('span'); sep1.className = 'sep'; barEl.appendChild(sep1);
  BEATS.forEach((b, i) => {
    const c = document.createElement('button'); c.textContent = (i + 1) + ' ' + (b.content || '').split(' ')[0];
    c.title = b.content || '';
    c.onclick = () => { t = win(i)[0] + 0.001; finished = false; };
    c.dataset.beat = i; barEl.appendChild(c);
  });
  const sep2 = document.createElement('span'); sep2.className = 'sep'; barEl.appendChild(sep2);
  const dIn = document.createElement('input'); dIn.value = DUR; dIn.title = 'duration (s)';
  const sIn = document.createElement('input'); sIn.value = SPEED; sIn.title = 'speed (x)';
  const apply = document.createElement('button'); apply.textContent = 'Apply';
  apply.onclick = () => { Q.set('duration', dIn.value); Q.set('speed', sIn.value); location.search = Q.toString(); };
  barEl.append(dIn, sIn, apply);
  barEl.onmouseenter = () => (barHover = true);
  barEl.onmouseleave = () => (barHover = false);
  document.body.appendChild(barEl);
  addEventListener('mousemove', () => (lastMove = performance.now()));
  addEventListener('keydown', ev => {
    if (ev.target && /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
    if (ev.code === 'Space') { ev.preventDefault(); setPlaying(!playing); }
    if (ev.code === 'ArrowLeft') { t = Math.max(0, t - 1); finished = false; }
    if (ev.code === 'ArrowRight') { t = Math.min(TOTAL, t + 1); }
  });
}
function setPlaying(v) {
  if (v && t >= TOTAL) { t = 0; finished = false; actual.forEach(a => { delete a.start; delete a.end; }); }
  playing = v;
}
function finish() {
  if (finished) return; finished = true;
  const payload = {
    segment: SCENE.id, duration: DUR, speed: SPEED, scale: +T.toFixed(4),
    beats: BEATS.map((b, i) => ({
      content: b.content, scheduledStart: +win(i)[0].toFixed(4), scheduledEnd: +win(i)[1].toFixed(4),
      actualStart: actual[i].start ?? null, actualEnd: actual[i].end ?? null
    })),
    scheduledTotal: +TOTAL.toFixed(4),
    actualTotal: +(((performance.now() - animStart) / 1000).toFixed(4))
  };
  console.log('[sprout-anim ' + SCENE.id + '] ' + JSON.stringify(payload));
  if (hudEl) hudEl.dataset.done = JSON.stringify(payload);
}
function chrome(stamp) {
  if (RECORD) return;
  if (barEl) barEl.classList.toggle('fade', !barHover && playing && stamp - lastMove > 2000);
  const playBtn = document.getElementById('bar-play');
  if (playBtn) playBtn.textContent = playing ? 'Pause' : 'Play';
  if (barEl) barEl.querySelectorAll('[data-beat]').forEach(c => {
    const i = +c.dataset.beat; const [s, e] = win(i);
    c.classList.toggle('on', t >= s && t < e);
  });
  if (hudEl) {
    const bi = BEATS.findIndex((b, i) => t >= win(i)[0] && t < win(i)[1]);
    hudEl.textContent = SCENE.id + '  t=' + t.toFixed(2) + '/' + TOTAL.toFixed(2) + 's  (' + (T * 100).toFixed(0) + '% of base, ' + SPEED + 'x)'
      + (bi >= 0 ? '  beat ' + (bi + 1) + ': ' + BEATS[bi].content : '  —')
      + (hudEl.dataset.done ? '\\n' + hudEl.dataset.done : '');
  }
}
SCENE.mount(H);
function frame(stamp) {
  requestAnimationFrame(frame);
  if (playing && !finished) {
    const next = Math.min(TOTAL, t + ((stamp - lastStamp) / 1000) * SPEED);
    if (next > t) cross(t, next, lastStamp, stamp);
    t = next;
    if (t >= TOTAL) { playing = false; finish(); }
  }
  lastStamp = stamp;
  SCENE.render(t, H);
  chrome(stamp);
}
buildChrome();
SCENE.render(0, H);
requestAnimationFrame(frame);
`;

export function buildShell(meta, sceneCss, sceneHtml, sceneJs, interB64) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<!--
  Sprout A3 feature animation — ${meta.id}: ${meta.title}
  Self-contained: no network, no CDN, no fetch. Open and it plays.
  Query params: ?duration=<seconds>&speed=<multiplier>&record=1
  Icons: lucide (ISC license, https://lucide.dev/license) — inlined as stroke SVG.
  Mascot: inlined from apps/web/src/studio/Mascot.tsx (Sprout, happy/thinking).
-->
<style>${SHARED_CSS.replace('__INTER_B64__', interB64)}</style>
<style>${sceneCss}</style>
</head>
<body>
<div id="viewport"><div id="stage">
${sceneHtml}
</div></div>
<script>${ENGINE_ASSETS_JS}</script>
<script>
${sceneJs}
</script>
<script>${ENGINE_JS}</script>
</body>
</html>
`;
}
