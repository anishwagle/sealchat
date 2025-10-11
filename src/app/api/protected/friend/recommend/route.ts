import { Logger } from "@/lib/logger";
import { friendRecommendationService } from "@/services/serviceProvider";
import { NextRequest, NextResponse } from "next/server";
const COMPONENT = "api/protected/friend/recommend";
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
    const recommendations = await friendRecommendationService.recommendFriends(
      currentUserId
    );
     if (!recommendations) {
          Logger.log(COMPONENT, FUNCTION, "error", "No User Recommendation found");
          return NextResponse.json(
            { message: "No Recommendation found", code: "RECOMMENDATION_NOT_FOUND" },
            { status: 404 }
          );
        }
        return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error("Error getting friend recommendations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
