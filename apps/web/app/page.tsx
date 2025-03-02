import Button from "../components/Button-component"
import Input from "../components/Input-component"

export default function Home(){

  return (
    <div style={{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      height:"100vh"
    }}>
        <div  style={{
          display:"flex",
          padding:"0px"
        }}>
          <Input type={"text"} placeholder={"Enter room Id"} style={{ backgroundColor: "white", color: "black", border: "none",outline: "none"}}  />
          <Button href={'/room'} text={"Submit"} variant={"variant1"}/>
          
        </div>
    </div>
  )
}