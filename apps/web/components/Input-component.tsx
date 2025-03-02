export default function Input({onChange,type,placeholder,style}){
    return(
        <input onChange={onChange} type={type} placeholder={placeholder}  style={{
            backgroundColor:"white",
            color: "black",
            padding: "10px 10px 10px 3px",
            ...style
        }} />
    )
}