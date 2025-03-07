"use client"
import Input from '@repo/ui/Input'
import {useState, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage({isSignin}:{isSignin: boolean}){
    const usernameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const Router = useRouter();
    const [requesting,setRequesting] = useState<boolean>(false);

    const handleSubmit = async()=>{
        setRequesting(true);
        const username = usernameRef.current?.value;
        const email  = emailRef.current?.value;
        const password = passwordRef.current?.value;
        if(isSignin){
            // Sign in logic
            console.log("Signing in with", {username, password})
            const response = await axios.post("http://localhost:3001/user/signin",{
                username,
                password,
                email
            })
            const data = response.data;
            const token  = data.token;
            console.log("Token:", token)
            if(!token){
                console.log("Invalid credentials");
                setRequesting(false);
                return;
            }
            localStorage.setItem("token", token);
            setRequesting(false);
            Router.push('/');
        }
        else{
            const username = usernameRef.current?.value;
            const email  = emailRef.current?.value;
            const password = passwordRef.current?.value;
            // Sign up logic
           const response =  await axios.post("http://localhost:3001/user/signup",{
                username,
                password,
                email
            })
            const data = response.data;
            if(data.success){
                console.log("User created successfully");
            }
            setRequesting(false);
            Router.push("/signin");
        }
    }

    return(
        <div className="h-screen w-screen bg-gradient-to-r from-indigo-950 to-black flex justify-center items-center">
            <div className=" px-8 py-10  w-96 text-white bg-black flex gap-3 flex-col justify-center items-center rounded-xl shadow-blue-400 ">
                <h1 className="text-3xl text-white-600 font-bold">{isSignin ? "Sign in" : "Sign up"}</h1>
                <div className='flex flex-col w-full gap-5'>
                    <Input reference={usernameRef} label={"Username"} placeholder={"Enter username"} type={"text"} />
                    <Input reference={emailRef} label={"Email"} placeholder={"Enter email"} type={"text"} />
                    <Input reference={passwordRef} label={"Password"} placeholder={"Enter password"} type={"password"} />
                    <button onClick={handleSubmit} className={`  bg-indigo-600 hover:bg-indigo-800 cursor-pointer text-white px-5 py-2 rounded-xl`}>

                        {
                            requesting ? "wait"  : isSignin ? "Sign in" : "Sign up"
                        }
                        
                    </button>
                </div>
                <div>
                    {isSignin ? "Don't have an account?" : "Already have an account?"}
                    
                     <Link href={isSignin? "/signup" : "/signin"} >
                        <span className="hover:font-bold cursor-pointer underline">
                            {isSignin ? "Sign up" : "Sign in"}
                        </span>
                    </Link>
                    
                </div>
            </div>
        </div>
    )
}