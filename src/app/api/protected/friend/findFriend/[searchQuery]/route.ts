import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/friend/findfriend/[searchQuery]';
const FUNCTION = 'GET';

export async function GET(request: Request, { params }: { params: { searchQuery: string } }) {
  const p = await params;
  Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching users', { searchQuery: p.searchQuery });

  try {
    
    const users = await friendService.findFriends(p.searchQuery);
    if (!users) {
      Logger.log(COMPONENT, FUNCTION, 'error', 'Users not found', { searchQuery: p.searchQuery });
      return NextResponse.json({ message: 'Users not found', code: 'USERS_NOT_FOUND' }, { status: 404 });
    }

    Logger.log(COMPONENT, FUNCTION, 'info', 'Users fetched', { searchQuery: p.searchQuery });
    return NextResponse.json({users:users }, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to fetch users', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}