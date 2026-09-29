export interface PreviewFont { data: string; license: string }
let fontPromise: Promise<PreviewFont> | undefined;
/** One cached local asset; generated code never gains permission to fetch it. */
export function loadPreviewFont(): Promise<PreviewFont> {
  fontPromise ??= Promise.all([fetch('/fonts/SproutSansSC.woff2'), fetch('/fonts/OFL.txt')])
    .then(async ([font, license]) => {
      if (!font.ok || !license.ok) throw new Error('作品字体暂时没有加载完成，请再试一次。');
      const blob = await font.blob();
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('无法读取作品字体，请再试一次。'));
        reader.readAsDataURL(blob);
      });
      return {data, license: await license.text()};
    }).catch(error => { fontPromise = undefined; throw error; });
  return fontPromise;
}
export function previewDocument(html: string, font?: PreviewFont | null): string {
  const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; connect-src 'none'; font-src data:; form-action 'none'; base-uri 'none';">`;
  const typography = font ? `<style>@font-face{font-family:SproutPreview;src:url('${font.data}') format('woff2');font-display:swap}body,button,input,select,textarea{font-family:SproutPreview,system-ui,sans-serif!important}</style>` : '';
  const head = policy + typography;
  const document = /<head[\s>]/i.test(html) ? html.replace(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i, (_match, open, content, close) => open + head + content.replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/gi, '') + close) : head + html;
  return document + (font ? `\n<!-- Embedded Noto Sans SC font license:\n${font.license.replace(/-->/g, '--&gt;')}\n-->` : '');
}
