"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import FraudGraph3D from "@/components/three/FraudGraph3D";

const scoreData = [
  { name: "Score", value: 845 },
  { name: "Remaining", value: 55 },
];
const SCORE_COLORS = ["#10b981", "rgba(255, 255, 255, 0.05)"];

const shapData = [
  { feature: "Zero GST Delay Days (12m)", value: 85, type: "positive" },
  { feature: "High UPI Velocity (30d)", icon: TrendingUp, value: 65, type: "positive" },
  { feature: "Positive Cash Flow Trend", value: 40, type: "positive" },
  { feature: "Low Working Cap Ratio", value: -15, type: "negative" },
  { feature: "High ITC Mismatch", value: -30, type: "negative" },
];

const mockFraudPayload = {
  flag_type: "Accommodation Bill Ring",
  nodes_involved: ["07FRAUD1111Z9Z9", "27MOCK_A", "27MOCK_B", "27MOCK_C"],
  edges: [
    { source: "07FRAUD1111Z9Z9", target: "27MOCK_A" },
    { source: "27MOCK_A", target: "27MOCK_B" },
    { source: "27MOCK_B", target: "27MOCK_C" },
    { source: "27MOCK_C", target: "07FRAUD1111Z9Z9" },
  ]
};
const mockNoiseNodes = Array.from({ length: 40 }, (_, i) => ({ id: `noise_${i}` }));

export default function underwritingDashboard() {
  const [gstinInput, setGstinInput] = useState("29HERO9999X1Z5");
  const [activeView, setActiveView] = useState<"hero" | "fraud">("hero");

  const handleInference = () => {
    if (gstinInput.trim().toUpperCase() === "07FRAUD1111Z9Z9") {
      setActiveView("fraud");
    } else {
      setActiveView("hero");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Underwriter Engine</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">Advanced signal processing for credit risk</p>
        </div>
        <div className="flex w-full md:w-auto items-center space-x-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={gstinInput}
              onChange={(e) => setGstinInput(e.target.value)}
              className="pl-10 bg-card/40 border-white/5 uppercase font-mono h-12 rounded-xl focus-visible:ring-primary/50"
              placeholder="TARGET GSTIN..."
            />
          </div>
          <Button 
            onClick={handleInference}
            className={`h-12 px-8 font-bold transition-all ${
              activeView === "fraud" ? "bg-destructive hover:bg-red-700 shadow-lg shadow-red-900/20" : "bg-primary hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
            }`}
          >
            Run Inference
          </Button>
        </div>
      </div>

      {activeView === "fraud" ? (
        <Card className="bg-card/40 border-destructive/30 backdrop-blur-md overflow-hidden rounded-3xl">
          <CardHeader className="bg-destructive/10 border-b border-destructive/20 p-6">
            <CardTitle className="text-destructive flex items-center gap-3 font-black tracking-tighter uppercase italic">
              <AlertTriangle className="h-7 w-7 animate-pulse" />
              Network Loop Triggered // Anomaly Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FraudGraph3D fraudPayload={mockFraudPayload} noiseNodes={mockNoiseNodes} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-3 bg-card/40 border-white/5 backdrop-blur-md p-8 relative rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-around gap-12 relative z-10">
              <div className="text-center space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Legacy Bureau Score</span>
                <p className="text-7xl font-thin text-muted-foreground/40">620</p>
                <Badge variant="outline" className="border-white/10 text-muted-foreground/60 px-4">REJECTED</Badge>
              </div>

              <div className="h-48 w-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" className="absolute">
                  <PieChart>
                    <Pie data={scoreData} innerRadius={65} outerRadius={85} startAngle={225} endAngle={-45} dataKey="value" stroke="none" cornerRadius={10}>
                      {scoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SCORE_COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center">
                  <span className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">845</span>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Blended AI</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <span className="text-xs text-primary uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Final Assessment
                </span>
                <p className="text-3xl font-black text-primary">SECURE_PASS</p>
                <Badge className="bg-primary/20 text-primary border-primary/50 px-6 py-1">APPROVED</Badge>
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-2 bg-card/40 border-white/5 backdrop-blur-md rounded-3xl">
            <CardHeader className="border-b border-white/5 p-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                <Activity className="h-5 w-5 text-primary" /> SHAP Decision Drivers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {shapData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
                    <span className="text-slate-400">{item.feature}</span>
                    <span className={item.type === 'positive' ? 'text-primary' : 'text-destructive'}>
                      {item.value > 0 ? `+${item.value}` : item.value}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-1000 ${item.type === 'positive' ? 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-destructive'}`} 
                      style={{ width: `${Math.abs(item.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-white/5 backdrop-blur-md flex flex-col justify-between rounded-3xl">
            <CardHeader className="border-b border-white/5 p-6">
              <CardTitle className="text-lg font-bold uppercase tracking-tight">Portfolio Delta</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Simulated Lift</p>
                <p className="text-4xl font-black text-primary tracking-tighter">+30 bps</p>
                <p className="text-[10px] text-muted-foreground mt-2 italic">Micro-enterprise Sub-target contribution</p>
              </div>
              <Button className="w-full bg-primary hover:bg-emerald-600 text-white font-black h-14 text-lg rounded-2xl shadow-xl shadow-emerald-900/30">
                SANCTION LOAN
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}