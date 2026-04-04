// Location: app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Briefcase, ShieldAlert, Network, BrainCircuit, Activity, TrendingDown, Building2, RefreshCw, AlertTriangle, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async (res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(json => {
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || "Unknown error parsing CSV");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8 bg-destructive/10 border border-destructive/30 rounded-2xl">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <p className="text-white font-bold text-lg mb-1">Data Pipeline Failure</p>
            <p className="text-destructive font-mono text-sm">{error}</p>
          </div>
          <p className="text-slate-400 text-xs mt-4">Check if 'bank_portfolio_master.csv' is in the root directory and 'app/api/dashboard/route.ts' exists.</p>
        </div>
      </div>
    );
  }

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

  const statIcons = [Briefcase, Building2, TrendingDown, ShieldAlert];
  const statColors = ["text-primary", "text-blue-400", "text-orange-400", "text-destructive"];

  return (
    <div className="animate-in fade-in duration-1000">
      
      {/* ========================================================= */}
      {/* 1. WEB UI VIEW (Hidden on Print)                          */}
      {/* ========================================================= */}
      <div className="p-2 space-y-8 print:hidden">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Enterprise Portfolio Analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Macro-level intelligence derived from real-time CSV data.</p>
          </div>
          <Button onClick={handleExportPDF} className="bg-primary text-black hover:bg-emerald-600 font-bold gap-2">
            <Printer className="h-4 w-4" />
            Generate PDF Report
          </Button>
        </div>

        {/* TOP STATS */}
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

        {/* CHARTS ROW */}
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

        {/* AI INSIGHTS */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Deterministics NLG Engine Outputs
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {data.aiInsights.map((insight: any, i: number) => {
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
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-2">System Finding</h4>
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

      {/* ========================================================= */}
      {/* 2. PDF / PRINT VIEW (Hidden on Web)                       */}
      {/* ========================================================= */}
      <div className="hidden print:block text-black bg-white p-8 max-w-4xl mx-auto font-sans">
        
        {/* WATERMARK */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0">
          <span className="text-[150px] font-black rotate-[-45deg] uppercase tracking-tighter">CONFIDENTIAL</span>
        </div>

        {/* LETTERHEAD */}
        <div className="border-b-4 border-black pb-4 mb-8 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-8 w-8 text-black" />
                <h1 className="text-3xl font-black uppercase tracking-widest">MSME Ignisia Node</h1>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Enterprise Risk & Portfolio Intelligence Report</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold border-2 border-black px-2 py-1 inline-block uppercase bg-black text-white">Restricted: CRO Eyes Only</span>
              <p className="text-xs font-mono text-gray-600 mt-3">Generated: {new Date().toLocaleString()}</p>
              <p className="text-xs font-mono text-gray-600">Ref: IGN-AUTO-AUDIT-{Math.floor(Math.random() * 10000)}</p>
            </div>
          </div>
        </div>

        {/* 1. EXECUTIVE SUMMARY */}
        <div className="mb-10 relative z-10">
          <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-4">1. Executive Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            {data.topStats.map((stat: any, i: number) => (
              <div key={i} className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-2xl font-black text-black">{stat.value}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 border border-gray-300 px-2 py-0.5 rounded">
                    {stat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. PORTFOLIO BREAKDOWN (Tables instead of charts for formal reporting) */}
        <div className="mb-10 relative z-10 break-inside-avoid">
          <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-4">2. Portfolio Distribution Tables</h3>
          <div className="flex gap-8">
            {/* Risk Table */}
            <div className="w-1/2">
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Credit Health Tranches</h4>
              <table className="w-full text-sm border border-gray-300">
                <thead>
                  <tr className="bg-black text-white text-left">
                    <th className="p-2 border border-gray-300">Risk Band</th>
                    <th className="p-2 border border-gray-300 text-right">Capital Exposure</th>
                  </tr>
                </thead>
                <tbody>
                  {data.riskData.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-300 font-bold">{row.name}</td>
                      <td className="p-2 text-right font-mono">₹{row.value.toFixed(2)} Cr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Industry Table */}
            <div className="w-1/2">
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Sector Concentration</h4>
              <table className="w-full text-sm border border-gray-300">
                <thead>
                  <tr className="bg-black text-white text-left">
                    <th className="p-2 border border-gray-300">Industry</th>
                    <th className="p-2 border border-gray-300 text-right">Capital Exposure</th>
                  </tr>
                </thead>
                <tbody>
                  {data.industryData.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-300 font-bold">{row.name}</td>
                      <td className="p-2 text-right font-mono">₹{row.value.toFixed(2)} Cr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. ALGORITHMIC AUDIT FINDINGS */}
        <div className="relative z-10">
          <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-gray-300 pb-2 mb-6">3. Algorithmic System Findings</h3>
          <div className="space-y-6">
            {data.aiInsights.map((insight: any, i: number) => (
              <div key={i} className="border-l-4 border-black pl-4 py-1 break-inside-avoid">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-sm uppercase bg-gray-200 px-2 py-1 tracking-widest">{insight.classification}</span>
                  <span className="text-xs font-mono text-gray-500">Source: {insight.module}</span>
                </div>
                <p className="text-base text-black font-medium leading-relaxed mb-3">
                  {insight.finding}
                </p>
                <div className="flex gap-6 bg-gray-50 p-3 border border-gray-200 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fiscal Impact</span>
                    <span className="font-black text-black">{insight.impact}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audit Trail / Action</span>
                    <span className="font-mono text-xs text-gray-700">{insight.trail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIGNATURE BLOCK */}
        <div className="mt-20 pt-8 border-t-2 border-gray-300 break-inside-avoid relative z-10">
          <div className="flex justify-between items-end">
            <div className="w-64 text-center">
              <div className="border-b border-black mb-2 h-16"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-black">Authorized Officer</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">ID: OFF-9812-XYZ</p>
            </div>
            <div className="text-center">
              <ShieldAlert className="h-12 w-12 text-gray-200 mx-auto mb-2" />
              <p className="text-[10px] text-gray-400 font-mono uppercase">Digitally Validated</p>
            </div>
            <div className="w-64 text-center">
              <div className="border-b border-black mb-2 h-16"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-black">Chief Risk Officer (CRO)</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Date: _______________</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}