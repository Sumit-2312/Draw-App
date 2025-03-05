export default function Input({label,type,placeholder}:{
    label: string,
    type: string,
    placeholder: string
    
}){
    return(
        <div>
            <h4 className="text-black font-bold">
                {label}
            </h4>
            <input className="w-full px-3 py-5 "  type={type} placeholder={placeholder}  />
        </div>
    )
}