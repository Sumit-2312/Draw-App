export default function Input({onChange,type,placeholder,style}){
    return(
        <input onChange={onChange} type={type} placeholder={placeholder}  className="bg-white text-black py-3 px-3 outline-none border-none"  />
    )
}