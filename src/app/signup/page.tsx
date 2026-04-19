"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

type SubmitState = "idle" | "loading" | "success" | "error";

export default function SignupPage() {
  const router = useRouter();

  // Field states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Avatar states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status states
  const [loadingContext, setLoadingContext] = useState(true);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Verify auth strictly on load
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login"); // Only authorized users can see this page
      } else {
        setEmail(user.email || "");
        setLoadingContext(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Avatar upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("loading");
    setErrorMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication deeply expired. Please log in again.");

      // 1. Upload Avatar first natively on Client-side directly to Supabase storage Bucket
      let finalAvatarUrl = null;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(user.id);
        if (!finalAvatarUrl) {
           throw new Error("Avatar upload failed. Check the walkthrough for Storage configuration.");
        }
      }

      // 2. Submit Identity data to API to properly configure Profile
      const res = await fetch("/api/protected/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          bio: bio.trim(),
          avatar_url: finalAvatarUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitState("success");
        setTimeout(() => router.push("/"), 500);
      } else {
        setSubmitState("error");
        setErrorMessage(data.message || "Failed to create profile. Ensure username is unique.");
      }
    } catch (error: any) {
      setSubmitState("error");
      setErrorMessage(error.message || "Something went wrong.");
    }
  };

  if (loadingContext) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
            Almost there.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Complete your profile to join SealChat. 
            <br/> <span className="font-medium text-foreground opacity-70">Your name must match your legal ID.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-border flex items-center justify-center bg-muted/30 cursor-pointer hover:border-foreground/40 transition-colors"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">Upload Photo</span>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">Authentication Email</label>
              <Input
                type="email"
                value={email}
                disabled
                className="h-10 text-sm px-3 bg-muted/50 opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fullname" className="text-sm font-medium text-foreground block">
                Full Legal Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={submitState === "loading"}
                placeholder="John Doe"
                className="h-10 text-sm px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground block">
                Username <span className="text-destructive">*</span>
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} // alphanumeric + underscore block
                required
                disabled={submitState === "loading"}
                placeholder="johndoe"
                className="h-10 text-sm px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium text-foreground block">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={submitState === "loading"}
                placeholder="A short tagline about yourself"
                className="w-full min-h-[80px] text-sm px-3 py-2 rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {submitState === "error" && errorMessage && (
            <p className="text-sm text-destructive font-medium text-center">{errorMessage}</p>
          )}

          <Button
            type="submit"
            disabled={submitState === "loading" || !fullName.trim() || !username.trim()}
            className="w-full h-11 text-sm font-semibold tracking-wide"
          >
            {submitState === "loading" ? "Creating Profile..." : "Complete Setup"}
          </Button>

        </form>
      </div>
    </main>
  );
}