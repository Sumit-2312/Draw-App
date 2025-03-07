"use client"

import Input from "@repo/ui/Input"
import { useRef } from "react"
import axios from "axios"
import { useRouter } from "next/navigation";

export default function Create(){
    const inputref = useRef<HTMLInputElement>(null);
    const router = useRouter()

    const handleCreate = async()=>{
        const response:any = await axios.post("http://localhost:3001/user/create-room",{
            roomName: inputref.current?.value,
        }
        ,{
            headers:{
                Authorization: `Bearer ${localStorage.getItem("token")}`    
            }
        }
    )
        const data = response.data;
        console.log(response.status)
        if(response.status === 403){
            alert("Room with this name already exist please try another name")
            return;
        }
        else if(response.status === 200){
            router.push(`/`)
        }
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-r from-indigo-950 to-black flex justify-center items-center">
            <div className="flex flex-col justify-center gap-5 items-center bg-white p-10 rounded-lg shadow-lg">
                <h1 className="text-black text-4xl font-bold ">
                    Create Room
                </h1>
                <Input reference={inputref} type="text" placeholder="Myroom" label="Room Name" />
                <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-400 text-white px-4 py-2 rounded ">
                    Create
                </button>
            </div>
        </div>
    )
}