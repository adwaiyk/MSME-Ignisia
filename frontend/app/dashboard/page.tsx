"use client";

import React from "react";
import { 
  Briefcase, 
  ShieldAlert, 
  AlertTriangle, 
  Network, 
  BrainCircuit, 
  Activity, 
  TrendingDown,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";

// --- AGGREGATED DATA (From bank_portfolio_master.csv) ---

const topStats = [
  { label: "Total Portfolio Exposure", value: "₹1,392.52 Cr", icon: Briefcase, status: "Active", color: "text-primary" },
  { label: "Active Loan Accounts", value: "5,000", icon: Building2, status: "Live", color: "text-blue-400" },
  { label: "Capital at Risk (High/Critical)", value: "₹144.21 Cr", icon: TrendingDown, status: "Monitor", color: "text-orange-400" },
  { label: "Fraud Exposure Detected", value: "₹11.62 Cr", icon: ShieldAlert, status: "Action Required", color: "text-destructive" },
];

const industryData = [
  { name: "Agri Tech", value: 285.93, color: "#10b981" },
  { name: "IT/Services", value: 281.06, color: "#3b82f6" },
  { name: "Retail/FMCG", value: 278.30, color: "#8b5cf6" },
  { name: "Manufacturing", value: 277.36, color: "#f59e0b" },
  { name: "Logistics", value: 269.86, color: "#64748b" },
];

const riskData = [
  { name: "Low Risk", value: 793.80, color: "#10b981" },
  { name: "Medium Risk", value: 454.50, color: "#eab308" },
  { name: "High Risk", value: 117.84, color: "#f97316" },
  { name: "Critical Risk", value: 26.37, color: "#ef4444" },
];

const aiInsights = [
  {
    classification: "CRITICAL RISK EXPOSURE",
    module: "Topology Detection Engine (NetworkX)",
    finding: "Isolated 41 active accounts engaged in circular transaction topologies indicative of Accommodation Bill fraud.",
    impact: "INR 11.62 Crores",
    trail: "Referenced 'bank_portfolio_master.csv'. Recommended immediate freeze protocol.",
    icon: Network,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30"
  },
  {
    classification: "PORTFOLIO OPTIMIZATION",
    module: "Predictive Scoring Engine (XGBoost)",
    finding: "Identified 35 loan accounts possessing prime legacy bureau scores (>700) while demonstrating high-risk alternative data markers (elevated GST delays, low UPI velocity).",
    impact: "INR 8.95 Crores safeguarded",
    trail: "Action: Accounts successfully downgraded below the approval threshold. Validated against current DPD metrics.",
    icon: BrainCircuit,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30"
  },
  {
    classification: "SECTORAL STRESS WARNING",
    module: "Macro-Portfolio Analytics",
    finding: "Detected significant credit quality degradation within the Manufacturing sector. 2.94% of total sector exposure has migrated to the 'Critical Risk' tranche.",
    impact: "Systemic Risk Increase",
    trail: "Data indicates correlation with elevated average GST delays across 29 specific accounts. Recommend tightening sector-specific origination caps.",
    icon: Activity,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30"
  }
];

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in duration-1000 p-2 space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Enterprise Portfolio Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Macro-level intelligence derived from alternative data signals.</p>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((stat, i) => (
          <Card key={i} className="bg-card/40 border-white/5 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl border border-white/10 bg-white/5`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant="outline" className={`text-[10px] font-bold uppercase border-white/10 ${stat.color}`}>
                  {stat.status}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Concentration Risk (Pie) */}
        <Card className="bg-card/40 border-white/5 backdrop-blur-md">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-lg font-bold">Exposure by Industry Sector</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest mt-1">Concentration Risk Analysis (in Crores)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => [`₹${value.toFixed(2)} Cr`, 'Exposure']}
                  contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CHART 2: Portfolio Health (Bar) */}
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
              <BarChart data={riskData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value: any) => [`₹${value.toFixed(2)} Cr`, 'Capital']}
                  contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI INSIGHTS MVP SECTION */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Deterministics NLG Engine Outputs
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {aiInsights.map((insight, i) => (
            <Card key={i} className={`bg-card/40 border ${insight.border} backdrop-blur-md overflow-hidden relative`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.bg.replace('/10', '')}`} />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  
                  {/* Icon & Classification */}
                  <div className="md:w-1/4 space-y-3">
                    <div className={`inline-flex p-3 rounded-xl ${insight.bg}`}>
                      <insight.icon className={`h-6 w-6 ${insight.color}`} />
                    </div>
                    <div>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest border-white/10 ${insight.color}`}>
                        {insight.classification}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">MODULE:<br/>{insight.module}</p>
                    </div>
                  </div>

                  {/* Finding & Impact */}
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
          ))}
        </div>
      </div>

    </div>
  );
}