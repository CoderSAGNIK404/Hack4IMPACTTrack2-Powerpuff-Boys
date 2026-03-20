import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function RealisticDNA() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  const basePairs = 40;
  const radius = 1.4;
  const height = 15;

  const { rungs, backbone } = useMemo(() => {
    const rgs = [];
    const bb = [];
    
    // Generate rungs (base pairs)
    for (let i = 0; i <= basePairs; i++) {
      const t = i / basePairs;
      const angle = t * Math.PI * 6; // 3 full turns
      const y = (t - 0.5) * height;
      
      rgs.push({
        y,
        angle,
        type: Math.random() > 0.5 ? 0 : 1 // A-T or G-C
      });
    }

    // Generate atomic backbone (high density spheres)
    const backboneNodes = basePairs * 6;
    for (let i = 0; i <= backboneNodes; i++) {
      const t = i / backboneNodes;
      const angle = t * Math.PI * 6;
      const y = (t - 0.5) * height;
      
      bb.push({
        x1: Math.cos(angle) * radius,
        z1: Math.sin(angle) * radius,
        x2: Math.cos(angle + Math.PI) * radius,
        z2: Math.sin(angle + Math.PI) * radius,
        y
      });
    }

    return { rungs: rgs, backbone: bb };
  }, []);

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 8]} scale={0.55}>
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0}>
        {/* Render base pairs (Rungs) */}
        {rungs.map((rung, i) => {
          const color1 = rung.type === 0 ? '#ef4444' : '#10b981'; // Red / Green
          const color2 = rung.type === 0 ? '#3b82f6' : '#eab308'; // Blue / Yellow

          return (
            <group key={`rung-${i}`} position={[0, rung.y, 0]} rotation={[0, -rung.angle, 0]}>
              {/* Left half */}
              <mesh position={[radius/2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.08, 0.08, radius, 16]} />
                <meshPhysicalMaterial color={color1} roughness={0.2} metalness={0.1} transmission={0.6} thickness={0.5} />
              </mesh>
              {/* Right half */}
              <mesh position={[-radius/2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.08, 0.08, radius, 16]} />
                <meshPhysicalMaterial color={color2} roughness={0.2} metalness={0.1} transmission={0.6} thickness={0.5} />
              </mesh>
              
              {/* Connection node Left */}
              <mesh position={[radius, 0, 0]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshPhysicalMaterial color="#1e1b4b" roughness={0.1} metalness={0.8} clearcoat={1} />
              </mesh>
              {/* Connection node Right */}
              <mesh position={[-radius, 0, 0]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshPhysicalMaterial color="#1e1b4b" roughness={0.1} metalness={0.8} clearcoat={1} />
              </mesh>
            </group>
          );
        })}

        {/* Render Backbone */}
        {backbone.map((node, i) => (
          <group key={`bb-${i}`}>
            <mesh position={[node.x1, node.y, node.z1]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshPhysicalMaterial color="#6366f1" roughness={0.3} metalness={0.4} transmission={0.4} />
            </mesh>
            <mesh position={[node.x2, node.y, node.z2]}>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshPhysicalMaterial color="#6366f1" roughness={0.3} metalness={0.4} transmission={0.4} />
            </mesh>
          </group>
        ))}
      </Float>
    </group>
  );
}

const HomePage = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-24 relative overflow-hidden">
      
      {/* Left Content Area */}
      <div className="w-full md:w-1/2 flex flex-col items-start justify-center space-y-6 pt-12 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/80 text-secondary text-sm font-semibold mb-2 shadow-sm animate-[slide-up-fade_0.8s_ease-out_forwards] opacity-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Your Health, Secured</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-800 animate-[slide-up-fade_0.8s_ease-out_0.2s_forwards] opacity-0">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-emerald-700">
            SurakshaAI
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-lg animate-[slide-up-fade_0.8s_ease-out_0.4s_forwards] opacity-0">
          Predict Early. Respond Instantly. Save Lives.
        </p>
        
        <p className="text-muted text-base md:text-lg max-w-md animate-[slide-up-fade_0.8s_ease-out_0.6s_forwards] opacity-0">
          Leveraging AI to assess your health risks in real-time. Get preventive suggestions and instant emergency response at your fingertips.
        </p>

        <Link 
          to="/form" 
          className="mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-1 active:translate-y-0 animate-[slide-up-fade_0.8s_ease-out_0.8s_forwards] opacity-0"
        >
          Start Assessment
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Right 3D Area with Three.js DNA */}
      <div className="absolute top-0 right-[-10%] w-full md:w-[65%] h-[120%] z-0 pointer-events-auto flex items-center justify-center animate-[fade-in-modal_2.5s_ease-out_0.3s_forwards] opacity-0">
        <div className="w-full h-full cursor-grab active:cursor-grabbing opacity-90">
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 20, 10]} intensity={3} color="#ffffff" />
            <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#10b981" />
            <pointLight position={[0, -5, 5]} intensity={2} color="#059669" />
            
            <Sparkles count={200} scale={15} size={2.5} speed={0.5} opacity={0.6} color="#6ee7b7" />
            
            <RealisticDNA />
            
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
