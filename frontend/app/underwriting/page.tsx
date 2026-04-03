"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, Activity, TrendingUp, TrendingDown, AlertTriangle, IndianRupee, Clock, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import FraudGraph3D from "@/components/three/FraudGraph3D";

// 1. GAUGE CHART DATA (XGBoost Spectrum)
const gaugeData = [
  { name: "Poor/Bad", value: 20, color: "#ef4444" },      // 300-649 (Red)
  { name: "Fair/Avg", value: 20, color: "#f97316" },      // 650-699 (Orange)
  { name: "Good", value: 20, color: "#eab308" },          // 700-749 (Yellow)
  { name: "Very Good", value: 20, color: "#84cc16" },     // 750-799 (Light Green)
  { name: "Excellent", value: 20, color: "#22c55e" },     // 800-900 (Dark Green)
];

// 2. MOCK SHAP DATA (Aligned with shap_serializer.py)
const shapData = [
  { feature: "total_upi_credits", value: 65, type: "positive", label: "High UPI Transaction Velocity" },
  { feature: "vintage_months", value: 42, type: "positive", label: "Strong Business Vintage" },
  { feature: "total_gst_sales", value: 28, type: "positive", label: "Consistent GST Filing" },
  { feature: "gst_delay_days", value: -15, type: "negative", label: "Minor GST Payment Delays" },
  { feature: "eway_bill_mismatch", value: -5, type: "negative", label: "Slight E-way Bill Variance" },
];

// 3. FRAUD PAYLOAD (Hardcoded Scenario)
const mockFraudPayload = {
  fraud_type: "Accommodation Bill",
  reasoning: "ML anomaly detection + Graph Cycle validation with <5% variance.",
  total_laundered_inr: 12408970.01,
  nodes: [
      { id: "MSME_14582", label: "Prime Foods", gstin: "26MXWQV1581K4ZO" },
      { id: "MSME_18762", label: "Shree Traders", gstin: "34IBUFE5382D4Z1" },
      { id: "MSME_17869", label: "Shree Enterprises", gstin: "14ODZMH8712L6ZV" },
      { id: "MSME_15975", label: "Green Logistics", gstin: "20ORNAO3644A1Z8" },
      { id: "MSME_12556", label: "Skyline Logistics", gstin: "20ZWMWJ8343A4ZL" }
  ],
  links: [
      { source: "MSME_14582", target: "MSME_18762", label: "₹2,480,600" },
      { source: "MSME_18762", target: "MSME_17869", label: "₹2,476,406" },
      { source: "MSME_17869", target: "MSME_15975", label: "₹2,481,568" },
      { source: "MSME_15975", target: "MSME_12556", label: "₹2,477,321" },
      { source: "MSME_12556", target: "MSME_14582", label: "₹2,493,076" } // Circular Loop!
  ]
};

// 4. MOCK UPI LEDGER DATA
const legitTransactions = [
  { id: "TXN_9981", date: "2026-04-03", amount: "₹45,000", entity: "Vendor A", type: "DEBIT", status: "SUCCESS" },
  { id: "TXN_9982", date: "2026-04-02", amount: "₹12,500", entity: "Supplier B", type: "CREDIT", status: "SUCCESS" },
  { id: "TXN_9983", date: "2026-04-01", amount: "₹89,200", entity: "Logistics Corp", type: "DEBIT", status: "SUCCESS" },
];
const fraudTransactions = [
  { id: "TXN_F001", date: "2026-04-04", amount: "₹2,480,600", entity: "Shree Traders", type: "DEBIT", status: "FLAGGED" },
  { id: "TXN_F002", date: "2026-04-03", amount: "₹2,493,076", entity: "Skyline Logistics", type: "CREDIT", status: "FLAGGED" },
  { id: "TXN_F003", date: "2026-04-01", amount: "₹2,450,000", entity: "Shree Traders", type: "DEBIT", status: "FLAGGED" },
];

export default function UnderwritingDashboard() {
  const [gstinInput, setGstinInput] = useState("29LEGIT1234A1Z5");
  const [activeView, setActiveView] = useState<"idle" | "legit" | "fraud">("idle");
  const [isInferencing, setIsInferencing] = useState(false);

  const handleInference = () => {
    setIsInferencing(true);
    setActiveView("idle");
    
    setTimeout(() => {
      setIsInferencing(false);
      // Hardcoded hackathon trigger
      if (gstinInput.trim().toUpperCase() === "26MXWQV1581K4ZO") {
        setActiveView("fraud");
      } else {
        setActiveView("legit");
      }
    }, 1200);
  };

  const upiLedger = activeView === "fraud" ? fraudTransactions : legitTransactions;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 p-2">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">XGBoost Inference Engine</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">Cross-referencing GST, E-way, and UPI velocity</p>
        </div>
        <div className="flex w-full md:w-auto items-center space-x-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={gstinInput}
              onChange={(e) => setGstinInput(e.target.value)}
              className="pl-10 bg-card/40 border-white/5 uppercase font-mono h-12 rounded-xl focus-visible:ring-primary/50 text-white"
              placeholder="TARGET GSTIN..."
            />
          </div>
          <Button 
            onClick={handleInference}
            disabled={isInferencing}
            className={`h-12 px-8 font-bold transition-all ${
              activeView === "fraud" 
                ? "bg-destructive hover:bg-red-700 shadow-lg shadow-red-900/20" 
                : "bg-primary hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
            }`}
          >
            {isInferencing ? "Processing..." : "Run Inference"}
          </Button>
        </div>
      </div>

      {/* STATE 1: IDLE */}
      {activeView === "idle" && !isInferencing && (
        <div className="h-[50vh] flex flex-col items-center justify-center border border-white/5 bg-black/20 rounded-3xl border-dashed mt-8">
          <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Enter a GSTIN to initiate the XGBoost pipeline.</p>
          <p className="text-xs text-muted-foreground/50 mt-2 font-mono">Try: 26MXWQV1581K4ZO for anomaly detection</p>
        </div>
      )}

      {/* UPI TRANSACTIONS LEDGER (Visible after inference) */}
      {activeView !== "idle" && (
        <Card className="bg-card/40 border-white/5 backdrop-blur-md rounded-3xl mb-8 animate-in fade-in duration-500">
          <CardHeader className="border-b border-white/5 p-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Recent UPI Transactions
            </CardTitle>
            {activeView === "fraud" && <Badge variant="destructive" className="animate-pulse">HIGH VARIANCE DETECTED</Badge>}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {upiLedger.map((txn, i) => (
                <div key={i} className="flex justify-between items-center p-4 px-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${txn.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {txn.type === 'CREDIT' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{txn.entity}</p>
                      <p className="text-xs font-mono text-muted-foreground">{txn.id} • {txn.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{txn.amount}</p>
                    <p className={`text-[10px] font-bold tracking-widest uppercase ${txn.status === 'FLAGGED' ? 'text-destructive' : 'text-primary'}`}>
                      {txn.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STATE 2: FRAUD (Red UI & Circular 3D Network Graph) */}
      {activeView === "fraud" && (
        <Card className="bg-black/60 border-destructive/50 backdrop-blur-md overflow-hidden rounded-3xl animate-in zoom-in-95 duration-500">
          <CardHeader className="bg-destructive/10 border-b border-destructive/20 p-6">
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
              <div>
                <CardTitle className="text-destructive flex items-center gap-3 font-black tracking-tighter uppercase italic text-xl">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                  {mockFraudPayload.fraud_type} Detected
                </CardTitle>
                <p className="text-xs text-destructive/80 mt-2 font-mono max-w-xl">
                  {mockFraudPayload.reasoning} System mapped transactions as a network graph. Closed-loop flow detected indicating artificially inflated velocity.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-destructive/80 font-bold uppercase tracking-widest mb-1">Total Laundered (INR)</p>
                <p className="text-2xl font-black text-destructive tracking-tighter">₹1,24,08,970</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[500px] relative">
            {/* The Graph component gets the exact payload */}
            <FraudGraph3D fraudPayload={mockFraudPayload} noiseNodes={Array.from({ length: 40 }, (_, i) => ({ id: `noise_${i}` }))} />
          </CardContent>
        </Card>
      )}

      {/* STATE 3: LEGIT (XGBoost Gauge, SHAP NLP, Deliverables) */}
      {activeView === "legit" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
          
          <div className="xl:col-span-1 space-y-6">
            {/* The Custom XGBoost Gauge Chart with Ticker */}
            <Card className="bg-card/40 border-white/5 backdrop-blur-md p-6 rounded-3xl relative overflow-hidden flex flex-col items-center min-h-[400px]">
              <div className="absolute top-0 right-0 w-full h-full bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <h3 className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4 relative z-10 w-full text-left">Ignisia XGBoost Score</h3>
              
              <div className="h-48 w-full relative flex flex-col items-center justify-end overflow-hidden pb-4 z-10">
                <ResponsiveContainer width="100%" height="200%" className="absolute top-0">
                  <PieChart>
                    <Pie data={gaugeData} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={70} outerRadius={90} dataKey="value" stroke="none">
                      {gaugeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="text-center z-10 mt-16">
                  <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">845</span>
                </div>
              </div>

              {/* Score Ticker / Legend */}
              <div className="w-full mt-6 space-y-2 z-10 bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>750-900 (Excellent)</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>700-749 (Good)</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div>650-699 (Fair/Avg)</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div>300-649 (Poor/Bad)</span>
                  <span>NA/NH (No History)</span>
                </div>
              </div>
            </Card>

            {/* Expected Deliverables Panel */}
            <Card className="bg-card/40 border-white/5 backdrop-blur-md rounded-3xl">
              <CardHeader className="border-b border-white/5 p-5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Final Assessment</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Risk Band</p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 uppercase tracking-widest font-bold">Low Risk (A1)</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Estimated Sanction Limit</p>
                  <p className="text-2xl font-black text-white">₹14.5 Lakhs</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Data Freshness</p>
                  <p className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 inline-block uppercase">Live_Sync (Just Now)</p>
                </div>
                <Button className="w-full mt-4 bg-primary text-black hover:bg-emerald-500 font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">Proceed to Sanction</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: SHAP Explainability & NLP */}
          <Card className="xl:col-span-2 bg-card/40 border-white/5 backdrop-blur-md rounded-3xl flex flex-col">
            <CardHeader className="border-b border-white/5 p-6">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight text-white">
                  <Activity className="h-5 w-5 text-primary" /> Algorithmic Decision Drivers (SHAP)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 font-mono">XGBoost Feature Importance Translation</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 flex-1">
              
              {/* NLP Explanation Block */}
              <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">AI Summary Generation</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Based on the SHAP analysis, this entity achieved an <span className="font-bold text-white">Excellent score of 845</span> primarily driven by a <span className="text-emerald-400 font-medium">high UPI transaction velocity</span> and <span className="text-emerald-400 font-medium">strong business vintage</span>. While the model detected <span className="text-red-400 font-medium">minor GST payment delays</span>, consistent cash flow trends mitigate this risk, placing the MSME firmly in the Low Risk (A1) category for immediate sanctioning.
                </p>
              </div>

              <div className="space-y-6 mt-4">
                {shapData.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-300 flex items-center gap-2">
                        {item.type === 'positive' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                        {item.label} <span className="text-xs text-slate-500 font-mono hidden md:inline-block">({item.feature})</span>
                      </span>
                      <span className={`font-mono font-bold ${item.type === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.value > 0 ? `+${item.value}` : item.value}
                      </span>
                    </div>
                    {/* Split visual bar for SHAP values */}
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden flex border border-white/5">
                      <div className="w-1/2 flex justify-end">
                        {item.type === 'negative' && (
                           <div className="h-full bg-red-500 rounded-l-full" style={{ width: `${Math.abs(item.value)}%` }} />
                        )}
                      </div>
                      <div className="w-1/2">
                        {item.type === 'positive' && (
                           <div className="h-full bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${item.value}%` }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}