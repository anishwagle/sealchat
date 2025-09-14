import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { userService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/profile';
const FUNCTION = 'GET';

export async function GET(request: Request) {
    
  try {
    const cookies = request.headers.get('cookie') || '';
  const accessToken = cookies
    .split("; ")
    .find((row) => row.startsWith("accessToken="))
    ?.split("=")[1];

  const decoded = accessToken
    ? JSON.parse(atob(accessToken.split(".")[1]))
    : null;
  if (!decoded?.userId) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'No access token provided');
        return NextResponse.json(
          { message: 'Unauthorized: No token provided', code: 'NO_TOKEN' },
          { status: 401 }
        );
  }
  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching User profile', { userId: decoded.userId });
    const user = await userService.findUserById(decoded.userId);
    if (!user) {
      Logger.log(COMPONENT, FUNCTION, "error", "User not found", {
        username: decoded.userId,
      });
      return NextResponse.json(
        { message: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    Logger.log(COMPONENT, FUNCTION, "info", "Profile fetched", {
      username: user.username,
    });
    return NextResponse.json(
      { username: user.username, email: user.email },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to fetch profile",
      500,
      "INTERNAL_ERROR",
      { error: error.message }
    );
    Logger.log(COMPONENT, FUNCTION, "error", apiError.message, {
      details: apiError.details,
    });
    return NextResponse.json(
      {
        message: apiError.message,
        code: apiError.code,
        details: apiError.details,
      },
      { status: apiError.status }
    );
  }
}