// Location: app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip"; // <-- Import this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axiom.ai",
  description: "Real-Time MSME Credit Scoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {/* Wrap everything in the TooltipProvider */}
        <TooltipProvider delayDuration={0}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}