import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "./lib/logger";

const COMPONENT = "AuthProxy";
const FUNCTION = "proxy";
const JWT_SECRET = process.env.JWT_SECRET;
// Pre-launch: only these pages are publicly accessible
const PUBLIC_PAGES = ['/', '/privacy'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --- Pre-launch page guard ---
  // Redirect any non-public page route back to the landing page.
  // API routes and static assets are excluded via the matcher config.
  if (!pathname.startsWith('/api/')) {
    if (!PUBLIC_PAGES.includes(pathname)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // --- Public API exemption ---
  // Allow anyone to submit waitlist requests or hit auth endpoints (login/signup)
  const PUBLIC_API_PREFIXES = ['/api/waitlist', '/api/auth'];
  if (PUBLIC_API_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // --- API auth (existing logic for /api/protected/*) ---
  Logger.log(COMPONENT, FUNCTION, 'info', 'Checking authentication', { path: pathname });

  if (!JWT_SECRET) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'JWT_SECRET not set in environment');
    return NextResponse.json(
      { message: 'Internal server error', code: 'CONFIG_ERROR' },
      { status: 500 }
    );
  }

  const cookies = request.headers.get('cookie') || '';
  const accessToken = cookies
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];

  if (!accessToken) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'No access token provided');
    return NextResponse.json(
      { message: 'Unauthorized: No token provided', code: 'NO_TOKEN' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as { userId: string; email: string };
    // Attach user details to request headers for downstream use
    const modifiedRequest = NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });
    modifiedRequest.headers.set('x-user-id', decoded.userId);
    modifiedRequest.headers.set('x-user-email', decoded.email);
    return modifiedRequest;
  } catch (error: any) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'Invalid token', { error: error.message });
    return NextResponse.json(
      { message: 'Unauthorized: Invalid token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    // Match all page routes except static assets and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
