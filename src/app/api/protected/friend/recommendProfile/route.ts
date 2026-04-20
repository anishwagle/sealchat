import { Logger } from "@/lib/logger";
import {
  friendRecommendationService,
  friendService,
} from "@/services/serviceProvider";
import { NextRequest, NextResponse } from "next/server";
import { Profile } from "@/types/profile";

const COMPONENT = "api/protected/friend/recommendProfile";
const FUNCTION = "GET";

export async function GET(req: NextRequest) {
  const currentUserId = req.headers.get("x-user-id");
  if (!currentUserId) {
    Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
    return NextResponse.json(
      { message: "Current User not Found", code: "USER_NOT_FOUND" },
      { status: 404 }
    );
  }

  try {
    const recommendations = await friendRecommendationService.recommendProfile(currentUserId);
    
    // Enrichment
    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (profile) => ({
        ...profile,
        friendshipStatus: await friendService.getFriendShipStatus(currentUserId, profile.userId),
        profileLikeCount: await friendService.getProfileLikeCount(profile.userId),
        profileLikeStatus: await friendService.getProfileLikeStatus(currentUserId, profile.userId),
      }))
    );

    Logger.log(COMPONENT, FUNCTION, "info", "Profile recommendations fetched", { count: enrichedRecommendations.length });
    return NextResponse.json({ recommendations: enrichedRecommendations }, { status: 200 });
  } catch (error) {
    Logger.log(
      COMPONENT,
      FUNCTION,
      "error",
      `An unexpected error occurred: ${error}`
    );
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}