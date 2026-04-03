// Location: components/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between h-full font-sans">
      
      {/* Top Section: Logo & Links */}
      <div>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="p-2 bg-white/5 border border-white/10 rounded-lg mr-3 shadow-inner">
            <Building2 className="h-5 w-5 text-slate-300" />
          </div>
          <span className="font-bold text-white tracking-tight">Global underwriting</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl transition-colors">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Command Center</span>
          </Link>
          
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">MSME Portfolio</span>
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">Compliance Reports</span>
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Risk Parameters</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section: User & Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-200">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Admin User</span>
            <span className="text-[10px] text-slate-500">admin@somebank.com</span>
          </div>
        </div>
        
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Terminate Session</span>
        </Link>
      </div>

    </div>
  );
}