import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";

const COMPONENT = "api/protected/posts/delete/[postId]";
const FUNCTION = "DELETE";

export async function DELETE(request: Request,{ params }: { params: { postId: string }}) {
  const p = await params;
    Logger.log(COMPONENT, FUNCTION, 'info', 'Deleting Users Post', { postId: p.postId });

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

   await postService.deletePost(currentUserId,p.postId);


    Logger.log(COMPONENT, FUNCTION, "info", "Post Deleted");
    return NextResponse.json(
      { message: "Post Deleted Successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to fetch Post",
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
