import { NextResponse } from 'next/server';

import { Logger } from '@/lib/logger';
import { friendService } from '@/services/serviceProvider';
import { ApiError } from '@/lib/errors';

const COMPONENT = 'api/protected/friend/findfriend/';
const FUNCTION = 'GET';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  Logger.log(COMPONENT, FUNCTION, 'info', 'Searching for users', { query });

  try {
    const profiles = await friendService.findFriends(query);
    
    Logger.log(COMPONENT, FUNCTION, 'info', 'Profiles fetched', { count: profiles.length });
    return NextResponse.json({ users: profiles }, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError('Failed to fetch users', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}