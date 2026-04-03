// Location: components/Sidebar.tsx
import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Activity, Database, LogOut } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between hidden md:flex fixed left-0 top-0 z-40">
      <div className="p-6">
        {/* Branding */}
        <div className="flex items-center gap-3 mb-12">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
            <ShieldCheck className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">IGNISIA<span className="text-primary">.AI</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Enterprise Gateway</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all group">
            <LayoutDashboard className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Command Center</span>
          </Link>
          
          <Link href="/underwriting" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-white border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Underwriting Engine</span>
          </Link>

          <Link href="/intake" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all group">
            <Database className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">Data Intake (Sahamati)</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-6 border-t border-white/10">
        <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">End Session</span>
        </button>
      </div>
    </aside>
  );
}