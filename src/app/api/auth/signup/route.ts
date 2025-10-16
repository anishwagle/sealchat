import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { users } from "@/lib/mockData";
import { userService } from "@/services/serviceProvider";
import { Logger } from "@/lib/logger";
import { ValidationError, ApiError } from "@/lib/errors";

const COMPONENT = "api/auth/signup";
const FUNCTION = "POST";
export async function POST(request: Request) {
  Logger.time(COMPONENT, FUNCTION, 'total');
  try {
    const { username, email,fullname, password } = await request.json();
    if (!username || !email || !password||!fullname) {
     const error = new ValidationError('Missing Required Field',{username,email,password,fullname});
     Logger.log(COMPONENT,FUNCTION,'error',error.message,error.details);
     throw new ApiError(error.message,400,'MISSING_FIELDS',error.details);
    }
    Logger.log(COMPONENT,FUNCTION,'debug','Checking for existing user', {email,username})
    const existingUser = await userService.findUserByEmailOrUsername(
      email,
      username
    );
    if (existingUser) {
        Logger.log(COMPONENT,FUNCTION,'error','User Already Exist',{email,username})
        throw new ApiError('User Already Exist',400, 'DUPLICATE_USER', {email,username});
    }

    Logger.time(COMPONENT,FUNCTION,'createUser');
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userService.createUser(email, username,fullname, hashedPassword);
    Logger.timeEnd(COMPONENT,FUNCTION,'createUser');
    Logger.log(COMPONENT,FUNCTION,'info','User Created', {userId:newUser.id})
    Logger.timeEnd(COMPONENT,FUNCTION,'total');

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    const apiError = error instanceof ApiError 
    ? error : 
    new ApiError('Internal Server Error',500,'INTERNAL_ERROR',{error:error.message});
    Logger.log(COMPONENT,FUNCTION,'error',apiError.message,{details:apiError.details,stack:error.stack});
    Logger.timeEnd(COMPONENT,FUNCTION,'total');
    return NextResponse.json({message:apiError.message,code:apiError.code,details:apiError.details},
    {status:apiError.status})
  }
}
