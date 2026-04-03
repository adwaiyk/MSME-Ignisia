"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  PieChart as PieChartIcon,
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
  const [data, setData] = useState<MSMEProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/msme-data');
      if (!res.ok) throw new Error("Connection failed");
      const json = await res.json();
      if (json.success && json.msme_profiles) {
        setData(json.msme_profiles);
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium tracking-tight">Synchronizing Enterprise Ledger...</p>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalExposure = data.reduce((acc, curr) => acc + (curr.credit_limit_requested || 0), 0);
  const validProfiles = data.filter(d => d.bureau_score_cibil > 0);
  const avgBlendedScore = validProfiles.length > 0 
    ? Math.round(validProfiles.reduce((acc, curr) => acc + curr.bureau_score_cibil, 0) / validProfiles.length)
    : 0;
  const highRiskTotal = data.filter(d => d.bureau_score_cibil > 0 && d.bureau_score_cibil < 650).length;

  const stats = [
    { label: "Total Exposure", value: `₹${(totalExposure / 10000000).toFixed(2)}Cr`, icon: TrendingUp, status: "Live" },
    { label: "Active Entities", value: data.length.toString(), icon: Users, status: "Live" },
    { label: "Critical Alerts", value: highRiskTotal.toString(), icon: ShieldAlert, status: "Action Required" },
    { label: "Network Avg Score", value: avgBlendedScore.toString(), icon: BarChart3, status: "Stable" },
  ];

  // Chart Data Preparation
  const sectorMap: Record<string, number> = {};
  data.forEach(item => {
    const sector = item.industry_code.replace('NIC_', '');
    sectorMap[sector] = (sectorMap[sector] || 0) + item.credit_limit_requested;
  });

  const chartColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
  const sectorData = Object.entries(sectorMap)
    .map(([sector, value], index) => ({
      name: sector,
      lakhs: value / 100000,
      color: chartColors[index % chartColors.length]
    }))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Portfolio Command Center</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Real-time risk intelligence gateway</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card/40 border-white/5 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase border-primary/20 text-primary">
                  {stat.status}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/40 border-white/5 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold">Sectoral Exposure</CardTitle>
                <p className="text-[10px] text-muted-foreground font-mono uppercase mt-1">Credit distribution across NIC verticals (Lakhs)</p>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">VALIDATED</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: "#000", border: "1px solid #222", borderRadius: "12px" }}
                  />
                  <Bar dataKey="lakhs" radius={[6, 6, 0, 0]}>
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              Inference Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-white/5">
              {data.slice(0, 6).map((item, i) => (
                <div key={i} className="p-4 hover:bg-white/5 transition-all group cursor-default">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">{item.entity_id}</p>
                    </div>
                    <Badge variant={item.bureau_score_cibil > 700 ? "default" : "outline"} className="text-[9px] font-black">
                      {item.bureau_score_cibil > 700 ? 'SECURE' : 'PENDING'}
                    </Badge>
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