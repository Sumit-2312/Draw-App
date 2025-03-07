export default function Input({reference,label,type,placeholder}:{
    label: string,
    type: string,
    placeholder: string
    reference: any
}){
    return(
        <div>
            <h4 className="text-black font-bold">
                {label}
            </h4>
            <input required ref={reference} className="inline-block w-full py-2 px-5 text-black rounded border border-black " type={type} placeholder={placeholder} />
            </div>
    )
}