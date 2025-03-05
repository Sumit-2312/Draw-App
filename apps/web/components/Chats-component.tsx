"use client";
import { useEffect, useState } from "react"
import axios from "axios"
import ChatInput from "./Chat-input";



async function getChats(roomId:any,setChats){
    
    const response = await axios.get(`http://localhost:3001/user/chat?roomId=${roomId}`,{
        headers:{
            "Authorization" : `Bearer ${localStorage.getItem('token')}`
        }
    })
    const chats = response.data.userChats;  // we will have   chats: [{ message: "hello", userId: 1, roomId: 1, createdAt: "2021-09-29T07:00:00.000Z" }]
    setChats(chats);
}

export default function Chats({roomId}){

    const [chats,setChats] = useState<any>([]);
    const [userId, setUserid] = useState<number|null>();
    
    const getUserId = async() =>{
        const response = await axios.get('http://localhost:3001/user/userId',{
            headers:{
                "Authorization" : `Beared ${localStorage.getItem("token")}`
            }
        });
        setUserid(response.data.userId);
    }
    useEffect(()=>{
        getUserId();
    }, []); 
    
    useEffect(()=>{
        if (userId !== null) {
            getChats(roomId,setChats);
        }
    }, [roomId]);  
    
    return(
       <div className="h-full w-full flex flex-col">
        
        <div className="scrollbar-none   overflow-y-scroll h-full w-full">
                <div className=" chat px-5 py-5 flex flex-col gap-5 h-full w-full justify-start">
                    
                    {chats.map((chat:any) => (
                            (chat.userId === userId) ? 
                            <div key={chat.id} className="border px-5 py-2 self-end bg-green-800 text-white rounded-xl border-black">
                                {chat.message}
                            </div> :
                            <div key={chat.id} className="border px-5 py-2 self-start bg-gray-800 text-white rounded-xl border-black">
                                {chat.message}
                            </div>
                    ))}
                    
                </div>

        </div>

        <div> 
            <ChatInput roomId={roomId} setChats={setChats} />
        </div>

       </div>
    )
}