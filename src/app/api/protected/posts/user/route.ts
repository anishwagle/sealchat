import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";
import { Post } from "@/types/post";

const COMPONENT = "api/protected/posts/user";
const FUNCTION = "GET";

export async function GET(request: Request) {
  try {

    const userId = request.headers.get("x-user-id");
    Logger.log(COMPONENT, FUNCTION, "info", "Fetching users Post", { userId });
    if (!userId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cursorCreatedAt = searchParams.get('cursorCreatedAt') ;
    const sinceCreatedAt = searchParams.get('sinceCreatedAt');
    const limit = searchParams.get('limit') ? parseInt(`${searchParams.get('limit')}`) : 20;

    const direction = sinceCreatedAt ? 'newer' : 'older';
    const cursor = sinceCreatedAt || cursorCreatedAt;
    const posts = await postService.getUserPaginatedPosts( userId,`${cursor}`,direction,limit );
    const nextCursor = direction === 'older' && posts.length === limit ? posts[posts.length - 1].createdAt : null;
    if (!posts) {
      Logger.log(COMPONENT, FUNCTION, "error", "Posts not found", {
        userId: userId,
      });
      return NextResponse.json(
        { message: "Posts not found", code: "Post_NOT_FOUND" },
        { status: 404 }
      );
    }
    Logger.log(COMPONENT, FUNCTION, "info", "Post fetched");
    return NextResponse.json({ posts,nextCursor }, { status: 200 });
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
