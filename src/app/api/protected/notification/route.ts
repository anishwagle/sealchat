import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { notificationService, postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";
import { Post } from "@/types/post";

const COMPONENT = "api/protected/notification";
const FUNCTION = "GET";

export async function GET(request: Request) {
  

  try {
    const userId = request.headers.get("x-user-id");
    Logger.log(COMPONENT, FUNCTION, "info", "Fetching users feed",{userId});
    if (!userId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    const notifications = await notificationService.getUserNotifications(userId);
    Logger.log(COMPONENT, FUNCTION, "info", "User's Notification Count:",{count:notifications.length});
    
    if (!notifications) {
      Logger.log(COMPONENT, FUNCTION, "error", "notifications not found",{userId:userId});
      return NextResponse.json(
        { message: "notifications not found", code: "NOTIFICATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    Logger.log(COMPONENT, FUNCTION, "info", "NOTIFICATION fetched");
    return NextResponse.json({ notifications: notifications }, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to fetch Notification",
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
