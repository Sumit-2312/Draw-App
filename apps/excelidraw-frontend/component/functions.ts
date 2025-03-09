  // Check if a point is inside a rectangle
 export const isPointInRectangle = (
    px: number, py: number, 
    rx: number, ry: number, 
    rw: number, rh: number
  ): boolean => {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  };

  // Check if a point is inside a circle
 export const isPointInCircle = (
    px: number, py: number,   // these are the coordintes of the cursor
    cx: number, cy: number,   // these are the coordinates of the center of circle
    radius: number
  ): boolean => {
    const dx = px - cx;    // distance on x-axis from the center of the circle
    const dy = py - cy;     // distance on y-axis from the center of the circle
  return dx * dx + dy * dy <= radius * radius;
  };

  // Check if a point is near a line
 export const isPointNearLine = (
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

 export const isPointNearPencil = (
    px:number , py: number, points: {x:number, y: number}[]
  )=>{
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
  
