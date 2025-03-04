"use client";

import { log } from "console";
import { useEffect, useState } from "react";

export default function ChatInput({roomId,setChats}){ // we have got the room id from the parent component now we can use it to send request to the server when we click on the send button and we can send the message written in the input field to the chat of the room with that roomId

    const [message, setMessage] = useState<string|null>(null);
    const [socket ,setSocket] = useState<WebSocket|null>(null);

    const handlechange = (e:any)=>{
        setMessage(e.target.value);
    }


    const handleClick = async (e:any) => {
        if (!message?.trim()) return; // Prevent sending empty messages
    
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "chat",
                message: message,
                roomId: roomId
            }));
            console.log("Message sent to the server");
            setMessage(""); // Clear input after sending
        } else {
            console.error("WebSocket is not open. Current state:", socket?.readyState);
        }
    };
    

    useEffect(() => {
        const wss = new WebSocket(`ws://localhost:8080/?token=${localStorage.getItem('token')}`);

        wss.onopen = () => {
            console.log("Connected to WebSocket");
            wss.send(JSON.stringify({ type: "join_room", roomId }));  // ✅ Send only after onopen
            
            setSocket(wss);
            console.log("Setting up WebSocket...");
            console.log(socket)
        };

        wss.onclose = () => console.log("Disconnected from WebSocket");

        const handleMessage = (event: MessageEvent) => {
            console.log("Message received from server:", event.data);

            try {
                const receivedMessage = JSON.parse(event.data);
                if (receivedMessage.type === "chat") {
                    setChats((prevChats) => [...prevChats, receivedMessage]); // ✅ Functional update
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        wss.onmessage = handleMessage;

        return () => {
            console.log("Cleaning up WebSocket...");
            wss.removeEventListener("message", handleMessage);  // ✅ Cleanup listeners
            wss.close();
        };
    }, [roomId]);

    useEffect(()=>{
        if(socket){
            console.log("Socket is set");
            console.log(socket);
        }
    },[socket])
    

    return(
        <div className="input flex w-full ">
            <input value={message} required onChange={handlechange} type="text" placeholder="Enter message"  className="bg-zinc-900 border-none outline-none text-white px-5 py-3 w-full"/>  
            <button onClick={handleClick} className="px-10 bg-green-800 text-white font-bold">
                Send
            </button>            
        </div>
    )
}
