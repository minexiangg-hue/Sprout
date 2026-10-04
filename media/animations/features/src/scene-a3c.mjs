// A3c — "See every line. Know where the magic comes from." (15s).
// Code excerpts trace to apps/local-server/src/studio/templates.ts (scenes["star-catcher"],
// shared css, starLogic, celebrate). Display copy localized to English; elisions marked with ….
export default {
  meta: {
    id: "A3c",
    title: "Every block is real code",
    file: "sprout-feature-A3c-code-15s.html",
    base: 15,
    slogan: "See every line. Know where the magic comes from.",
    localizedDisplay: true,
    illustration: false,
    sourceAssets: [
      "apps/local-server/src/studio/templates.ts (scenes[star-catcher], css, starLogic, celebrate)",
      "display copy localized to English; excerpts use … elisions"
    ]
  },

  css: /* css */ `
#col-c { left: 40px; top: 108px; width: 240px; display: flex; flex-direction: column; gap: 14px; }
#col-c .tile { width: 240px; position: relative; }
#col-c .tile .chk { position: absolute; right: 12px; color: var(--green); opacity: 0; }
#progress-c { margin-top: 8px; align-self: flex-start; font-size: 12px; }
#preview {
  left: 310px; top: 78px; width: 430px; height: 524px; padding: 22px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.pv-kicker { font: 800 10px "Inter", system-ui, sans-serif; letter-spacing: 3px; color: var(--muted); }
#preview h3 { font: 800 26px/1.2 "Inter", system-ui, sans-serif; letter-spacing: -0.6px; margin: 6px 0 4px; }
.pv-pills { display: flex; gap: 10px; margin: 8px 0 4px; }
.pv-pill {
  border: 1px solid #dce5d8; border-radius: 99px; background: #fff;
  padding: 5px 14px; font: 700 11px "Inter", system-ui, sans-serif; color: var(--ink);
}
#pv-board {
  width: 100%; border-radius: 20px; margin: 12px 0; padding: 12px;
  border: 2px solid transparent; position: relative; overflow: hidden;
}
#pv-canvas {
  position: relative; width: 100%; height: 220px; border-radius: 14px;
  background: #172d38; overflow: hidden;
}
.pv-star { position: absolute; width: 26px; height: 26px; }
#pv-basket {
  position: absolute; bottom: 12px; width: 66px; height: 18px;
  border-radius: 9px; background: var(--leaf);
}
#pv-status { min-height: 20px; font: 700 11px "Inter", system-ui, sans-serif; color: var(--muted); }
#pv-btn {
  border: 0; border-radius: 14px; padding: 10px 18px; margin-top: 8px;
  font: 700 13px "Inter", system-ui, sans-serif; color: #233e34;
  background: #e6e9df; box-shadow: 0 3px 0 #0002;
}
#pv-celebrate {
  position: absolute; inset: 0; display: grid; place-items: center;
  background: #ffffffb0; opacity: 0; border-radius: var(--r14);
}
#pv-celebrate .cc {
  width: 200px; padding: 14px 20px 18px; border-radius: 24px; background: #fffdf3;
  box-shadow: 0 12px 44px #25443c22; text-align: center;
}
#pv-celebrate .cc strong { display: block; font: 750 20px "Inter", system-ui, sans-serif; margin-top: 8px; }
#codewin-c { left: 770px; top: 58px; width: 470px; height: 564px; }
#codewin-c .cw-body { position: relative; flex: 1; }
#codewin-c pre { position: absolute; inset: 0; }
#slogan-c { opacity: 0; }
`,

  html: /* html */ `
<div id="col-c">
  <div class="tile k-purple" data-tile="0"><span class="no">1</span>Scene<span class="chk" data-ic="check" data-sz="17"></span></div>
  <div class="tile k-apricot" data-tile="1"><span class="no">2</span>Style<span class="chk" data-ic="check" data-sz="17"></span></div>
  <div class="tile k-leaf" data-tile="2"><span class="no">3</span>Gameplay<span class="chk" data-ic="check" data-sz="17"></span></div>
  <div class="tile k-blue" data-tile="3"><span class="no">4</span>Celebration<span class="chk" data-ic="check" data-sz="17"></span></div>
  <span class="chip" id="progress-c">0 / 4 built</span>
</div>

<div id="preview" class="card">
  <div class="pv-kicker">SPROUT · PLAY LAB</div>
  <h3>Star Catcher</h3>
  <div class="pv-pills"><span class="pv-pill">Stars 0 / 10</span><span class="pv-pill">Missed 0 / 5</span></div>
  <div id="pv-board">
    <div id="pv-canvas">
      <svg class="pv-star" data-star="0" viewBox="0 0 24 24"><path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16l-5.8 3.6 1.6-6.5-5.1-4.4 6.7-.5z" fill="#ffd46b" stroke="#ffe9ab" stroke-width="1"/></svg>
      <svg class="pv-star" data-star="1" viewBox="0 0 24 24"><path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16l-5.8 3.6 1.6-6.5-5.1-4.4 6.7-.5z" fill="#ffd46b" stroke="#ffe9ab" stroke-width="1"/></svg>
      <svg class="pv-star" data-star="2" viewBox="0 0 24 24"><path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16l-5.8 3.6 1.6-6.5-5.1-4.4 6.7-.5z" fill="#ffd46b" stroke="#ffe9ab" stroke-width="1"/></svg>
      <div id="pv-basket"></div>
    </div>
  </div>
  <p id="pv-status">Ready? Press start and catch your first star.</p>
  <button id="pv-btn">Start catching</button>
  <div id="pv-celebrate"><div class="cc">
    <svg viewBox="0 0 220 120" width="100%" aria-hidden="true"><path d="M110 13L127 49L166 54L138 81L145 119L110 101L75 119L82 81L54 54L93 49Z" fill="#ffce65" stroke="#e5a342" stroke-width="3" stroke-linejoin="round"/><path d="M32 19L38 32L52 34L42 44L45 58L32 51L19 58L22 44L12 34L26 32ZM188 12L194 25L208 27L198 37L201 51L188 44L175 51L178 37L168 27L182 25Z" fill="#a6c882"/><circle cx="97" cy="61" r="3" fill="#785430"/><circle cx="123" cy="61" r="3" fill="#785430"/><path d="M97 73Q110 87 123 73" fill="none" stroke="#785430" stroke-width="4" stroke-linecap="round"/></svg>
    <strong>You did it!</strong>
  </div></div>
</div>

<div id="codewin-c" class="codewin">
  <div class="cw-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span id="cw-file">scene.html</span></div>
  <div class="cw-body">
<pre data-code="0">&lt;main&gt;
  &lt;div class="kicker"&gt;SPROUT · PLAY LAB&lt;/div&gt;
  &lt;h1&gt;Star Catcher&lt;/h1&gt;
  &lt;p&gt;Move the basket with ← → or your finger to catch the stars.&lt;/p&gt;
  &lt;div class="row"&gt;
    &lt;span class="pill"&gt;Stars &lt;output id="score"&gt;0&lt;/output&gt; / &lt;span id="target"&gt;10&lt;/span&gt;&lt;/span&gt;
    &lt;span class="pill"&gt;Missed &lt;output id="misses"&gt;0&lt;/output&gt; / 5&lt;/span&gt;
  &lt;/div&gt;
  &lt;div class="board"&gt;
    &lt;canvas id="game" width="680" height="340" tabindex="0"&gt;&lt;/canvas&gt;
  &lt;/div&gt;
  &lt;p id="status" role="status"&gt;Ready? Press start and catch your first star.&lt;/p&gt;
  &lt;button id="start"&gt;Start catching&lt;/button&gt;
  &lt;p class="fine"&gt;Try it: tune the speed and target to design your challenge.&lt;/p&gt;
&lt;/main&gt;</pre>
<pre data-code="1">button{border:0;border-radius:16px;padding:12px 20px;
  background:var(--accent);color:#233e34;
  font:700 15px system-ui;cursor:pointer;box-shadow:0 3px 0 #0002}
.pill{border:1px solid #dce5d8;border-radius:99px;
  background:#fff;padding:8px 16px;font-weight:700}
.board{background:#edf4e5;border:2px solid #dce8d2;
  border-radius:26px;overflow:hidden;margin:20px auto;padding:20px}
canvas{width:100%;max-width:680px;height:auto;display:block;
  margin:auto;border-radius:22px;background:#172d38;touch-action:none}
#status{min-height:28px;font-weight:700}</pre>
<pre data-code="2">const config = window.SPROUT_CONFIG;
const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
let x=340, score=0, misses=0, stars=[], running=false, last=0, spawn=0;
function drawStar(cx,cy){ctx.beginPath();for(let point=0;point&lt;10;point++){…}
  ctx.fillStyle='#ffd46b';ctx.fill();…}
function frame(time){const dt=Math.min((time-last)/1000,.04);last=time;
  if(running){… stars fall, the basket follows, catches are counted …
    if(score&gt;=config.target)end(true);
    else if(misses&gt;=5)end(false)}
  draw();requestAnimationFrame(frame)}</pre>
<pre data-code="3">const button=document.createElement('button');
button.className='sound';button.textContent='Turn sound on';
document.querySelector('main').append(button);
function beep(frequency){if(!enabled||!audio)return;…}
window.addEventListener('sprout:point',()=&gt;beep(660));
window.addEventListener('sprout:success',()=&gt;{
  celebration.classList.add('show');beep(880);
  setTimeout(()=&gt;celebration.classList.remove('show'),1800)});</pre>
  </div>
</div>

<div class="slogan" id="slogan-c">
  <span class="sl-brand"><span data-ic="code" data-sz="14"></span>SPROUT</span>
  <h2>See every line. Know where the magic comes from.</h2>
</div>
`,

  js: /* js */ `
const FILES = ['scene.html', 'style.css', 'main.js', 'celebrate.js'];
function hexLerp(a, b, p) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * p)).join(',') + ')';
}
const SCENE = {
  id: 'A3c', base: 15,
  beats: [
    { start: 0, dur: 3, content: 'Block 1: scene.html, empty stage' },
    { start: 3, dur: 3, content: 'Block 2: style.css, color arrives' },
    { start: 6, dur: 3, content: 'Block 3: main.js, stage moves' },
    { start: 9, dur: 4, content: 'Block 4: celebrate.js, 4 of 4 built' },
    { start: 13, dur: 2, content: 'Slogan card' }
  ],
  mount(H) {
    H.$all('[data-ic]').forEach(el => { el.innerHTML = H.icon(el.dataset.ic, +(el.dataset.sz || 18)); });
  },
  render(t, H) {
    const beats = [H.B(0), H.B(1), H.B(2), H.B(3)];
    const b4 = H.B(4);
    const fadeAll = 1 - H.eio(b4.p);
    const active = t >= H.B(3).s ? 3 : t >= H.B(2).s ? 2 : t >= H.B(1).s ? 1 : 0;

    H.$all('#col-c .tile').forEach((tile, i) => {
      const enter = H.eo(H.seg(t, 0.2 * H.T + i * 0.15 * H.T, 1.0 * H.T + i * 0.15 * H.T));
      const hot = i === active && b4.p < 1 ? 1 : 0;
      tile.style.opacity = enter * fadeAll;
      tile.style.transform = 'translateX(' + H.lerp(-14, 0, enter) + 'px) scale(' + (1 + 0.04 * hot) + ')';
      tile.style.boxShadow = hot ? '0 8px 24px #27401c14' : 'var(--sh-rest)';
      const done = H.eo(H.seg(t, beats[i].e - 0.4 * H.T, beats[i].e));
      tile.querySelector('.chk').style.opacity = done;
    });
    let built = 0;
    beats.forEach((b, i) => { if (t >= beats[i].e - 0.4 * H.T) built = i + 1; });
    const prog = H.$('#progress-c');
    prog.textContent = built + ' / 4 built';
    prog.style.opacity = fadeAll;

    const pv = H.$('#preview');
    pv.style.opacity = fadeAll;
    const p1 = H.eo(beats[0].p);
    pv.querySelectorAll('.pv-kicker, h3, .pv-pills, #pv-status, #pv-btn').forEach(el => { el.style.opacity = p1; });
    H.$('#pv-canvas').style.opacity = p1;

    const p2 = H.eio(beats[1].p);
    H.$('#pv-board').style.background = hexLerp('#fbfcf8', '#edf4e5', p2);
    H.$('#pv-board').style.borderColor = hexLerp('#fbfcf8', '#dce8d2', p2);
    H.$('#pv-btn').style.background = hexLerp('#e6e9df', '#ffbb54', p2);

    const p3 = H.clamp(beats[2].p * 1.5);
    H.$all('.pv-star').forEach((s, i) => {
      const y = ((t * 46 + i * 120) % 250) - 26;
      s.style.opacity = p3 * fadeAll;
      s.style.transform = 'translate(' + (56 + i * 108) + 'px,' + y + 'px)';
    });
    H.$('#pv-basket').style.opacity = p3 * fadeAll;
    H.$('#pv-basket').style.left = (150 + 80 * Math.sin(t * 1.15)) + 'px';

    const p4 = H.eio(H.seg(t, beats[3].s + 1.2 * H.T, beats[3].s + 2.2 * H.T));
    const cel = H.$('#pv-celebrate');
    cel.style.opacity = p4 * (1 - H.eio(H.seg(t, beats[3].e - 0.5 * H.T, beats[3].e)));

    H.$('#cw-file').textContent = FILES[active];
    H.$all('#codewin-c pre').forEach((pre, i) => {
      const on = i === active;
      const enter = on ? H.eo(H.seg(t, beats[i].s + 0.3 * H.T, beats[i].s + 1.1 * H.T)) : 0;
      pre.style.opacity = on ? enter : 0;
      pre.style.transform = 'translateX(' + H.lerp(26, 0, enter) + 'px)';
    });
    H.$('#codewin-c').style.opacity = fadeAll;

    const s = H.$('#slogan-c');
    const sp = H.eo(b4.p);
    s.style.opacity = sp;
    s.style.transform = 'translate(-50%,-50%) translateY(' + H.lerp(12, 0, sp) + 'px) scale(' + H.lerp(0.97, 1, sp) + ')';
  }
};
`
};
