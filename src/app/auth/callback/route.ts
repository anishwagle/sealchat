import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.verifyOtp({
      type: type as "magiclink" | "email",
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If verification fails, redirect to login with error
  return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
}
