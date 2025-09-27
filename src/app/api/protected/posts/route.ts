import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Logger } from "@/lib/logger";
import { postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";
import { Post } from "@/types/post";

const COMPONENT = "api/protected/posts";
const FUNCTION = "GET";

export async function GET(request: Request) {
  

  try {
    const userId = request.headers.get("x-user-id");
    Logger.log(COMPONENT, FUNCTION, "info", "Fetching users feed",{userId});
    if (!userId) {
      Logger.log(COMPONENT, FUNCTION, "error", "Current User not found");
      return NextResponse.json(
        { message: "Current User not Found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    const ownPosts = await postService.getUserPosts(userId);
    Logger.log(COMPONENT, FUNCTION, "info", "User's Own Post Count:",{count:ownPosts.length});
    const friendPosts = await postService.getPrivatePosts(userId);
    Logger.log(COMPONENT, FUNCTION, "info", "User's Friend Post Count:",{count:friendPosts.length});
    const publicOpinions = await postService.getPublicOpinions(userId,userId);
    Logger.log(COMPONENT, FUNCTION, "info", "User's Friend public opinion Count:",{count:publicOpinions.length});
    const posts = [...ownPosts, ...friendPosts, ...publicOpinions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    Logger.log(COMPONENT, FUNCTION, "info", "User's Total Post Count:",{count:posts.length});
    if (!posts) {
      Logger.log(COMPONENT, FUNCTION, "error", "Posts not found",{userId:userId});
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
