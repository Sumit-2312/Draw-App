"use client";
import  Link  from "next/link";
export default function Signin(){
    return(
        <div className="h-96 w-80 bg-zinc-300 rounded-xl">
            <div className="text-2xl text-black font-bold text-center p-5">
                Sign in
            </div>
            <div className="flex flex-col gap-3 p-5">
                <input type="text" placeholder="Enter name" className="p-3 rounded-lg border border-black"/>
                <input type="email" placeholder="Enter email" className="p-3 rounded-lg border border-black"/>
                <input type="password" placeholder="Enter password" className="p-3 rounded-lg border border-black"/>
                <button className="bg-green-800 text-white p-3 rounded-lg">
                    Sign in
                </button>
            </div>
            <div className="text-black flex text-center px-5">
                <p>Don't have an account? </p> <Link href={'/signup'}><span className="underline hover:font-bold px-2"> Signup</span></Link>
            </div>
        </div>  
    )
}