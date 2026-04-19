import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Logger } from '../../../../lib/logger';
import { ApiError } from '../../../../lib/errors';

const COMPONENT = 'api/auth/logout';
const FUNCTION = 'POST';

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, 'info', 'Processing Supabase logout');

  try {
    const cookieStore = await cookies();
    
    // Instantiate SSR client securely against NextJS Route Context
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The setAll wrapper safely traps strict edge invocations 
            }
          },
        },
      }
    );

    // Native Supabase API handles universally expiring all specific Supabase Session cookies internally bridging the server and client
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    Logger.log(COMPONENT, FUNCTION, 'info', 'Logout successful');

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  } catch (error: any) {
    const apiError = new ApiError('Logout failed', 500, 'LOGOUT_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}