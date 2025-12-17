import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if accessing dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for auth token in cookies
    const authToken = request.cookies.get('auth-token')?.value

    // If no auth token, redirect to login
    if (!authToken) {
      const loginUrl = new URL('/login', request.url)
      // Add redirect parameter so we can redirect back after login
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
