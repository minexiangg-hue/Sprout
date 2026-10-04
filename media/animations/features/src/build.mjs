// Build script for the Sprout A3 feature-animation series.
// Usage: node build.mjs   (from media/animations/features/src/)
// Assembles self-contained segment HTMLs + feature-template.html + A3-manifest.json
// into media/animations/features/. No dependencies, no network.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { buildShell } from "./shared.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "..");

const interB64 = readFileSync(path.join(here, "inter-var.b64"), "utf8").trim();
const gameDocB64 = readFileSync(path.join(here, "game-doc.html")).toString("base64");

const sceneFiles = [
  "scene-a3a.mjs",
  "scene-a3b.mjs",
  "scene-a3c.mjs",
  "scene-a3d.mjs",
  "scene-a3e.mjs",
  "scene-a3f.mjs"
];

const segments = [];
for (const file of sceneFiles) {
  const mod = await import(pathToFileURL(path.join(here, file)).href);
  const scene = mod.default;
  const html = buildShell(
    { id: scene.meta.id, title: scene.meta.title },
    scene.css,
    scene.html,
    scene.js.replaceAll("'__GAME_DOC_B64__'", JSON.stringify(gameDocB64)),
    interB64
  );
  const outFile = scene.meta.file;
  writeFileSync(path.join(outDir, outFile), html, "utf8");

  // Beats are authored once, inside the scene's SCENE definition — extract them
  // so the manifest can never drift from the animation itself.
  const beatsMatch = scene.js.match(/beats:\s*(\[[\s\S]*?\])\s*,/);
  if (!beatsMatch) throw new Error(`beats not found in ${file}`);
  const beats = eval(beatsMatch[1]).map(b => ({ start: b.start, dur: b.dur, content: b.content, keyword: null }));

  segments.push({
    id: scene.meta.id,
    file: outFile,
    base: scene.meta.base,
    beats,
    slogan: scene.meta.slogan,
    localizedDisplay: scene.meta.localizedDisplay,
    illustration: scene.meta.illustration,
    sourceAssets: scene.meta.sourceAssets
  });
  console.log(`built ${outFile} (${(html.length / 1024).toFixed(0)} KB)`);
}

// ---- feature-template.html: the shared base with a small demo scene ----
const demoScene = {
  meta: { id: "TEMPLATE", title: "Feature animation base template" },
  css: /* css */ `
#demo-swatches { left: 90px; top: 120px; display: flex; gap: 14px; }
#demo-swatches .sw { width: 84px; height: 84px; border-radius: var(--r14); border: 1px solid var(--line); box-shadow: var(--sh-rest); }
#demo-tiles { left: 90px; top: 250px; display: flex; flex-direction: column; gap: 12px; width: 240px; }
#demo-icons { left: 90px; top: 480px; display: flex; gap: 14px; color: var(--muted); }
#demo-mascots { left: 700px; top: 160px; display: flex; gap: 40px; align-items: flex-end; }
#demo-note { left: 700px; top: 420px; width: 420px; font: 500 13px/1.65 "Inter", system-ui, sans-serif; color: var(--muted); }
#demo-slogan { opacity: 0; }
`,
  html: /* html */ `
<div id="demo-swatches">
  <span class="sw" style="background:#26382d"></span>
  <span class="sw" style="background:#456d39"></span>
  <span class="sw" style="background:#ffbb54"></span>
  <span class="sw" style="background:#f5f7ef"></span>
  <span class="sw" style="background:#fbfcf8"></span>
</div>
<div id="demo-tiles">
  <div class="tile k-purple"><span class="no">1</span>Scene</div>
  <div class="tile k-apricot"><span class="no">2</span>Style</div>
  <div class="tile k-leaf"><span class="no">3</span>Gameplay</div>
  <div class="tile k-blue"><span class="no">4</span>Celebration</div>
</div>
<div id="demo-icons">
  <span data-ic="sparkles"></span><span data-ic="wand"></span><span data-ic="layers"></span>
  <span data-ic="code"></span><span data-ic="play"></span><span data-ic="check"></span>
  <span data-ic="folder"></span><span data-ic="heart"></span><span data-ic="download"></span>
</div>
<div id="demo-mascots">
  <span data-mascot="happy" data-w="180"></span>
  <span data-mascot="thinking" data-w="180"></span>
</div>
<p id="demo-note">Shared base for the A3 feature-animation series: design tokens, Inter (embedded),
Sprout mascot, lucide icons (ISC), the rAF beat engine, and the debug control bar.
Open any segment with ?duration=&lt;seconds&gt;&amp;speed=&lt;x&gt;&amp;record=1.</p>
<div class="slogan" id="demo-slogan">
  <span class="sl-brand"><span data-ic="sparkles" data-sz="14"></span>SPROUT</span>
  <h2>Plant an idea. Watch every step grow.</h2>
</div>
`,
  js: /* js */ `
const SCENE = {
  id: 'TEMPLATE', base: 6,
  beats: [
    { start: 0, dur: 2, content: 'Tokens and components entrance' },
    { start: 2, dur: 2, content: 'Mascot and icons idle' },
    { start: 4, dur: 2, content: 'Brand signature slogan' }
  ],
  mount(H) {
    H.$all('[data-ic]').forEach(el => { el.innerHTML = H.icon(el.dataset.ic, +(el.dataset.sz || 20)); });
    H.$all('[data-mascot]').forEach(el => { el.innerHTML = H.mascot(el.dataset.mascot, +(el.dataset.w || 160)); });
  },
  render(t, H) {
    const b0 = H.B(0), b2 = H.B(2);
    H.$all('#demo-swatches .sw').forEach((el, i) => {
      const p = H.eo(H.seg(t, i * 0.12 * H.T, 0.6 * H.T + i * 0.12 * H.T));
      el.style.opacity = p * (1 - b2.p);
      el.style.transform = 'translateY(' + H.lerp(14, 0, p) + 'px)';
    });
    H.$all('#demo-tiles .tile').forEach((el, i) => {
      const p = H.eo(H.seg(t, 0.3 * H.T + i * 0.12 * H.T, 0.9 * H.T + i * 0.12 * H.T));
      el.style.opacity = p * (1 - b2.p);
      el.style.transform = 'translateX(' + H.lerp(-14, 0, p) + 'px)';
    });
    H.$('#demo-icons').style.opacity = H.eo(b0.p) * (1 - b2.p);
    H.$('#demo-note').style.opacity = H.eo(b0.p) * (1 - b2.p);
    H.$all('#demo-mascots > span').forEach((el, i) => {
      el.style.display = 'inline-block';
      el.style.opacity = H.eo(b0.p) * (1 - b2.p);
      el.style.transform = 'translateY(' + H.float(4, 3, i * 0.4) + 'px)';
    });
    const s = H.$('#demo-slogan');
    const sp = H.eo(b2.p);
    s.style.opacity = sp;
    s.style.transform = 'translate(-50%,-50%) translateY(' + H.lerp(12, 0, sp) + 'px) scale(' + H.lerp(0.97, 1, sp) + ')';
  }
};
`
};
writeFileSync(
  path.join(outDir, "feature-template.html"),
  buildShell(demoScene.meta, demoScene.css, demoScene.html, demoScene.js, interB64),
  "utf8"
);
console.log("built feature-template.html");

// ---- A3-manifest.json ----
const total = segments.reduce((m, s) => m + s.base, 0);
const manifest = {
  series: "A3",
  language: "en",
  totalBaseDuration: total,
  segments,
  skipped: [
    {
      id: "A3g",
      reason: "Voice feature is roadmap-only in the product; skipped per spec (no fake features)."
    }
  ],
  recordUsage:
    "Open each segment as file:// with ?duration=<base>&record=1 and screen-record fullscreen; " +
    "actual beat timings are logged to the console as JSON at playback end. " +
    "Concatenate in order A3a(8s) A3b(12s) A3c(15s) A3d(12s) A3e(8s) A3f(25s). " +
    "?duration scales the whole timeline (verified range: 40%–110%); ?speed multiplies playback rate.",
  notes: [
    "All on-screen copy is English; A3c/A3d/A3e show real product code/game with display copy localized (localizedDisplay).",
    "A3f is a stylized illustration of real capabilities (code graph, src files, agent run states), not a UI recording (illustration).",
    "Font: Inter variable (latin subset, wght 100–900) embedded as base64; lucide icons inlined (ISC license).",
    "Mascot inlined from apps/web/src/studio/Mascot.tsx (happy/thinking), called 'Sprout' on screen."
  ]
};
writeFileSync(path.join(outDir, "A3-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`built A3-manifest.json (total base ${total}s)`);
