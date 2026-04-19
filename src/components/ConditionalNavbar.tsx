 "use client";
 
 import { usePathname } from "next/navigation";
 import Navbar from "./Navbar";

 // Navbar only renders on authenticated app pages.
 // Public pages (home, login, signup, privacy) never show the navbar.
 const APP_PREFIXES = ["/feed", "/profile", "/archive", "/friends", "/notifications", "/posts"];

 export default function ConditionalNavbar() {
   const pathname = usePathname();

   const isAppPage = APP_PREFIXES.some(prefix => pathname.startsWith(prefix));

   if (!isAppPage) {
     return null;
   }

   return <Navbar />;
 }