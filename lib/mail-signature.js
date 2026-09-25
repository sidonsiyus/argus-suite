// Server-side email signature for outgoing console mail — Siddarth's MH Cockpit
// / Vels signature, reproduced from his real sent mail (logo + socials hosted,
// so no inline blobs). Emails go out as HTML (with this appended) plus a
// plain-text fallback.

const LOGO = "https://mhcglobal.edgeone.app/MHCG%20Pvt%20Ltd.jpg";
const ICON = "https://imgmsgen.com/img/out-of-the-blue";
const SOCIALS = [
  { name: "Facebook", href: "https://www.facebook.com/MHCGlobalPvtLtd", img: `${ICON}/fb.png` },
  { name: "X", href: "https://x.com/mhcockpitpvtltd", img: `${ICON}/tt.png` },
  { name: "YouTube", href: "https://www.youtube.com/@mhcockpit", img: `${ICON}/yt.png` },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/mhcockpit/", img: `${ICON}/ln.png` },
  { name: "Instagram", href: "https://www.instagram.com/mhcglobalpvtltd/", img: `${ICON}/it.png` },
];

export const SIGNATURE_HTML = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#222222;line-height:1.5;margin-top:22px">
  <div style="margin-bottom:9px"><img src="${LOGO}" alt="MH Cockpit" width="147" height="29" style="display:block;border:0;outline:none"></div>
  <div style="font-weight:bold;font-size:14px;color:#111111">Best Regards,</div>
  <div style="font-weight:bold;font-size:14px;color:#111111;margin-top:6px">Siddarth J</div>
  <div>Assistant Professor</div>
  <div>Team: Vels University</div>
  <div style="margin-top:7px">Mobile: <a href="tel:+918838411371" style="color:#222222;text-decoration:none">8838411371</a></div>
  <div>Email: <a href="mailto:siddarth@mhcglobal.info" style="color:#1155cc;text-decoration:none">siddarth@mhcglobal.info</a></div>
  <div style="margin-top:7px;max-width:540px;color:#555555">Address: Tower-B, Featherlite The Address, 200 Feet Radial Rd, Iswarya Nagar, Raja Joseph Colony, Pallavaram, Chennai, Tamil Nadu 600043</div>
  <div style="margin-top:7px"><a href="https://www.mhcglobal.info" style="color:#1155cc;text-decoration:none">www.mhcglobal.info</a></div>
  <div style="margin-top:9px">
    ${SOCIALS.map((s) => `<a href="${s.href}" style="display:inline-block;margin-right:7px" target="_blank" rel="noopener"><img src="${s.img}" alt="${s.name}" width="16" height="16" style="border:0;outline:none"></a>`).join("")}
  </div>
</div>`.trim();

export const SIGNATURE_TEXT = `Best Regards,

Siddarth J
Assistant Professor
Team: Vels University

Mobile: 8838411371
Email: siddarth@mhcglobal.info

Address: Tower-B, Featherlite The Address, 200 Feet Radial Rd, Iswarya Nagar, Raja Joseph Colony, Pallavaram, Chennai, Tamil Nadu 600043
www.mhcglobal.info`;

function htmlEscape(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Plain message text → simple, safe HTML paragraphs (no user HTML injected).
function bodyToHtml(text) {
  const esc = htmlEscape(text);
  return esc
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Full HTML email = the message body + the signature.
export function buildHtmlEmail(bodyText) {
  const body = bodyToHtml(bodyText);
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222222;line-height:1.55">${body}</div>${SIGNATURE_HTML}`;
}

// Plain-text fallback = the message body + the plain signature.
export function buildTextEmail(bodyText) {
  return `${String(bodyText || "").trim()}\n\n${SIGNATURE_TEXT}`;
}
