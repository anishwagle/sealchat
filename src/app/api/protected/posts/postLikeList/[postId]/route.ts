import { ApiError } from "@/lib/errors";
import { Logger } from "@/lib/logger";
import { engagementService } from "@/services/serviceProvider";
import { NextResponse } from "next/server";

const COMPONENT = "api/protected/posts/postLikeList/[postId]";
const FUNCTION = "GET";
export async function GET(request: Request,context: { params:Promise< { postId: string }>}) {
  const p = await context.params;
  Logger.log(COMPONENT, FUNCTION, "info", " get post like list ",{postId:p.postId});
  try {
    const userId1 = request.headers.get("x-user-id");
    if (!userId1) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    const postlikeList =await engagementService.getPostLikeList(p.postId);
    Logger.log(COMPONENT, FUNCTION, "info", "fetch post like list Successful");
    return NextResponse.json(
      {likeList:postlikeList },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError("Failed to Fetch post Like list", 500, "INTERNAL_ERROR", {
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
