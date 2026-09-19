/**
 * Production RFC 4180 CSV Parser & Normalization Utility
 * Department of Aviation — Faculty–Student Appointment Portal
 */

export interface ParsedCsvRow {
  rowNumber: number;
  data: Record<string, string>;
  rawValues: string[];
}

export interface CsvParseResult {
  headers: string[];
  rows: ParsedCsvRow[];
  headerMap: Record<string, number>;
  errors: { row: number; reason: string }[];
}

/**
 * Parses raw CSV string according to RFC 4180 rules:
 * - Handles UTF-8 BOM (\uFEFF)
 * - Supports CRLF and LF line breaks
 * - Supports multiline quoted cells
 * - Supports escaped double quotes ("") inside quoted fields
 * - Trims leading and trailing whitespace around unquoted fields
 */
export function parseRfc4180Csv(csvText: string): CsvParseResult {
  if (!csvText || typeof csvText !== 'string') {
    return { headers: [], rows: [], headerMap: {}, errors: [{ row: 0, reason: 'Empty CSV input' }] };
  }

  // Strip UTF-8 BOM if present
  let text = csvText;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const rawRows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ("")
        if (i + 1 < len && text[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r') {
        // Handle CRLF
        if (i + 1 < len && text[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((field) => field.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((field) => field.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Final field and row if any remaining
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rawRows.push(currentRow);
    }
  }

  if (rawRows.length === 0) {
    return { headers: [], rows: [], headerMap: {}, errors: [{ row: 0, reason: 'No rows found in CSV' }] };
  }

  // Extract and normalize headers
  const rawHeaders = rawRows[0];
  const headers = rawHeaders.map((h) =>
    h
      .toLowerCase()
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\s+/g, '_')
  );

  const headerMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const parsedRows: ParsedCsvRow[] = [];
  const errors: { row: number; reason: string }[] = [];

  // Parse data rows
  for (let r = 1; r < rawRows.length; r++) {
    const rowNumber = r + 1; // 1-indexed for display, accounting for header
    const rowValues = rawRows[r];

    // Skip purely empty rows
    if (rowValues.every((val) => val.trim() === '')) {
      continue;
    }

    const rowData: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      rowData[header] = (rowValues[colIdx] ?? '').trim();
    });

    parsedRows.push({
      rowNumber,
      data: rowData,
      rawValues: rowValues,
    });
  }

  return {
    headers,
    rows: parsedRows,
    headerMap,
    errors,
  };
}

/**
 * Normalizes academic year values safely.
 * Accepts: I, II, III, IV, 1, 2, 3, 4, and "Year 1" / "First Year" style formats.
 * Rejects ambiguous values (e.g., 2023, Senior, Final, UG3).
 */
export function normalizeAcademicYear(rawYear: string): {
  valid: boolean;
  normalized?: 'I' | 'II' | 'III' | 'IV';
  raw: string;
  reason?: string;
} {
  if (!rawYear || typeof rawYear !== 'string') {
    return { valid: false, raw: '', reason: 'Academic year is missing' };
  }

  const cleaned = rawYear.trim().toUpperCase();

  // Direct Roman numeral and numeric matches
  if (
    cleaned === 'I' ||
    cleaned === 'YEAR I' ||
    cleaned === 'YEAR-I' ||
    cleaned === '1' ||
    cleaned === 'YEAR 1' ||
    cleaned === 'YEAR-1' ||
    cleaned === 'FIRST YEAR' ||
    cleaned === '1ST YEAR'
  ) {
    return { valid: true, normalized: 'I', raw: rawYear };
  }
  if (
    cleaned === 'II' ||
    cleaned === 'YEAR II' ||
    cleaned === 'YEAR-II' ||
    cleaned === '2' ||
    cleaned === 'YEAR 2' ||
    cleaned === 'YEAR-2' ||
    cleaned === 'SECOND YEAR' ||
    cleaned === '2ND YEAR'
  ) {
    return { valid: true, normalized: 'II', raw: rawYear };
  }
  if (
    cleaned === 'III' ||
    cleaned === 'YEAR III' ||
    cleaned === 'YEAR-III' ||
    cleaned === '3' ||
    cleaned === 'YEAR 3' ||
    cleaned === 'YEAR-3' ||
    cleaned === 'THIRD YEAR' ||
    cleaned === '3RD YEAR'
  ) {
    return { valid: true, normalized: 'III', raw: rawYear };
  }
  if (
    cleaned === 'IV' ||
    cleaned === 'YEAR IV' ||
    cleaned === 'YEAR-IV' ||
    cleaned === '4' ||
    cleaned === 'YEAR 4' ||
    cleaned === 'YEAR-4' ||
    cleaned === 'FOURTH YEAR' ||
    cleaned === '4TH YEAR'
  ) {
    return { valid: true, normalized: 'IV', raw: rawYear };
  }

  return {
    valid: false,
    raw: rawYear,
    reason: `Unsupported academic year format "${rawYear}". Accepted formats: I, II, III, IV (or 1, 2, 3, 4).`,
  };
}

/**
 * Finds all duplicate Register Numbers within the parsed CSV rows.
 * Returns a map of registerNumber -> array of row numbers where it appeared.
 */
export function findCsvDuplicates(rows: ParsedCsvRow[]): Map<string, number[]> {
  const regToRows = new Map<string, number[]>();

  for (const row of rows) {
    const reg = row.data['register_number']?.trim().toUpperCase();
    if (reg) {
      const existing = regToRows.get(reg) || [];
      existing.push(row.rowNumber);
      regToRows.set(reg, existing);
    }
  }

  // Filter to only those with > 1 occurrence
  const duplicates = new Map<string, number[]>();
  regToRows.forEach((rowNums, reg) => {
    if (rowNums.length > 1) {
      duplicates.set(reg, rowNums);
    }
  });

  return duplicates;
}
