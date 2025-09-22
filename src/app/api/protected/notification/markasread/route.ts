import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { notificationService, postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";

const COMPONENT = "api/notification/markasread";
const FUNCTION = "POST";

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "mark notification as read");

  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current Users not found");
      return NextResponse.json(
        { message: "Current Users not found", code: "USERS_NOT_FOUND" },
        { status: 404 }
      );
    }
    const  notificationIds  = (await request.json()).notificationIds as number[];
    Logger.log(COMPONENT, FUNCTION, "info", "mark notification as read",{val:notificationIds});
    notificationIds.forEach(async x=>{
        await notificationService.markNotificationAsRead(x,userId);
    })
    
    Logger.log(COMPONENT, FUNCTION, "info", "Marked notification as read Successfully",notificationIds);
    return NextResponse.json(
      { message: "Marked notification as read Successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to Marked notification as read",
      500,
      "INTERNAL_ERROR",
      { error: error.message }
    );
    Logger.log(COMPONENT, FUNCTION, "error", apiError.message, {
      details: apiError.details,
    });
    return NextResponse.json(
      {
        message: apiError.message,
        code: apiError.code,
        details: apiError.details,
      },
      { status: apiError.status }
    );
  }
}
