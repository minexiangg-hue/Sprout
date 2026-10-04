// A3a — "Just write the idea." (8s). A quiet start: one input box, no门槛.
export default {
  meta: {
    id: "A3a",
    title: "A quiet start — one idea box",
    file: "sprout-feature-A3a-idea-8s.html",
    base: 8,
    slogan: "Just write the idea.",
    localizedDisplay: false,
    illustration: false,
    sourceAssets: ["Mascot.tsx", "studio.css tokens", "lucide icons (ISC)"]
  },

  css: /* css */ `
#rail-a { left: 26px; top: 196px; }
#rail-a .rail-btn { opacity: 0; }
#idea-card { left: 340px; top: 236px; width: 600px; padding: 22px; opacity: 0; }
#idea-card .idea-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
#idea-box {
  position: relative; background: var(--panel); border: 1px solid var(--line);
  border-radius: var(--r11); min-height: 92px; padding: 14px 16px;
  font: 500 15px/1.65 "Inter", system-ui, sans-serif; color: var(--ink);
}
#idea-ph { color: var(--muted); }
#caret {
  display: inline-block; width: 2px; height: 18px; background: var(--green);
  vertical-align: -3px; margin-left: 1px;
}
#idea-card .idea-actions { display: flex; justify-content: flex-end; margin-top: 14px; }
#mascot-a { left: 1010px; top: 336px; opacity: 0; }
#focus-ring {
  left: 332px; top: 228px; width: 616px; height: 232px;
  border-radius: var(--r18); border: 3px solid #456d3959; opacity: 0; pointer-events: none;
}
#slogan-a { opacity: 0; }
`,

  html: /* html */ `
<div id="rail-a" class="rail">
  <span class="rail-btn active" data-ic="folder" data-sz="19"></span>
  <span class="rail-btn" data-ic="layers" data-sz="19"></span>
  <span class="rail-btn" data-ic="gamepad" data-sz="19"></span>
  <span class="rail-btn" data-ic="settings" data-sz="19"></span>
</div>
<div id="idea-card" class="card">
  <div class="idea-top">
    <span class="chip" data-ic="wand" data-sz="14">&nbsp;New idea</span>
    <span class="chip" data-ic="bulb" data-sz="14">&nbsp;Give me a spark</span>
  </div>
  <div id="idea-box"><span id="idea-text"></span><span id="caret"></span><span id="idea-ph">Write an idea…</span></div>
  <div class="idea-actions"><button class="btn-primary" id="sprout-btn"><span data-ic="sparkles" data-sz="15"></span>Sprout it!</button></div>
</div>
<div id="focus-ring"></div>
<div id="mascot-a" data-mascot="happy" data-w="170"></div>
<div class="slogan" id="slogan-a">
  <span class="sl-brand"><span data-ic="sparkles" data-sz="14"></span>SPROUT</span>
  <h2>Just write the idea.</h2>
</div>
`,

  js: /* js */ `
const IDEA = 'I want to make a star-catching game…';
const SCENE = {
  id: 'A3a', base: 8,
  beats: [
    { start: 0, dur: 2, content: 'Home scene entrance' },
    { start: 2, dur: 3, content: 'Idea typed into the box' },
    { start: 5, dur: 2.5, content: 'Input takes focus' },
    { start: 7.5, dur: 0.5, content: 'Slogan card' }
  ],
  mount(H) {
    H.$all('[data-ic]').forEach(el => { el.insertAdjacentHTML('afterbegin', H.icon(el.dataset.ic, +(el.dataset.sz || 18))); });
    H.$all('[data-mascot]').forEach(el => { el.innerHTML = H.mascot(el.dataset.mascot, +(el.dataset.w || 160)); });
  },
  render(t, H) {
    const b0 = H.B(0), b1 = H.B(1), b2 = H.B(2), b3 = H.B(3);

    H.$all('#rail-a .rail-btn').forEach((el, i) => {
      const p = H.eo(H.seg(t, 0.25 + i * 0.12 * H.T, 0.85 + i * 0.12 * H.T));
      el.style.opacity = p * (1 - 0.55 * H.eio(b2.p)) * (1 - b3.p);
      el.style.transform = 'translateX(' + H.lerp(-12, 0, p) + 'px)';
    });

    const cardIn = H.eo(H.seg(t, 0.35 * H.T, 1.5 * H.T));
    const focus = H.eio(b2.p);
    const card = H.$('#idea-card');
    card.style.opacity = cardIn * (1 - b3.p);
    card.style.transform = 'translateY(' + (H.lerp(18, 0, cardIn) - 6 * focus) + 'px)';
    card.style.boxShadow = focus > 0.02
      ? '0 ' + (5 + 11 * focus) + 'px ' + (20 + 20 * focus) + 'px #27401c' + (focus > 0.5 ? '14' : '0a')
      : 'var(--sh-rest)';

    const typed = H.typed(IDEA, b1.p);
    H.$('#idea-text').textContent = typed;
    H.$('#idea-ph').style.display = typed.length ? 'none' : 'inline';
    H.$('#caret').style.opacity = (b1.p >= 1 && b2.p > 0.4) ? 0 : (Math.floor(t * 1.6) % 2 ? 0 : 1);

    const ring = H.$('#focus-ring');
    ring.style.opacity = focus * (1 - b3.p);
    ring.style.transform = 'translateY(' + -6 * focus + 'px)';

    const mIn = H.eo(H.seg(t, 0.6 * H.T, 1.7 * H.T));
    const m = H.$('#mascot-a');
    m.style.opacity = mIn * (1 - 0.55 * focus) * (1 - b3.p);
    m.style.transform = 'translateY(' + (H.lerp(14, 0, mIn) + H.float(4, 3)) + 'px)';

    const s = H.$('#slogan-a');
    const sp = H.eo(b3.p);
    s.style.opacity = sp;
    s.style.transform = 'translate(-50%,-50%) translateY(' + H.lerp(12, 0, sp) + 'px) scale(' + H.lerp(0.97, 1, sp) + ')';
  }
};
`
};
