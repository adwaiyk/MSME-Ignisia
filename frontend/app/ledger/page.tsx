// Location: app/ledger/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="animate-in fade-in duration-1000 p-2 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Enterprise Audit Ledger
        </h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Immutable log of sanctioned loans and applied policy overrides.</p>
      </div>

      <Card className="bg-card/40 border-white/5 backdrop-blur-md overflow-hidden rounded-3xl">
        <CardHeader className="bg-white/5 border-b border-white/5">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-300">Sanctioned Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-sm">
              <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
              No records found. Sanction a loan in the Underwriter engine.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    <th className="p-4 px-6">App ID</th>
                    <th className="p-4">Entity GSTIN</th>
                    <th className="p-4">Sanctioned Limit</th>
                    <th className="p-4">Policy Override (Amnesty)</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((record, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="p-4 px-6 font-mono text-slate-300">{record.id}</td>
                      <td className="p-4 font-mono font-bold text-white">{record.gstin}</td>
                      <td className="p-4 font-black text-primary">{record.amount}</td>
                      <td className="p-4">
                        {record.amnestyWindow !== "None applied" ? (
                          <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10 font-mono text-[10px]">
                            {record.amnestyWindow}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Standard</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{record.date}</td>
                      <td className="p-4 text-right">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 uppercase tracking-widest">
                          <ShieldCheck className="h-3 w-3 mr-1" /> {record.status}
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
    </div>
  );
}