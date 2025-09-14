// src/app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '../../../../lib/logger';
import { userService } from '@/services/serviceProvider';

const COMPONENT = 'api/auth/refresh';
const FUNCTION = 'POST';
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = '15m';

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Refreshing token');

  if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'JWT_SECRET or REFRESH_TOKEN_SECRET not set');
    return NextResponse.json({ message: 'Internal server error', code: 'CONFIG_ERROR' }, { status: 500 });
  }

  try {
    const cookies = request.headers.get('cookie') || '';
    const refreshToken = cookies
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];

    if (!refreshToken) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'No refresh token provided');
      return NextResponse.json({ message: 'No refresh token', code: 'NO_TOKEN' }, { status: 401 });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };
    const isValid = await userService.validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'Invalid refresh token');
      return NextResponse.json({ message: 'Invalid refresh token', code: 'INVALID_TOKEN' }, { status: 401 });
    }

    const user = await userService.findUserById(decoded.userId); 
    if (!user) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'User not found');
      return NextResponse.json({ message: 'User not found', code: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    Logger.log(COMPONENT, FUNCTION, 'info', 'Token refreshed', { userId: user.id });

    return NextResponse.json(
      { message: 'Token refreshed', userId: user.id },
      {
        status: 200,
        headers: {
          'Set-Cookie': `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900`,
        },
      }
    );
  } catch (error: any) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'Refresh failed', { error: error.message });
    return NextResponse.json(
      { message: 'Invalid refresh token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }
}