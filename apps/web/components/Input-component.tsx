export default function Input({type,placeholder,style}){
    return(
        <input type={type} placeholder={placeholder}  style={{
            backgroundColor:"white",
            color: "black",
            padding: "10px 10px 10px 3px",
            ...style
        }} />
    )
}