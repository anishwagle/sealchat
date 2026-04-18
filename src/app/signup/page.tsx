import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign Up - SealChat",
  description: "SealChat is invite-only. Join the waitlist to request access.",
};

export default function SignupPage() {
  redirect("/login");
}