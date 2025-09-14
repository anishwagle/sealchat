import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { userService } from "@/services/serviceProvider";
import { Logger } from "@/lib/logger";
import { ValidationError, ApiError } from "@/lib/errors";
import { LoginResponse } from "@/types/loginResponse";
import jwt from 'jsonwebtoken';

const COMPONENT = "api/auth/login";
const FUNCTION = "POST";
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // Long-lived refresh token
export async function POST(request: Request) {
  Logger.time(COMPONENT, FUNCTION, 'total');
  if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
    Logger.log(COMPONENT, FUNCTION, 'error', 'JWT_SECRET or REFRESH_TOKEN_SECRET not set');
    return NextResponse.json({ message: 'Internal server error', code: 'CONFIG_ERROR' }, { status: 500 });
  }
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
     const error = new ValidationError('Missing Required Field',{username,password});
     Logger.log(COMPONENT,FUNCTION,'error',error.message,error.details);
     throw new ApiError(error.message,400,'MISSING_FIELDS',error.details);
    }

    Logger.time(COMPONENT,FUNCTION,'validateUser');
    const user = await userService.findUserByEmailOrUsername(username, username);
    if(!user){
        Logger.log(COMPONENT,FUNCTION,'error','User Not Found',{username});
        throw new ApiError('User not found',400,'USER_NOT_FOUND',{username})
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        const error = new ValidationError('Invalid username/email or password', { username });
      Logger.log(COMPONENT, FUNCTION, 'error', error.message, error.details);
      throw new ApiError(error.message, 401, 'INVALID_CREDENTIALS', error.details);
    }

    const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    await userService.storeRefreshToken(user.id, refreshToken);

    Logger.log(COMPONENT, FUNCTION, 'info', 'Login successful', { userId: user.id });
    Logger.timeEnd(COMPONENT, FUNCTION, 'total');
    
    return NextResponse.json(
      { message: 'Login successful', userId: user.id },
      {
        status: 200,
        headers: {
          'Set-Cookie': [
            `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=900`, // 15m
            `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800`, // 7d
          ].join(', '),
        },
      }
    );
  } catch (error: any) {
    const apiError = error instanceof ApiError
      ? error
      : new ApiError('Internal server error', 500, 'INTERNAL_ERROR', { error: error.message });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details, stack: error.stack });
    Logger.timeEnd(COMPONENT, FUNCTION, 'total');
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}
