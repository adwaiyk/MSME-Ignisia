"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShieldCheck,
  Database,
  Building2,
  ChevronUp,
  User2,
  LogOut,
  Settings,
  Users
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { title: "Command Center", url: "/dashboard", icon: LayoutDashboard },
  { title: "Underwriting", url: "/underwriting", icon: ShieldCheck },
  { title: "Data Intake", url: "/intake", icon: Database },
  { title: "Portfolio", url: "#", icon: Users },
  { title: "Settings", url: "#", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-white/10 bg-black text-white">
      <SidebarHeader className="border-b border-white/10 bg-black">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/5 transition-colors">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none ml-2">
                  <span className="font-bold text-white tracking-tight">MSME Ignisia</span>
                  <span className="text-[10px] text-primary uppercase tracking-widest font-black">Enterprise Gateway</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-6">
            Platform Engine
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 mt-4 space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url} 
                    tooltip={item.title}
                    className={`
                      flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200
                      ${pathname === item.url 
                        ? "bg-white/10 text-primary shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"}
                    `}
                  >
                    <Link href={item.url}>
                      <item.icon className={`size-5 ${pathname === item.url ? "text-primary" : ""}`} />
                      <span className="font-bold tracking-tight">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4 bg-black">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="hover:bg-white/5 text-slate-300">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    <User2 className="size-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none ml-2">
                    <span className="font-bold text-white text-xs">Admin Portal</span>
                    <span className="text-[10px] text-slate-500 font-mono italic">Root Access</span>
                  </div>
                  <ChevronUp className="ml-auto size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] bg-[#0a0a0a] border-white/10 shadow-2xl rounded-xl p-2">
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-3 px-3 py-2 text-destructive focus:text-white focus:bg-destructive/20 cursor-pointer rounded-lg transition-colors font-bold text-xs uppercase tracking-tighter">
                    <LogOut className="size-4" />
                    <span>Terminate Session</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}