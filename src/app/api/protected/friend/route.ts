import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';
import { Profile } from '@/types/profile';

const COMPONENT = 'api/protected/friend/';
const FUNCTION = 'GET';

export async function GET(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching current friends');

  try {
    const currentUserId = request.headers.get("x-user-id");
    if (!currentUserId) {
      return NextResponse.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const profiles = await friendService.getCurrentFriend(currentUserId);
    
    // Enrichment
    const enrichedFriends = await Promise.all(
      profiles.map(async (profile) => ({
        ...profile,
        friendshipStatus: 'accepted' as const,
        profileLikeCount: await friendService.getProfileLikeCount(profile.userId),
        profileLikeStatus: await friendService.getProfileLikeStatus(currentUserId, profile.userId),
      }))
    );

    Logger.log(COMPONENT, FUNCTION, 'info', 'Friends fetched', { count: enrichedFriends.length });
    return NextResponse.json({ friends: enrichedFriends }, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to fetch Friends', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}