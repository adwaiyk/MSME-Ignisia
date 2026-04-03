import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function UnderwritingDashboard() {
  return (
    // Base dark mode background and padding
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">MSME Underwriting Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-slate-400 border-slate-700">Live Inference</Badge>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1: Inference Engine & Scores (Spans full width) */}
        <Card className="lg:col-span-3 bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
            
            {/* Input Area */}
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input 
                type="text" 
                placeholder="Enter GSTIN (e.g., 29HERO9999X1Z5)" 
                className="bg-black/50 border-white/10 text-white placeholder:text-slate-500"
              />
              <Button className="bg-[#10b981] hover:bg-[#059669] text-white">
                Run
              </Button>
            </div>

            {/* Scores Area */}
            <div className="flex items-center space-x-12">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Legacy Bureau Score</p>
                <p className="text-4xl font-semibold text-slate-300">620</p>
              </div>
              
              {/* Vertical Separator */}
              <div className="h-16 w-px bg-white/10"></div>

              <div className="text-center">
                <p className="text-sm text-[#10b981] mb-1">Blended AI Score</p>
                {/* We will replace this number with a Recharts Radial Pie later */}
                <p className="text-5xl font-bold text-[#10b981] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  845
                </p>
              </div>

              <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50 px-4 py-1 text-sm">
                LOW_RISK_APPROVED
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: SHAP Explainability (Spans 2 columns) */}
        <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-md h-96">
          <CardHeader>
            <CardTitle className="text-lg">Algorithmic Decision Drivers (SHAP)</CardTitle>
            <p className="text-xs text-slate-400">Fulfilling RBI Duty of Explanation</p>
          </CardHeader>
          <CardContent className="h-full flex items-center justify-center text-slate-500">
            {/* Recharts BarChart will go here in the next step */}
            [SHAP Horizontal Bar Chart Placeholder]
          </CardContent>
        </Card>

        {/* SECTION 3: PSL Compliance Simulation (Spans 1 column) */}
        <Card className="lg:col-span-1 bg-white/5 border-white/10 backdrop-blur-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Impact & PSL</CardTitle>
            <p className="text-xs text-slate-400">Micro-enterprise Sub-target Simulation</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Current Target</span>
                <span className="text-[#10b981] font-bold">Projected: 7.1%</span>
              </div>
              {/* Shadcn Progress Bar */}
              <Progress value={68} className="h-3 bg-slate-800 indicator-[#10b981]" />
              <p className="text-[10px] text-slate-500 mt-2 text-right">+30bps lift from current sanction</p>
            </div>

            <Button className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold h-12 text-lg">
              SANCTION LOAN
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}