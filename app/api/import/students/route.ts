import { NextRequest } from 'next/server';
import { POST as coordinatorImportPost } from '@/app/api/coordinator/students/import/route';

/**
 * Legacy alias route forwarding to the primary coordinator import API
 */
export async function POST(request: NextRequest) {
  return coordinatorImportPost(request);
}
