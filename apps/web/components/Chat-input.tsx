"use client";

import { useEffect, useState } from "react";

export default function ChatInput({roomId,setChats}){ // we have got the room id from the parent component now we can use it to send request to the server when we click on the send button and we can send the message written in the input field to the chat of the room with that roomId

    const [message, setMessage] = useState<string|null>(null);
    const [socket ,setSocket] = useState<WebSocket|null>(null);

    const handlechange = (e:any)=>{
        setMessage(e.target.value);
    }


    const handleClick = async (e:any)=>{
        console.log(message);
        console.log(roomId);
        // here we need to send the ws request to with the type as chat and message be the message in the input field and roomId be the roomId of the room
       socket?.send(JSON.stringify({
            type:"chat",
            message: message,
            roomId: roomId
        }));
        e.target.value = "";
    }

    useEffect(() => {
        const wss = new WebSocket("ws://localhost:8080/?token=" + localStorage.getItem('token'));

        wss.send(JSON.stringify({
            type: "join_room",
            roomId: roomId
        }));
    
        wss.onopen = () => console.log("Connected to WebSocket");
        wss.onclose = () => console.log("Disconnected from WebSocket");

        wss.onmessage = (event) => {
            console.log("Message received from server:", event.data);

            try {
                const receivedMessage = JSON.parse(event.data);
                
                if (receivedMessage.type === "chat") {
                    // Update chat list with the new message
                    setChats((chats:any) => [...chats, receivedMessage]);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
    
        setSocket(wss);
    
        return () => wss.close();  // ✅ Cleanup when unmounting
    }, [roomId]);
    

    return(
        <div className="input flex w-full ">
            <input required onChange={handlechange} type="text" placeholder="Enter message"  className="bg-zinc-900 border-none outline-none text-white px-5 py-3 w-full"/>  
            <button onClick={handleClick} className="px-10 bg-green-800 text-white font-bold">
                Send
            </button>            
        </div>
    )
}
