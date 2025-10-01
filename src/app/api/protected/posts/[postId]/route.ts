import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";
import { Post } from "@/types/post";

const COMPONENT = "api/protected/posts/[postId]";
const FUNCTION = "GET";

export async function GET(request: Request, { params }: { params: { postId: string } }) {
  

  try {
    const p = await params;
    const userId = request.headers.get("x-user-id");
    Logger.log(COMPONENT, FUNCTION, "info", "Fetching users feed",{userId});
    if (!userId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    const post = await postService.getPostById(p.postId,userId);

  if (post?.sharedPostId) {
    const sharedPosts = await postService.getPostsByIds([post.sharedPostId], userId);
    post.sharedPost=sharedPosts[0];
  }

    Logger.log(COMPONENT, FUNCTION, "info", " Post :",{post});
    
    if (!post) {
      Logger.log(COMPONENT, FUNCTION, "error", "Posts not found",{userId:userId});
      return NextResponse.json(
        { message: "Posts not found", code: "Post_NOT_FOUND" },
        { status: 404 }
      );
    }
    Logger.log(COMPONENT, FUNCTION, "info", "Post fetched");
    return NextResponse.json({ post: post }, { status: 200 });
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
