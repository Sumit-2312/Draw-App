"use client";
import { useEffect, useState } from "react"
import Button from "../components/Button-component"
import Input from "../components/Input-component"
import axios from 'axios';
import {useRouter }  from 'next/navigation'
export default function Home(){

  const router = useRouter();
  const [roomName, setRoomName] = useState(null);  // name of room entered by the user
  const [roomId ,setRoomId] = useState(null);      // room id recieved from the server 
  const handleChange = (e:any) => { 
    setRoomName(e.target.value)
  }

  const handleClick = async()=>{
    console.log(roomName);
    console.log(localStorage.getItem('token'));
        const response = await axios.get(`http://localhost:3001/user/chat/${roomName}`,
        { 
          headers:{
            "Authorization" : `Bearer ${localStorage.getItem('token')}`
          }
        }
        );  // this will get the room id as per the roomName provided by the user
        if(response.status === 200){
            setRoomId(response.data.roomId);  // setting the room id recieved from the server
            // it does not directly put the roomId to be response.data.roomId instead it assign this work and then move to other tasks due to which the roomId is not set and the user is redirected to the room page with roomId as null
            // solution to this is to use the useEffect hook to set the roomId
          return;
        }
        else{
          alert("Room do not exists");
          return;
        }
  }

      useEffect(()=>{
        if(roomId){
          router.push(`/room/${roomId}`);
        }
      },[roomId]);

  return (
    <div style={{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      height:"100vh",
      backgroundColor:"black"
    }}>
        <div  style={{
          display:"flex",
          padding:"0px"
        }}>
          <Input onChange={handleChange} type={"text"} placeholder={"Enter room Id"} style={{ backgroundColor: "white", color: "black", border: "none",outline: "none"}}  />
          <Button onClick={handleClick} text={"Join Room"} variant={"variant1"}/>
        </div>
    </div>
  )
}
