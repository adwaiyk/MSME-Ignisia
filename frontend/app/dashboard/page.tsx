// Location: app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";

// Define the shape of our data based on your CSV
interface MSMEProfile {
  entity_id: string;
  name: string;
  gstin: string;
  industry_code: string;
  vintage_months: number;
  bureau_score_cibil: number;
  credit_limit_requested: number;
}

export default function CommandCenter() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<MSMEProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the API route we created
  const fetchData = async () => {
    try {
      const res = await fetch('/api/msme-data');
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      
      if (json.success && json.msme_profiles) {
        setData(json.msme_profiles);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();

    // Real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  if (loading && data.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-slate-400 font-medium">Connecting to Data Sources...</p>
        </div>
      </div>
    );
  }

  // --- DYNAMIC DATA CALCULATIONS ---

  // 1. Stats Row Math
  const totalCreditRequested = data.reduce((acc, curr) => acc + (curr.credit_limit_requested || 0), 0);
  const validScores = data.filter(d => d.bureau_score_cibil > 0);
  const avgScore = validScores.length > 0 
    ? Math.round(validScores.reduce((acc, curr) => acc + curr.bureau_score_cibil, 0) / validScores.length)
    : 0;
  const highRiskCount = data.filter(d => d.bureau_score_cibil > 0 && d.bureau_score_cibil < 650).length;

  const dynamicStats = [
    { label: "Total Exposure", value: `₹${(totalCreditRequested / 10000000).toFixed(2)}Cr`, change: "Live", upward: true, icon: TrendingUp },
    { label: "Active Applications", value: data.length.toString(), change: "Live", upward: true, icon: Users },
    { label: "High Risk Alerts", value: highRiskCount.toString(), change: "Review", upward: false, icon: ShieldAlert },
    { label: "Avg. Blended Score", value: avgScore.toString(), change: "Stable", upward: true, icon: BarChart3 },
  ];

  // 2. Queue Mapping (Translating CIBIL to Status)
  const queueData = data.slice(0, 6).map(item => {
    let status = "PENDING";
    let color = "text-slate-400";
    
    if (item.bureau_score_cibil > 700) { 
      status = "APPROVED"; 
      color = "text-primary"; 
    } else if (item.bureau_score_cibil === -1) { 
      status = "NO DATA"; 
      color = "text-slate-500"; 
    } else if (item.bureau_score_cibil < 650) { 
      status = "FLAGGED"; 
      color = "text-destructive"; 
    }

    return {
      name: item.name,
      id: item.entity_id,
      score: item.bureau_score_cibil,
      status,
      color
    };
  });

  // 3. Dynamic Portfolio Chart (Grouping by Industry Code)
  const industryTotals: Record<string, number> = {};
  data.forEach(item => {
    if (!industryTotals[item.industry_code]) industryTotals[item.industry_code] = 0;
    industryTotals[item.industry_code] += item.credit_limit_requested;
  });

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
  const dynamicPortfolioData = Object.entries(industryTotals)
    .map(([sector, value], index) => ({
      sector: sector.replace('NIC_', ''), 
      value: value / 100000, // Convert to Lakhs for chart readability
      color: colors[index % colors.length]
    }))
    .slice(0, 5); // Take top 5 industries

  return (
    <div className="animate-in fade-in duration-700 space-y-8 p-8 bg-black min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">Portfolio-wide risk and compliance monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Live Sync
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStats.map((stat, i) => (
          <Card key={i} className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <stat.icon className="h-5 w-5 text-slate-400" />
                </div>
                <div className={`flex items-center text-xs font-medium ${stat.upward ? "text-primary" : "text-destructive"}`}>
                  {stat.upward ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION: RBI PSL COMPLIANCE TRACKER */}
        <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-white">Exposure by Industry Segment</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Credit limits requested across NIC sectors (in Lakhs)</p>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/50">ON TRACK</Badge>
          </CardHeader>
          
          <CardContent className="pt-8">
            <div className="space-y-8">
              {/* Primary Progress Visual */}
              <div className="relative">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Data Processing Pipeline</span>
                  <span className="text-white font-bold text-lg">100% <span className="text-slate-500 font-normal text-sm">/ Live</span></span>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)] w-full" />
                </div>
              </div>

              {/* Dynamic Sector Distribution Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicPortfolioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="sector" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}L`, 'Credit Exposure']}
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {dynamicPortfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION: REAL-TIME FEED / RECENT ACTIVITY */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-slate-400" />
              Live Underwriting Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-white/5">
              {queueData.map((item, i) => (
                <div key={i} className="p-4 hover:bg-white/5 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{item.id}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${item.color}`}>{item.status}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {item.score === -1 ? 'Thin File' : `Score: ${item.score}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}