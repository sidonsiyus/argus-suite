/**
 * ARGUS Attendance → Google Sheet writer
 * ---------------------------------------------------------------
 * Bound Apps Script for "II B.SC. AERO A" (spreadsheet 1Z_rWwGIKSTFlbqb3yFR89ztYWg1IJwYf).
 * Receives a day's marks from the ARGUS dashboard and writes P / A / OD into the
 * five period columns under that date, matched to each student by Reg No.
 *
 * SETUP (once):
 *   1. Open the sheet → Extensions → Apps Script. Paste this file in (replace Code.gs).
 *   2. Project Settings (gear) → Script properties → add property:
 *          WRITE_SECRET   =   <a private passphrase you choose>
 *      (Put the SAME passphrase into the ARGUS dashboard under ⚙ → Sheet writer.)
 *   3. Deploy → New deployment → type "Web app":
 *          Execute as:  Me
 *          Who has access:  Anyone
 *      Copy the /exec URL → paste it into the dashboard (⚙ → Sheet writer).
 *   4. On first deploy Google asks you to authorise access to the spreadsheet — allow it.
 *
 * It only ever writes the five period cells under the requested date. It never
 * creates date columns (if the date isn't already in the sheet it returns an
 * error), and never touches any other day. Re-sending the same day overwrites.
 */

// ── layout knobs (only change if the sheet template changes) ──
var PERIODS_PER_DAY = 5;      // columns per date (period 1..5)
var FIRST_DATA_HINT = 6;      // period columns start around column F (1-based); used as a floor when scanning

function doGet(e) {
  // health check — open the /exec URL in a browser to confirm it's deployed
  return json({ ok: true, service: 'argus-attendance-writer', tabs: SpreadsheetApp.getActive().getSheets().map(function (s) { return s.getName(); }) });
}

function doPost(e) {
  try {
    var body = {};
    try { body = JSON.parse(e.postData.contents); } catch (_) { return json({ ok: false, error: 'bad JSON body' }); }

    var secret = PropertiesService.getScriptProperties().getProperty('WRITE_SECRET');
    if (!secret) return json({ ok: false, error: 'WRITE_SECRET not set in Script properties' });
    if (String(body.secret || '') !== String(secret)) return json({ ok: false, error: 'unauthorised (bad secret)' });

    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName(body.sheetName);
    if (!sh) return json({ ok: false, error: 'tab not found: "' + body.sheetName + '"' });

    var tgt = parseYMD(body.date);              // { y, m, d }
    if (!tgt) return json({ ok: false, error: 'bad date: ' + body.date });

    var values = sh.getDataRange().getValues();  // 0-based 2D grid
    var loc = locate(values);                    // { headerRow, regCol, nameCol, dateRow, dataStart, dataEnd }
    if (loc.regCol < 0) return json({ ok: false, error: 'could not find a "Reg No" header in the tab' });

    var dateCol = findDateColumn(values[loc.dateRow], tgt, ss.getSpreadsheetTimeZone(), loc.nameCol);
    if (dateCol < 0) return json({ ok: false, error: 'date ' + fmt(tgt) + ' not found in row ' + (loc.dateRow + 1) + ' — add the column in the sheet first' });

    // reg -> sheet row (0-based)
    var rowByReg = {};
    for (var r = loc.dataStart; r <= loc.dataEnd; r++) {
      var reg = normReg(values[r][loc.regCol]);
      if (reg) rowByReg[reg] = r;
    }

    var marks = body.marks || [];
    var wrote = 0, present = 0, absent = 0, od = 0;
    var unmatched = [];
    var writes = [];  // { row, mark } collected, applied after validation

    for (var i = 0; i < marks.length; i++) {
      var reg = normReg(marks[i].reg);
      var mk = String(marks[i].mark || '').toUpperCase();
      if (mk !== 'P' && mk !== 'A' && mk !== 'OD') continue;
      var row = rowByReg[reg];
      if (row == null) { unmatched.push(marks[i].reg); continue; }
      writes.push({ row: row, mark: mk });
      if (mk === 'P') present++; else if (mk === 'OD') od++; else absent++;
    }

    if (!body.dryRun) {
      for (var w = 0; w < writes.length; w++) {
        var rowVals = [];
        for (var p = 0; p < PERIODS_PER_DAY; p++) rowVals.push(writes[w].mark);
        sh.getRange(writes[w].row + 1, dateCol + 1, 1, PERIODS_PER_DAY).setValues([rowVals]);
        wrote++;
      }
    } else {
      wrote = writes.length;
    }

    return json({
      ok: true, dryRun: !!body.dryRun, sheet: body.sheetName, date: fmt(tgt),
      dateColumn: colLetter(dateCol), wrote: wrote, present: present, absent: absent, od: od,
      unmatched: unmatched
    });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

/* ── helpers ── */

// find the header row (has "Reg No"), the date row above it, and the data range
function locate(values) {
  var headerRow = -1, regCol = -1, nameCol = -1;
  for (var r = 0; r < Math.min(values.length, 20) && headerRow < 0; r++) {
    for (var c = 0; c < values[r].length; c++) {
      var v = String(values[r][c] || '').trim().toLowerCase();
      if (v === 'reg no' || v === 'reg no.' || v === 'reg. no' || v === 'reg. no.' || v === 'reg no:' || v.indexOf('reg no') === 0) {
        headerRow = r; regCol = c;
      }
      if (headerRow === r && (v.indexOf('name') === 0)) nameCol = c;
    }
  }
  if (headerRow >= 0 && nameCol < 0) nameCol = regCol + 1;
  var dateRow = headerRow > 0 ? headerRow - 1 : 0;

  // data starts at the first row below the header whose reg cell looks like a reg number
  var dataStart = -1, dataEnd = -1;
  for (var rr = headerRow + 1; rr < values.length; rr++) {
    if (normReg(values[rr][regCol])) { if (dataStart < 0) dataStart = rr; dataEnd = rr; }
    else if (dataStart >= 0 && !normReg(values[rr][regCol])) { break; } // stop at first gap after data begins
  }
  return { headerRow: headerRow, regCol: regCol, nameCol: nameCol, dateRow: dateRow, dataStart: dataStart, dataEnd: dataEnd };
}

// scan the date row for a cell matching the target day+month (dates are merged, value in the first of the 5 cols)
function findDateColumn(dateRowVals, tgt, tz, nameCol) {
  var start = Math.max(nameCol + 1, FIRST_DATA_HINT - 1);
  for (var c = start; c < dateRowVals.length; c++) {
    var cell = dateRowVals[c];
    if (cell === '' || cell == null) continue;
    var md = cellToMonthDay(cell, tz);
    if (md && md.m === tgt.m && md.d === tgt.d) return c;
  }
  return -1;
}

// turn a date-header cell (real Date, or text like "1-Sep") into { m, d }
function cellToMonthDay(cell, tz) {
  if (Object.prototype.toString.call(cell) === '[object Date]') {
    return { m: cell.getMonth() + 1, d: cell.getDate() };
  }
  var s = String(cell).trim();
  var m = s.match(/^(\d{1,2})[\-\/ ]+([A-Za-z]{3,})/);           // "1-Sep", "1 September"
  if (m) { var mon = monthNum(m[2]); if (mon) return { m: mon, d: +m[1] }; }
  var m2 = s.match(/^([A-Za-z]{3,})[\-\/ ]+(\d{1,2})/);          // "Sep-1", "September 1"
  if (m2) { var mon2 = monthNum(m2[1]); if (mon2) return { m: mon2, d: +m2[2] }; }
  var d = new Date(s);                                           // last resort
  if (!isNaN(d.getTime())) return { m: d.getMonth() + 1, d: d.getDate() };
  return null;
}

function monthNum(name) {
  var m = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var i = m.indexOf(String(name).slice(0, 3).toLowerCase());
  return i < 0 ? 0 : i + 1;
}
function parseYMD(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  return { y: +m[1], m: +m[2], d: +m[3] };
}
function fmt(t) {
  var mm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return t.d + '-' + mm[t.m - 1];
}
function normReg(v) {
  var s = String(v == null ? '' : v).trim();
  if (/^\d{5,}(\.0)?$/.test(s)) return s.replace(/\.0$/, '');   // handles reg read back as a number
  return /^\d{5,}$/.test(s) ? s : (s && /^\d/.test(s) ? s : '');
}
function colLetter(c) {
  var s = ''; c += 1;
  while (c > 0) { var r = (c - 1) % 26; s = String.fromCharCode(65 + r) + s; c = (c - r - 1) / 26; }
  return s;
}
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
