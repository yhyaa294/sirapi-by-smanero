import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if accessing dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // In production, you'd check a cookie or session
    // For now, we'll let the client-side handle it
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
