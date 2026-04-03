"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      if (email === "admin@somebank.com" && password === "admin@123") {
        // Redirect to your dashboard route
        router.push("/dashboard"); 
      } else {
        // Updated error message per your instructions
        setError("incorrect credentials, try again.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white selection:bg-primary selection:text-black font-sans p-4 relative overflow-hidden">
      
      {/* Ambient background glow to keep the enterprise feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Centered Login Card */}
      <div className="w-full max-w-md space-y-8 relative z-10 p-8 sm:p-10 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl">
        
        {/* Header & Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
            <Building2 className="h-8 w-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Global Underwriting</h2>
            <p className="text-slate-400 text-sm">Authenticate to access the command center</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mt-8">
          {/* Error Message Alert */}
          {error && (
            <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Corporate Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-5 w-5 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Enter your corporate email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <span className="text-xs text-slate-500 hover:text-white cursor-pointer transition-colors">Forgot password?</span>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/50 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
            ) : (
              <>
                Authenticate <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}