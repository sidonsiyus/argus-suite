import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { verifyCoordinatorSession } from '@/lib/auth/require-coordinator';
import {
  isValidRegisterNumber,
  isValidEmail,
  sanitizeCsvField,
} from '@/lib/utils/validation';
import {
  parseRfc4180Csv,
  normalizeAcademicYear,
  findCsvDuplicates,
  ParsedCsvRow,
} from '@/lib/utils/csv-parser';
import { logAuditEvent } from '@/lib/audit';

export interface RowFieldChange {
  field: string;
  existingValue: string;
  incomingValue: string;
}

export interface PreviewItem {
  row: number;
  register_number: string;
  name: string;
  programme: string;
  year: string;
  section: string;
  email: string | null;
  phone: string | null;
  classification: 'NEW' | 'NO_CHANGE' | 'UPDATE' | 'DUPLICATE' | 'INVALID';
  existingSource?: 'IMPORTED' | 'BOOKING' | 'ADMIN';
  changes?: RowFieldChange[];
  error?: string;
}

/**
 * Resolves standard column indices with alias support
 */
function resolveHeaderIndices(headers: string[]) {
  const findIdx = (...aliases: string[]) => {
    return headers.findIndex((h) => aliases.includes(h.toLowerCase().trim()));
  };

  return {
    regIdx: findIdx('register_number', 'reg_number', 'reg_no', 'regno', 'registration_number'),
    nameIdx: findIdx('name', 'student_name', 'full_name'),
    progIdx: findIdx('programme', 'program', 'course', 'branch', 'department'),
    yearIdx: findIdx('year', 'academic_year', 'yr'),
    secIdx: findIdx('section', 'sec'),
    emailIdx: findIdx('email', 'student_email', 'email_id', 'email_address'),
    phoneIdx: findIdx('phone', 'phone_number', 'mobile', 'contact', 'mobile_number'),
  };
}

export async function POST(request: NextRequest) {
  const authCheck = await verifyCoordinatorSession();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status || 401 });
  }

  try {
    const body = await request.json();
    const { csvText, action = 'import' } = body;

    if (!csvText || typeof csvText !== 'string') {
      return NextResponse.json(
        { error: 'CSV data is required.' },
        { status: 400 }
      );
    }

    // Size limit: 2MB max
    if (csvText.length > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'CSV file size exceeds 2MB limit. Please split the file into smaller batches.' },
        { status: 400 }
      );
    }

    // Parse CSV using RFC 4180 parser
    const { headers, rows, errors: parseErrors } = parseRfc4180Csv(csvText);

    if (parseErrors.length > 0 && rows.length === 0) {
      return NextResponse.json(
        { error: parseErrors[0].reason || 'Malformed CSV format.' },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file must contain a header row and at least one student data row.' },
        { status: 400 }
      );
    }

    if (rows.length > 5000) {
      return NextResponse.json(
        { error: 'CSV file contains too many rows (limit is 5,000 students per batch).' },
        { status: 400 }
      );
    }

    const { regIdx, nameIdx, progIdx, yearIdx, secIdx, emailIdx, phoneIdx } =
      resolveHeaderIndices(headers);

    if (regIdx === -1 || nameIdx === -1) {
      return NextResponse.json(
        {
          error:
            'Missing required header columns. The CSV must contain at least "register_number" and "name". Expected: register_number, name, programme, year, section, email, phone.',
        },
        { status: 400 }
      );
    }

    if (progIdx === -1 || yearIdx === -1 || secIdx === -1) {
      return NextResponse.json(
        {
          error:
            'Missing required header columns. Expected: register_number, name, programme, year, section. Optional: email, phone.',
        },
        { status: 400 }
      );
    }

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    // Fetch existing students for matching (schema-resilient)
    let existingStudents: any[] = [];
    const { data: stdData, error: fetchErr } = await supabase
      .from('students')
      .select('id, register_number, name, programme, year, section, email, phone, status, source');

    if (fetchErr) {
      // Fallback for MENTOR OS schema before additive migration
      const { data: mentorData, error: mentorErr } = await supabase
        .from('students')
        .select('*');

      if (mentorErr) {
        return NextResponse.json(
          { error: `Database error while loading existing students: ${fetchErr.message}` },
          { status: 500 }
        );
      }

      existingStudents = (mentorData || []).map((s: any) => ({
        id: s.id,
        register_number: s.register_number || s.reg_no || '',
        name: s.name || s.full_name || '',
        programme: s.programme || 'Department of Aviation',
        year: s.year || 'N/A',
        section: s.section || 'N/A',
        email: s.email,
        phone: s.phone,
        status: s.status || (s.is_active ? 'ACTIVE' : 'INACTIVE'),
        source: s.source || 'IMPORTED',
      }));
    } else {
      existingStudents = stdData || [];
    }

    // Map existing students by upper(trim(register_number))
    const existingMap = new Map<string, any>();
    (existingStudents || []).forEach((s) => {
      existingMap.set(s.register_number.trim().toUpperCase(), s);
    });

    // Detect duplicate Register Numbers inside the CSV
    const duplicatesInCsv = findCsvDuplicates(rows);

    const previewItems: PreviewItem[] = [];
    let newCount = 0;
    let existingNoChangeCount = 0;
    let existingUpdateCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (const row of rows) {
      const rowNum = row.rowNumber;
      const rawReg = row.data[headers[regIdx]]?.trim() ?? '';
      const rawName = row.data[headers[nameIdx]]?.trim() ?? '';
      const rawProgramme = row.data[headers[progIdx]]?.trim() ?? '';
      const rawYear = row.data[headers[yearIdx]]?.trim() ?? '';
      const rawSection = row.data[headers[secIdx]]?.trim() ?? '';
      const rawEmail = emailIdx !== -1 ? row.data[headers[emailIdx]]?.trim() : '';
      const rawPhone = phoneIdx !== -1 ? row.data[headers[phoneIdx]]?.trim() : '';

      const normReg = rawReg.toUpperCase();

      // 1. Check Missing Required Fields
      if (!rawReg) {
        invalidCount++;
        previewItems.push({
          row: rowNum,
          register_number: '—',
          name: rawName,
          programme: rawProgramme,
          year: rawYear,
          section: rawSection,
          email: rawEmail || null,
          phone: rawPhone || null,
          classification: 'INVALID',
          error: 'Missing Register Number',
        });
        continue;
      }

      if (!rawName) {
        invalidCount++;
        previewItems.push({
          row: rowNum,
          register_number: normReg,
          name: '—',
          programme: rawProgramme,
          year: rawYear,
          section: rawSection,
          email: rawEmail || null,
          phone: rawPhone || null,
          classification: 'INVALID',
          error: 'Missing Student Name',
        });
        continue;
      }

      if (!rawProgramme) {
        invalidCount++;
        previewItems.push({
          row: rowNum,
          register_number: normReg,
          name: rawName,
          programme: '—',
          year: rawYear,
          section: rawSection,
          email: rawEmail || null,
          phone: rawPhone || null,
          classification: 'INVALID',
          error: 'Missing Programme',
        });
        continue;
      }

      // Normalize Section: if not specified or 'NA', normalize to 'N/A' (never invent A, B, C)
      const normSection = (!rawSection || rawSection.toUpperCase() === 'NA') ? 'N/A' : rawSection.trim();

      // 2. Validate Register Number Format
      if (!isValidRegisterNumber(normReg)) {
        invalidCount++;
        previewItems.push({
          row: rowNum,
          register_number: normReg,
          name: rawName,
          programme: rawProgramme,
          year: rawYear,
          section: rawSection,
          email: rawEmail || null,
          phone: rawPhone || null,
          classification: 'INVALID',
          error: 'Invalid Register Number format (alphanumeric, 2–30 chars)',
        });
        continue;
      }

      // 3. Normalize & Validate Academic Year
      const yearResult = normalizeAcademicYear(rawYear);
      if (!yearResult.valid || !yearResult.normalized) {
        invalidCount++;
        previewItems.push({
          row: rowNum,
          register_number: normReg,
          name: rawName,
          programme: rawProgramme,
          year: rawYear,
          section: rawSection,
          email: rawEmail || null,
          phone: rawPhone || null,
          classification: 'INVALID',
          error: yearResult.reason || 'Invalid academic year',
        });
        continue;
      }
      const normYear = yearResult.normalized;

      // 4. Validate Email Format (if provided)
      if (rawEmail && !isValidEmail(rawEmail)) {
        invalidCount++;
        previewItems.push({
          row: rowNum,
          register_number: normReg,
          name: rawName,
          programme: rawProgramme,
          year: normYear,
          section: normSection,
          email: rawEmail,
          phone: rawPhone || null,
          classification: 'INVALID',
          error: `Invalid email address format: ${rawEmail}`,
        });
        continue;
      }

      // 5. In-CSV Duplicate Check
      if (duplicatesInCsv.has(normReg)) {
        duplicateCount++;
        const allOccurrences = duplicatesInCsv.get(normReg)!;
        previewItems.push({
          row: rowNum,
          register_number: normReg,
          name: rawName,
          programme: rawProgramme,
          year: normYear,
          section: normSection,
          email: rawEmail || null,
          phone: rawPhone || null,
          classification: 'DUPLICATE',
          error: `Duplicate Register Number: ${normReg} (appears on Rows: ${allOccurrences.join(', ')})`,
        });
        continue;
      }

      // 6. Match Against Existing Database Record
      const existing = existingMap.get(normReg);

      if (!existing) {
        newCount++;
        previewItems.push({
          row: rowNum,
          register_number: normReg,
          name: rawName,
          programme: rawProgramme,
          year: normYear,
          section: normSection,
          email: rawEmail || null,
          phone: rawPhone || null,
          classification: 'NEW',
        });
      } else {
        // Compute Field Diffs
        const changes: RowFieldChange[] = [];

        if (existing.name.trim().toLowerCase() !== rawName.trim().toLowerCase()) {
          changes.push({
            field: 'name',
            existingValue: existing.name,
            incomingValue: rawName,
          });
        }

        if (existing.programme.trim().toLowerCase() !== rawProgramme.trim().toLowerCase()) {
          changes.push({
            field: 'programme',
            existingValue: existing.programme,
            incomingValue: rawProgramme,
          });
        }

        if (existing.year.trim().toUpperCase() !== normYear) {
          changes.push({
            field: 'year',
            existingValue: existing.year,
            incomingValue: normYear,
          });
        }

        if (existing.section.trim().toUpperCase() !== normSection.toUpperCase()) {
          changes.push({
            field: 'section',
            existingValue: existing.section,
            incomingValue: normSection,
          });
        }

        const existingEmail = existing.email ? existing.email.trim().toLowerCase() : '';
        const incomingEmail = rawEmail ? rawEmail.trim().toLowerCase() : '';
        if (incomingEmail && existingEmail !== incomingEmail) {
          changes.push({
            field: 'email',
            existingValue: existing.email || '—',
            incomingValue: rawEmail,
          });
        }

        const existingPhone = existing.phone ? existing.phone.trim() : '';
        const incomingPhone = rawPhone ? rawPhone.trim() : '';
        if (incomingPhone && existingPhone !== incomingPhone) {
          changes.push({
            field: 'phone',
            existingValue: existing.phone || '—',
            incomingValue: rawPhone,
          });
        }

        if (changes.length > 0) {
          existingUpdateCount++;
          previewItems.push({
            row: rowNum,
            register_number: normReg,
            name: rawName,
            programme: rawProgramme,
            year: normYear,
            section: normSection,
            email: rawEmail || null,
            phone: rawPhone || null,
            classification: 'UPDATE',
            existingSource: existing.source,
            changes,
          });
        } else {
          existingNoChangeCount++;
          previewItems.push({
            row: rowNum,
            register_number: normReg,
            name: rawName,
            programme: rawProgramme,
            year: normYear,
            section: normSection,
            email: rawEmail || null,
            phone: rawPhone || null,
            classification: 'NO_CHANGE',
            existingSource: existing.source,
          });
        }
      }

    }

    const summary = {
      totalRows: rows.length,
      newCount,
      existingNoChangeCount,
      existingUpdateCount,
      duplicateCount,
      invalidCount,
    };

    // =========================================================================
    // PHASE 1: PREVIEW (ZERO DATABASE WRITES)
    // =========================================================================
    if (action === 'preview') {
      return NextResponse.json({
        success: true,
        preview: true,
        summary,
        items: previewItems,
      });
    }

    // =========================================================================
    // PHASE 2: CONFIRMED IMPORT (CHUNKED BATCH OPERATIONS)
    // =========================================================================
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const executionErrors: { row: number; register_number?: string; reason: string }[] = [];

    const newItems: PreviewItem[] = [];
    const updateItems: PreviewItem[] = [];

    for (const item of previewItems) {
      if (item.classification === 'INVALID' || item.classification === 'DUPLICATE') {
        skippedCount++;
        executionErrors.push({
          row: item.row,
          register_number: item.register_number !== '—' ? item.register_number : undefined,
          reason: item.error || 'Row validation error or duplicate in CSV',
        });
        continue;
      }

      if (item.classification === 'NO_CHANGE') {
        // No modification needed, existing data is identical
        continue;
      }

      if (item.classification === 'NEW') {
        newItems.push(item);
      } else if (item.classification === 'UPDATE') {
        updateItems.push(item);
      }
    }

    // 1. CHUNKED BATCH INSERTS (Chunk size: 100 records)
    const BATCH_SIZE = 100;
    for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
      const chunk = newItems.slice(i, i + BATCH_SIZE);
      const insertPayloads = chunk.map((item) => ({
        register_number: sanitizeCsvField(item.register_number, 30),
        name: sanitizeCsvField(item.name, 100),
        programme: sanitizeCsvField(item.programme, 100),
        year: sanitizeCsvField(item.year, 10),
        section: sanitizeCsvField(item.section, 10),
        email: item.email ? sanitizeCsvField(item.email, 100) : null,
        phone: item.phone ? sanitizeCsvField(item.phone, 25) : null,
        status: 'ACTIVE',
        source: 'IMPORTED',
      }));

      const { error: batchErr } = await supabase.from('students').insert(insertPayloads);

      if (!batchErr) {
        importedCount += chunk.length;
      } else {
        // Fallback: If chunk insert fails, isolate row-by-row to preserve valid records
        for (let j = 0; j < chunk.length; j++) {
          const item = chunk[j];
          const singlePayload = insertPayloads[j];
          const { error: singleErr } = await supabase.from('students').insert(singlePayload);

          if (singleErr) {
            skippedCount++;
            executionErrors.push({
              row: item.row,
              register_number: item.register_number,
              reason: `Insert failed: ${singleErr.message}`,
            });
          } else {
            importedCount++;
          }
        }
      }
    }

    // 2. BATCH UPDATES (Concurrent chunks of 25 records)
    const UPDATE_CONCURRENCY = 25;
    for (let i = 0; i < updateItems.length; i += UPDATE_CONCURRENCY) {
      const chunk = updateItems.slice(i, i + UPDATE_CONCURRENCY);
      await Promise.all(
        chunk.map(async (item) => {
          const reg = sanitizeCsvField(item.register_number, 30);
          const existing = existingMap.get(reg.toUpperCase());
          if (!existing) {
            skippedCount++;
            executionErrors.push({
              row: item.row,
              register_number: reg,
              reason: 'Existing student record no longer found during commit phase.',
            });
            return;
          }

          // UPDATE EXISTING STUDENT RECORD:
          // PRESERVES students.id (UUID) and foreign key relationships to appointments!
          // PRESERVES original source (whether BOOKING, ADMIN, or IMPORTED)!
          const { error: updateErr } = await supabase
            .from('students')
            .update({
              name: sanitizeCsvField(item.name, 100),
              programme: sanitizeCsvField(item.programme, 100),
              year: sanitizeCsvField(item.year, 10),
              section: sanitizeCsvField(item.section, 10),
              email: item.email ? sanitizeCsvField(item.email, 100) : null,
              phone: item.phone ? sanitizeCsvField(item.phone, 25) : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateErr) {
            skippedCount++;
            executionErrors.push({
              row: item.row,
              register_number: reg,
              reason: `Update failed: ${updateErr.message}`,
            });
          } else {
            updatedCount++;
          }
        })
      );
    }

    // Structured Audit Logging
    await logAuditEvent(supabase, {
      actor_user_id: authCheck.user?.id,
      action: 'STUDENT_BATCH_IMPORTED',
      entity_type: 'IMPORT',
      metadata: {
        total_rows: rows.length,
        imported: importedCount,
        updated: updatedCount,
        no_change: existingNoChangeCount,
        skipped: skippedCount,
        errors: executionErrors.length,
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rows.length,
        imported: importedCount,
        updated: updatedCount,
        noChange: existingNoChangeCount,
        skipped: skippedCount,
        errorCount: executionErrors.length,
        errors: executionErrors,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error processing student CSV import' },
      { status: 500 }
    );
  }
}
