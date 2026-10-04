// A3e — "Offline. Portable. Truly yours." (8s).
// The exported window runs the same real star-catcher doc (src/game-doc.html).
export default {
  meta: {
    id: "A3e",
    title: "The work belongs to the kid",
    file: "sprout-feature-A3e-export-8s.html",
    base: 8,
    slogan: "Offline. Portable. Truly yours.",
    localizedDisplay: true,
    illustration: false,
    sourceAssets: [
      "src/game-doc.html = templates.ts scenes[star-catcher] + css + starLogic + celebrate",
      "display copy localized to English"
    ]
  },

  css: /* css */ `
#proj-card { left: 96px; top: 196px; width: 380px; padding: 20px 22px; }
#proj-card h3 { font: 700 16px "Inter", system-ui, sans-serif; letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
#proj-card .pc-sub { font: 500 11px "Inter", system-ui, sans-serif; color: var(--muted); margin: 4px 0 14px; }
#pc-thumb {
  height: 150px; border-radius: var(--r11); background: #172d38; position: relative; overflow: hidden;
  margin-bottom: 16px; border: 1px solid var(--line);
}
#pc-thumb .th-star { position: absolute; width: 20px; height: 20px; }
#pc-thumb .th-basket { position: absolute; bottom: 10px; left: 40%; width: 56px; height: 15px; border-radius: 8px; background: #7b9161; }
#export-row { display: flex; align-items: center; gap: 10px; }
#file-chip { opacity: 0; }
#dl-icon { position: absolute; left: 318px; top: 420px; color: var(--green); opacity: 0; }
#browser {
  left: 560px; top: 118px; width: 620px; height: 486px; opacity: 0;
  display: flex; flex-direction: column; overflow: hidden; padding: 0;
}
#browser .br-chrome {
  display: flex; align-items: center; gap: 8px; padding: 9px 12px;
  background: var(--panel); border-bottom: 1px solid var(--line); flex-shrink: 0;
}
#browser .br-chrome .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--line); }
#browser .br-addr {
  flex: 1; display: flex; align-items: center; gap: 6px;
  background: #fff; border: 1px solid var(--line); border-radius: 999px;
  padding: 4px 12px; font: 500 10.5px "Inter", system-ui, sans-serif; color: var(--muted);
}
#browser .br-off { color: var(--apricot); display: grid; place-items: center; }
#browser .br-body { flex: 1; overflow: hidden; background: #f8f5ed; }
#browser iframe { width: 780px; height: 618px; border: 0; transform: scale(0.7564); transform-origin: top left; }
#cursor-e { left: 0; top: 0; opacity: 0; }
#slogan-e { opacity: 0; }
`,

  html: /* html */ `
<div id="proj-card" class="card">
  <h3><span data-ic="gamepad" data-sz="18"></span>Star Catcher</h3>
  <p class="pc-sub">4 blocks · built with Sprout</p>
  <div id="pc-thumb">
    <svg class="th-star" style="left:26%;top:18%" viewBox="0 0 24 24"><path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16l-5.8 3.6 1.6-6.5-5.1-4.4 6.7-.5z" fill="#ffd46b"/></svg>
    <svg class="th-star" style="left:60%;top:38%" viewBox="0 0 24 24"><path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16l-5.8 3.6 1.6-6.5-5.1-4.4 6.7-.5z" fill="#ffd46b"/></svg>
    <svg class="th-star" style="left:44%;top:60%" viewBox="0 0 24 24"><path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16l-5.8 3.6 1.6-6.5-5.1-4.4 6.7-.5z" fill="#ffd46b"/></svg>
    <div class="th-basket"></div>
  </div>
  <div id="export-row">
    <button class="btn-primary" id="export-btn"><span data-ic="download" data-sz="15"></span>Export project</button>
    <span class="chip" id="file-chip">star-catcher.html</span>
  </div>
</div>
<div id="dl-icon" data-ic="download" data-sz="26"></div>
<div id="browser" class="card">
  <div class="br-chrome">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    <span class="br-addr">file:///star-catcher.html</span>
    <span class="br-off" data-ic="wifioff" data-sz="17"></span>
  </div>
  <div class="br-body" id="br-body"></div>
</div>
<div id="cursor-e"></div>
<div class="slogan" id="slogan-e">
  <span class="sl-brand"><span data-ic="download" data-sz="14"></span>SPROUT</span>
  <h2>Offline. Portable. Truly yours.</h2>
</div>
`,

  js: /* js */ `
const GAME_B64 = '__GAME_DOC_B64__';
const SCENE = {
  id: 'A3e', base: 8,
  beats: [
    { start: 0, dur: 2, content: 'Export project clicked' },
    { start: 2, dur: 3, content: 'Project graduates into an offline page' },
    { start: 5, dur: 3, content: 'Slogan card' }
  ],
  mount(H) {
    H.$all('[data-ic]').forEach(el => { el.innerHTML = H.icon(el.dataset.ic, +(el.dataset.sz || 18)); });
    const doc = new TextDecoder().decode(Uint8Array.from(atob(GAME_B64), c => c.charCodeAt(0)));
    const ifr = document.createElement('iframe');
    ifr.setAttribute('title', 'Exported Star Catcher running offline');
    ifr.srcdoc = doc;
    H.$('#br-body').appendChild(ifr);
    H.$('#cursor-e').innerHTML = CURSOR_SVG;
  },
  render(t, H) {
    const b0 = H.B(0), b1 = H.B(1), b2 = H.B(2);
    const fadeAll = 1 - H.eio(b2.p);

    const cardIn = H.eo(H.seg(t, 0, 0.7 * H.T));
    const grad = H.eio(H.seg(t, b1.s + 0.4 * H.T, b1.s + 1.4 * H.T));
    const card = H.$('#proj-card');
    card.style.opacity = cardIn * (1 - 0.75 * grad) * fadeAll;
    card.style.transform = 'translate(' + H.lerp(0, -30, grad) + 'px,' + H.lerp(16, 0, cardIn) + 'px) scale(' + H.lerp(1, 0.94, grad) + ')';

    const clickP = H.eio(H.seg(t, 0.9 * H.T, 1.15 * H.T));
    const dip = Math.sin(H.clamp(clickP) * Math.PI);
    H.$('#export-btn').style.transform = 'translateY(' + (2 * dip) + 'px)';
    H.$('#export-btn').style.boxShadow = '0 ' + (3 - 2 * dip) + 'px 0 var(--green-deep)';

    const dlP = H.eo(H.seg(t, 1.15 * H.T, 1.7 * H.T));
    const dl = H.$('#dl-icon');
    dl.style.opacity = (dlP > 0 && dlP < 1 ? 1 : 0) * fadeAll;
    dl.style.transform = 'translateY(' + H.lerp(-26, 6, dlP) + 'px)';
    const chipP = H.eo(H.seg(t, 1.6 * H.T, 2.0 * H.T));
    H.$('#file-chip').style.opacity = chipP;
    H.$('#file-chip').style.transform = 'translateY(' + H.lerp(6, 0, chipP) + 'px)';

    const win = H.eo(H.seg(t, b1.s + 0.3 * H.T, b1.s + 1.6 * H.T));
    const br = H.$('#browser');
    br.style.opacity = win * fadeAll;
    br.style.transform = 'translateY(' + (H.lerp(60, 0, win) + H.float(3, 3)) + 'px) scale(' + H.lerp(0.9, 1, win) + ')';
    const off = H.eo(H.seg(t, b1.s + 1.8 * H.T, b1.s + 2.4 * H.T));
    br.querySelector('.br-off').style.opacity = off;
    br.querySelector('.br-off').style.transform = 'scale(' + H.lerp(0.4, 1, off) + ')';

    const cur = H.$('#cursor-e');
    const cIn = H.eio(H.seg(t, 0.1 * H.T, 0.8 * H.T));
    const cOut = H.eio(H.seg(t, 1.2 * H.T, 1.6 * H.T));
    cur.style.opacity = (cIn * (1 - cOut)) * fadeAll;
    cur.style.transform = 'translate(' + H.lerp(620, 250, cIn) + 'px,' + H.lerp(560, 512, cIn) + 'px)';

    const s = H.$('#slogan-e');
    const sp = H.eo(b2.p);
    s.style.opacity = sp;
    s.style.transform = 'translate(-50%,-50%) translateY(' + H.lerp(12, 0, sp) + 'px) scale(' + H.lerp(0.97, 1, sp) + ')';
  }
};
`
};
