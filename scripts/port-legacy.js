// Faithful port: extract CSS / body markup / inline JS from argus-dashboard.html,
// scope the CSS under #argus-legacy via postcss, emit a data module.
const fs = require("fs");
const path = require("path");
const ROOT = "/Users/sid/Desktop/CLAUDE PROJECT /omniroute";
const postcss = require(path.join(ROOT, "node_modules/postcss"));
const SRC = path.join(ROOT, "public/argus-dashboard.html");
const OUT = path.join(ROOT, "app/attendance/legacy-data.js");
const SCOPE = "#argus-legacy";

const html = fs.readFileSync(SRC, "utf8");

// --- CSS: first <style>...</style> ---
const styleM = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
if (!styleM) throw new Error("no <style> found");
const rawCss = styleM[1];

// --- body inner (use the LAST </body>; earlier ones live inside JS strings) ---
const bodyOpen = html.match(/<body[^>]*>/i);
if (!bodyOpen) throw new Error("no <body> found");
const bStart = bodyOpen.index + bodyOpen[0].length;
const bEnd = html.lastIndexOf("</body>");
if (bEnd < 0) throw new Error("no </body> found");
let bodyInner = html.slice(bStart, bEnd);

// --- pull <script> blocks out of the body ---
const inlineJs = [];
bodyInner = bodyInner.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (m, attrs, code) => {
  if (/\bsrc\s*=/.test(attrs)) return ""; // external in body (none expected) — dropped, collected below
  inlineJs.push(code);
  return "";
});

// --- external script srcs (whole file) — e.g. docx CDN in <head> ---
const externalSrcs = [];
const srcRe = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/gi;
let sm;
while ((sm = srcRe.exec(html))) externalSrcs.push(sm[1]);

// --- scope CSS under SCOPE ---
function scopeSelector(sel) {
  sel = sel.trim();
  if (!sel) return sel;
  if (sel === ":root" || sel === "html" || sel === "body" || sel === "html body") return SCOPE;
  if (/^:root\b/.test(sel)) return sel.replace(/^:root\b/, SCOPE);
  if (/^html\s+body\b/.test(sel)) return sel.replace(/^html\s+body\b/, SCOPE);
  if (/^(html|body)\b/.test(sel)) return sel.replace(/^(html|body)\b/, SCOPE);
  return SCOPE + " " + sel;
}
const root = postcss.parse(rawCss);
root.walkRules((rule) => {
  const p = rule.parent;
  if (p && p.type === "atrule" && /^(keyframes|-webkit-keyframes|font-face)$/i.test(p.name)) return; // don't touch keyframe steps / font-face
  rule.selectors = rule.selectors.map(scopeSelector);
});
const scopedCss = root.toString();

// --- emit module ---
const banner = "// AUTO-GENERATED from public/argus-dashboard.html — do not edit by hand.\n// Regenerate: node scratchpad/port-legacy.js\n";
const mod =
  banner +
  "export const EXTERNAL_SRCS = " + JSON.stringify([...new Set(externalSrcs)]) + ";\n" +
  "export const LEGACY_CSS = " + JSON.stringify(scopedCss) + ";\n" +
  "export const BODY_HTML = " + JSON.stringify(bodyInner) + ";\n" +
  "export const LEGACY_JS = " + JSON.stringify(inlineJs.join("\n;\n")) + ";\n";

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, mod);

console.log("wrote", OUT);
console.log("  external srcs :", externalSrcs);
console.log("  inline scripts:", inlineJs.length);
console.log("  css bytes     :", scopedCss.length, "(raw", rawCss.length + ")");
console.log("  body bytes    :", bodyInner.length);
console.log("  js bytes      :", inlineJs.join("").length);
