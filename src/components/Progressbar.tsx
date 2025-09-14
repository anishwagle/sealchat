"use client"
import { usePathname, useSearchParams } from "next/navigation";
import  NProgress  from "nprogress";
import { useEffect } from "react";
NProgress.configure({
    minimum: 0.3,
    easing: 'ease',
    speed: 500,
    showSpinner : false
})
export default function Progressbar(){
    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(()=>{
        NProgress.done();
        return ()=>{
            NProgress.start();
        }
    },[pathname,searchParams]);
    return null;
}