import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';
import { Profile } from '@/types/profile';

const COMPONENT = 'api/protected/friend/';
const FUNCTION = 'GET';

export async function GET(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching current Friends');

  try {
     const currentUserId = request.headers.get("x-user-id");
        if (!currentUserId) {
          Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
          return NextResponse.json(
            { message: "Current User not Found", code: "USER_NOT_FOUND" },
            { status: 404 }
          );
        }
    const users = await friendService.getCurrentFriend(currentUserId);
    if (!users) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'Friends not found');
      return NextResponse.json({ message: 'Friends not found', code: 'FRIENDS_NOT_FOUND' }, { status: 404 });
    }

    Logger.log(COMPONENT, FUNCTION, 'info', 'Friends fetched');
    const response: Profile[] = await Promise.all(
          users.map(async (user) => ({
            userId: user.id,
            username: user.username,
            fullName: user.fullName,
            joinedAt: `${user.createdAt?.toDateString()}`,
            friendshipStatus: await friendService.getFriendShipStatus(
              currentUserId,
              user.id
            ),
            profileLikeCount: await friendService.getProfileLikeCount(user.id),
            profileLikeStatus: await friendService.getProfileLikeStatus(
              currentUserId,
              user.id
            ),
          }))
        );
        return NextResponse.json({friends:response}, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to fetch Friends', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}