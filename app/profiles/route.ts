import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { DASHBOARD_HTML } from "@/lib/profiles/dashboard-html";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PASSCODE = process.env.PROFILES_PASSCODE || "Mhcglobal@12345";
const AUTH_COOKIE = "mhc_profiles_session";
const AUTH_HASH = crypto.createHash("sha256").update(PASSCODE + "_mhc_profiles_salt_2026").digest("hex");

function renderPasscodePage(hasError = false): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MHC Student Profiles · Passcode Required</title>
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d0d0c;
      --card: #161615;
      --border: #282825;
      --border-focus: #ff3b42;
      --brand: #ff3b42;
      --brand-soft: rgba(255, 59, 66, 0.12);
      --accent: #3987e5;
      --text: #ffffff;
      --text-secondary: #c3c2b7;
      --text-muted: #84837a;
      --error-bg: rgba(255, 59, 66, 0.14);
      --error-border: rgba(255, 59, 66, 0.4);
      --error-text: #ff6b70;
    }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    /* Subtle radar background grid */
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle at 50% 35%, rgba(255, 59, 66, 0.08) 0%, transparent 55%),
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 100% 100%, 36px 36px, 36px 36px;
      pointer-events: none;
      z-index: 0;
    }
    .container {
      width: 100%;
      max-width: 440px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 38px 32px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(255, 255, 255, 0.04) inset;
      position: relative;
      z-index: 1;
      animation: fadeIn 0.28s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 999px;
      background: var(--brand-soft);
      border: 1px solid rgba(255, 59, 66, 0.25);
      color: var(--brand);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .badge-icon {
      font-size: 12px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      color: var(--text);
    }
    p.subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .error-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 10px;
      background: var(--error-bg);
      border: 1px solid var(--error-border);
      color: var(--error-text);
      font-size: 13.5px;
      margin-bottom: 22px;
      animation: shake 0.35s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
      40%, 60% { transform: translate3d(3px, 0, 0); }
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    input[type="password"],
    input[type="text"] {
      width: 100%;
      height: 48px;
      padding: 0 46px 0 16px;
      background: #0d0d0c;
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      font-size: 15px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.16s, box-shadow 0.16s;
    }
    input:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px var(--brand-soft);
    }
    .toggle-btn {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }
    .toggle-btn:hover {
      color: var(--text);
    }
    .btn-submit {
      height: 48px;
      background: var(--brand);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 650;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: filter 0.15s, transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 4px;
    }
    .btn-submit:hover {
      filter: brightness(1.1);
    }
    .btn-submit:active {
      transform: translateY(1px);
    }
    .footer-links {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 12.5px;
      color: var(--text-muted);
    }
    .footer-links a {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer-links a:hover {
      color: var(--text);
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">
        <span class="badge-icon">🔒</span>
        <span>Restricted Area</span>
      </div>
      <h1>MHC Student Profiles</h1>
      <p class="subtitle">Enter the authorization passcode to view the cadet profiling dashboard.</p>
    </div>

    ${
      hasError
        ? `<div class="error-box" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Incorrect passcode. Please try again.</span>
          </div>`
        : ""
    }

    <form method="POST" action="/profiles">
      <div class="field-group">
        <label for="passcode">Access Passcode</label>
        <div class="input-wrapper">
          <input
            type="password"
            id="passcode"
            name="passcode"
            placeholder="Enter passcode"
            required
            autofocus
            autocomplete="current-password"
            spellcheck="false"
          >
          <button type="button" class="toggle-btn" id="togglePass" aria-label="Toggle password visibility">
            <svg id="eyeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <button type="submit" class="btn-submit">
        <span>Unlock Dashboard</span>
        <span>→</span>
      </button>
    </form>

    <div class="footer-links">
      <a href="/">← Return to ARGUS</a>
      <span>MHC Aviation</span>
    </div>
  </div>

  <script>
    const toggleBtn = document.getElementById('togglePass');
    const passInput = document.getElementById('passcode');
    const eyeIcon = document.getElementById('eyeIcon');
    if (toggleBtn && passInput) {
      toggleBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        eyeIcon.innerHTML = isPass
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
          : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
      });
    }
  </script>
</body>
</html>`;
}

function getSecuredDashboardHtml(): string {
  // Inject clean navigational controls into the dashboard masthead:
  // 1. "← Argus Suite" link
  // 2. "🔒 Lock" link that triggers /profiles?logout=1
  const navAdditions = `
    <a href="/" class="btn ghost" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-size:13px;" title="Return to ARGUS Aviation Terminal">← Argus Suite</a>
    <a href="/profiles?logout=1" class="btn ghost" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--brand);" title="Lock session">🔒 Lock</a>
  `;

  if (DASHBOARD_HTML.includes('<div class="spacer"></div>')) {
    return DASHBOARD_HTML.replace(
      '<div class="spacer"></div>',
      '<div class="spacer"></div>' + navAdditions
    );
  }
  return DASHBOARD_HTML;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Handle Logout
  if (searchParams.get("logout") === "1" || searchParams.get("logout") === "true") {
    const response = NextResponse.redirect(new URL("/profiles", request.url), 303);
    response.cookies.set(AUTH_COOKIE, "", {
      path: "/profiles",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  // Check Authentication Cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (sessionCookie && sessionCookie === AUTH_HASH) {
    const html = getSecuredDashboardHtml();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  }

  // Show Passcode Page
  const hasError = searchParams.get("error") === "1";
  return new Response(renderPasscodePage(hasError), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  let passcode = "";
  try {
    const formData = await request.formData();
    passcode = (formData.get("passcode") || "").toString().trim();
  } catch {
    // If formData parsing fails, try JSON
    try {
      const json = await request.json();
      passcode = (json.passcode || "").toString().trim();
    } catch {
      passcode = "";
    }
  }

  if (passcode === PASSCODE) {
    const response = NextResponse.redirect(new URL("/profiles", request.url), 303);
    response.cookies.set(AUTH_COOKIE, AUTH_HASH, {
      path: "/profiles",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  return NextResponse.redirect(new URL("/profiles?error=1", request.url), 303);
}
