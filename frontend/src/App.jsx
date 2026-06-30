import React, { useState } from 'react';
import Canvas2D from './components/Canvas2D';
import Viewer3D from './components/Viewer3D';
import { Layers } from 'lucide-react';

export default function App() {
  const [walls, setWalls] = useState([]);

  // Callback function triggered when 2D canvas draws/modifies lines
  const handleWallsUpdate = (updatedWalls) => {
    setWalls(updatedWalls);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
          <Layers size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Plan3D Studio
          </h1>
          <p className="text-xs text-slate-500">
            Trace a 2D floor plan layout to generate an interactive 3D model environment
          </p>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-[1600px] w-full mx-auto items-start">
        {/* Left Hand Column: Control Tooling & 2D Canvas Editor */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-md font-semibold text-slate-700">1. Architectural Blueprint Layout</h2>
            <p className="text-xs text-slate-400 mb-2">Upload your blueprint background and trace over the target structural partitions.</p>
          </div>
          <Canvas2D onWallsUpdate={handleWallsUpdate} />
        </div>

        {/* Right Hand Column: Three.js Realtime 3D Engine Instance */}
        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-md font-semibold text-slate-700">2. Real-Time Dimensional Viewport</h2>
            <p className="text-xs text-slate-400 mb-2">Click and drag inside the scene to orbit view angles, scroll to scale zoom metrics.</p>
          </div>
          <Viewer3D walls={walls} />
        </div>
      </main>
    </div>
  );
}