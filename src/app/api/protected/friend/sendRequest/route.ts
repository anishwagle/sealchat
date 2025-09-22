import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { friendService, notificationService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/friend/sendRequest';
const FUNCTION = 'POST';

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Send Friend request from user');

  try {
    const senderId = request.headers.get('x-user-id');
    const { userId2 } = await request.json();
    const receiverId = userId2;
    if (!senderId) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'Current Users not found');
      return NextResponse.json({ message: 'Current Users not found', code: 'USERS_NOT_FOUND' }, { status: 404 });
    }
    await friendService.sendFriendRequest(senderId,receiverId);
    await notificationService.createNotification(
          userId2,
          "friend_request_sent",
          senderId
        );
    Logger.log(COMPONENT, FUNCTION, 'info', 'Friend Request Sent');
    return NextResponse.json({message:"Friend Request Sent"}, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to Send Friend Request', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}