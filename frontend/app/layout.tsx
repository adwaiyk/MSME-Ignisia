// Location: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ignisia.AI | MSME Credit Scoring",
  description: "Real-Time MSME Credit Scoring via Alternative Business Signals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased flex h-screen overflow-hidden`}>
        <Sidebar />
        {/* Main content wrapper pushes content to the right of the 64-width (16rem) sidebar */}
        <main className="flex-1 ml-64 h-screen overflow-y-auto relative">
          {/* Subtle top ambient glow for extra premium feel */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}