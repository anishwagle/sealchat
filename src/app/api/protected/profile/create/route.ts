import { NextResponse } from "next/server";
import { profileService, userService } from "@/services/serviceProvider";
import { Logger } from "@/lib/logger";
import { ValidationError, ApiError } from "@/lib/errors";
const COMPONENT = "api/protected/profile/create";
const FUNCTION = "POST";
export async function POST(request: Request) {
  Logger.time(COMPONENT, FUNCTION, "total");
  try {
    const currentUserId = `${request.headers.get("x-user-id")}`;
    Logger.log(COMPONENT, FUNCTION, "info", "Creating User profile", {
      userId: currentUserId,
    });
    const user = await userService.findUserById(currentUserId);
    if (!user) {
      Logger.log(COMPONENT, FUNCTION, "error", "User not found", {
        username: currentUserId,
      });
      return NextResponse.json(
        { message: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }
    const { dateOfBirth,dateOfBirthVisibility, gender,genderVisibility, bio, location,locationVisibility } = await request.json();
    if (!dateOfBirth || !gender || !location) {
      const error = new ValidationError("Missing Required Field", {
        dateOfBirth,
        gender,
        location
      });
      Logger.log(COMPONENT, FUNCTION, "error", error.message, error.details);
      throw new ApiError(error.message, 400, "MISSING_FIELDS", error.details);
    }

    await profileService.createProfile(
      currentUserId,
      dateOfBirth,
      dateOfBirthVisibility,
      gender,
      genderVisibility,
      bio,
      location,
      locationVisibility
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
    Logger.log(COMPONENT, FUNCTION, "error", apiError.message, {
      details: apiError.details,
      stack: error.stack,
    });
    Logger.timeEnd(COMPONENT, FUNCTION, "total");
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
