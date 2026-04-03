// Location: components/PlatformWrapper.tsx
"use client"

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function PlatformWrapper({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col min-h-screen">
        {/* Universal Header with Breadcrumb-style title */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">{pageTitle}</span>
        </header>

        {/* Content Area */}
        <main className="flex-1 relative p-6 lg:p-8">
           {/* Re-injecting your signature premium glow */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 blur-[120px] pointer-events-none -z-10" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}