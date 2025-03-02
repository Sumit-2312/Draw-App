import Input from "../../../components/Input-component"

export default function Room({params}:{
    params: {
        slug: string
    }
}){
   
    return(
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
            <div className="w-1/2 p-3 text-white  bg-zinc-800 flex items-center justify-between px-5">
                <div className="text-2xl text-orange-300">
                    Chat app
                </div>
                <div className="text-xl">
                    Room: {params.slug}
                </div>
            </div>
            <div className="h-5/6 w-1/2 bg-zinc-200 flex flex-col items-center justify-between ">
                <div className="chat px-5 py-5 flex flex-col gap-5 h-full w-full justify-start">
                    <div className="border px-5 py-2 self-start bg-green-800 text-white rounded-xl  border-black ">
                        hello
                    </div>
                    <div className="border self-end px-5 py-2 bg-green-800 text-white rounded-xl  border-black ">
                        hi there
                    </div>
                </div>

                <div className="input flex w-full ">
                    <input type="text" placeholder="Enter message"  className="bg-zinc-900 text-white px-5 py-3 w-full"/>  
                    <button className="px-10 bg-green-800 text-white font-bold">
                        Send
                    </button>            
                </div>

            </div>
        </div>
    )
}