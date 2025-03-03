"use client";

import { useState } from "react"
import Button from "../components/Button-component"
import Input from "../components/Input-component"
import axios from 'axios';
import {useRouter }  from 'next/router'
export default function Home(){

  const router = useRouter();
  const [roomName, setRoomName] = useState(null);  // name of room entered by the user
  const [roomId ,setRoomId] = useState(null);      // room id recieved from the server 
  const handleChange = (e:any) => { 
    setRoomId(e.target.value)
  }

  const handleClick = async()=>{
        const response = await axios.get(`https://localhost:3000/user/${roomName}`);
        if(response.status === 200){
            setRoom(response.data.roomId);
            router.push(`/room/${roomId}`)
          return;
        }
        else{
          console.log("Room do not exists");
          return;
        }
  }

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
          <Button onClick={handleClick} text={"Submit"} variant={"variant1"}/>
        </div>
    </div>
  )
}
