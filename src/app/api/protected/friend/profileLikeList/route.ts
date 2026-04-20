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
    const profiles = await friendService.getCurrentProfileLikeList(currentUserId);
    
    // Enrichment
    const enrichedFollows = await Promise.all(
      profiles.map(async (profile) => ({
        ...profile,
        friendshipStatus: await friendService.getFriendShipStatus(currentUserId, profile.userId),
        profileLikeCount: await friendService.getProfileLikeCount(profile.userId),
        profileLikeStatus: true as const, // Since they are in the like list for this user
      }))
    );

    Logger.log(COMPONENT, FUNCTION, "info", "Profile follow list fetched", { count: enrichedFollows.length });
    return NextResponse.json({ follows: enrichedFollows }, { status: 200 });
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
