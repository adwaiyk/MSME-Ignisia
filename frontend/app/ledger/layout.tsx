// Location: app/ledger/layout.tsx
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col bg-black">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 px-4 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
          <SidebarTrigger className="-ml-1 text-white opacity-60 hover:opacity-100 transition-opacity" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Axiom.ai
            </span>
            <span className="text-[10px] text-white/20 font-mono">//</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Secured Enterprise Node
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 blur-[120px] pointer-events-none -z-10" />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}