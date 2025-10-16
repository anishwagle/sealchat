import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { friendService, userService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';
import { Profile } from '@/types/profile';


const COMPONENT = 'api/protected/profile/[username]';
const FUNCTION = 'GET';

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {
  const p = await context.params;
  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching profile', { username: p.username });

  try {
    const username = p.username;
    const user = await userService.findUserByUsername(username);
    if (!user) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'User not found', { username: username });
      return NextResponse.json({ message: 'User not found', code: 'USER_NOT_FOUND' }, { status: 404 });
    }
    const currentUserId = request.headers.get('x-user-id');
        if (!currentUserId) {
          Logger.log(COMPONENT, FUNCTION, 'error', 'Current Users not found');
          return NextResponse.json({ message: 'Current Users not found', code: 'USERS_NOT_FOUND' }, { status: 404 });
        }
    Logger.log(COMPONENT, FUNCTION, 'info', 'Profile fetched', { username: username });

    const response:Profile = {
      userId:user.id,
      username:username,
      fullName:user.fullName,
      joinedAt: `${user.createdAt?.toDateString()}`,
      friendshipStatus:await friendService.getFriendShipStatus(currentUserId,user.id),
      profileLikeCount:await friendService.getProfileLikeCount(user.id),
      profileLikeStatus:await friendService.getProfileLikeStatus(currentUserId,user.id)
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to fetch profile', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}