// Location: app/ledger/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, FileText, AlertCircle, Download, FileSpreadsheet, FileJson, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditRecord {
  id: string;
  gstin: string;
  amount: string;
  amnestyWindow: string;
  date: string;
  status: string;
}

export default function AuditLedgerPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);

  useEffect(() => {
    // Fetch sanctioned loans from browser storage
    const stored = JSON.parse(localStorage.getItem('audit_ledger') || '[]');
    setRecords(stored);
  }, []);

  // --- EXPORT FUNCTIONS ---

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ["App ID", "Entity GSTIN", "Sanctioned Limit", "Policy Override", "Timestamp", "Status"];
    const rows = records.map(r => [r.id, r.gstin, r.amount, r.amnestyWindow, r.date, r.status]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Ignisia_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (records.length === 0) return;
    // Excel can read Tab-Separated Values (TSV) natively when saved as .xls
    const headers = ["App ID", "Entity GSTIN", "Sanctioned Limit", "Policy Override", "Timestamp", "Status"];
    const rows = records.map(r => [r.id, r.gstin, r.amount, r.amnestyWindow, r.date, r.status]);
    const tsvContent = [headers.join("\t"), ...rows.map(e => e.join("\t"))].join("\n");
    
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Ignisia_Audit_Ledger_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // Uses the browser's native print-to-PDF engine
    window.print();
  };

  return (
    <div className="animate-in fade-in duration-1000 p-2 space-y-8">
      
      {/* HEADER & EXPORT ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Enterprise Audit Ledger
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Immutable log of sanctioned loans and applied policy overrides.</p>
        </div>
        
        {/* Export Toolbar */}
        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/10">
          <Button 
            onClick={handleExportCSV} 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
            disabled={records.length === 0}
          >
            <FileText className="h-4 w-4" /> CSV
          </Button>
          <div className="w-px h-4 bg-white/10" />
          <Button 
            onClick={handleExportExcel} 
            variant="ghost" 
            size="sm" 
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 flex items-center gap-2"
            disabled={records.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <div className="w-px h-4 bg-white/10" />
          <Button 
            onClick={handleExportPDF} 
            variant="ghost" 
            size="sm" 
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 flex items-center gap-2"
            disabled={records.length === 0}
          >
            <Printer className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* TABLE DATA */}
      <Card className="bg-card/40 border-white/5 backdrop-blur-md overflow-hidden rounded-3xl">
        <CardHeader className="bg-white/5 border-b border-white/5 print:bg-transparent print:border-b-black">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-300 print:text-black">Sanctioned Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-sm print:hidden">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
              No records found. Sanction a loan in the Underwriter engine.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-400 font-bold print:bg-transparent print:text-black print:border-black">
                    <th className="p-4 px-6">App ID</th>
                    <th className="p-4">Entity GSTIN</th>
                    <th className="p-4">Sanctioned Limit</th>
                    <th className="p-4">Policy Override (Amnesty)</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-black/20">
                  {records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors text-sm print:text-black">
                      <td className="p-4 px-6 font-mono text-slate-300 print:text-black">{record.id}</td>
                      <td className="p-4 font-mono font-bold text-white print:text-black">{record.gstin}</td>
                      <td className="p-4 font-black text-primary print:text-black">{record.amount}</td>
                      <td className="p-4">
                        {record.amnestyWindow !== "None applied" ? (
                          <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10 font-mono text-[10px] print:border-black print:text-black print:bg-transparent">
                            {record.amnestyWindow}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 italic text-xs print:text-black">Standard</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs print:text-black">{record.date}</td>
                      <td className="p-4 text-right">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 uppercase tracking-widest print:border-black print:text-black print:bg-transparent">
                          <ShieldCheck className="h-3 w-3 mr-1 print:hidden" /> {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Print only footer */}
      <div className="hidden print:block mt-8 text-center text-xs font-mono text-black">
        <p>Generated by MSME Ignisia Enterprise Engine - Authorized Audit Copy</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>

    </div>
  );
}