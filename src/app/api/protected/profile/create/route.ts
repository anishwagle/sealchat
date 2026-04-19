import { NextResponse } from "next/server";
import { profileService } from "@/services/serviceProvider";
import { Logger } from "@/lib/logger";
import { ValidationError, ApiError } from "@/lib/errors";

const COMPONENT = "api/protected/profile/create";
const FUNCTION = "POST";

export async function POST(request: Request) {
  Logger.time(COMPONENT, FUNCTION, "total");
  try {
    const currentUserId = request.headers.get("x-user-id");
    const currentUserEmail = request.headers.get("x-user-email");

    if (!currentUserId || !currentUserEmail) {
      throw new ApiError("Unauthorized", 401, "UNAUTHORIZED", {});
    }

    Logger.log(COMPONENT, FUNCTION, "info", "Creating User profile", { userId: currentUserId });

    const { full_name, username, bio, avatar_url } = await request.json();

    if (!full_name || !username) {
      const error = new ValidationError("Missing Required Field", { full_name, username });
      Logger.log(COMPONENT, FUNCTION, "error", error.message, error.details);
      throw new ApiError(error.message, 400, "MISSING_FIELDS", error.details);
    }

    // 1. Create/update the profile directly
    // Since we take userId from authenticated headers, this is strictly authorized by Supabase.
    // If the profile exists, it will be updated; otherwise, a new one is created.
    await profileService.createProfile(
      currentUserId,
      full_name,
      username,
      bio || "",
      avatar_url || "",
      currentUserEmail
    );

    Logger.log(COMPONENT, FUNCTION, "info", "User Profile Created", {
      userId: currentUserId,
    });
    Logger.timeEnd(COMPONENT, FUNCTION, "total");

    return NextResponse.json(
      { message: "Profile Created Successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError("Internal Server Error", 500, "INTERNAL_ERROR", {
            error: error.message,
          });
    Logger.log(COMPONENT, FUNCTION, "error", apiError.message, { details: apiError.details });
    Logger.timeEnd(COMPONENT, FUNCTION, "total");
    return NextResponse.json(
      { message: apiError.message, code: apiError.code, details: apiError.details },
      { status: apiError.status }
    );
  }
}
