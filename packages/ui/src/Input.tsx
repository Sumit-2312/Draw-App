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
            <input className="inline-block w-full py-2 px-1 rounded border border-black " type={type} placeholder={placeholder} />
            </div>
    )
}