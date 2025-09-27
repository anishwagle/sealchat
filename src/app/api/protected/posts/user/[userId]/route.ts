import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";

const COMPONENT = "api/protected/posts/user/[userId]";
const FUNCTION = "GET";

export async function GET(request: Request,{ params }: { params: { userId: string }}) {
  const p = await params;
    Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching Users Post', { userId: p.userId });

  try {
    const currentUserId = request.headers.get("x-user-id");
    Logger.log(COMPONENT, FUNCTION, 'info', 'Fetching Users Post', { currentUserId: p.userId });
    if (!currentUserId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const friendPosts = await postService.getFriendPosts(p.userId,currentUserId);
    const publicOpinions = await postService.getPublicOpinions(p.userId,currentUserId);
    const posts = [...friendPosts, ...publicOpinions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (!posts) {
      Logger.log(COMPONENT, FUNCTION, "error", "Posts not found",{userId:p.userId});
      return NextResponse.json(
        { message: "Posts not found", code: "Post_NOT_FOUND" },
        { status: 404 }
      );
    }

    Logger.log(COMPONENT, FUNCTION, "info", "Post fetched");
    return NextResponse.json({ posts: posts }, { status: 200 });
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
