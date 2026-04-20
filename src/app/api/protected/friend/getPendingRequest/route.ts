import { NextResponse } from 'next/server';

import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';
import { Profile } from '@/types/profile';

const COMPONENT = 'api/protected/friend/getPendingRequest';
const FUNCTION = 'GET';

export async function GET(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching pending requests');

  try {
    const currentUserId = request.headers.get("x-user-id");
    if (!currentUserId) {
      return NextResponse.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const profiles = await friendService.getPendingRequestList(currentUserId);
    
    // Enrich profiles with social status
    const enrichedRequests = await Promise.all(
      profiles.map(async (profile) => ({
        ...profile,
        friendshipStatus: 'received' as const,
        profileLikeCount: await friendService.getProfileLikeCount(profile.userId),
        profileLikeStatus: await friendService.getProfileLikeStatus(currentUserId, profile.userId),
      }))
    );

    Logger.log(COMPONENT, FUNCTION, 'info', 'Pending requests fetched', { count: enrichedRequests.length });
    return NextResponse.json({ requests: enrichedRequests }, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to fetch Friends', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}