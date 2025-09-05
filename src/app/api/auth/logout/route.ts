import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '../../../../lib/logger';
import { userService } from '../../../../services/serviceProvider';
import { ApiError } from '../../../../lib/errors';

const COMPONENT = 'LogoutApi';
const FUNCTION = 'POST';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Processing logout');

  if (!REFRESH_TOKEN_SECRET) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'REFRESH_TOKEN_SECRET not set in environment');
    return NextResponse.json(
      { message: 'Internal server error', code: 'CONFIG_ERROR' },
      { status: 500 }
    );
  }

  try {
    const cookies = request.headers.get('cookie') || '';
    const refreshToken = cookies
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };
        await userService.removeRefreshToken(decoded.userId);
        Logger.log(COMPONENT, FUNCTION, 'info', 'Refresh token removed', { userId: decoded.userId });
      } catch (error: any) {
        Logger.log(COMPONENT, FUNCTION, 'warn', 'Invalid refresh token during logout', { error: error.message });
        // Continue with logout even if token is invalid
      }
    }

    Logger.log(COMPONENT, FUNCTION, 'info', 'Logout successful');

    return NextResponse.json(
      { message: 'Logout successful' },
      {
        status: 200,
        headers: {
          'Set-Cookie': [
            `accessToken=; HttpOnly; Path=/; Max-Age=0`,
            `refreshToken=; HttpOnly; Path=/; Max-Age=0`,
          ].join(', '),
        },
      }
    );
  } catch (error: any) {
    const apiError = new ApiError('Logout failed', 500, 'LOGOUT_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details, stack: error.stack });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}