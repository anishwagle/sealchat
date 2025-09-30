import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { ApiError } from "@/lib/errors";
import { engagementService } from "@/services/serviceProvider";

const COMPONENT = "api/protected/posts/comment/delete/[commentId]";
const FUNCTION = "DELETE";

export async function DELETE(request: Request,{ params }: { params: { commentId: string }}) {
  const p = await params;
    Logger.log(COMPONENT, FUNCTION, 'info', 'Deleting Users Comment', { commentId: p.commentId });

  try {
    const currentUserId = request.headers.get("x-user-id");
    Logger.log(COMPONENT, FUNCTION, 'info', 'Deleting Users Post', { currentUserId: currentUserId });
    if (!currentUserId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

   await engagementService.deleteComment(currentUserId,p.commentId);


    Logger.log(COMPONENT, FUNCTION, "info", "Comment Deleted");
    return NextResponse.json(
      { message: "Comment Deleted Successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to fetch Comment",
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
