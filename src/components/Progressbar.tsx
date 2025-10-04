"use client"
import { usePathname } from "next/navigation";
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
    useEffect(()=>{
        NProgress.done();
        return ()=>{
            NProgress.start();
        }
    },[pathname]);
    return null;
}