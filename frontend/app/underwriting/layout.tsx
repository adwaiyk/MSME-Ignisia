import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col bg-black">
        {/* The fixed header that holds the toggle button */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            MSME-Ignisia // System Access
          </span>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-primary/10 blur-[120px] pointer-events-none -z-10" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}