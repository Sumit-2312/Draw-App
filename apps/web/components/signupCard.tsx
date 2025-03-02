"use client";
import  Link  from "next/link";
import { useRef } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";

export default function Signup(){

    const passref = useRef<HTMLInputElement>(null);
    const emailref = useRef<HTMLInputElement>(null);  
    const nameref = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleclick = async()=>{
        const name = nameref.current?.value;
        const email = emailref.current?.value;
        const password = passref.current?.value;

        console.log(name,email,password);

        const response = await axios.post("http://localhost:3001/user/signup",{
            username:name,
            email:email,
            password:password
        });
        if(response.status === 200){
            router.push('/signin');
        }
    }

    return(
        <div className="h-96 w-80 bg-zinc-300 rounded-xl">
            <div className="text-2xl text-black font-bold text-center p-5">
                Sign up
            </div>
            <div className="flex flex-col gap-3 p-5">
                <input ref={nameref} type="text" placeholder="Enter name" className="p-3 rounded-lg border border-black"/>
                <input ref={emailref} type="email" placeholder="Enter email" className="p-3 rounded-lg border border-black"/>
                <input ref={passref} type="password" placeholder="Enter password" className="p-3 rounded-lg border border-black"/>
                <button onClick={handleclick} className="bg-green-800 text-white p-3 rounded-lg">
                    Sign up
                </button>
            </div>
            <div className="text-black flex text-center px-5">
                <p>Already have an account? </p> <Link href={'/signin'}><span className="underline hover:font-bold px-2"> Login</span></Link>
            </div>
        </div>  
    )
}