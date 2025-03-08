// pages/my-rooms.js
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import RoomCard from '@/component/room-card';
import axios from 'axios';

export default function MyRooms() {
  const [rooms, setRooms] = useState([{}]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered,setFiltered] = useState([{}]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const userIdResponse = await axios.get('http://localhost:3001/user/userId',{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const userId = userIdResponse.data.userId;
        const response = await axios.get(`http://localhost:3001/user/rooms?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = response.data;
        const roomList = data.map((obj: any) => obj.room);

        setRooms(roomList);
      } catch (err: any) {
        console.log(err.message || "Failed to fetch rooms");
      } finally {
        setIsLoading(false);
      }
    };

     fetchRooms();
  }, []); 


  
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Unknown"; // ✅ Handle undefined dates
  
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid date"; // ✅ Handle invalid dates
  
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
  
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
  
    return parsedDate.toLocaleDateString(); // ✅ Now it's safe to call
  };

  useEffect(() => {
    setFiltered(() => {
        const filtered = rooms.filter((room: any) => {
            if (!room?.name) return false; 
            return room.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
        return filtered;
    });

    console.log("Filtered Rooms:", filtered);
}, [searchTerm, rooms]);    
  
  return (
    <div className="min-h-screen bg-gray-100">
    

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Rooms</h1>
          <Link href="/create-room" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Create New Room
          </Link>
        </div>
      </header>

    <main className='px-80 border flex flex-col gap-10 border-black min-h-screen  py-10'>

    {/* Search section */}
      <div className=' relative w-fit flex text-black border border-zinc-400 justify-between items-center px-5 py-3 rounded '>
            <input onChange={(e)=>setSearchTerm(e.target.value)} className='border-none outline-none h-full' value={searchTerm} type="text" placeholder='Search rooms...'/>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
      </div>

    {/* Rooms list */}
    {isLoading? <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                 </div>:
                 <div className='grid grid-cols-3 gap-10 mt-10'>
                        {filtered.map((room,index)=>{
                                {/* @ts-ignore */}
                            return <Link key={index} href={`/draw/${room.id}`}>
                                {/* @ts-ignore */}
                                <RoomCard text={room.name} members={rooms.length} days={formatDate(room.createdAt)} />
                                </Link>
                        })}
                 </div>
    }
    


    </main>
     

    </div>
  );
}