
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Mesh, MathUtils } from 'three';

function FloatingObject({ position, color, speed, size }: { 
  position: [number, number, number]; 
  color: string; 
  speed: number;
  size: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const initialY = position[1];
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3 * speed;
      meshRef.current.rotation.y += delta * 0.4 * speed;
      meshRef.current.rotation.z += delta * 0.1 * speed;
      
      // Gentle floating motion
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
    </mesh>
  );
}

interface FloatingObjectsProps {
  className?: string;
  count?: number;
}

export default function FloatingObjects({ className = "", count = 10 }: FloatingObjectsProps) {
  const objects = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      return {
        position: [
          MathUtils.randFloatSpread(10), // x
          MathUtils.randFloatSpread(10), // y
          MathUtils.randFloatSpread(10)  // z
        ] as [number, number, number],
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        speed: 0.5 + Math.random() * 0.5,
        size: 0.3 + Math.random() * 0.5,
        key: i
      };
    });
  }, [count]);

  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#5e72e4" />
        
        {objects.map((obj) => (
          <FloatingObject 
            key={obj.key}
            position={obj.position}
            color={obj.color}
            speed={obj.speed}
            size={obj.size}
          />
        ))}
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
