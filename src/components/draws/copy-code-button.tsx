"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyCodeButtonProps {
  code: string;
  className?: string;
}

export function CopyCodeButton({ code, className }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso caso clipboard não esteja disponível
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition-colors cursor-pointer",
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100",
        className
      )}
      title="Copiar código do sorteio"
    >
      <span>{code}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-slate-400" />
      )}
    </button>
  );
}
