import Chats from "../../../components/Chats-component";




export default async function Room({ params }: { params: { slug: number } }) {

    
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

            <div className="h-5/6 w-1/2  bg-zinc-200 flex flex-col items-center justify-between">
                <Chats roomId={params.slug}/>
            </div>
        </div>

    )
}