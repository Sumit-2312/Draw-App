"use client";

import {  useEffect, useRef, useState } from "react";
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
} | {
  type: "pencil";
  points: { x: number; y: number }[];
  id: string;
}

export default function Page({params}:{params: {roomId : string}}) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shape, setShape] = useState<string>("rectangle");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [isErasing, setIsErasing] = useState(false);
  const [socket , setSocket] = useState<WebSocket>();
  const [continuedPencil,setContinuedPencil] = useState(false); // to check if the pencil is continued or not

  

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

  const isPointNearPencil = (
    px:number , py: number, points: {x:number, y: number}[]
  ){
    const threshold = 5; // distance threshold to consider point near the pencil line
    for(let i = 0; i < points.length - 1; i++){
      const x1 = points[i].x;
      const y1 = points[i].y;
      const x2 = points[i+1].x;
      const y2 = points[i+1].y;

      if(isPointNearLine(px,py,x1,y1,x2,y2,threshold)){
        return true;
      }
    }
    return false;
  }


  const reRenderCanvas = (ctx: any, canvas: any) => {
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
  
      if (shape.type === "rectangle") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } 
      else if (shape.type === "circle") {
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      } 
      else if (shape.type === "line") {
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      } 
      else if (shape.type === "pencil") {
        // Draw pencil strokes
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
  
        shape.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
  
        ctx.stroke();
      }
    });
  };
  


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;


    reRenderCanvas(ctx,canvas);

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
        // Check for shapes under the eraser and remove them
        const updatedShapes = drawnShapes.filter((shape) => {  // drawnshapes would be an array of shapes that will be rendered on the canvas whenever there is a change in the drawnshapes state
          if (shape.type === 'rectangle') {
             // this will return true if cursor lies in the rectangle 
            // if it returns true, then we need to remove the rectangle from the drawnshapes array and send a message to the ws server with type delete and id of the rectangle which we are sending to the database while storing the shape
            if(isPointInRectangle(x, y, shape.x, shape.y, shape.width, shape.height)){
              // in the database we will traverse through the chats and remove the chat with the shapeId we will provide in the message
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id,
                roomId : params.roomId
              }))
              return false; // Remove this shape
            }

            return true;
          }
          else if (shape.type === 'circle') {
            if(!isPointInCircle(x, y, shape.x, shape.y, shape.radius)){
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id
              }))
              return false; // Remove this shape  
            }
            return true; 
          }
          else if (shape.type === 'line') {
            if(!isPointNearLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2)){
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id
              }))
              return false; // Remove this shape  
            }
            return true;
          }
          else if(shape.type === 'pencil'){
            if(!isPointNearPencil(x,y,shape.points)){
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id
              }))
              return false; // Remove this shape  
            }
            return true;
          }
          return true;
        });
        
        // Update the shapes array if any shape was deleted
        if (updatedShapes.length !== drawnShapes.length) {
          setDrawnShapes(updatedShapes);
        }
      } else {
        // Normal drawing behavior
       if(!continuedPencil){
        setDrawnShapes((prev)=>{
          return [...prev,{type:"pencil",points:[{x,y}],id:crypto.randomUUID()}]
        })
        setContinuedPencil(true);
       }
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
        const updatedShapes = drawnShapes.filter((shape) => {  // drawnshapes would be an array of shapes that will be rendered on the canvas whenever there is a change in the drawnshapes state
          if (shape.type === 'rectangle') {
             // this will return true if cursor lies in the rectangle 
            // if it returns true, then we need to remove the rectangle from the drawnshapes array and send a message to the ws server with type delete and id of the rectangle which we are sending to the database while storing the shape
            if(isPointInRectangle(x, y, shape.x, shape.y, shape.width, shape.height)){
              // in the database we will traverse through the chats and remove the chat with the shapeId we will provide in the message
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id,
                roomId : params.roomId
              }))
              return false; // Remove this shape
            }

            return true;
          }
          else if (shape.type === 'circle') {
            if(!isPointInCircle(x, y, shape.x, shape.y, shape.radius)){
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id
              }))
              return false; // Remove this shape  
            }
            return true; 
          }
          else if (shape.type === 'line') {
            if(!isPointNearLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2)){
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id
              }))
              return false; // Remove this shape  
            }
            return true;
          }
          else if(shape.type === 'pencil'){
            if(!isPointNearPencil(x,y,shape.points)){
              socket?.send(JSON.stringify({
                type: "delete",
                shapeId : shape.id
              }))
              return false; // Remove this shape  
            }
            return true;
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
      
      
      reRenderCanvas(ctx,canvas);  // re-render everything on the canvas 

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
      else if (shape === "pencil") {
        if (!isDrawing) return; // Ensure drawing only happens when mouse is down
      
        const newPoint = { x, y };
      
        // Add the new point to the current stroke
        const updatedShapes = [...drawnShapes];   // here the array of all the shapes will be shallow copied in the updateshapes
        // if user is using the pencil then the last updated shape will be the pencil shape
        const lastShape = updatedShapes[updatedShapes.length - 1];  // here we are getting the last shape from the updatedshapes array
        // if the last shape is pencil then we will push the new point to the points array of the last shape
      
        if (lastShape?.type === "pencil" && continuedPencil) {
          lastShape.points.push(newPoint);   // push the last point to the points array of the last shape
        } else {
          // If no active stroke, create a new one
          updatedShapes.push({ type: "pencil", points: [startPoint, newPoint], id: crypto.randomUUID() });
        }
      
        setDrawnShapes(updatedShapes); // Update state with new stroke data
        setStartPoint(newPoint); // Update start point
      
        // Redraw everything on canvas
        reRenderCanvas(ctx,canvas);
      }
      
    };

    const stopDrawing = async(e: MouseEvent) => {
      // End erasing mode
      if (isErasing) {
        setIsErasing(false);
        return;
      }
      if(continuedPencil){
        setContinuedPencil(false);
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
      else if(shape === 'pencil'){
        interface pencilShape {
          type: "pencil"
          points : {x: number,y:number}[],
          id: string
        }
        const Lastshape:pencilShape = drawnShapes[drawnShapes.length -1] as pencilShape; // this would definately be the pencil shape
        socket?.send(JSON.stringify({
          type: "chat",
          roomId: roomId,
          message: JSON.stringify({
            type: "pencil",
            points: Lastshape.points,
            id: uniqueId
          })
        }))
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
  useEffect(()=>{
    const insideFunction = async()=>{
          
        // first fetch all the shapes from the backend
        //@ts-ignore
        const {roomId} = await params;
        const response = await axios.get(`http://localhost:3001/user/chat?roomId=${roomId}`,{
          headers:{
            Authorization: `Bearer ${localStorage.getItem("token")}`
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
        const wss = new WebSocket(`ws://localhost:8080?token=${localStorage.getItem("token")}`);

        wss.onopen = async()=>{
          setSocket(wss);
          wss.send(JSON.stringify({
            type: "join_room",
            roomId : (await params).roomId
          }))
        }

        wss.onmessage = (message)=>{
          const data = JSON.parse(message.data);
          if(data.type === 'chat'){
              const newShape = JSON.parse(data.message);
              setDrawnShapes((prev) => {
                return [...prev, newShape];
              });
              console.log(newShape);
          }
          else if(data.type === 'delete'){
            const shapeId = data.shapeId;
            setDrawnShapes((prev) => {
              return prev.filter(shape => shape.id !== shapeId);
            });
          }
        }
    }
    insideFunction();
  },[]);


  if(!socket) return  <div className="flex justify-center items-center h-64">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
</div>

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

        <div onClick={() => setShape("pencil")} className="h-full w-[50px] hover:cursor-pointer flex items-center justify-center">
          <div className={`cursor-pointer h-5 w-5 flex items-center justify-center ${shape === "pencil" ? "text-yellow-300" : "text-white"}`}>
            {/* Simple pencil icon */}
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.586 3.414a2 2 0 0 1 2.828 0l1.172 1.172a2 2 0 0 1 0 2.828L9 19H5v-4L16.586 3.414z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5l4 4" />
            </svg>
          </div>
        </div>

        
      </div>
    </div>
  );
}

