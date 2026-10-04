// A3f — "From first block to real development." (25s).
// STYLIZED ILLUSTRATION of the expert workbench (not a UI recording): the real product
// behind the blocks is a full coding workbench — code graph canvas, project files, agent runs.
export default {
  meta: {
    id: "A3f",
    title: "The tools grow with the kid",
    file: "sprout-feature-A3f-expert-25s.html",
    base: 25,
    slogan: "From first block to real development.",
    localizedDisplay: false,
    illustration: true,
    sourceAssets: [
      "stylized illustration, not UI recording",
      "real capabilities shown: code graph canvas, src file tree, agent run states",
      "module file names from demoModules (scene.html/style.css/main.js/celebrate.js)"
    ]
  },

  css: /* css */ `
#kid-view { left: 0; top: 0; width: 1280px; height: 720px; }
#rail-f { left: 26px; top: 180px; }
#kid-card { left: 340px; top: 250px; width: 520px; padding: 20px 22px; opacity: 0.9; }
#kid-card .kc-line { height: 12px; border-radius: 6px; background: var(--line); margin-bottom: 10px; }
#kid-card .kc-line.short { width: 60%; }
#expert-chip {
  left: 26px; top: 396px; width: 56px; display: flex; flex-direction: column; align-items: center; gap: 4px;
  font: 600 9px "Inter", system-ui, sans-serif; color: var(--green); text-align: center;
}
#expert-chip .ec-btn {
  width: 38px; height: 38px; border-radius: var(--r11); display: grid; place-items: center;
  background: #fff; border: 1px solid var(--line); color: var(--green); box-shadow: var(--sh-rest);
}
#bench { left: 0; top: 0; width: 1280px; height: 720px; opacity: 0; }
#topbar {
  left: 0; top: 0; width: 1280px; height: 52px; background: var(--ink);
  display: flex; align-items: center; gap: 12px; padding: 0 18px;
}
#topbar .tb-logo { width: 22px; height: 22px; border-radius: 8px; background: #d6ecb4; display: grid; place-items: center; color: var(--ink); }
#topbar .tb-chip {
  display: inline-flex; align-items: center; gap: 6px; border-radius: 999px;
  background: #ffffff1f; color: #eef3e6; padding: 4px 12px;
  font: 600 11px "Inter", system-ui, sans-serif;
}
#topbar .tb-right { margin-left: auto; display: flex; gap: 8px; }
#topbar .tb-ghost { color: #b9c4ae; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: #ffffff12; }
#graph { left: 0; top: 52px; width: 1280px; height: 668px; }
#edges-f { position: absolute; left: 0; top: 0; width: 1280px; height: 668px; }
#edges-f path { stroke: var(--muted); stroke-width: 2; fill: none; opacity: 0.55; }
.node {
  position: absolute; width: 150px; height: 58px; padding: 9px 12px;
  display: flex; flex-direction: column; justify-content: center; gap: 2px; opacity: 0;
}
.node .n-name { font: 600 11.5px ui-monospace, Consolas, monospace; color: var(--ink); }
.node .n-kind { font: 500 9px "Inter", system-ui, sans-serif; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
.node .n-status {
  position: absolute; top: -10px; right: -8px; border-radius: 999px; padding: 2px 8px;
  font: 700 9px "Inter", system-ui, sans-serif; color: #fff; opacity: 0; box-shadow: var(--sh-rest);
}
.node.st-planned .n-status { background: var(--muted); }
.node.st-coded .n-status { background: var(--blue); }
.node.st-reviewed .n-status { background: var(--purple); }
.node.st-implemented { border-color: #b8d298; box-shadow: 0 8px 24px #456d3930; }
.node.st-implemented .n-status { background: var(--green); }
#filetree {
  left: 950px; top: 128px; width: 284px; padding: 14px 16px; opacity: 0;
}
#filetree h5 { font: 700 11px ui-monospace, Consolas, monospace; color: var(--muted); letter-spacing: 1px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
#filetree .ft-row {
  display: flex; align-items: center; gap: 8px; border-radius: var(--r8);
  padding: 6px 10px; font: 500 11px ui-monospace, Consolas, monospace; color: var(--ink);
  opacity: 0; border: 1px solid transparent;
}
#filetree .ft-row.hot { background: var(--leaf-bg); border-color: #cfdcc0; }
#cursor-f { left: 0; top: 0; opacity: 0; }
#slogan-f { opacity: 0; }
`,

  html: /* html */ `
<div id="kid-view">
  <div id="rail-f" class="rail">
    <span class="rail-btn active" data-ic="folder" data-sz="19"></span>
    <span class="rail-btn" data-ic="layers" data-sz="19"></span>
    <span class="rail-btn" data-ic="gamepad" data-sz="19"></span>
  </div>
  <div id="expert-chip"><span class="ec-btn" data-ic="code" data-sz="19"></span>Expert mode</div>
  <div id="kid-card" class="card">
    <div class="kc-line"></div>
    <div class="kc-line short"></div>
    <div class="kc-line" style="width:80%"></div>
  </div>
</div>
<div id="bench">
  <div id="topbar">
    <span class="tb-logo" data-ic="sparkles" data-sz="13"></span>
    <span class="tb-chip" data-ic="code" data-sz="13">Expert mode</span>
    <span class="tb-right">
      <span class="tb-ghost" data-ic="folder" data-sz="15"></span>
      <span class="tb-ghost" data-ic="settings" data-sz="15"></span>
    </span>
  </div>
  <div id="graph">
    <svg id="edges-f" viewBox="0 0 1280 668" aria-hidden="true">
      <path data-e="0" d="M 245 208 L 245 330"/>
      <path data-e="1" d="M 320 359 L 440 269"/>
      <path data-e="2" d="M 590 269 L 700 269"/>
      <path data-e="3" d="M 515 298 L 515 480"/>
      <path data-e="4" d="M 590 509 L 700 509"/>
    </svg>
    <div class="node card" data-node="0" style="left:170px;top:150px"><span class="n-name">scene.html</span><span class="n-kind">module</span><span class="n-status"></span></div>
    <div class="node card" data-node="1" style="left:170px;top:330px"><span class="n-name">style.css</span><span class="n-kind">module</span><span class="n-status"></span></div>
    <div class="node card" data-node="2" style="left:440px;top:240px"><span class="n-name">main.js</span><span class="n-kind">module</span><span class="n-status"></span></div>
    <div class="node card" data-node="3" style="left:700px;top:240px"><span class="n-name">celebrate.js</span><span class="n-kind">module</span><span class="n-status"></span></div>
    <div class="node card" data-node="4" style="left:440px;top:480px"><span class="n-name">drawStar()</span><span class="n-kind">function</span><span class="n-status"></span></div>
    <div class="node card" data-node="5" style="left:700px;top:480px"><span class="n-name">frame()</span><span class="n-kind">function</span><span class="n-status"></span></div>
  </div>
  <div id="filetree" class="card">
    <h5><span data-ic="folder" data-sz="13"></span>src/</h5>
    <div class="ft-row" data-row="0"><span data-ic="code" data-sz="13"></span>scene.html</div>
    <div class="ft-row" data-row="1"><span data-ic="code" data-sz="13"></span>style.css</div>
    <div class="ft-row" data-row="2"><span data-ic="code" data-sz="13"></span>main.js</div>
    <div class="ft-row" data-row="3"><span data-ic="code" data-sz="13"></span>celebrate.js</div>
  </div>
</div>
<div id="cursor-f"></div>
<div class="slogan" id="slogan-f">
  <span class="sl-brand"><span data-ic="code" data-sz="14"></span>SPROUT</span>
  <h2>From first block to real development.</h2>
</div>
`,

  js: /* js */ `
const STATUS = ['Planned', 'Coded', 'Reviewed', 'Implemented'];
const STATUS_CLASS = ['st-planned', 'st-coded', 'st-reviewed', 'st-implemented'];
const NODE_TO_ROW = { 0: 0, 1: 1, 2: 2, 3: 3 };
const SCENE = {
  id: 'A3f', base: 25,
  beats: [
    { start: 0, dur: 4, content: 'Switch into Expert mode' },
    { start: 4, dur: 6, content: 'Code graph canvas opens' },
    { start: 10, dur: 6, content: 'Project unbundles into a src file tree' },
    { start: 16, dur: 6, content: 'Agent run: Planned to Implemented' },
    { start: 22, dur: 3, content: 'Slogan card' }
  ],
  mount(H) {
    H.$all('[data-ic]').forEach(el => { el.insertAdjacentHTML('afterbegin', H.icon(el.dataset.ic, +(el.dataset.sz || 18))); });
    H.$all('#edges-f path').forEach(p => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    });
    H.$('#cursor-f').innerHTML = CURSOR_SVG;
  },
  render(t, H) {
    const b0 = H.B(0), b1 = H.B(1), b2 = H.B(2), b3 = H.B(3), b4 = H.B(4);
    const fadeAll = 1 - H.eio(b4.p);

    const kidOut = H.eio(H.seg(t, 1.8 * H.T, 3.1 * H.T));
    const kid = H.$('#kid-view');
    kid.style.opacity = 1 - kidOut;
    kid.style.transform = 'translateX(' + H.lerp(0, -60, kidOut) + 'px)';

    const cur = H.$('#cursor-f');
    const cIn = H.eio(H.seg(t, 0.3 * H.T, 1.3 * H.T));
    const cOut = H.eio(H.seg(t, 1.9 * H.T, 2.4 * H.T));
    cur.style.opacity = cIn * (1 - cOut);
    cur.style.transform = 'translate(' + H.lerp(520, 46, cIn) + 'px,' + H.lerp(470, 408, cIn) + 'px)';
    const dip = Math.sin(H.clamp(H.seg(t, 1.3 * H.T, 1.7 * H.T)) * Math.PI);
    H.$('#expert-chip').style.transform = 'scale(' + (1 - 0.08 * dip) + ')';

    const benchIn = H.eo(H.seg(t, 2.2 * H.T, 3.6 * H.T));
    const bench = H.$('#bench');
    bench.style.opacity = benchIn * fadeAll;
    H.$('#topbar').style.transform = 'translateY(' + H.lerp(-52, 0, H.eo(H.seg(t, 2.2 * H.T, 3.2 * H.T))) + 'px)';

    const pan = H.lerp(50, -46, H.eio(H.seg(t, b1.s, b3.e)));
    H.$('#graph').style.transform = 'translateX(' + pan + 'px)';

    H.$all('.node').forEach((n, i) => {
      const enter = H.eo(H.seg(t, b1.s + (0.4 + i * 0.35) * H.T, b1.s + (1.3 + i * 0.35) * H.T));
      n.style.opacity = enter;
      n.style.transform = 'translateY(' + (H.lerp(14, 0, enter) + H.float(2, 3, i * 0.2)) + 'px)';
    });
    H.$all('#edges-f path').forEach((p, i) => {
      const len = p.getTotalLength();
      const q = H.eio(H.seg(t, b1.s + (1.2 + i * 0.4) * H.T, b1.s + (2.0 + i * 0.4) * H.T));
      p.style.strokeDashoffset = len * (1 - q);
    });

    const ft = H.eo(H.seg(t, b2.s + 0.3 * H.T, b2.s + 1.3 * H.T));
    const tree = H.$('#filetree');
    tree.style.opacity = ft;
    tree.style.transform = 'translateX(' + H.lerp(40, 0, ft) + 'px)';
    H.$all('#filetree .ft-row').forEach((row, i) => {
      const p = H.eo(H.seg(t, b2.s + (1.0 + i * 0.7) * H.T, b2.s + (1.6 + i * 0.7) * H.T));
      row.style.opacity = p;
      row.style.transform = 'translateY(' + H.lerp(8, 0, p) + 'px)';
      const hot = H.seg(t, b2.s + (1.6 + i * 0.7) * H.T, b2.s + (2.3 + i * 0.7) * H.T);
      row.classList.toggle('hot', hot > 0 && hot < 1);
      const node = document.querySelector('.node[data-node="' + i + '"]');
      if (node) node.style.boxShadow = hot > 0 && hot < 1 ? '0 0 0 3px #ffbb5459, var(--sh-hover)' : '';
    });

    H.$all('.node').forEach((n, i) => {
      const startAt = b3.s + 0.4 * H.T + i * 0.4 * H.T;
      const step = Math.floor((t - startAt) / (1.15 * H.T));
      const s = H.clamp(step, -1, 3);
      n.classList.remove(...STATUS_CLASS);
      const pill = n.querySelector('.n-status');
      if (s >= 0 && t < b4.s) {
        n.classList.add(STATUS_CLASS[s]);
        pill.textContent = STATUS[s];
        pill.style.opacity = 1;
      } else {
        pill.style.opacity = 0;
        n.style.boxShadow = '';
      }
    });

    const s = H.$('#slogan-f');
    const sp = H.eo(b4.p);
    s.style.opacity = sp;
    s.style.transform = 'translate(-50%,-50%) translateY(' + H.lerp(12, 0, sp) + 'px) scale(' + H.lerp(0.97, 1, sp) + ')';
  }
};
`
};
