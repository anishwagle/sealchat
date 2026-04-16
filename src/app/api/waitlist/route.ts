import { NextResponse } from "next/server";
import supabasePool from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicates
    const existing = await supabasePool.query(
      "SELECT id FROM alpha_waitlist WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      // Return success anyway so we don't reveal whether an email is on the list
      return NextResponse.json({ message: "You're on the list." });
    }

    await supabasePool.query(
      "INSERT INTO alpha_waitlist (email) VALUES ($1)",
      [normalizedEmail]
    );

    return NextResponse.json({ message: "You're on the list." });
  } catch (error: unknown) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
