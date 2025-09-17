import { ApiError } from "@/lib/errors";
import { Logger } from "@/lib/logger";
import { friendService } from "@/services/serviceProvider";
import { NextResponse } from "next/server";

const COMPONENT = "api/protected/friend/unfriend";
const FUNCTION = "POST";
export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "Un-friend user");
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
    await friendService.unfriendRequest(userId1, userId2);
    Logger.log(COMPONENT, FUNCTION, "info", "Unfriend Successful");
    return NextResponse.json(
      { message: "Un-friend Successful" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError("Failed to unFriend", 500, "INTERNAL_ERROR", {
      error: error.message,
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
