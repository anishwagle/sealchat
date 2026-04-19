import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { profileService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/profile';
const FUNCTION = 'GET';

export async function GET(request: Request) {
  try {
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json(
        { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching User profile', { userId: currentUserId });

    const profile = await profileService.getProfile(currentUserId, currentUserId);
    if (!profile) {
      Logger.log(COMPONENT, FUNCTION, "error", "Profile not found", {
        userId: currentUserId,
      });
      return NextResponse.json(
        { message: "Profile not found", code: "PROFILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    Logger.log(COMPONENT, FUNCTION, "info", "Profile fetched", {
      username: profile.username,
    });

    return NextResponse.json({ profile }, { status: 200 });

  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to fetch profile",
      500,
      "INTERNAL_ERROR",
      { error: error.message }
    );
    Logger.log(COMPONENT, FUNCTION, "error", apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}