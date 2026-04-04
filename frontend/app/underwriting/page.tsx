"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Activity, TrendingUp, TrendingDown, AlertTriangle, IndianRupee, Clock, ArrowRightLeft, Calendar, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import FraudGraph3D from "@/components/three/FraudGraph3D";

// --- STATIC DATA CONFIGURATION ---
const gaugeData = [
  { name: "Poor/Bad", value: 20, color: "#ef4444" },
  { name: "Fair/Avg", value: 20, color: "#f97316" },
  { name: "Good", value: 20, color: "#eab308" },
  { name: "Very Good", value: 20, color: "#84cc16" },
  { name: "Excellent", value: 20, color: "#22c55e" },
];

const fallbackShapData = [
  { feature: "total_upi_credits", value: 65, type: "positive", label: "High UPI Transaction Velocity" },
  { feature: "vintage_months", value: 42, type: "positive", label: "Strong Business Vintage" },
  { feature: "total_gst_sales", value: 28, type: "positive", label: "Consistent GST Filing" },
];

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
      { source: "MSME_12556", target: "MSME_14582", label: "₹2,493,076" }
  ]
};

export default function UnderwritingDashboard() {
  const router = useRouter();
  const [gstinInput, setGstinInput] = useState("15UBWOC4083U1ZL");
  const [activeView, setActiveView] = useState<"idle" | "legit" | "fraud">("idle");
  const [isInferencing, setIsInferencing] = useState(false);

  // --- DYNAMIC API STATE ---
  const [apiResult, setApiResult] = useState<any>(null);
  
  // --- EDITABLE STATES ---
  const [sanctionAmt, setSanctionAmt] = useState("");
  const [sanctionUnit, setSanctionUnit] = useState("Lakhs");
  
  // --- MODAL STATES ---
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleInference = async () => {
    if (!gstinInput.trim()) return;
    setIsInferencing(true);
    setActiveView("idle");
    setApiResult(null);

    // 1. Check for Hardcoded Fraud Scenario
    if (gstinInput.trim().toUpperCase() === "26MXWQV1581K4ZO") {
      setTimeout(() => {
        setIsInferencing(false);
        setActiveView("fraud");
      }, 1200);
      return;
    }

    // 2. LIVE FASTAPI INTEGRATION
    try {
      const response = await fetch(`http://localhost:8000/score/${gstinInput.trim().toLowerCase()}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      setApiResult(data);
      
      // Auto-fill amount (Convert raw INR to Lakhs)
      const amtInLakhs = (data.recommended_loan_amount / 100000).toFixed(2);
      setSanctionAmt(amtInLakhs);
      
      setActiveView("legit");
    } catch (error) {
      console.error("Inference Error:", error);
      alert("Failed to connect to FastAPI Backend. Make sure it is running on port 8000 with CORS enabled.");
    } finally {
      setIsInferencing(false);
    }
  };

  const handleFinalize = () => {
    const record = {
      id: `APP_${Math.floor(Math.random() * 10000)}`,
      gstin: gstinInput,
      amount: `₹${sanctionAmt} ${sanctionUnit}`,
      amnestyWindow: startDate && endDate ? `${startDate} to ${endDate}` : "None applied",
      date: new Date().toISOString().split('T')[0],
      status: "SANCTIONED"
    };
    
    const existing = JSON.parse(localStorage.getItem('audit_ledger') || '[]');
    localStorage.setItem('audit_ledger', JSON.stringify([record, ...existing]));
    router.push('/ledger');
  };

  const formatRiskBand = (band: string) => {
    if (!band) return "";
    return band.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 p-2 relative">
      
      {/* AMNESTY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-primary/30 p-8 rounded-2xl w-[450px] shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Policy Override</h2>
                <p className="text-xs text-primary font-mono mt-1">GST Amnesty Scheme Adjustment</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Define the government amnesty quarter. The ML model will dynamically mask SHAP penalties for late filings within this specific timeframe without retraining.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-widest mb-2 block">Amnesty Start Date</label>
                <Input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="bg-black border-white/10 text-white dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-widest mb-2 block">Amnesty End Date</label>
                <Input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="bg-black border-white/10 text-white dark:[color-scheme:dark]" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={handleFinalize} className="bg-primary hover:bg-emerald-600 text-black font-bold">Finalize & Log Audit</Button>
            </div>
          </div>
        </div>
      )}

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
              onKeyDown={(e) => e.key === 'Enter' && handleInference()}
            />
          </div>
          <Button 
            onClick={handleInference}
            disabled={isInferencing}
            className={`h-12 px-8 font-bold transition-all ${
              activeView === "fraud" ? "bg-destructive hover:bg-red-700 shadow-lg shadow-red-900/20" : "bg-primary hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
            }`}
          >
            {isInferencing ? "Connecting to API..." : "Run Inference"}
          </Button>
        </div>
      </div>

      {/* STATE 1: IDLE */}
      {activeView === "idle" && !isInferencing && (
        <div className="h-[50vh] flex flex-col items-center justify-center border border-white/5 bg-black/20 rounded-3xl border-dashed mt-8">
          <BrainCircuit className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Enter a GSTIN to call the live FastAPI endpoint.</p>
          <p className="text-xs text-muted-foreground/50 mt-2 font-mono">Try: 15UBWOC4083U1ZL (Live) or 26MXWQV1581K4ZO (Fraud)</p>
        </div>
      )}

      {/* STATE 2: FRAUD */}
      {activeView === "fraud" && (
        <Card className="bg-black/60 border-destructive/50 backdrop-blur-md overflow-hidden rounded-3xl mt-8">
           <CardHeader className="bg-destructive/10 border-b border-destructive/20 p-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-destructive flex items-center gap-3 font-black tracking-tighter uppercase italic text-xl">
                <AlertTriangle className="h-6 w-6 animate-pulse" /> Accommodation Bill Detected
              </CardTitle>
              <Badge className="bg-destructive hover:bg-destructive text-white uppercase tracking-widest font-bold">Auto-Reject Initiated</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[500px]">
            <FraudGraph3D fraudPayload={mockFraudPayload} noiseNodes={Array.from({ length: 40 }, (_, i) => ({ id: `noise_${i}` }))} />
          </CardContent>
        </Card>
      )}

      {/* STATE 3: LEGIT (Powered by Live API) */}
      {activeView === "legit" && apiResult && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          
          <div className="xl:col-span-1 space-y-6">
            
            {/* LIVE API GAUGE CHART */}
            <Card className="bg-card/40 border-white/5 backdrop-blur-md p-6 rounded-3xl flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <h3 className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4 z-10 w-full text-left">Live AI Score</h3>
              
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
                  <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                    {apiResult.credit_score}
                  </span>
                </div>
              </div>
            </Card>

            {/* LIVE DYNAMIC ASSESSMENT PANEL */}
            <Card className="bg-card/40 border-white/5 backdrop-blur-md rounded-3xl">
              <CardHeader className="border-b border-white/5 p-5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex justify-between">
                  Final Assessment
                  <Badge className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest">
                    {formatRiskBand(apiResult.risk_band)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-muted-foreground mb-2 font-bold uppercase tracking-widest">Model Recommended Limit</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-primary">₹</span>
                    <Input 
                      type="number" 
                      value={sanctionAmt} 
                      onChange={(e) => setSanctionAmt(e.target.value)}
                      className="bg-transparent border-b-2 border-white/20 border-t-0 border-x-0 rounded-none text-2xl font-black text-white px-1 h-12 w-24 focus-visible:ring-0 focus-visible:border-primary" 
                    />
                    <select 
                      value={sanctionUnit} 
                      onChange={(e) => setSanctionUnit(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary cursor-pointer h-10"
                    >
                      <option className="bg-black">Lakhs</option>
                      <option className="bg-black">Crores</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-primary/70 mt-2 font-mono">
                    Probability of Default: {(apiResult.probability_of_default * 100).toFixed(2)}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Data Freshness</p>
                  <p className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 inline-block uppercase">API_SYNC (Live)</p>
                </div>
                
                <Button onClick={() => setShowModal(true)} className="w-full h-14 bg-primary text-black hover:bg-emerald-600 font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Proceed to Sanction
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SHAP NLP Analysis */}
          <Card className="xl:col-span-2 bg-card/40 border-white/5 backdrop-blur-md rounded-3xl flex flex-col">
             <CardHeader className="border-b border-white/5 p-6">
              <CardTitle className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Algorithmic Decision Drivers
              </CardTitle>
              {apiResult.top_reasons?.length === 0 && (
                <p className="text-[10px] text-orange-400 mt-2 font-mono bg-orange-400/10 px-2 py-1 rounded inline-block">
                  ⚠️ Live SHAP generation disabled. Showing proxy drivers.
                </p>
              )}
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col">
               
               <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl relative overflow-hidden mb-6">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Live API Summary</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Based on the live FastAPI inference, this entity achieved a <span className="font-bold text-white">score of {apiResult.credit_score}</span>. The model confidence is <span className="text-emerald-400 font-bold uppercase">{apiResult.confidence}</span>, placing the MSME in the <span className="text-white font-medium">{formatRiskBand(apiResult.risk_band)}</span> category for a recommended tenure of {apiResult.tenure_months} months.
                </p>
              </div>

               <div className="space-y-4">
                {/* Dynamically render strings from API or fallback objects */}
                {apiResult.top_reasons?.length > 0 ? (
                  apiResult.top_reasons.map((reasonStr: string, i: number) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-200">{reasonStr}</p>
                    </div>
                  ))
                ) : (
                  fallbackShapData.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-300 flex items-center gap-2">
                          {item.type === 'positive' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                          {item.label}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full flex border border-white/5">
                        <div className="w-1/2 flex justify-end">
                          {item.type === 'negative' && <div className="h-full bg-red-500 rounded-l-full" style={{ width: `${Math.abs(item.value)}%` }} />}
                        </div>
                        <div className="w-1/2">
                          {item.type === 'positive' && <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${item.value}%` }} />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}