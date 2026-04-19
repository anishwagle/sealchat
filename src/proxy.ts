import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Logger } from "./lib/logger";

const COMPONENT = "AuthProxy";
const FUNCTION = "proxy";

const PUBLIC_PAGES = ['/', '/privacy', '/login', '/signup'];
const PUBLIC_PAGE_PREFIXES = ['/auth/'];
const PUBLIC_API_PREFIXES = ['/api/waitlist', '/api/auth'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // --- Public API exemption (check early to avoid unnecessary auth calls) ---
  if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return supabaseResponse;
  }

  // --- Fetch user session (also triggers token refresh if needed) ---
  const { data: { user } } = await supabase.auth.getUser();

  // --- Page guard ---
  if (!pathname.startsWith('/api/')) {
    const isPublicPage = PUBLIC_PAGES.includes(pathname);
    const isPublicPrefix = PUBLIC_PAGE_PREFIXES.some(prefix => pathname.startsWith(prefix));

    if (!isPublicPage && !isPublicPrefix && !user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For authenticated requests to pages, attach user context to request headers
    if (user) {
      request.headers.set('x-user-id', user.id);
      request.headers.set('x-user-email', user.email!);

      const existingCookies = supabaseResponse.cookies.getAll();
      supabaseResponse = NextResponse.next({ request });
      existingCookies.forEach(cookie => {
        supabaseResponse.cookies.set(cookie);
      });
    }

    return supabaseResponse;
  }

  // --- Protected API auth ---
  Logger.log(COMPONENT, FUNCTION, 'info', 'Checking authentication', { path: pathname });

  if (!user) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'Supabase auth failed', { path: pathname });
    return NextResponse.json(
      { message: 'Unauthorized: Invalid or missing token', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // Attach user context to request headers for downstream route handlers
  request.headers.set('x-user-id', user.id);
  request.headers.set('x-user-email', user.email!);

  // Re-create response with updated request headers, preserving Supabase cookies
  const existingCookies = supabaseResponse.cookies.getAll();
  supabaseResponse = NextResponse.next({ request });
  existingCookies.forEach(cookie => {
    supabaseResponse.cookies.set(cookie);
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
