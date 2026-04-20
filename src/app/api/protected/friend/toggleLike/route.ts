import { ApiError } from "@/lib/errors";
import { Logger } from "@/lib/logger";
import { friendService } from "@/services/serviceProvider";
import { NextResponse } from "next/server";

const COMPONENT = "api/protected/friend/toggleLike";
const FUNCTION = "POST";
export async function POST(request: Request) {
  Logger.log(COMPONENT, FUNCTION, "info", "Toggling profile follow");
  try {
    const userId1 = request.headers.get("x-user-id");
    const { userId2 } = await request.json();

    if (!userId1) {
      return NextResponse.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    await friendService.toggleProfileLike(userId1, userId2);

    Logger.log(COMPONENT, FUNCTION, "info", "Profile follow toggled successfully", { userId1, userId2 });
    return NextResponse.json(
      { message: "Follow status toggled successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const apiError = new ApiError("Failed to Toggle Profile Like", 500, "INTERNAL_ERROR", {
      error: error.message,
    });
    Logger.log(COMPONENT, FUNCTION, 'error', apiError.message, { details: apiError.details });
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
