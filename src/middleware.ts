import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "./lib/logger";

const COMPONENT = "AuthMiddleware";
const FUNCTION = "middleware";
const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request: NextRequest) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Checking authentication', { path: request.nextUrl.pathname });

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
    jwt.verify(accessToken, JWT_SECRET);
    return NextResponse.next();
  } catch (error: any) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'Invalid token', { error: error.message });
    return NextResponse.json(
      { message: 'Unauthorized: Invalid token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ['/api/protected/:path*'],
};