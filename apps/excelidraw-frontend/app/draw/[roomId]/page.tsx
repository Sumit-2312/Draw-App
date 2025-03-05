"use client";

import { useEffect, useRef, useState } from "react";

type DrawnShape = {
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
} | {
  type: "circle";
  x: number;
  y: number;
  radius: number; 
} | {
  type: "line"; 
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shape, setShape] = useState<string>("rectangle");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);

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

    function getRadius(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    const draw = (e: MouseEvent) => {
      if (!isDrawing || !startPoint) return;

      const { x, y } = getCanvasCoordinates(e);
      
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

    const stopDrawing = (e: MouseEvent) => {
      if (!startPoint) return;

      const { x, y } = getCanvasCoordinates(e);
      
      if (shape === "rectangle") {
        setDrawnShapes((prev) => {
          const width = x - startPoint.x;
          const height = y - startPoint.y;
          return [...prev, {
            type: "rectangle",
            x: width >= 0 ? startPoint.x : x,
            y: height >= 0 ? startPoint.y : y,
            width: Math.abs(width),
            height: Math.abs(height)
          }];
        });
      }
      else if (shape === "circle") {
        setDrawnShapes((prev) => {
          const radius = getRadius(startPoint.x, startPoint.y, x, y);
          return [...prev, {
            type: "circle", 
            x: startPoint.x, 
            y: startPoint.y, 
            radius: radius
          }];
        });
      }
      else if (shape === "line") {
        setDrawnShapes((prev) => {
          return [...prev, {
            type: "line",
            x1: startPoint.x,
            y1: startPoint.y, 
            x2: x, 
            y2: y
          }];
        });
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
  }, [isDrawing, drawnShapes, shape]);

  return (
    <div className="relative h-screen w-screen bg-white">
      <canvas 
        ref={canvasRef} 
        id="canvas" 
        className="bg-black h-full w-full"
      />

      <div className="absolute top-[1%] left-1/2 -translate-x-1/2 border-[0.1px] rounded h-10 px-10 flex items-center gap-10 justify-evenly">
        <div 
          onClick={() => setShape("rectangle")} 
          className={`cursor-pointer ${shape === "rectangle" ? "text-yellow-300" : "text-white"} h-5 w-5 border`}
        >
        </div>

        <div 
          onClick={() => setShape("circle")} 
          className={`cursor-pointer ${shape === "circle" ? "text-yellow-300" : "text-white"} h-5 w-5 border rounded-full`}
        >
        </div>

        <div 
          onClick={() => setShape("line")} 
          className={`cursor-pointer h-5 ${shape === "line" ? "text-yellow-300" : "text-white"} rotate-45 border rounded-full`}
        >
        </div>
      </div>
    </div>
  );
}