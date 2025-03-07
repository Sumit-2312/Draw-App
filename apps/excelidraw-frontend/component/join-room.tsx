"use client"

import Input from "@repo/ui/Input"
import { useRef } from "react"
import axios from "axios"
import { useRouter } from "next/navigation";

export default function Join(){
    const inputref = useRef<HTMLInputElement>(null);
    const router = useRouter()

    const handleCreate = async () => {
        try {
          const response = await axios.post(
            "http://localhost:3001/user/join-room",
            { roomName: inputref.current?.value },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
      
          console.log("Status Code:", response.status); // ✅ Runs only for successful responses
      
          if (response.status === 200) {
            router.push(`/draw/${response.data.newRoom.id}`);
          }
          
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.log("Error Status Code:", error.response.status); // ✅ Runs for 403 errors
      
            if (error.response.status === 403) {
              console.log("No such room exists");
              //@ts-ignore
              inputref.current.value = "";
              alert("No such room exists");
            } else {
              console.error("Error:", error.response.data.message || "Something went wrong");
            }
          } else {
            console.error("Unexpected Error:", error);
          }
        }
      };
      

    return (
        <div className="h-screen w-screen bg-gradient-to-r from-indigo-950 to-black flex justify-center items-center">
            <div className="flex flex-col justify-center gap-5 items-center bg-white p-10 rounded-lg shadow-lg">
                <h1 className="text-black text-4xl font-bold ">
                    Join Room
                </h1>
                <Input reference={inputref} type="text" placeholder="Myroom" label="Room Name" />
                <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-400 text-white px-4 py-2 rounded ">
                    Join
                </button>
            </div>
        </div>
    )
}