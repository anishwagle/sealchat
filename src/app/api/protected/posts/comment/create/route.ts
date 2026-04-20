import { NextResponse } from "next/server";

import { Logger } from "@/lib/logger";
import { engagementService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";

const COMPONENT = "api/protected/posts/comment/create";
const FUNCTION = "POST";

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "create new post");

  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current Users not found");
      return NextResponse.json(
        { message: "Current Users not found", code: "USERS_NOT_FOUND" },
        { status: 404 }
      );
    }
    const { content, postId, parentCommentId } = (await request.json()) as {
      content: string;
      postId: string;
      parentCommentId?: string;
    };
    const comment = await engagementService.createComment(userId, content, postId, parentCommentId);
    Logger.log(COMPONENT, FUNCTION, "info", "Comment Created Successfully",comment);
    return NextResponse.json(
      { comment:comment
        ,message: "Comment Created Successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to Create New Comment",
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
