import { NextResponse } from "next/server";

import { Logger } from "@/lib/logger";
import { postService } from "@/services/serviceProvider";
import { ApiError } from "@/lib/errors";

const COMPONENT = "api/protected/posts/create";
const FUNCTION = "POST";

export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "create new post");

  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const { content, type, durationDays, sharedPostId, mediaIds, isDraft } = (await request.json()) as {
      content: string;
      type: "friend_post" | "public_opinion";
      durationDays?: number;
      sharedPostId?: string;
      mediaIds?: string[];
      isDraft?: boolean;
    };

    if (isDraft) {
      const draftId = await postService.saveDraft(userId, content, type, mediaIds);
      return NextResponse.json({ message: "Draft Saved", draftId }, { status: 200 });
    }

    await postService.createPost(userId, content, type, durationDays, sharedPostId, mediaIds);
    Logger.log(COMPONENT, FUNCTION, "info", "Post Created Successfully");
    return NextResponse.json(
      { message: "Post Created Successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError(
      "Failed to Create New Post",
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
