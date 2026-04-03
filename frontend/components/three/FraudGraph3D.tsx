// Location: components/three/FraudGraph3D.tsx
"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

// CRITICAL: Dynamically import the graph to prevent Next.js SSR crashes
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-destructive animate-pulse">Initializing WebGL Canvas...</div>
});

export default function FraudGraph3D({ fraudPayload, noiseNodes }: { fraudPayload: any, noiseNodes: any[] }) {
  
  // useMemo provides a stable reference, preventing React re-rendering loops
  const graphData = useMemo(() => {
    // Merge background noise nodes with the flagged laundering nodes
    const flaggedNodes = fraudPayload.nodes_involved.map((id: string) => ({ id, isFraudRing: true }));
    return {
      nodes: [...noiseNodes, ...flaggedNodes],
      links: [...fraudPayload.edges]
    };
  }, [fraudPayload, noiseNodes]);

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden backdrop-blur-md bg-black/40 border border-destructive/30 shadow-[0_0_30px_rgba(255,0,0,0.15)] relative">
      
      {/* Absolute positioned warning overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-destructive font-bold text-xl tracking-widest uppercase">CRITICAL ALERT</h3>
        <p className="text-white text-sm font-mono bg-destructive/20 px-2 py-1 rounded inline-block mt-1 border border-destructive/50">
          {fraudPayload.flag_type} Detected
        </p>
      </div>

      <ForceGraph3D
        graphData={graphData}
        backgroundColor="#0a0a0a"
        // Active particles flowing along the fraud ring
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => '#ff0000'}
        
        // FIX: Replaced invalid linkForce with linkWidth and linkColor for visual emphasis
        linkWidth={(link: any) => (fraudPayload.edges.some((e: any) => e.source === link.source.id || e.source === link.source) ? 2 : 0.5)}
        linkColor={(link: any) => (fraudPayload.edges.some((e: any) => e.source === link.source.id || e.source === link.source) ? '#ff0000' : '#333333')}
        
        nodeThreeObject={(node: any) => {
          if (node.isFraudRing) {
            // Apply custom WebGL shaders: Emissive materials generate the intense neon red glow
            return new THREE.Mesh(
              new THREE.SphereGeometry(8),
              new THREE.MeshLambertMaterial({
                color: '#ff0000',
                emissive: '#ff0000',
                emissiveIntensity: 3.0
              })
            );
          }
          // Render non-fraudulent background noise nodes as dim grey spheres
          return new THREE.Mesh(
            new THREE.SphereGeometry(3),
            new THREE.MeshLambertMaterial({ 
                color: '#333333', 
                transparent: true, 
                opacity: 0.6 
            })
          );
        }}
      />
    </div>
  );
}