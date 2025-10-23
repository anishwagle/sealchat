import { ApiError } from "@/lib/errors";
import { Logger } from "@/lib/logger";
import { friendService } from "@/services/serviceProvider";
import { Profile } from "@/types/profile";
import { NextResponse } from "next/server";

const COMPONENT = "api/protected/friend/profileLikeList";
const FUNCTION = "GET";
export async function GET(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", " get profile like list ");
  try {
    const currentUserId = request.headers.get("x-user-id");
    if (!currentUserId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    const users = await friendService.getCurrentProfileLikeList(currentUserId);
    if (!users) {
      Logger.log(COMPONENT, FUNCTION, "error", "No Profile Like found");
      return NextResponse.json(
        { message: "No Profile Like found", code: "PROFILE_LIKE_NOT_FOUND" },
        { status: 404 }
      );
    }
    const response: Profile[] = await Promise.all(
              users.map(async (user) => ({
                userId: user.id,
                username: user.username,
                fullName: user.fullName,
                joinedAt: `${user.createdAt?.toDateString()}`,
                friendshipStatus: await friendService.getFriendShipStatus(
                  currentUserId,
                  user.id
                ),
                profileLikeCount: await friendService.getProfileLikeCount(user.id),
                profileLikeStatus: await friendService.getProfileLikeStatus(
                  currentUserId,
                  user.id
                ),
              }))
            );
            return NextResponse.json({follows:response}, { status: 200 });
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to Fetch profile Like list",
      500,
      "INTERNAL_ERROR",
      {
        error: error.message,
      }
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
