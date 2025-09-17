import { ApiError } from "@/lib/errors";
import { Logger } from "@/lib/logger";
import { friendService } from "@/services/serviceProvider";
import { NextResponse } from "next/server";

const COMPONENT = "api/protected/friend/toggleLike";
const FUNCTION = "POST";
export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "Toggle profile like for User");
  try {
    const userId1 = request.headers.get("x-user-id");
    const { userId2 } = await request.json();
    if (!userId1) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    await friendService.toggleProfileLike(userId1, userId2);
    Logger.log(COMPONENT, FUNCTION, "info", "profile like toggled Successful");
    return NextResponse.json(
      { message: "Like Toggled Successful" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError("Failed to Toggle Profile Like", 500, "INTERNAL_ERROR", {
      error: error.message,
    });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
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
