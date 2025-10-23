import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { friendService, profileService, userService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';
import { Profile } from '@/types/profile';

const COMPONENT = 'api/protected/profile';
const FUNCTION = 'GET';

export async function GET(request: Request) {
    
  try {
    const currentUserId = `${request.headers.get('x-user-id')}`;

  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching User profile', { userId: currentUserId });
    const user = await userService.findUserById(currentUserId);
    if (!user) {
      Logger.log(COMPONENT, FUNCTION, "error", "User not found", {
        username: currentUserId,
      });
      return NextResponse.json(
        { message: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    const profile = await profileService.getProfile(currentUserId,currentUserId);
    Logger.log(COMPONENT, FUNCTION, "info", "Profile fetched", {
      username: user.username,
    });
     return NextResponse.json({profile}, { status: 200 });
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