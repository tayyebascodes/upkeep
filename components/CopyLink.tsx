"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

// Shows the absolute tenant link for a path and copies it.
export function CopyLink({ path }: { path: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}${path}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface p-1.5 pl-3">
      <span className="flex-1 truncate font-mono text-xs text-ink-muted">{url}</span>
      <button onClick={handleCopy} className="btn btn-secondary h-8 flex-shrink-0 px-3 text-xs">
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
