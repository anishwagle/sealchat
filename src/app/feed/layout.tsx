"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/lib/auth/withAuth";
import FeedNavigation from "@/components/layout/FeedNavigation";

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfileState = async () => {
      try {
        const response = await fetch('/api/protected/profile');
        if (response.status === 404) {
          router.push('/signup');
        } else {
          setProfileLoading(false);
        }
      } catch (error) {
        setProfileLoading(false);
      }
    };
    fetchProfileState();
  }, [router]);

  if (profileLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="pt-16 pb-20 md:pb-0 bg-background min-h-screen">
      <div className="flex flex-col items-center">
        {/* Centered feed container with max-width */}
        <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-5">
            {children}
          </div>
        </div>
      </div>
      
      {/* Navigation - bottom tabs on mobile, hidden on desktop for now */}
      <FeedNavigation />
    </main>
  );
}

export default withAuth(DashboardLayout);