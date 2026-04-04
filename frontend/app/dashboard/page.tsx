"use client";

import React, { useEffect, useState } from "react";
import { Briefcase, ShieldAlert, Network, BrainCircuit, Activity, TrendingDown, Building2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium tracking-tight">Processing CSV Portfolio Data...</p>
        </div>
      </div>
    );
  }

  // Icons array matched to topStats array index
  const statIcons = [Briefcase, Building2, TrendingDown, ShieldAlert];
  const statColors = ["text-primary", "text-blue-400", "text-orange-400", "text-destructive"];

  return (
    <div className="animate-in fade-in duration-1000 p-2 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Enterprise Portfolio Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Macro-level intelligence derived from real-time CSV data.</p>
      </div>

      {/* TOP STATS (Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.topStats.map((stat: any, i: number) => {
          const Icon = statIcons[i];
          return (
            <Card key={i} className="bg-card/40 border-white/5 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl border border-white/10 bg-white/5`}>
                    <Icon className={`h-5 w-5 ${statColors[i]}`} />
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase border-white/10 ${statColors[i]}`}>
                    {stat.status}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{stat.value}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CHARTS ROW (Dynamic) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-bold">Exposure by Industry Sector</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest mt-1">Concentration Risk Analysis (in Crores)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.industryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                  {data.industryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)} Cr`, 'Exposure']}
                  contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold">Portfolio Risk Distribution</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest mt-1">Credit Health & Tranche Migration</CardDescription>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">AI BLENDED</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)} Cr`, 'Capital']}
                  contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {data.riskData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI INSIGHTS MVP SECTION (Dynamic) */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Deterministics NLG Engine Outputs
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {data.aiInsights.map((insight: any, i: number) => {
            // Assign icons based on classification string
            let IconToUse = Activity;
            if (insight.classification.includes("FRAUD") || insight.classification.includes("CRITICAL")) IconToUse = Network;
            else if (insight.classification.includes("OPTIMIZATION")) IconToUse = BrainCircuit;

            return (
              <Card key={i} className={`bg-card/40 border ${insight.border} backdrop-blur-md overflow-hidden relative`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.bg.replace('/10', '')}`} />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    
                    <div className="md:w-1/4 space-y-3">
                      <div className={`inline-flex p-3 rounded-xl ${insight.bg}`}>
                        <IconToUse className={`h-6 w-6 ${insight.color}`} />
                      </div>
                      <div>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest border-white/10 ${insight.color}`}>
                          {insight.classification}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">MODULE:<br/>{insight.module}</p>
                      </div>
                    </div>

                    <div className="md:w-3/4 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                          System Finding
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{insight.finding}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-3 rounded-lg">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Fiscal Impact</p>
                          <p className={`text-lg font-black tracking-tight ${insight.color}`}>{insight.impact}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-3 rounded-lg">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Audit Trail</p>
                          <p className="text-xs text-slate-400 font-mono leading-tight">{insight.trail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}