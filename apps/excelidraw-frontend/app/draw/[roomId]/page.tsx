"use client";

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure canvas matches its display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const getCanvasCoordinates = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const startDrawing = (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      setIsDrawing(true);
      setStartPoint({ x, y });
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing || !startPoint) return;

      const { x, y } = getCanvasCoordinates(e);
      
      // Clear previous drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw rectangle
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      // Calculate width and height, handling different drawing directions
      const width = x - startPoint.x;
      const height = y - startPoint.y;

      ctx.strokeRect(
        width >= 0 ? startPoint.x : x, 
        height >= 0 ? startPoint.y : y, 
        Math.abs(width), 
        Math.abs(height)
      );
    };

    const stopDrawing = () => {
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
  }, [isDrawing]);

  return (
    <div className="relative h-screen w-screen bg-white">
      <canvas 
        ref={canvasRef} 
        id="canvas" 
        className="bg-black h-full w-full"
      />

      <div className="absolute top-[1%] left-1/2 -translate-x-1/2 border-[0.1px] rounded h-10 px-10 flex items-center gap-10 justify-evenly">
        <div className="cursor-pointer h-5 w-5 border"></div>
        <div className="cursor-pointer h-5 w-5 border rounded-full"></div>
        <div className="cursor-pointer h-5 rotate-45 border rounded-full"></div>
      </div>
    </div>
  );
}