import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '../../../../lib/logger';

const COMPONENT = 'api/auth/verify';
const FUNCTION = 'POST';
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Verifying token');

  if (!JWT_SECRET) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'JWT_SECRET not set in environment');
    return NextResponse.json({ message: 'Internal server error', code: 'CONFIG_ERROR' }, { status: 500 });
  }

  try {
    const cookies = request.headers.get('cookie') || '';
    const accessToken = cookies
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];

    if (!accessToken) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'No access token provided');
      return NextResponse.json({ message: 'No token provided', code: 'NO_TOKEN' }, { status: 401 });
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET)as { userId: string; email: string };
    return NextResponse.json({ message: 'Token valid',userId:decoded.userId }, { status: 200 });
  } catch (error: any) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'Invalid token', { error: error.message });
    return NextResponse.json({ message: 'Invalid token', code: 'INVALID_TOKEN' }, { status: 401 });
  }
}