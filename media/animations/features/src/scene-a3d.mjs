// A3d — "One number changes the whole world." (12s).
// The mini game inside the dome is the REAL star-catcher (see src/game-doc.html):
// scenes["star-catcher"] + css + starLogic + celebrate from templates.ts, display copy localized.
export default {
  meta: {
    id: "A3d",
    title: "Play it, then tweak it",
    file: "sprout-feature-A3d-play-12s.html",
    base: 12,
    slogan: "One number changes the whole world.",
    localizedDisplay: true,
    illustration: false,
    sourceAssets: [
      "src/game-doc.html = templates.ts scenes[star-catcher] + css + starLogic + celebrate",
      "display copy localized to English; demo autopilot driver marked in game-doc.html"
    ]
  },

  css: /* css */ `
#dome-bench {
  left: 60px; top: 96px; width: 596px; height: 480px;
  display: grid; place-items: center; overflow: visible;
}
#game-frame {
  width: 564px; height: 444px; border-radius: var(--r14); overflow: hidden;
  border: 1px solid var(--line); box-shadow: var(--sh-hover); background: #f8f5ed;
}
#game-frame iframe { width: 720px; height: 566px; border: 0; transform: scale(0.7833); transform-origin: top left; }
#dome-glass {
  left: 44px; top: 80px; width: 628px; height: 512px; border-radius: 120px 120px 26px 26px;
  border: 2px solid #ffffff; outline: 1px solid var(--line);
  background: linear-gradient(160deg, #ffffff3d 0%, #ffffff08 34%, #ffffff00 60%);
  box-shadow: inset 0 0 60px #ffffff26, 0 16px 40px #27401c0d;
  pointer-events: none;
}
#dome-glass::after {
  content: ""; position: absolute; left: 60px; top: 26px; width: 200px; height: 90px;
  border-radius: 50%; background: radial-gradient(#ffffff59, #ffffff00 70%);
}
#param-panel {
  left: 726px; top: 176px; width: 340px; padding: 20px 22px; opacity: 0;
}
#param-panel h4 { font: 700 13px "Inter", system-ui, sans-serif; letter-spacing: -0.2px; margin-bottom: 16px; }
.pp-row { margin-bottom: 18px; }
.pp-row label { display: flex; justify-content: space-between; font: 600 11px "Inter", system-ui, sans-serif; color: var(--muted); margin-bottom: 8px; }
.pp-row label output { color: var(--ink); font-weight: 700; }
.pp-track { position: relative; height: 6px; border-radius: 3px; background: var(--line); }
.pp-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; background: var(--green); }
.pp-thumb {
  position: absolute; top: 50%; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 2px solid var(--green); box-shadow: var(--sh-rest);
  transform: translate(-50%, -50%);
}
.pp-dots { display: flex; gap: 12px; }
.pp-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; position: relative; }
.pp-dot.sel::after {
  content: ""; position: absolute; inset: -6px; border-radius: 50%;
  border: 2px solid var(--green);
}
#cursor-d { left: 0; top: 0; opacity: 0; }
#slogan-d { opacity: 0; }
`,

  html: /* html */ `
<div id="dome-bench" class="panel">
  <div id="game-frame"></div>
</div>
<div id="dome-glass"></div>
<div id="param-panel" class="card">
  <h4>Tune the challenge</h4>
  <div class="pp-row">
    <label>Target <output id="pp-target">10</output></label>
    <div class="pp-track" id="pp-track"><div class="pp-fill" id="pp-fill"></div><div class="pp-thumb" id="pp-thumb"></div></div>
  </div>
  <div class="pp-row">
    <label>Theme</label>
    <div class="pp-dots">
      <span class="pp-dot sel" data-c="#7b9161" style="background:#7b9161"></span>
      <span class="pp-dot" data-c="#ad8c6d" style="background:#ad8c6d"></span>
      <span class="pp-dot" data-c="#ffbb54" style="background:#ffbb54"></span>
    </div>
  </div>
</div>
<div id="cursor-d"></div>
<div class="slogan" id="slogan-d">
  <span class="sl-brand"><span data-ic="gamepad" data-sz="14"></span>SPROUT</span>
  <h2>One number changes the whole world.</h2>
</div>
`,

  js: /* js */ `
const GAME_B64 = '__GAME_DOC_B64__';
const SCENE = {
  id: 'A3d', base: 12,
  beats: [
    { start: 0, dur: 5, content: 'Real game runs inside the safety dome' },
    { start: 5, dur: 4, content: 'Target 10 to 5, theme recolor' },
    { start: 9, dur: 3, content: 'Slogan card' }
  ],
  applied: {},
  mount(H) {
    H.$all('[data-ic]').forEach(el => { el.innerHTML = H.icon(el.dataset.ic, +(el.dataset.sz || 18)); });
    const doc = new TextDecoder().decode(Uint8Array.from(atob(GAME_B64), c => c.charCodeAt(0)));
    const frame = H.$('#game-frame');
    const ifr = document.createElement('iframe');
    ifr.setAttribute('title', 'Star Catcher demo running real product code');
    ifr.srcdoc = doc;
    frame.appendChild(ifr);
    this.ifr = ifr;
    H.$('#cursor-d').innerHTML = CURSOR_SVG;
  },
  game() { try { return this.ifr.contentWindow; } catch (e) { return null; } },
  applyTarget(v) {
    const w = this.game(); if (!w || !w.SPROUT_CONFIG) return;
    w.SPROUT_CONFIG.target = v;
    const el = w.document.getElementById('target'); if (el) el.textContent = v;
  },
  applyAccent(c) {
    const w = this.game(); if (!w || !w.SPROUT_CONFIG) return;
    w.SPROUT_CONFIG.accent = c;
    w.document.documentElement.style.setProperty('--accent', c);
  },
  render(t, H) {
    const b0 = H.B(0), b1 = H.B(1), b2 = H.B(2);
    const fadeAll = 1 - H.eio(b2.p);

    const inP = H.eo(H.seg(t, 0.1 * H.T, 1.1 * H.T));
    const bench = H.$('#dome-bench'), glass = H.$('#dome-glass');
    bench.style.opacity = inP * fadeAll;
    glass.style.opacity = inP * 0.9 * fadeAll;
    bench.style.transform = 'translateY(' + (H.lerp(20, 0, inP) + H.float(3, 3.2)) + 'px)';
    glass.style.transform = bench.style.transform;

    const pp = H.eo(H.seg(t, b1.s + 0.2 * H.T, b1.s + 1.1 * H.T));
    const panel = H.$('#param-panel');
    panel.style.opacity = pp * fadeAll;
    panel.style.transform = 'translateX(' + H.lerp(46, 0, pp) + 'px)';

    if (t < b1.s && this.applied.done) {
      this.applied = {};
      this.applyTarget(10); this.applyAccent('#7b9161');
    }

    const dragP = H.eio(H.seg(t, b1.s + 1.2 * H.T, b1.s + 2.6 * H.T));
    const val = Math.round(H.lerp(10, 5, dragP));
    H.$('#pp-target').textContent = val;
    const trackW = 296;
    const frac = (10 - val) / 8;
    H.$('#pp-fill').style.width = (frac * trackW) + 'px';
    H.$('#pp-thumb').style.left = (frac * trackW) + 'px';
    if (val <= 5 && !this.applied.target) { this.applied.target = true; this.applyTarget(5); }

    const recolor = H.eio(H.seg(t, b1.s + 3.0 * H.T, b1.s + 3.5 * H.T));
    if (recolor > 0.9 && !this.applied.accent) { this.applied.accent = true; this.applyAccent('#ffbb54'); }
    H.$all('.pp-dot').forEach(d => {
      const sel = recolor < 0.5 ? d.dataset.c === '#7b9161' : d.dataset.c === '#ffbb54';
      d.classList.toggle('sel', sel);
    });

    const cur = H.$('#cursor-d');
    let cx = 0, cy = 0, co = 0;
    const p1 = H.eio(H.seg(t, b1.s + 0.6 * H.T, b1.s + 1.2 * H.T));
    const p2 = H.eio(H.seg(t, b1.s + 2.6 * H.T, b1.s + 3.0 * H.T));
    const p3 = H.eio(H.seg(t, b1.s + 3.5 * H.T, b1.s + 3.9 * H.T));
    const thumbX = 748 + frac * trackW, thumbY = 262;
    const dotX = 852, dotY = 338;
    if (t > b1.s + 0.4 * H.T && t < b1.e) {
      co = (1 - p3) * fadeAll;
      const ax = H.lerp(980, thumbX, p1);
      const ay = H.lerp(430, thumbY, p1);
      const bx = H.lerp(thumbX, 748 + (5 / 8) * trackW, dragP);
      const dx = H.lerp(bx, dotX, p2), dy = H.lerp(thumbY, dotY, p2);
      cx = p2 < 1 ? H.lerp(ax, dx, p2) : dotX;
      cy = p2 < 1 ? H.lerp(ay, dy, p2) : dotY;
      if (dragP > 0 && p2 === 0) { cx = bx; cy = thumbY; }
    }
    cur.style.opacity = co;
    cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';

    const s = H.$('#slogan-d');
    const sp = H.eo(b2.p);
    s.style.opacity = sp;
    s.style.transform = 'translate(-50%,-50%) translateY(' + H.lerp(12, 0, sp) + 'px) scale(' + H.lerp(0.97, 1, sp) + ')';
  }
};
`
};
