/* ═══════════════════════════════════════════════════════════════════
   ARGUS Attendance · AI-hybrid Cloudflare Worker  (READ + WRITE)
   Deploy as:  argus-attend.jhrishi7.workers.dev

   ── READ (unchanged) ──
     GET  /               → attendance JSON for the current (first) month tab
     GET  /?sheet=AUG     → a specific month tab (matched by name substring)
     GET  /?all=1         → every month tab combined into overall %
     GET  /?sheets=1      → list of tab names
     GET  /?debug=1       → health check
     GET  /?trace=1       → what the worker sees

   ── WRITE (new) ──
     POST /   with JSON body:
        { "secret":"…", "sheetName":"Daily Attendance for SEP-26",
          "date":"2026-09-14", "dryRun":false,
          "marks":[ {"reg":"25153101","mark":"P"}, … ] }
     → finds the date's column in row 7, writes P / A / OD across that day's
       five period cells for each student (matched by Reg No, col B), by editing
       ONLY those cells in the worksheet XML and re-uploading the same .xlsx —
       so all formatting/colours (conditional formatting) are preserved.
       dryRun:true validates (date column found? regs matched?) without writing.

   ── SECRETS (Cloudflare → Settings → Variables and Secrets) ──
     SA_KEY        = entire service-account JSON   (must be EDITOR on the file)
     GROQ_KEY      = your Groq API key (optional, read-side AI)
     FILE_ID       = 1Z_rWwGIKSTFIbqb3yFR89ztYWg1IJwYf   (optional; default set)
     WRITE_SECRET  = a private passphrase (same value goes in the dashboard)
   ═══════════════════════════════════════════════════════════════════ */

const DEFAULT_FILE_ID = "1Z_rWwGIKSTFIbqb3yFR89ztYWg1IJwYf";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: CORS });

    // ★ WRITE path — any POST is a write/dry-run request
    if (request.method === "POST") return await handleWrite(request, env);

    const url = new URL(request.url);

    if (url.searchParams.get("debug") === "1") {
      return json({
        alive: true,
        SA_KEY: !!env.SA_KEY,
        GROQ_KEY: !!env.GROQ_KEY,
        WRITE_SECRET: !!env.WRITE_SECRET,
        FILE_ID: env.FILE_ID || DEFAULT_FILE_ID,
        model: GROQ_MODEL,
      });
    }

    if (url.searchParams.get("sheets") === "1") return await handleSheets(env);
    if (url.searchParams.get("all") === "1") return await handleAll(env, url);

    const trace = [];
    try {
      if (!env.SA_KEY) return json({ error: "Missing SA_KEY secret" }, 500);
      const key = JSON.parse(env.SA_KEY);
      const fileId = (env.FILE_ID || DEFAULT_FILE_ID).trim();
      trace.push("keys ok");

      const token = await getAccessToken(key);
      trace.push("token ok");

      const bytes = await downloadFile(fileId, token);
      trace.push("downloaded " + bytes.length + " bytes");

      const { grid, sheetName, sheets } = await extractGrid(bytes, url.searchParams.get("sheet"));
      trace.push("grid " + grid.length + " rows, sheet=" + sheetName);

      let layout;
      const useAI = url.searchParams.get("ai") === "1" && env.GROQ_KEY;
      if (useAI) {
        try { layout = await aiLayout(grid, env.GROQ_KEY); trace.push("AI layout: " + JSON.stringify(layout)); }
        catch (e) { layout = defaultLayout(); trace.push("AI failed → default layout: " + String(e && e.message || e)); }
      } else {
        layout = defaultLayout();
        trace.push("default layout");
      }

      const result = countAttendance(grid, layout, sheetName, sheets);
      trace.push("students " + result.students.length);

      if (url.searchParams.get("trace") === "1")
        return json({ trace, layout, sample: result.students.slice(0, 5), summary: result.summary });

      return json(result);
    } catch (e) {
      return json({ error: "Attendance failed", detail: String(e && e.message || e), trace }, 502);
    }
  },
};

/* ═══════════════════════ ★ WRITE ═══════════════════════ */
async function handleWrite(request, env) {
  try {
    if (!env.SA_KEY) return json({ ok: false, error: "Missing SA_KEY secret" }, 500);
    if (!env.WRITE_SECRET) return json({ ok: false, error: "WRITE_SECRET not set in the worker" });
    let body;
    try { body = JSON.parse(await request.text()); } catch (_) { return json({ ok: false, error: "bad JSON body" }); }
    if (String(body.secret || "") !== String(env.WRITE_SECRET)) return json({ ok: false, error: "unauthorised (bad secret)" });

    const tgt = parseYMD(body.date);
    if (!tgt) return json({ ok: false, error: "bad date: " + body.date });

    const key = JSON.parse(env.SA_KEY);
    const fileId = String(body.fileId || env.FILE_ID || DEFAULT_FILE_ID).trim();   // fileId override lets you test on a COPY
    const token = await getAccessToken(key, "https://www.googleapis.com/auth/drive");
    const bytes = await downloadFile(fileId, token);

    const { files, order, raw } = await unzip(bytes);
    const dec = new TextDecoder();
    const shared = parseSharedStrings(files["xl/sharedStrings.xml"] ? dec.decode(files["xl/sharedStrings.xml"]) : "");
    const sheets = mapSheets(dec.decode(files["xl/workbook.xml"] || new Uint8Array()), dec.decode(files["xl/_rels/workbook.xml.rels"] || new Uint8Array()));

    const want = String(body.sheetName || "").trim().toUpperCase();
    let target = sheets.find(s => s.name.trim().toUpperCase() === want)
      || sheets.find(s => s.name.toUpperCase().includes(want) || (want && want.includes(s.name.toUpperCase())));
    if (!target) return json({ ok: false, error: 'tab not found: "' + body.sheetName + '" (tabs: ' + sheets.map(s => s.name).join(", ") + ")" });

    const path = "xl/" + target.path;
    const sheetXml = dec.decode(files[path] || new Uint8Array());
    const grid = parseSheet(sheetXml, shared);
    const L = defaultLayout();

    // find the day's first period column from the date-header row (row 7 = startRow-4)
    const headerRow = grid[Math.max(0, L.startRow - 4)] || [];
    const PERIODS = 5;
    let dayCol = -1;
    for (let d = 0; d <= 60; d++) {
      const c = L.attStartCol + d * PERIODS;
      if (c >= headerRow.length + PERIODS) break;
      const info = parseAnyDate((headerRow[c] || "").toString().trim());
      if (info && info.date) {
        const [, M, D] = info.date.split("-").map(Number);
        if (M === tgt.m && D === tgt.d) { dayCol = c; break; }
      }
    }
    if (dayCol < 0) return json({ ok: false, error: "date " + fmtMD(tgt) + " not found in the header row of \"" + target.name + "\" — add that column in the sheet first" });

    // reg → row (0-based)
    const rowByReg = {};
    for (let r = L.startRow; r < grid.length; r++) {
      const reg = deNum((grid[r][L.idRegCol] || "").toString().trim());
      if (/^\d{5,}$/.test(reg)) rowByReg[reg] = r;
    }

    const marks = Array.isArray(body.marks) ? body.marks : [];
    let present = 0, absent = 0, od = 0;
    const unmatched = [];
    const editsByRow = new Map();
    for (const mk of marks) {
      const reg = deNum(String(mk.reg || "").trim());
      const val = String(mk.mark || "").toUpperCase();
      if (val !== "P" && val !== "A" && val !== "OD") continue;
      const row0 = rowByReg[reg];
      if (row0 == null) { unmatched.push(mk.reg); continue; }
      if (val === "P") present++; else if (val === "OD") od++; else absent++;
      const rowNum = row0 + 1; // 1-based (XML)
      const arrE = editsByRow.get(rowNum) || [];
      for (let p = 0; p < PERIODS; p++) { const col = dayCol + p; arrE.push({ col, ref: colLetter(col) + rowNum, value: val }); }
      editsByRow.set(rowNum, arrE);
    }

    const dateColumn = colLetter(dayCol);
    const wrote = present + absent + od;

    if (body.dryRun) {
      return json({ ok: true, dryRun: true, sheet: target.name, date: fmtMD(tgt), dateColumn, wrote, present, absent, od, unmatched, fileId });
    }
    if (wrote === 0) return json({ ok: false, error: "no matching students to write", unmatched });

    // surgical XML edit → re-zip (reusing untouched files' original bytes) → upload the SAME file
    const newXml = editSheetXml(sheetXml, editsByRow);
    const changed = await compressEntry(path, new TextEncoder().encode(newXml));
    const entries = order.filter(n => raw[n]).map(n => n === path ? changed
      : { name: n, comp: raw[n].comp, method: raw[n].method, crc: raw[n].crc, uncompSize: raw[n].uncompSize });
    const outZip = zipWrite(entries);
    await uploadFile(fileId, token, outZip);

    return json({ ok: true, dryRun: false, sheet: target.name, date: fmtMD(tgt), dateColumn, wrote, present, absent, od, unmatched, fileId });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 502);
  }
}

// edit ONLY the target cells inside their <row> blocks; every other byte is preserved
function editSheetXml(xml, editsByRow) {
  return xml.replace(/<row[^>]*\sr="(\d+)"[^>]*>[\s\S]*?<\/row>/g, (block, rnum) => {
    const edits = editsByRow.get(+rnum);
    if (!edits) return block;
    const open = block.match(/<row[^>]*?>/)[0];
    const cells = [];
    const cRe = /<c\b[^>]*?\sr="([A-Z]+)\d+"[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g;
    let m;
    while ((m = cRe.exec(block))) cells.push({ col: colIdx(m[1]), xml: m[0] });
    for (const e of edits) {
      const idx = cells.findIndex(c => c.col === e.col);
      const style = idx >= 0 ? (cells[idx].xml.match(/\ss="(\d+)"/) || [])[1] : null;
      const cellXml = '<c r="' + e.ref + '"' + (style ? ' s="' + style + '"' : "") + ' t="inlineStr"><is><t>' + e.value + '</t></is></c>';
      if (idx >= 0) cells[idx] = { col: e.col, xml: cellXml };
      else cells.push({ col: e.col, xml: cellXml });
    }
    cells.sort((a, b) => a.col - b.col);
    return open + cells.map(c => c.xml).join("") + "</row>";
  });
}

async function uploadFile(fileId, token, bytes) {
  const u = "https://www.googleapis.com/upload/drive/v3/files/" + fileId + "?uploadType=media&supportsAllDrives=true";
  const r = await fetch(u, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    body: bytes,
  });
  if (!r.ok) throw new Error("Upload " + r.status + ": " + (await r.text()).slice(0, 200));
  return await r.json();
}

/* ── ZIP writer (deflate-raw + CRC32), preserving entry order ── */
function crc32(bytes) {
  if (!crc32.t) { crc32.t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); crc32.t[n] = c >>> 0; } }
  const t = crc32.t; let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ t[(crc ^ bytes[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
async function deflateRaw(bytes) {
  const cs = new CompressionStream("deflate-raw");
  const stream = new Response(bytes).body.pipeThrough(cs);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
// build a ready-to-emit entry (compress once) for the ONE file we changed
async function compressEntry(name, data) {
  const comp = await deflateRaw(data);
  const useComp = comp.length < data.length;
  return { name, comp: useComp ? comp : data, method: useComp ? 8 : 0, crc: crc32(data), uncompSize: data.length };
}
// entries: [{ name, comp:Uint8Array, method, crc, uncompSize }] — already compressed, no re-compression here
function zipWrite(entries) {
  const enc = new TextEncoder();
  const parts = [], central = []; let offset = 0;
  for (const e of entries) {
    const nameBytes = enc.encode(e.name);
    const stored = e.comp, method = e.method, crc = e.crc, uncompSize = e.uncompSize;

    const lh = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true);
    dv.setUint16(8, method, true); dv.setUint16(10, 0, true); dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, stored.length, true); dv.setUint32(22, uncompSize, true);
    dv.setUint16(26, nameBytes.length, true); dv.setUint16(28, 0, true);
    lh.set(nameBytes, 30);
    parts.push(lh, stored);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(cd.buffer);
    cdv.setUint32(0, 0x02014b50, true); cdv.setUint16(4, 20, true); cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0, true); cdv.setUint16(10, method, true); cdv.setUint16(12, 0, true); cdv.setUint16(14, 0, true);
    cdv.setUint32(16, crc, true); cdv.setUint32(20, stored.length, true); cdv.setUint32(24, uncompSize, true);
    cdv.setUint16(28, nameBytes.length, true); cdv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);
    central.push(cd);
    offset += lh.length + stored.length;
  }
  let cdSize = 0; central.forEach(c => cdSize += c.length);
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(8, entries.length, true); edv.setUint16(10, entries.length, true);
  edv.setUint32(12, cdSize, true); edv.setUint32(16, offset, true); edv.setUint16(20, 0, true);

  const all = parts.concat(central, [eocd]);
  let total = 0; all.forEach(a => total += a.length);
  const out = new Uint8Array(total); let p = 0;
  for (const a of all) { out.set(a, p); p += a.length; }
  return out;
}

function parseYMD(s) { const m = String(s || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null; }
function fmtMD(t) { return t.d + "-" + MONS[t.m - 1]; }
function colLetter(c) { let s = ""; c += 1; while (c > 0) { const r = (c - 1) % 26; s = String.fromCharCode(65 + r) + s; c = (c - r - 1) / 26; } return s; }

/* ───────── ★ list of tab names ───────── */
async function handleSheets(env) {
  try {
    if (!env.SA_KEY) return json({ error: "Missing SA_KEY secret" }, 500);
    const key = JSON.parse(env.SA_KEY);
    const fileId = (env.FILE_ID || DEFAULT_FILE_ID).trim();
    const token = await getAccessToken(key);
    const bytes = await downloadFile(fileId, token);
    const { files } = await unzip(bytes);
    const dec = new TextDecoder();
    const sheetMap = mapSheets(dec.decode(files["xl/workbook.xml"] || new Uint8Array()), dec.decode(files["xl/_rels/workbook.xml.rels"] || new Uint8Array()));
    return json({ sheets: sheetMap.map(s => s.name), count: sheetMap.length });
  } catch (e) {
    return json({ error: "Sheets failed", detail: String(e && e.message || e) }, 502);
  }
}

/* ───────── ★ combine every month tab → overall per student ───────── */
async function handleAll(env, url) {
  try {
    if (!env.SA_KEY) return json({ error: "Missing SA_KEY secret" }, 500);
    const key = JSON.parse(env.SA_KEY);
    const fileId = (env.FILE_ID || DEFAULT_FILE_ID).trim();
    const token = await getAccessToken(key);
    const bytes = await downloadFile(fileId, token);
    const { files } = await unzip(bytes);
    const dec = new TextDecoder();
    const shared = parseSharedStrings(files["xl/sharedStrings.xml"] ? dec.decode(files["xl/sharedStrings.xml"]) : "");
    const sheetMap = mapSheets(dec.decode(files["xl/workbook.xml"] || new Uint8Array()), dec.decode(files["xl/_rels/workbook.xml.rels"] || new Uint8Array()));
    if (!sheetMap.length) return json({ error: "No sheets in workbook" }, 502);
    const allNames = sheetMap.map(s => s.name);

    const firstGrid = parseSheet(dec.decode(files["xl/" + sheetMap[0].path] || new Uint8Array()), shared);
    let layout;
    if (url.searchParams.get("ai") === "1" && env.GROQ_KEY) {
      try { layout = await aiLayout(firstGrid, env.GROQ_KEY); } catch (_) { layout = defaultLayout(); }
    } else layout = defaultLayout();

    const agg = {}; const used = []; const skipped = [];
    let firstDate = "", lastDate = "", totalDays = 0;
    const refWant = (url.searchParams.get("ref") || "").toUpperCase();
    let refRegs = null;

    for (const sh of sheetMap) {
      let grid;
      try { grid = parseSheet(dec.decode(files["xl/" + sh.path] || new Uint8Array()), shared); } catch (_) { continue; }
      let res;
      try { res = countAttendance(grid, layout, sh.name, allNames); } catch (_) { continue; }
      if (!res.students.length) continue;

      const regs = res.students.map(s => String(s.reg));
      if (!refRegs) {
        if (!refWant || sh.name.toUpperCase().includes(refWant)) refRegs = new Set(regs);
        else { skipped.push(sh.name); continue; }
      }
      const overlap = regs.filter(r => refRegs.has(r)).length;
      if (overlap < Math.max(3, Math.floor(res.students.length * 0.5))) { skipped.push(sh.name); continue; }

      used.push(sh.name);
      totalDays += res.nDays;
      res.days.forEach(dy => { if (dy.date) { if (!firstDate || dy.date < firstDate) firstDate = dy.date; if (dy.date > lastDate) lastDate = dy.date; } });
      res.students.forEach(s => {
        const k = String(s.reg);
        if (!refRegs.has(k)) return;
        if (!agg[k]) agg[k] = { sno: s.sno, reg: s.reg, name: s.name, present: 0, od: 0, absent: 0 };
        const m = agg[k];
        m.present += s.present; m.od += s.od; m.absent += s.absent;
      });
    }
    if (!used.length) return json({ error: "No tabs returned attendance data" }, 502);

    const students = Object.keys(agg).map(k => {
      const m = agg[k];
      m.total = m.present + m.od; m.held = m.present + m.absent + m.od; m.base = m.held;
      m.pct = m.held ? Math.round((m.total / m.held) * 1000) / 10 : 0;
      return m;
    }).sort((a, b) => (+a.sno || 0) - (+b.sno || 0));

    const n = students.length;
    const totAtt = students.reduce((s, x) => s + x.total, 0);
    const totHeld = students.reduce((s, x) => s + x.held, 0);
    const overallPct = totHeld ? Math.round((totAtt / totHeld) * 1000) / 10 : 0;
    const avg = n ? Math.round((students.reduce((s, x) => s + x.pct, 0) / n) * 10) / 10 : 0;

    return json({
      combined: true, updated: new Date().toISOString(), sheetsUsed: used, sheetsSkipped: skipped,
      months: used.length, periods: 5, totalDays, firstDate, lastDate, students,
      summary: { count: n, overallPct, avgPct: avg, below75: students.filter(s => s.pct < 75).length },
    });
  } catch (e) {
    return json({ error: "Combine failed", detail: String(e && e.message || e) }, 502);
  }
}

/* ───────── AI layout interpretation (Groq) ───────── */
async function aiLayout(grid, groqKey) {
  const preview = grid.slice(0, 14).map((r, i) => i + ": " + (r || []).slice(0, 10).map(c => (c == null ? "" : String(c)).slice(0, 14)).join(" | ")).join("\n");
  const midIdx = Math.min(grid.length - 1, 12);
  const midRow = (grid[midIdx] || []).map(c => (c == null ? "" : String(c))).slice(0, 30).join(" ");
  const sys = "You analyse the layout of an attendance spreadsheet grid (0-indexed rows and columns). " +
    "Return ONLY a JSON object, no prose, with keys: startRow, idCol, attStartCol, attEndCol, base, presentCodes, odCodes, absentCodes.";
  const usr = "Grid preview (row: col0 | col1 | ...):\n" + preview +
    "\n\nA full data row (row " + midIdx + "):\n" + midRow + "\n\nReturn the JSON layout config.";
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + groqKey },
    body: JSON.stringify({ model: GROQ_MODEL, temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: sys }, { role: "user", content: usr }] }),
  });
  if (!res.ok) throw new Error("Groq " + res.status + ": " + (await res.text()).slice(0, 200));
  const j = await res.json();
  const txt = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  let cfg;
  try { cfg = JSON.parse(txt); } catch (e) { throw new Error("Groq returned non-JSON: " + String(txt).slice(0, 200)); }
  return {
    startRow: int(cfg.startRow, 10), idCol: int(cfg.idCol, 2), attStartCol: int(cfg.attStartCol, 5),
    attEndCol: int(cfg.attEndCol, 95), base: int(cfg.base, 90),
    presentCodes: arr(cfg.presentCodes, ["P"]), odCodes: arr(cfg.odCodes, ["OD"]), absentCodes: arr(cfg.absentCodes, ["A"]),
    idRegCol: 1, idSnoCol: 0,
  };
}
function defaultLayout() {
  return { startRow: 10, idSnoCol: 0, idRegCol: 1, idCol: 2, attStartCol: 5, attEndCol: 95, base: 90, presentCodes: ["P"], odCodes: ["OD"], absentCodes: ["A"] };
}

/* ───────── deterministic counting ───────── */
function countAttendance(grid, L, sheetName, sheets) {
  const isP = (s) => L.presentCodes.includes(s), isO = (s) => L.odCodes.includes(s), isA = (s) => L.absentCodes.includes(s);
  const PERIODS = 5;
  const headerRow = grid[Math.max(0, L.startRow - 4)] || [];
  const subjectRow = grid[Math.max(0, L.startRow - 3)] || [];
  const days = []; let d = 0;
  while (true) {
    const c = L.attStartCol + d * PERIODS;
    if (c >= headerRow.length + PERIODS) break;
    const raw = (headerRow[c] || "").toString().trim();
    const parsed = parseAnyDate(raw);
    if (!parsed) { const c2 = L.attStartCol + (d + 1) * PERIODS; if (!parseAnyDate((headerRow[c2] || "").toString().trim())) break; }
    const info = parsed || { date: "", dow: "", label: raw.slice(0, 10) || ("Day " + (d + 1)) };
    days.push({ idx: d, col: c, date: info.date, dow: info.dow, label: info.label });
    d++; if (d > 60) break;
  }
  const nDays = days.length || 18;
  const base = nDays * PERIODS;
  let labelDays = null;
  for (let c = 0; c < headerRow.length; c++) { const t = (headerRow[c] || "").toString(); const m = t.match(/(\d+)\s*DAYS/i); if (m) { labelDays = parseInt(m[1], 10); break; } }
  const subjects = []; for (let pp = 0; pp < PERIODS; pp++) subjects.push((subjectRow[L.attStartCol + pp] || "").toString().trim());

  const students = [];
  for (let r = L.startRow; r < grid.length; r++) {
    const row = grid[r] || [];
    const sno = deNum((row[L.idSnoCol] || "").toString().trim());
    const reg = deNum((row[L.idRegCol] || "").toString().trim());
    const name = (row[L.idCol] || "").toString().trim();
    if (!/^\d+$/.test(sno) || !name) { if (name.toUpperCase().includes("NUMBER OF STUDENTS")) break; continue; }
    let p = 0, a = 0, od = 0; const daily = [];
    for (let dd2 = 0; dd2 < nDays; dd2++) {
      let dp = 0, da = 0, dod = 0; const start = L.attStartCol + dd2 * PERIODS;
      for (let pp = 0; pp < PERIODS; pp++) { const v = (row[start + pp] || "").toString().trim().toUpperCase(); if (isP(v)) { p++; dp++; } else if (isO(v)) { od++; dod++; } else if (isA(v)) { a++; da++; } }
      const marked = dp + da + dod; let status = "blank";
      if (marked > 0) { if (da === PERIODS) status = "absent"; else if (dp + dod === PERIODS) status = (dod > 0 && dp === 0) ? "od" : "present"; else status = "partial"; }
      daily.push({ d: dd2, present: dp, absent: da, od: dod, status });
    }
    const total = p + od; const pct = base ? Math.round((total / base) * 1000) / 10 : 0; const markedSlots = p + a + od;
    students.push({ sno: +sno, reg, name, present: p, od, absent: a, total, base, pct, markedSlots, daily });
  }
  const n = students.length;
  const avg = n ? Math.round((students.reduce((s, x) => s + x.pct, 0) / n) * 10) / 10 : 0;
  const below = students.filter(s => s.pct < 75).length;
  const dayTrend = days.map(day => {
    let present = 0, absent = 0, od = 0, marked = 0;
    students.forEach(s => { const dd = s.daily[day.idx]; if (!dd) return; present += dd.present; absent += dd.absent; od += dd.od; marked += dd.present + dd.absent + dd.od; });
    const rate = marked ? Math.round(((present + od) / marked) * 1000) / 10 : null;
    return { idx: day.idx, date: day.date, dow: day.dow, label: day.label, present, absent, od, marked, rate };
  });
  return {
    sheet: sheetName, availableSheets: sheets, updated: new Date().toISOString(),
    base, periods: PERIODS, nDays, labelDays, days, subjects, dayTrend, students,
    summary: { count: n, avgPct: avg, below75: below, basis: labelDays && labelDays !== nDays ? ("Counting " + nDays + " days of data; sheet label says " + labelDays + " days") : (nDays + " days") },
  };
}

function deNum(s) { if (/^\d+$/.test(s)) return s; const n = Number(s); if (!isNaN(n) && isFinite(n) && Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n)); return s.replace(/\.0$/, ""); }
const DOWS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON_IDX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
function fromParts(y, mo, da) { const dt = new Date(Date.UTC(y, mo, da)); const iso = y + "-" + String(mo + 1).padStart(2, "0") + "-" + String(da).padStart(2, "0"); return { date: iso, dow: DOWS[dt.getUTCDay()], label: da + " " + MONS[mo] }; }
function parseAnyDate(raw) {
  const s = String(raw || "").trim(); if (!s) return null;
  const n = parseFloat(s);
  if (!isNaN(n) && String(n) === s.replace(/\.0$/, "") && n > 40000 && n < 60000) { const dt = new Date(Math.round((n - 25569) * 86400 * 1000)); return fromParts(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()); }
  let m = s.match(/^(\d{1,2})[\s\-\/]+([A-Za-z]{3,})[\s\-\/]*(\d{2,4})?$/);
  if (m) { const da = +m[1], mo = MON_IDX[m[2].slice(0, 3).toLowerCase()]; if (mo != null) { let y = m[3] ? +m[3] : (new Date()).getUTCFullYear(); if (y < 100) y += 2000; return fromParts(y, mo, da); } }
  m = s.match(/^([A-Za-z]{3,})[\s\-\/]+(\d{1,2})$/);
  if (m) { const mo = MON_IDX[m[1].slice(0, 3).toLowerCase()]; if (mo != null) return fromParts((new Date()).getUTCFullYear(), mo, +m[2]); }
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if (m) { let da = +m[1], mo = +m[2] - 1, y = m[3] ? +m[3] : (new Date()).getUTCFullYear(); if (y < 100) y += 2000; if (mo >= 0 && mo < 12 && da >= 1 && da <= 31) return fromParts(y, mo, da); }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return fromParts(+m[1], +m[2] - 1, +m[3]);
  return null;
}
function int(v, d) { const n = parseInt(v, 10); return isNaN(n) ? d : n; }
function arr(v, d) { return Array.isArray(v) && v.length ? v.map(x => String(x).toUpperCase()) : d; }

/* ───────── Google auth ───────── */
async function getAccessToken(key, scope) {
  const now = Math.floor(Date.now() / 1000);
  const enc = (o) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: key.client_email, scope: scope || "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now,
  });
  const sig = await signRS256(unsigned, key.private_key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + unsigned + "." + sig,
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("Token error: " + JSON.stringify(j));
  return j.access_token;
}
async function signRS256(data, pem) {
  const der = pemToDer(pem);
  const k = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", k, new TextEncoder().encode(data));
  return b64url(new Uint8Array(sig));
}
function pemToDer(pem) { const b64 = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/\s+/g, ""); const bin = atob(b64), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); return buf.buffer; }
function b64url(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }

/* ───────── Drive download ───────── */
async function downloadFile(fileId, token) {
  const u = "https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media&supportsAllDrives=true";
  const r = await fetch(u, { headers: { Authorization: "Bearer " + token } });
  if (!r.ok) throw new Error("Drive " + r.status + ": " + (await r.text()).slice(0, 200));
  return new Uint8Array(await r.arrayBuffer());
}

/* ───────── XLSX → grid ───────── */
async function extractGrid(bytes, wantSheet) {
  const { files } = await unzip(bytes);
  const dec = new TextDecoder();
  const shared = parseSharedStrings(files["xl/sharedStrings.xml"] ? dec.decode(files["xl/sharedStrings.xml"]) : "");
  const sheets = mapSheets(dec.decode(files["xl/workbook.xml"] || new Uint8Array()), dec.decode(files["xl/_rels/workbook.xml.rels"] || new Uint8Array()));
  let target = sheets[0];
  if (wantSheet) { const f = sheets.find(s => s.name.toUpperCase().includes(wantSheet.toUpperCase())); if (f) target = f; }
  const grid = parseSheet(dec.decode(files["xl/" + target.path] || new Uint8Array()), shared);
  return { grid, sheetName: target.name, sheets: sheets.map(s => s.name) };
}
function parseSharedStrings(xml) { const out = []; const re = /<si>([\s\S]*?)<\/si>/g; let m; while ((m = re.exec(xml))) { let t = ""; const tr = /<t[^>]*>([\s\S]*?)<\/t>/g; let tm; while ((tm = tr.exec(m[1]))) t += unesc(tm[1]); out.push(t); } return out; }
function mapSheets(wb, rels) {
  const map = {}; let m; const rr = /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g;
  while ((m = rr.exec(rels))) map[m[1]] = m[2].replace(/^\/?xl\//, "").replace(/^\//, "");
  const sheets = []; const sr = /<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/>/g;
  while ((m = sr.exec(wb))) sheets.push({ name: unesc(m[1]), path: map[m[2]] || ("worksheets/" + m[2] + ".xml") });
  return sheets;
}
function parseSheet(xml, shared) {
  const rows = []; const rowRe = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g; let rm;
  while ((rm = rowRe.exec(xml))) {
    const cells = [];
    const cRe = /<c[^>]*r="([A-Z]+)\d+"(?:[^>]*t="([^"]+)")?[^>]*>(?:<v>([\s\S]*?)<\/v>|<is><t[^>]*>([\s\S]*?)<\/t><\/is>)?<\/c>/g;
    let cm;
    while ((cm = cRe.exec(rm[2]))) {
      const col = colIdx(cm[1]); const t = cm[2];
      let v = cm[3] !== undefined ? cm[3] : (cm[4] !== undefined ? cm[4] : "");
      if (t === "s") v = shared[+v] || ""; else v = unesc(v);
      while (cells.length <= col) cells.push("");
      cells[col] = v;
    }
    rows.push(cells);
  }
  return rows;
}
function colIdx(letters) { let n = 0; for (let i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64); return n - 1; }
function unesc(s) { return (s || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&"); }

/* ───────── minimal ZIP reader (returns files + order) ───────── */
async function unzip(bytes) {
  const files = {}, raw = {}, order = [];
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("Not a zip");
  const cdOff = dv.getUint32(eocd + 16, true), cdCnt = dv.getUint16(eocd + 10, true);
  let p = cdOff;
  for (let i = 0; i < cdCnt; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), crc = dv.getUint32(p + 16, true);
    const compSize = dv.getUint32(p + 20, true), uncompSize = dv.getUint32(p + 24, true);
    const nameLen = dv.getUint16(p + 28, true), extraLen = dv.getUint16(p + 30, true), commentLen = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    const lhNameLen = dv.getUint16(lho + 26, true), lhExtraLen = dv.getUint16(lho + 28, true);
    const start = lho + 30 + lhNameLen + lhExtraLen;
    const comp = bytes.subarray(start, start + compSize);
    files[name] = method === 0 ? comp : await inflate(comp);
    raw[name] = { method, crc, comp, uncompSize };   // keep original compressed bytes to re-emit unchanged files cheaply
    order.push(name);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return { files, order, raw };
}
async function inflate(comp) { const ds = new DecompressionStream("deflate-raw"); const stream = new Response(comp).body.pipeThrough(ds); return new Uint8Array(await new Response(stream).arrayBuffer()); }

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}
