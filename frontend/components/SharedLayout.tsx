"use client"

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { 
  SidebarProvider, 
  SidebarTrigger, 
  SidebarInset 
} from "@/components/ui/sidebar";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // SidebarProvider handles the toggle state and the flex-grid
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-black">
        <AppSidebar />
        
        <SidebarInset className="flex flex-col flex-1 bg-black min-w-0">
          {/* Header with Toggle Button */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 px-4 sticky top-0 z-50 bg-black/50 backdrop-blur-md">
            <SidebarTrigger className="-ml-1 text-white hover:bg-white/10" />
            <div className="h-4 w-px bg-white/10 mx-2" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              MSME-Ignisia // Enterprise Gateway
            </span>
          </header>
          
          {/* Main Dashboard Content */}
          <main className="flex-1 relative overflow-y-auto">
            {/* The Glow (Moved behind everything) */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 blur-[120px] pointer-events-none -z-10" />
            
            <div className="p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}