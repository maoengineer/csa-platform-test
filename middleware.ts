import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_ROUTES = ['/feed', '/messages', '/settings', '/search'];
const ADMIN_ROUTES = ['/admin'];
const MODERATOR_ROUTES = ['/moderator'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect routes that require login
  if (!user && PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin/Moderator routes - user check (role check happens in page)
  if (!user && (ADMIN_ROUTES.some(r => pathname.startsWith(r)) || MODERATOR_ROUTES.some(r => pathname.startsWith(r)))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
