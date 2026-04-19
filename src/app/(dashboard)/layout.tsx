"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/layout/SideBar";
import withAuth from "@/lib/auth/withAuth";

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
    <main className="pt-16">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <SideBar />
          <div className="lg:flex-1 space-y-5">{children}</div>
        </div>
      </div>
    </main>
  );
}

export default withAuth(DashboardLayout);