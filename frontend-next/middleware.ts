import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth guard is client-side in (app)/layout (token in Zustand/localStorage)
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}
