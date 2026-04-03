// Location: app/underwriting/page.tsx
"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import FraudGraph3D from "@/components/three/FraudGraph3D";

// --- MOCK DATA FOR HERO PERSONA ---
const scoreData = [
  { name: "Score", value: 845 },
  { name: "Remaining", value: 900 - 845 },
];
const SCORE_COLORS = ["#10b981", "rgba(255, 255, 255, 0.05)"];

const shapData = [
  { feature: "Zero GST Delay Days (12m)", value: 85, type: "positive" },
  { feature: "High UPI Velocity (30d)", value: 65, type: "positive" },
  { feature: "Positive Cash Flow Trend", value: 40, type: "positive" },
  { feature: "Low Working Cap Ratio", value: -15, type: "negative" },
  { feature: "High ITC Mismatch", value: -30, type: "negative" },
];

// --- MOCK DATA FOR LAUNDERER PERSONA ---
const mockFraudPayload = {
  flag_type: "Accommodation Bill Ring",
  nodes_involved: ["07FRAUD1111Z9Z9", "27MOCK_A", "27MOCK_B", "27MOCK_C"],
  edges: [
    { source: "07FRAUD1111Z9Z9", target: "27MOCK_A" },
    { source: "27MOCK_A", target: "27MOCK_B" },
    { source: "27MOCK_B", target: "27MOCK_C" },
    { source: "27MOCK_C", target: "07FRAUD1111Z9Z9" }, // The circular loop!
  ]
};
// Generate 40 random noise nodes for the background 3D effect
const mockNoiseNodes = Array.from({ length: 40 }, (_, i) => ({ id: `noise_${i}` }));

export default function UnderwritingDashboard() {
  // State to track the input and the current UI view
  const [gstinInput, setGstinInput] = useState("29HERO9999X1Z5");
  const [activeView, setActiveView] = useState<"hero" | "fraud">("hero");

  const handleRunInference = () => {
    // Trigger the Fraud WebGL Canvas if the Launderer GSTIN is entered
    if (gstinInput.trim().toUpperCase() === "07FRAUD1111Z9Z9") {
      setActiveView("fraud");
    } else {
      setActiveView("hero");
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Underwriting Engine</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time inference & signal processing</p>
        </div>
        <div className="flex w-full md:w-auto items-center space-x-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              type="text" 
              value={gstinInput}
              onChange={(e) => setGstinInput(e.target.value)}
              className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary h-11 rounded-lg font-mono uppercase"
            />
          </div>
          <Button 
            onClick={handleRunInference}
            className={`h-11 px-6 text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
              activeView === "fraud" ? "bg-destructive hover:bg-red-700 shadow-[0_0_15px_rgba(255,0,0,0.3)]" : "bg-primary hover:bg-primary/80"
            }`}
          >
            Run Inference
          </Button>
        </div>
      </div>

      {/* CONDITIONAL RENDERING: FRAUD VIEW */}
      {activeView === "fraud" ? (
        <div className="grid grid-cols-1 gap-6 animate-in zoom-in-95 duration-500">
          <Card className="bg-black/40 border-destructive/50 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-destructive/20 bg-destructive/10">
              <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
                NETWORKX CYCLE DETECTION TRIGGERED
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Injecting the 3D WebGL Component */}
              <FraudGraph3D fraudPayload={mockFraudPayload} noiseNodes={mockNoiseNodes} />
            </CardContent>
          </Card>
        </div>
      ) : (
        /* CONDITIONAL RENDERING: HERO VIEW (The original grid) */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* SECTION 1: The Dual-Score Engine */}
          <Card className="xl:col-span-3 bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden relative">
            <div className="absolute -right-32 -top-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-evenly gap-8">
              
              <div className="flex flex-col items-center text-center space-y-2 w-1/3">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Legacy Bureau Score</span>
                <span className="text-6xl font-light text-slate-500">620</span>
                <Badge variant="outline" className="text-slate-500 border-slate-700 mt-2">HIGH RISK (REJECT)</Badge>
              </div>

              <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

              <div className="flex flex-col items-center text-center w-1/3 relative">
                <span className="text-sm font-medium text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Blended AI Score
                </span>
                
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
                    <PieChart>
                      <Pie
                        data={scoreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={75}
                        startAngle={225}
                        endAngle={-45}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                      >
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="text-5xl font-bold text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10">
                    845
                  </span>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/50 mt-2 animate-pulse">
                  LOW_RISK_APPROVED
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: SHAP Explainability */}
          <Card className="xl:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-slate-400" />
                    Algorithmic Decision Drivers (SHAP)
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Fulfilling RBI Duty of Explanation for transparent AI</p>
                </div>
                <Badge variant="outline" className="text-[10px] text-slate-500 border-white/5">UPDATED: JUST NOW</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {shapData.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-1/3 text-slate-300 pr-4 flex justify-between">
                    <span>{item.feature}</span>
                  </div>
                  <div className="w-2/3 flex items-center">
                    <div className="w-full flex items-center relative h-6 border-l-2 border-white/10 pl-2">
                      <div className="absolute left-0 w-1/2 h-full flex items-center justify-end pr-1 border-r border-white/20">
                        {item.type === "negative" && (
                          <div 
                            className="h-2 bg-destructive rounded-l-sm transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.abs(item.value)}%` }} 
                          />
                        )}
                      </div>
                      <div className="absolute left-1/2 w-1/2 h-full flex items-center justify-start pl-1">
                        {item.type === "positive" && (
                          <div 
                            className="h-2 bg-primary rounded-r-sm transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                            style={{ width: `${item.value}%` }} 
                          />
                        )}
                      </div>
                      <span className={`absolute ${item.type === 'positive' ? 'right-4 text-primary' : 'left-4 text-destructive'} font-mono text-xs font-bold`}>
                        {item.type === 'positive' ? '+' : ''}{item.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SECTION 3: PSL Compliance Simulation */}
          <Card className="xl:col-span-1 bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl flex flex-col">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-slate-400" />
                Portfolio Impact & PSL
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Micro-enterprise Sub-target Simulation</p>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-300">Current Target (7.5%)</span>
                    <span className="text-primary font-bold">Projected: 7.1%</span>
                  </div>
                  <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-slate-500 w-[68%]" />
                    <div className="absolute top-0 left-[68%] h-full bg-primary w-[3%] animate-pulse" />
                  </div>
                  <p className="text-xs text-primary mt-3 text-right flex items-center justify-end gap-1">
                    <TrendingUp className="h-3 w-3" /> +30bps lift from sanction
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Yield on Asset</span>
                    <span className="text-white font-mono">14.2%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Risk Weighted Impact</span>
                    <span className="text-primary font-mono">-12 bps</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-emerald-600 text-white font-bold h-14 text-lg mt-8 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                SANCTION LOAN
              </Button>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}