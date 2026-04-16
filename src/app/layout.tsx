import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "nprogress/nprogress.css";
import Progressbar from "@/components/Progressbar";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

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
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <head>
        <style>{`
          #nprogress .bar {
            background: #2563eb !important;
            height: 3px;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
          <Progressbar />
        <ConditionalNavbar />
        {children}
      </body>
    </html>
  );
}
