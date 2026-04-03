// Location: components/three/FraudGraph3D.tsx
"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';

// CRITICAL: Dynamically import the graph to prevent Next.js SSR crashes
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-destructive animate-pulse font-mono tracking-widest text-xs">INITIALIZING WEBGL CANVAS...</div>
});

export default function FraudGraph3D({ fraudPayload, noiseNodes }: { fraudPayload: any, noiseNodes: any[] }) {
  
  // useMemo provides a stable reference, preventing React re-rendering loops
  const graphData = useMemo(() => {
    // 1. Map the hardcoded fraud nodes
    const flaggedNodes = fraudPayload.nodes.map((n: any) => ({ 
      id: n.id, 
      label: n.label,
      gstin: n.gstin,
      isFraudRing: true 
    }));

    // 2. Map the background noise nodes (Legit Entities)
    const legitNodes = noiseNodes.map((n: any) => ({
      ...n,
      label: "Legit Transactor",
      gstin: "VERIFIED_NODE",
      isFraudRing: false
    }));

    // 3. Generate some fake background links for the noise nodes so the green network looks realistic
    const noiseLinks = [];
    for (let i = 0; i < noiseNodes.length - 1; i += 2) {
      noiseLinks.push({ source: noiseNodes[i].id, target: noiseNodes[i+1].id });
    }

    return {
      nodes: [...legitNodes, ...flaggedNodes],
      links: [...fraudPayload.links, ...noiseLinks]
    };
  }, [fraudPayload, noiseNodes]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden backdrop-blur-md bg-black/40 border border-destructive/30 shadow-[inset_0_0_50px_rgba(255,0,0,0.1)] relative">
      
      {/* Absolute positioned warning overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-destructive font-bold text-xl tracking-widest uppercase">CRITICAL ALERT</h3>
        <p className="text-white text-xs font-mono bg-destructive/20 px-2 py-1 rounded inline-block mt-1 border border-destructive/50">
          {fraudPayload.fraud_type} Detected
        </p>
      </div>

      <div className="absolute bottom-4 left-4 z-10 pointer-events-none text-[10px] font-mono text-white/50">
        <p>Rotate: Left Click + Drag</p>
        <p>Zoom: Scroll</p>
        <p>Inspect: Hover Nodes & Edges</p>
      </div>

      <ForceGraph3D
        graphData={graphData}
        backgroundColor="#0a0a0a"
        
        // Native HTML Tooltips for Hovering
        nodeLabel={(node: any) => 
          node.isFraudRing 
            ? `<div style="background: rgba(0,0,0,0.9); border: 1px solid #ef4444; padding: 8px; border-radius: 8px; font-family: monospace; color: white; font-size: 12px; text-transform: uppercase;">
                <b style="color: #ef4444; font-size: 14px;">${node.label}</b><br/>
                <span style="color: #888;">GSTIN:</span> ${node.gstin}<br/>
                <span style="color: #ef4444; font-weight: bold; margin-top: 4px; display: inline-block;">[FRAUD NODE]</span>
               </div>` 
            : `<div style="background: rgba(0,0,0,0.9); border: 1px solid #10b981; padding: 8px; border-radius: 8px; font-family: monospace; color: white; font-size: 12px; text-transform: uppercase;">
                <b style="color: #10b981;">${node.label}</b><br/>
                <span style="color: #10b981; font-weight: bold;">[LEGIT NODE]</span>
               </div>`
        }
        linkLabel={(link: any) => 
          link.label 
            ? `<div style="background: rgba(0,0,0,0.9); border: 1px solid #ef4444; padding: 6px; border-radius: 6px; font-family: monospace; color: white; font-size: 12px; text-transform: uppercase;">
                <span style="color: #888;">Transfer:</span> <b style="color: #ef4444; font-size: 14px;">${link.label}</b>
               </div>` 
            : ''
        }

        // Active particles flowing along the fraud ring (representing money flowing)
        linkDirectionalParticles={(link: any) => link.label ? 4 : 1}
        linkDirectionalParticleWidth={(link: any) => link.label ? 2.5 : 1}
        linkDirectionalParticleColor={(link: any) => link.label ? '#ef4444' : '#10b981'}
        linkDirectionalParticleSpeed={0.008}
        
        // Emphasize the circular fraud links
        linkWidth={(link: any) => link.label ? 2 : 0.5}
        linkColor={(link: any) => link.label ? '#ef4444' : '#10b981'}
        linkOpacity={0.6}
        
        // 3D Node Rendering (Green for Legit, Glowing Red for Fraud)
        nodeThreeObject={(node: any) => {
          if (node.isFraudRing) {
            return new THREE.Mesh(
              new THREE.SphereGeometry(10),
              new THREE.MeshLambertMaterial({
                color: '#ef4444',
                emissive: '#ef4444',
                emissiveIntensity: 2.0
              })
            );
          }
          // Legit Nodes (Green)
          return new THREE.Mesh(
            new THREE.SphereGeometry(4),
            new THREE.MeshLambertMaterial({ 
                color: '#10b981', 
                emissive: '#10b981',
                emissiveIntensity: 0.5,
                transparent: true, 
                opacity: 0.6 
            })
          );
        }}
      />
    </div>
  );
}