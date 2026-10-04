// A3b — "Every block does one small thing." (12s). One idea sprouts into four blocks.
export default {
  meta: {
    id: "A3b",
    title: "One idea, four blocks",
    file: "sprout-feature-A3b-blocks-12s.html",
    base: 12,
    slogan: "Every block does one small thing.",
    localizedDisplay: false,
    illustration: false,
    sourceAssets: ["Mascot.tsx", "studio.css tokens", "block palette", "lucide icons (ISC)"]
  },

  css: /* css */ `
#mascot-b { left: 190px; top: 300px; }
#mascot-b .mood { position: absolute; left: 0; top: 0; transition: none; }
#bubble {
  left: 330px; top: 150px; width: 320px; padding: 16px 18px;
  display: flex; align-items: center; gap: 10px;
  font: 500 14px/1.6 "Inter", system-ui, sans-serif; color: var(--ink);
}
#bubble::after {
  content: ""; position: absolute; left: 34px; bottom: -9px; width: 18px; height: 18px;
  background: #fff; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line);
  transform: rotate(45deg); border-bottom-right-radius: 4px;
}
#bubble .b-ic { color: var(--accent); flex-shrink: 0; }
.tile-b { position: absolute; width: 210px; opacity: 0; }
#arrows-b { left: 0; top: 0; width: 1280px; height: 720px; pointer-events: none; }
#arrows-b path { stroke: var(--muted); stroke-width: 2; fill: none; stroke-linecap: round; }
#arrows-b .ahead { stroke: var(--leaf); }
#slogan-b { opacity: 0; }
`,

  html: /* html */ `
<div id="mascot-b">
  <div class="mood" id="mood-think" data-mascot="thinking" data-w="180"></div>
  <div class="mood" id="mood-happy" data-mascot="happy" data-w="180"></div>
</div>
<div id="bubble" class="card"><span class="b-ic" data-ic="sparkles" data-sz="20"></span><span>A star-catching game, with a target and a celebration.</span></div>
<div class="tile tile-b k-purple" data-slot="0"><span class="no">1</span>Scene</div>
<div class="tile tile-b k-apricot" data-slot="1"><span class="no">2</span>Style</div>
<div class="tile tile-b k-leaf" data-slot="2"><span class="no">3</span>Gameplay</div>
<div class="tile tile-b k-blue" data-slot="3"><span class="no">4</span>Celebration</div>
<svg id="arrows-b" viewBox="0 0 1280 720" aria-hidden="true">
  <path data-ar="0" d="M 404 452 L 416 452 M 410 447 L 416 452 L 410 457"/>
  <path data-ar="1" d="M 638 452 L 650 452 M 644 447 L 650 452 L 644 457"/>
  <path data-ar="2" d="M 872 452 L 884 452 M 878 447 L 884 452 L 878 457"/>
</svg>
<div class="slogan" id="slogan-b">
  <span class="sl-brand"><span data-ic="layers" data-sz="14"></span>SPROUT</span>
  <h2>Every block does one small thing.</h2>
</div>
`,

  js: /* js */ `
const SLOTS = [184, 418, 652, 886];
const SLOT_Y = 430;
const SCENE = {
  id: 'A3b', base: 12,
  beats: [
    { start: 0, dur: 2, content: 'Idea bubble flies to Sprout' },
    { start: 2, dur: 4, content: 'Bubble sprouts into four blocks' },
    { start: 6, dur: 4, content: 'Blocks line up with arrows' },
    { start: 10, dur: 2, content: 'Slogan card' }
  ],
  mount(H) {
    H.$all('[data-ic]').forEach(el => { el.innerHTML = H.icon(el.dataset.ic, +(el.dataset.sz || 18)); });
    H.$all('[data-mascot]').forEach(el => { el.innerHTML = H.mascot(el.dataset.mascot, +(el.dataset.w || 160)); });
    H.$all('#arrows-b path').forEach(p => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    });
  },
  render(t, H) {
    const b0 = H.B(0), b1 = H.B(1), b2 = H.B(2), b3 = H.B(3);
    const fadeAll = 1 - H.eio(b3.p);

    const bp = H.eio(b0.p);
    const bubble = H.$('#bubble');
    const shrink = H.eio(H.seg(t, b1.s, b1.s + 0.7 * H.T));
    bubble.style.opacity = H.clamp(bp * 1.4) * (1 - shrink) * fadeAll;
    const bx = H.lerp(-360, 0, bp), by = H.lerp(60, 0, bp);
    bubble.style.transform = 'translate(' + bx + 'px,' + by + 'px) scale(' + H.lerp(1, 0.35, shrink) + ')';

    H.$('#mood-think').style.opacity = fadeAll * (1 - H.eio(H.seg(t, b2.s, b2.s + 0.4 * H.T)));
    H.$('#mood-happy').style.opacity = fadeAll * H.eio(H.seg(t, b2.s, b2.s + 0.4 * H.T));
    H.$('#mascot-b').style.transform = 'translateY(' + H.float(4, 3) + 'px)';

    H.$all('.tile-b').forEach((tile, i) => {
      const delay = i * 0.15 * H.T;
      const p = H.eo(H.seg(t, b1.s + 0.5 * H.T + delay, b1.s + 1.7 * H.T + delay));
      const fromX = 490 - SLOTS[i], fromY = 190 - SLOT_Y;
      const arc = Math.sin(p * Math.PI) * -70;
      const x = H.lerp(fromX, 0, p), y = H.lerp(fromY, 0, p) + arc * (1 - p * 0.3);
      const settle = 1 + 0.03 * Math.sin(H.clamp(H.seg(t, b2.s + i * 0.2 * H.T, b2.s + 0.9 * H.T + i * 0.2 * H.T)) * Math.PI);
      tile.style.left = SLOTS[i] + 'px';
      tile.style.top = SLOT_Y + 'px';
      tile.style.opacity = p * fadeAll;
      tile.style.transform = 'translate(' + x + 'px,' + (y + H.float(3, 2.8, i * 0.25)) + 'px) scale(' + (H.lerp(0.2, 1, p) * settle) + ')';
    });

    H.$all('#arrows-b path').forEach((p, i) => {
      const len = p.getTotalLength();
      const q = H.eio(H.seg(t, b2.s + 0.6 * H.T + i * 0.55 * H.T, b2.s + 1.4 * H.T + i * 0.55 * H.T));
      p.style.strokeDashoffset = len * (1 - q);
      p.style.opacity = fadeAll;
    });

    const s = H.$('#slogan-b');
    const sp = H.eo(b3.p);
    s.style.opacity = sp;
    s.style.transform = 'translate(-50%,-50%) translateY(' + H.lerp(12, 0, sp) + 'px) scale(' + H.lerp(0.97, 1, sp) + ')';
  }
};
`
};
