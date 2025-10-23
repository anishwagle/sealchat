"use client"
import SideBar from "@/components/layout/SideBar";
import withAuth from "@/lib/auth/withAuth";

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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