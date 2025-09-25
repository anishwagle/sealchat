import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { engagementService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";

const COMPONENT = "api/protected/posts/comment/publicComment/[postId]";
const FUNCTION = "GET";

export async function GET(request: Request,{ params }: { params: { postId: string }}) {
  const p = await params;
    Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching Users Comment', { postId: p.postId });

  try {
    const currentUserId = request.headers.get("x-user-id");
    Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching Users Comment on public post', { currentUserId: currentUserId });
    if (!currentUserId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const userComments = await engagementService.getPublicOpinionComment(p.postId);
    
    if (!userComments) {
      Logger.log(COMPONENT, FUNCTION, "error", "Comments not found", {
        postId: p.postId,
      });

      return NextResponse.json(
        { message: "Comments not found", code: "COMMENTS_NOT_FOUND" },
        { status: 404 }
      );
    }

    const comments = [...userComments].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    Logger.log(COMPONENT, FUNCTION, "info", "Comments fetched");
    return NextResponse.json({ comments: comments }, { status: 200 });
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
