// Location: components/SharedLayout.tsx
import React from "react";
import Sidebar from "@/components/Sidebar";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-black overflow-hidden">
      {/* The Sidebar */}
      <Sidebar />
      
      {/* Main content wrapper */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-primary/10 blur-[100px] pointer-events-none" />
        
        {/* Content area */}
        <div className="relative z-10 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}