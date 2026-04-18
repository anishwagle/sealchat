import { NextResponse } from "next/server";
import supabasePool from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if this email is on the invite list
    const result = await supabasePool.query(
      "SELECT id, invited FROM alpha_waitlist WHERE email = $1",
      [normalizedEmail]
    );

    if (result.rows.length === 0 || !result.rows[0].invited) {
      return NextResponse.json(
        { error: "not_invited" },
        { status: 403 }
      );
    }

    // Email is invited. Send magic link via Supabase Auth.
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("Supabase magic link error:", error);
      return NextResponse.json(
        { error: "Failed to send magic link. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Magic link sent." });
  } catch (error) {
    console.error("Magic link API error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
