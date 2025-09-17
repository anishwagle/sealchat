import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/friend/cancelRequest';
const FUNCTION = 'POST';

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Cancel Friend request from user');

  try {
    const userId1 = request.headers.get('x-user-id');
    const { userId2 } = await request.json();
    if (!userId1) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'Current Users not found');
      return NextResponse.json({ message: 'Current Users not found', code: 'USERS_NOT_FOUND' }, { status: 404 });
    }
    await friendService.cancelFriendRequest(userId1,userId2)
    Logger.log(COMPONENT, FUNCTION, 'info', 'Friend Request Canceled');
    return NextResponse.json({message:"Friend Request Canceled"}, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to Cancel Friend Request', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}