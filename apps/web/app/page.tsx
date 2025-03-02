"use client";

import { useState } from "react"
import Button from "../components/Button-component"
import Input from "../components/Input-component"

export default function Home(){

  const [roomId, setRoomId] = useState(null);
  const handleChange = (e:any) => { 
    setRoomId(e.target.value)

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
          <Button href={`/room/${roomId}`} text={"Submit"} variant={"variant1"}/>
          
        </div>
    </div>
  )
}