// Location: app/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Network, BrainCircuit, Activity, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden">
      
      {/* --- AMBIENT BACKGROUND GLOWS --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none -z-10" />

      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Building2 className="size-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl tracking-tight text-white">AXIOM.AI</span>
              
            </div>
          </div>

          {/* Top Right Login Button */}
          <Link href="/login">
            <Button className="bg-white hover:bg-slate-200 text-black font-bold px-6 h-11 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Portal Access
            </Button>
          </Link>

        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="container mx-auto px-6 pt-40 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center text-center relative z-10">
        
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 animate-in slide-in-from-bottom-4 duration-700">
          Advanced Risk Intelligence Platform
        </Badge>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 max-w-5xl leading-[1.1] animate-in slide-in-from-bottom-6 duration-1000">
          Underwrite <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">MSME Credit</span> with Military Precision.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl font-medium leading-relaxed animate-in slide-in-from-bottom-8 duration-1000 delay-150">
          Replacing legacy bureau scores with XGBoost, NetworkX fraud topology detection, and explainable AI to safely scale your enterprise loan portfolio.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-10 duration-1000 delay-300">
          <Link href="/login">
            <Button className="bg-primary hover:bg-emerald-600 text-black font-black h-14 px-8 rounded-full text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all flex items-center gap-2">
              Launch Engine <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* --- HERO DASHBOARD MOCKUP (Abstract Floating Elements) --- */}
        <div className="w-full max-w-5xl mt-24 relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Mock Card 1 */}
            <div className="bg-black/50 border border-white/10 backdrop-blur-xl p-6 rounded-3xl transform md:-rotate-2 hover:rotate-0 transition-all duration-500">
              <div className="flex justify-between items-center mb-6">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <Badge className="bg-primary/20 text-primary border-none">XGBoost Validated</Badge>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Blended AI Score</p>
              <p className="text-5xl font-black text-white">845</p>
            </div>

            {/* Mock Card 2 */}
            <div className="bg-black/50 border border-destructive/30 backdrop-blur-xl p-6 rounded-3xl transform scale-105 shadow-[0_0_40px_rgba(239,68,68,0.15)] z-20">
              <div className="flex justify-between items-center mb-6">
                <Network className="h-6 w-6 text-destructive" />
                <Badge className="bg-destructive text-white border-none animate-pulse">Circular Loop Detected</Badge>
              </div>
              <p className="text-xs text-destructive/80 font-bold uppercase tracking-widest mb-1">Accommodation Fraud</p>
              <p className="text-3xl font-black text-destructive tracking-tighter">₹1.24 Crores Blocked</p>
            </div>

            {/* Mock Card 3 */}
            <div className="bg-black/50 border border-white/10 backdrop-blur-xl p-6 rounded-3xl transform md:rotate-2 hover:rotate-0 transition-all duration-500">
              <div className="flex justify-between items-center mb-6">
                <Activity className="h-6 w-6 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400 border-none">SHAP Analyzed</Badge>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Top Decision Driver</p>
              <p className="text-xl font-bold text-white leading-tight">High UPI Transaction Velocity (30d)</p>
            </div>
          </div>
        </div>

      </main>

      {/* --- FEATURES GRID --- */}
      <section className="border-t border-white/5 bg-white/[0.02] relative z-10 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">The Ignisia Intelligence Stack</h2>
            <p className="text-slate-400 font-medium">Built for RBI compliance, designed for massive scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Predictive Analytics",
                desc: "Replacing simple linear scoring with extreme gradient boosting (XGBoost) to correlate obscure alternate data signals."
              },
              {
                icon: Network,
                title: "Topological Defense",
                desc: "Using NetworkX to visualize and instantly flag circular money laundering and fake GST accommodation bill rings."
              },
              {
                icon: Activity,
                title: "Transparent Decisions",
                desc: "Satisfying regulatory 'Duty of Explanation' using SHAP values to map exactly why a loan was approved or rejected."
              }
            ].map((feat, i) => (
              <div key={i} className="p-8 rounded-3xl border border-white/5 bg-black/40 hover:bg-white/5 transition-colors">
                <feat.icon className="h-8 w-8 text-primary mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 py-8 text-center bg-black relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-black text-white tracking-tight">AXIOM.AI</span>
        </div>
        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Built with ❤️ by Runtime Terrors</p>
      </footer>

    </div>
  );
