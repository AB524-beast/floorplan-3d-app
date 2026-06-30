import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

// Individual Wall Element Extrusion Component
function Wall3D({ wall, canvasWidth, canvasHeight }) {
  const wallHeight = 2.5; // Height in 3D scene units
  const wallThickness = 0.2; // Thickness in 3D scene units
  const scaleFactor = 0.05; // Converts 2D pixels to 3D scene units

  // 1. Convert canvas screen coordinates into centered 3D positions
  const x1 = (wall.start.x - canvasWidth / 2) * scaleFactor;
  const y1 = (canvasHeight / 2 - wall.start.y) * scaleFactor; // Invert Y for 3D webGL space
  const x2 = (wall.end.x - canvasWidth / 2) * scaleFactor;
  const y2 = (canvasHeight / 2 - wall.end.y) * scaleFactor;

  // 2. Calculate Midpoint (Where the 3D Box mesh will sit)
  const posX = (x1 + x2) / 2;
  const posZ = -(y1 + y2) / 2; // Map 2D Y axis to 3D Z depth axis

  // 3. Compute length and rotation angle using trigonometry
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  return (
    <mesh position={[posX, wallHeight / 2, posZ]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, wallHeight, wallThickness]} />
      <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

// Main 3D Canvas Assembly
export default function Viewer3D({ walls }) {
  // Matching the dimensions of our 2D canvas configuration
  const canvasWidth = 600;
  const canvasHeight = 500;

  return (
    <div className="w-full h-[560px] bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden relative">
      {/* 3D Context Viewport */}
      <Canvas camera={{ position: [0, 15, 15], fov: 50 }}>
        {/* Lights */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 10]} intensity={2.5} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={1.0} />

        {/* Dynamic Architectural Geometry Group */}
        <group>
          {walls.map((wall, index) => (
            <Wall3D 
              key={index} 
              wall={wall} 
              canvasWidth={canvasWidth} 
              canvasHeight={canvasHeight} 
            />
          ))}
        </group>

        {/* Clean Architectural Grid Floor */}
        <Grid 
          position={[0, -0.01, 0]} 
          args={[30, 30]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="#475569" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#64748b" 
          fadeDistance={30}
        />

        {/* User Interactive Navigation Constraints */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          minDistance={3} 
          maxDistance={25}
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going underneath the floor grid
        />
      </Canvas>

      {/* Overlay UI tag */}
      <div className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur text-slate-200 text-xs px-2.5 py-1 rounded border border-slate-700 font-medium">
        3D Interactive View
      </div>
    </div>
  );
}