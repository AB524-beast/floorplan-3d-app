import React, { useRef, useState, useEffect } from 'react';
import { Undo2, Trash2, Upload, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Canvas2D({ onWallsUpdate }) {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Keep raw file for backend upload
  const [walls, setWalls] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentMousePos, setCurrentMousePos] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    drawCanvas();
    onWallsUpdate(walls);
  }, [walls, image, currentMousePos, isDrawing]);

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file); // Save file blob for API
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Trigger OpenCV Backend Wall Detection
  const handleAutoDetect = async () => {
    if (!imageFile) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      // Connects directly to your local FastAPI server
      const response = await axios.post('http://localhost:8000/api/auto-detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setWalls(response.data.walls);
      }
    } catch (error) {
      console.error("Error running AI wall detection:", error);
      alert("Failed to auto-detect walls. Make sure your Python server is running on port 8000!");
    } finally {
      setIsProcessing(false);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const hRatio = canvas.width / image.width;
      const vRatio = canvas.height / image.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShift_x = (canvas.width - image.width * ratio) / 2;
      const centerShift_y = (canvas.height - image.height * ratio) / 2;
      ctx.drawImage(image, 0, 0, image.width, image.height,
        centerShift_x, centerShift_y, image.width * ratio, image.height * ratio);
    } else {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a 2D floor plan to start tracing', canvas.width / 2, canvas.height / 2);
    }

    // Draw Saved Walls
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563eb';
    walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });

    // Draw Live Preview Line
    if (isDrawing && startPoint && currentMousePos) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#10b981';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    if (!image) return;
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pos);
    setCurrentMousePos(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    setCurrentMousePos(getMousePos(e));
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    const endPoint = getMousePos(e);
    const distance = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    if (distance > 5) {
      setWalls([...walls, { start: startPoint, end: endPoint }]);
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentMousePos(null);
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm w-full">
      <div className="flex gap-2 mb-4 w-full justify-between items-center bg-white p-2 rounded-lg shadow-inner flex-wrap">
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-700 transition">
            <Upload size={16} />
            Upload Plan
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            onClick={handleAutoDetect}
            disabled={!imageFile || isProcessing}
            className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            AI Auto-Detect
          </button>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setWalls(walls.slice(0, -1))} 
            disabled={walls.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <Undo2 size={16} /> Undo
          </button>
          <button 
            onClick={() => setWalls([])} 
            disabled={walls.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="bg-white border border-gray-300 rounded-lg shadow-inner cursor-crosshair max-w-full"
      />
    </div>
  );
}