"use client";
import { SignIn } from "@clerk/nextjs";
import { useState } from "react";

export default function SignInPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4">
      <div className="w-full max-w-md bg-[#16161F] border border-amber-500/40 rounded-xl p-4 shadow-lg shadow-amber-500/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400 text-sm font-semibold tracking-wide">🎯 JUDGE / DEMO ACCESS</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-[#0A0A0F] rounded-lg px-3 py-2">
            <div>
              <span className="text-xs text-gray-500">Email</span>
              <p className="text-sm text-white font-mono">judge@demo.com</p>
            </div>
            <button
              onClick={() => copy("judge@demo.com", "email")}
              className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded px-2 py-1 transition-colors"
            >
              {copied === "email" ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div className="flex items-center justify-between bg-[#0A0A0F] rounded-lg px-3 py-2">
            <div>
              <span className="text-xs text-gray-500">Password</span>
              <p className="text-sm text-white font-mono">Demo@2026</p>
            </div>
            <button
              onClick={() => copy("Demo@2026", "pass")}
              className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded px-2 py-1 transition-colors"
            >
              {copied === "pass" ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#F59E0B",
            colorBackground: "#16161F",
            colorText: "#F8F8FC",
            colorInputBackground: "#1A1A24",
            colorInputText: "#F8F8FC",
            borderRadius: "8px",
          },
        }}
      />
    </div>
  );
}
