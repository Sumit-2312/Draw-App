export default function RoomCard ({text,members,days}:{
    text: any,
    members: number,
    days: string
}){
    return (
        <div className="text-black hover:shadow-2xl hover:-translate-y-1 h-80 w-96 rounded-lg overflow-hidden flex flex-col items-center justify-center">
            <div className="flex w-full h-3/4 bg-gray-300 items-center justify-center">
                <h1 className="text-4xl text-indigo-600 font-bold">
                    {text}
                </h1>
            </div>
            <div className="flex w-full h-1/4 bg-white text-black items-center justify-between px-10">
                <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    {members}
                </div>
                <div>
                    {days}
                </div>
            </div>
        </div>
    )
}