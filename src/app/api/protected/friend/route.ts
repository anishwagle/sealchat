import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/friend/findfriend/';
const FUNCTION = 'GET';

export async function GET(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching current Friends');

  try {
     const userId = request.headers.get("x-user-id");
        if (!userId) {
          Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
          return NextResponse.json(
            { message: "Current User not Found", code: "USER_NOT_FOUND" },
            { status: 404 }
          );
        }
    const users = await friendService.getCurrentFriend(userId);
    if (!users) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'Friends not found');
      return NextResponse.json({ message: 'Friends not found', code: 'FRIENDS_NOT_FOUND' }, { status: 404 });
    }

    Logger.log(COMPONENT, FUNCTION, 'info', 'Friends fetched');
    return NextResponse.json({users:users }, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to fetch Friends', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}