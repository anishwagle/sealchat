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

  // --- Pre-launch page guard ---
  if (!pathname.startsWith('/api/')) {
    const isPublicPage = PUBLIC_PAGES.includes(pathname);
    const isPublicPrefix = PUBLIC_PAGE_PREFIXES.some(prefix => pathname.startsWith(prefix));
    
    if (!isPublicPage && !isPublicPrefix) {
      // If hitting a protected page, enforce session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         return NextResponse.redirect(new URL('/', request.url));
      }
    } else {
       // Just pre-fetch to refresh potential expiring session cookies quietly
       await supabase.auth.getUser();
    }
    
    return supabaseResponse;
  }

  // --- Public API exemption ---
  if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return supabaseResponse;
  }

  // --- API auth (for protected routes) ---
  Logger.log(COMPONENT, FUNCTION, 'info', 'Checking authentication', { path: pathname });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'Supabase auth failed', { error: error?.message || 'No user found' });
    return NextResponse.json(
      { message: 'Unauthorized: Invalid or missing token', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // Attach user details to request headers for downstream use natively
  supabaseResponse.headers.set('x-user-id', user.id);
  supabaseResponse.headers.set('x-user-email', user.email!);

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
