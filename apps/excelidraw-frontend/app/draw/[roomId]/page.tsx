"use client";

import { useEffect, useRef, useState } from "react";
import axios from 'axios';

type DrawnShape = {
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
} | {
  type: "circle";
  x: number;
  y: number;
  radius: number;
  id: string;
} | {
  type: "line"; 
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  id: string;
} 

export default function Page({params}:{params: {roomId : string}}) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shape, setShape] = useState<string>("rectangle");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [isErasing, setIsErasing] = useState(false);
  const [socket , setSocket] = useState<WebSocket>()

  

  // Check if a point is inside a rectangle
  const isPointInRectangle = (
    px: number, py: number, 
    rx: number, ry: number, 
    rw: number, rh: number
  ): boolean => {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  };

  // Check if a point is inside a circle
  const isPointInCircle = (
    px: number, py: number, 
    cx: number, cy: number, 
    radius: number
  ): boolean => {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= radius * radius;
  };

  // Check if a point is near a line
  const isPointNearLine = (
    px: number, py: number, 
    x1: number, y1: number, 
    x2: number, y2: number, 
    threshold: number = 5
  ): boolean => {
    // Calculate distance from point to line
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) // in case of 0 length line
      param = dot / len_sq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy) <= threshold;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;


    // Ensure canvas matches its display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all existing shapes
    drawnShapes.forEach((shape) => {
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
      else if (shape.type === 'circle') {
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      else if (shape.type === 'line') {
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      }
    });

    // If erasing, show eraser cursor
    if (isErasing && shape === "eraser") {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "default";
    }

    const getCanvasCoordinates = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const startDrawing = (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      
      // Handle eraser functionality
      if (shape === "eraser") {
        setIsErasing(true);
        
        // Check if the click point intersects with any shape and remove it
        const updatedShapes = drawnShapes.filter((shape) => {
          if (shape.type === 'rectangle') {
            return !isPointInRectangle(x, y, shape.x, shape.y, shape.width, shape.height);
          }
          else if (shape.type === 'circle') {
            return !isPointInCircle(x, y, shape.x, shape.y, shape.radius);
          }
          else if (shape.type === 'line') {
            return !isPointNearLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
          }
          return true;
        });
        
        // Update the shapes array if any shape was deleted
        if (updatedShapes.length !== drawnShapes.length) {
          setDrawnShapes(updatedShapes);
        }
      } else {
        // Normal drawing behavior
        setIsDrawing(true);
        setStartPoint({ x, y });
      }
    };

    function getRadius(x1: number, y1: number, x2: number, y2: number) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    const draw = (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      
      // Handle erasing while moving (drag erase)
      if (isErasing && shape === "eraser") {
        // Check for shapes under the eraser and remove them
        const updatedShapes = drawnShapes.filter((shape) => {
          if (shape.type === 'rectangle') {
            return !isPointInRectangle(x, y, shape.x, shape.y, shape.width, shape.height);
          }
          else if (shape.type === 'circle') {
            return !isPointInCircle(x, y, shape.x, shape.y, shape.radius);
          }
          else if (shape.type === 'line') {
            return !isPointNearLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
          }
          return true;
        });
        
        // Update the shapes array if any shape was deleted
        if (updatedShapes.length !== drawnShapes.length) {
          setDrawnShapes(updatedShapes);
        }
        return;
      }
      
      // Normal drawing functionality
      if (!isDrawing || !startPoint) return;
      
      // Clear previous drawing and redraw existing shapes
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw existing shapes
      drawnShapes.forEach((shape) => {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        if (shape.type === 'rectangle') {
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        else if (shape.type === 'circle') {
          ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        else if (shape.type === 'line') {
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.stroke();
        }
      });
      // Draw current shape in progress
      ctx.beginPath();
      ctx.strokeStyle = "white";
      

      if (shape === "rectangle") {
        const width = x - startPoint.x;
        const height = y - startPoint.y;

        ctx.strokeRect(
          width >= 0 ? startPoint.x : x, 
          height >= 0 ? startPoint.y : y, 
          Math.abs(width), 
          Math.abs(height)
        );
      }
      else if (shape === "circle") {
        const radius = getRadius(startPoint.x, startPoint.y, x, y);
        
        ctx.arc(
          startPoint.x,
          startPoint.y,
          radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      else if (shape === "line") {
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };
    const stopDrawing = async(e: MouseEvent) => {
      // End erasing mode
      if (isErasing) {
        setIsErasing(false);
        return;
      }
      
      if (!isDrawing || !startPoint) return;
    
      const { x, y } = getCanvasCoordinates(e);
      const uniqueId = Date.now().toString();
      const roomId = (await params).roomId;
      
      if (shape === "rectangle") {
        const width = x - startPoint.x;
        const height = y - startPoint.y;
        const normalizedX = width >= 0 ? startPoint.x : x;
        const normalizedY = height >= 0 ? startPoint.y : y;
        const absWidth = Math.abs(width);
        const absHeight = Math.abs(height);
        
        socket?.send(JSON.stringify({
          type: "chat",
          roomId: roomId,
          message: JSON.stringify({
            type: "rectangle",
            x: normalizedX,
            y: normalizedY,
            width: absWidth,
            height: absHeight,
            id: uniqueId
          })
        }));
        
        setDrawnShapes((prev) => [...prev, {
          type: "rectangle",
          x: normalizedX,
          y: normalizedY,
          width: absWidth,
          height: absHeight,
          id: uniqueId
        }]);
      }
      else if (shape === "circle") {
        const radius = getRadius(startPoint.x, startPoint.y, x, y);
        
        socket?.send(JSON.stringify({
          type: "chat",
          roomId: roomId,
          message: JSON.stringify({
            type: "circle",
            x: startPoint.x,
            y: startPoint.y,
            radius: radius,
            id: uniqueId
          })
        }));
        
        setDrawnShapes((prev) => [...prev, {
          type: "circle", 
          x: startPoint.x, 
          y: startPoint.y, 
          radius: radius,
          id: uniqueId
        }]);
      }
      else if (shape === "line") {
        socket?.send(JSON.stringify({
          type:"chat",
          roomId: roomId,
          message: JSON.stringify({
            type: "line",
            x1: startPoint.x,
            y1: startPoint.y, 
            x2: x, 
            y2: y,
            id: uniqueId
          })
        }));
        
        setDrawnShapes((prev) => [...prev, {
          type: "line",
          x1: startPoint.x,
          y1: startPoint.y, 
          x2: x, 
          y2: y,
          id: uniqueId
        }]);
      }
      
      setIsDrawing(false);
      setStartPoint(null);
    };
    
    // Attach Event Listeners
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    // Cleanup Event Listeners on Unmount
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, [isDrawing, drawnShapes, shape, isErasing]);


  // @ts-ignore
  useEffect(async()=>{

    // first fetch all the shapes from the backend
    const response = await axios.get(`http://localhost:3001/user/chat?roomId=${params.roomId}`,{
      headers:{
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzQxMjYyNTExfQ.I9lj8w8m_F1PHGgJl9lLQ_CT3KoV1NGuaoAfjAVlq0M`
      }
    });
    const data = response.data;  // json object consist of array of objects
    const userChats = data.userChats;
    userChats.map((chat:any)=>{
      const message = JSON.parse(chat.message);
      setDrawnShapes((prev)=>{
        return [...prev,message]
      })
    }) 

    // establish a connection with the websocket server
    const wss = new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzQxMjYyNTExfQ.I9lj8w8m_F1PHGgJl9lLQ_CT3KoV1NGuaoAfjAVlq0M")

    wss.onopen = async()=>{
      setSocket(wss);
      wss.send(JSON.stringify({
        type: "join_room",
        roomId : (await params).roomId
      }))
    }

    wss.onmessage = (message)=>{
      const data = JSON.parse(message.data);
      const newShape = JSON.parse(data.message);
      setDrawnShapes((prev) => {
        return [...prev, newShape];
      });
      console.log(newShape);
    }

    
  },[]);


  if(!socket) return <div> Loading ... </div>

  return (

    <div className="relative h-screen w-screen bg-white">
      <canvas 
        ref={canvasRef} 
        id="canvas" 
        className="bg-black h-full w-full"
      />

      <div className="absolute top-[1%] left-1/2 -translate-x-1/2 border-[0.1px] rounded h-10 px-5 overflow-hidden flex items-center gap-5 ">
       
        <div onClick={() => setShape("rectangle")} className="h-full w-[50px] hover:cursor-pointer flex items-center justify-center">
          <div 
            className={`cursor-pointer ${shape === "rectangle" ? "text-yellow-300" : "text-white"} h-5 w-5 border`}
          >
          </div>
        </div>

        <div onClick={() => setShape("circle")} className="h-full w-[50px] hover:cursor-pointer flex items-center justify-center">
          <div  
            className={`cursor-pointer ${shape === "circle" ? "text-yellow-300" : "text-white"} h-5 w-5 border rounded-full`}
          >
          </div>
        </div>

        <div onClick={() => setShape("line")} className="h-full w-[50px] hover:cursor-pointer flex items-center justify-center">
          <div  
            className={`cursor-pointer h-5 ${shape === "line" ? "text-yellow-300" : "text-white"} rotate-45 border rounded-full`}
          >
          </div>
        </div>

        {/* Eraser Tool */}
        <div onClick={() => setShape("eraser")} className="h-full w-[50px] hover:cursor-pointer flex items-center justify-center">
          <div  
            className={`cursor-pointer h-5 w-5 flex items-center justify-center ${shape === "eraser" ? "text-yellow-300" : "text-white"}`}
          >
            {/* Simple eraser icon */}
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h14l-7 7-7-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19h4l7-7 7 7H3z" />
            </svg>
          </div>
        </div>
        
      </div>
    </div>
  );
}


// whenever user comes to the page, it should fetch the data from the server which will consist of the shapes drawn by the user
// whenever user draws a shape, it should be sent to the server and saved in the database
// whenever user erases a shape, it should be sent to the server and deleted from the database