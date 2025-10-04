import { ApiError } from "@/lib/errors";
import { Logger } from "@/lib/logger";
import { engagementService } from "@/services/serviceProvider";
import { NextResponse } from "next/server";

const COMPONENT = "api/protected/posts/comment/toggleLike/[commentId]";
const FUNCTION = "POST";
export async function POST(request: Request,context: { params: Promise<{ commentId: string }>}) {
  const p = await context.params;
  Logger.log(COMPONENT, FUNCTION, "info", "Toggle comment Like for User",{commentId:p.commentId});
  try {
    const userId1 = request.headers.get("x-user-id");
    if (!userId1) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    await engagementService.toggleCommentLike(userId1, p.commentId);
    Logger.log(COMPONENT, FUNCTION, "info", "comment like toggled Successful");
    return NextResponse.json(
      { message: "Like Toggled Successful" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError("Failed to Toggle comment Like", 500, "INTERNAL_ERROR", {
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
