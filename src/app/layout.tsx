import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "nprogress/nprogress.css";
import Progressbar from "@/components/Progressbar";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <style>{`
          #nprogress .bar {
            background: #2563eb !important;
            height: 3px;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Suspense fallback={<div className="h-1 bg-gray-200" />}>
          <Progressbar />
        </Suspense>
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}
