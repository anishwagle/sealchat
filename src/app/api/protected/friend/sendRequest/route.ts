import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/friend/sendRequest';
const FUNCTION = 'POST';

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Sending friend request', { method: FUNCTION });

  try {
    const senderId = request.headers.get('x-user-id');
    const { userId2: receiverId } = await request.json();

    if (!senderId) {
      return NextResponse.json({ message: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    await friendService.sendFriendRequest(senderId, receiverId);

    Logger.log(COMPONENT, FUNCTION, 'info', 'Friend Request Sent', { senderId, receiverId });
    return NextResponse.json({ message: "Friend Request Sent" }, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to Send Friend Request', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}