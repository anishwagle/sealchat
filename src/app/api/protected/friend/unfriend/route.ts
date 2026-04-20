import { ApiError } from "@/lib/errors";
import { Logger } from "@/lib/logger";
import { friendService } from "@/services/serviceProvider";
import { NextResponse } from "next/server";

const COMPONENT = "api/protected/friend/unfriend";
const FUNCTION = "POST";
export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "Unfriending user");
  try {
    const userId1 = request.headers.get("x-user-id");
    const { userId2 } = await request.json();

    if (!userId1) {
      return NextResponse.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    await friendService.unfriendRequest(userId1, userId2);

    Logger.log(COMPONENT, FUNCTION, "info", "Unfriend Successful", { userId1, userId2 });
    return NextResponse.json(
      { message: "Un-friend Successful" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError("Failed to unFriend", 500, "INTERNAL_ERROR", {
      error: error.message,
    });
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
