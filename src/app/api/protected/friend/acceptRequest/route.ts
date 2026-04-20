import { NextResponse } from "next/server";
import { Logger } from "@/lib/logger";
import { friendService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";

const COMPONENT = "api/protected/friend/acceptRequest";
const FUNCTION = "POST";

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "Accepting friend request");

  try {
    const userId1 = request.headers.get("x-user-id");
    const { userId2 } = await request.json();

    if (!userId1) {
      return NextResponse.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    await friendService.acceptFriendRequest(userId1, userId2);
    
    Logger.log(COMPONENT, FUNCTION, "info", "Friend Request Accepted", { userId1, userId2 });
    return NextResponse.json(
      { message: "Friend Request Accepted" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to Accept Friend Request",
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
