 "use client";
 
 import { usePathname } from "next/navigation";
 import Navbar from "./Navbar";
 import { useAuth } from "@/lib/auth/useAuth";
 
 export default function ConditionalNavbar() {
   const pathname = usePathname();
   const { isAuthenticated, isLoading } = useAuth();
 
   // Define routes where the Navbar should be hidden
   const hiddenRoutes = ["/login", "/signup"];
 
   if (isLoading || !isAuthenticated || hiddenRoutes.includes(pathname)) {
     return null;
   }
 
   return <Navbar />;
 }