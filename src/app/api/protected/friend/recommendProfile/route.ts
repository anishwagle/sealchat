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
    const recommendations = await friendRecommendationService.recommendProfile(
      currentUserId
    );
    if (!recommendations) {
      Logger.log(COMPONENT, FUNCTION, "error", "No Profile Recommendation found");
      return NextResponse.json(
        {
          message: "No Recommendation found",
          code: "RECOMMENDATION_NOT_FOUND",
        },
        { status: 404 }
      );
    }
    const response: Profile[] = await Promise.all(
      recommendations.map(async (user) => ({
        userId: user.id,
        username: user.username,
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
    return NextResponse.json({recommendations:response}, { status: 200 });
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