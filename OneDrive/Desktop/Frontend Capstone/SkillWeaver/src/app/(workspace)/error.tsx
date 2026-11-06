"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Workspace rendering error:", error); }, [error]);
  return <div className="error-screen"><span className="empty-icon"><AlertTriangle size={26} /></span><h1>We couldn't load this page.</h1><p>Your data has not been intentionally changed. Try loading the page again.</p><button className="button button-primary" onClick={() => reset()}><RefreshCcw size={16} /> Try again</button></div>;
}
