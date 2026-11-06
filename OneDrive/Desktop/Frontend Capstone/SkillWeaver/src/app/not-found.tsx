import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return <main className="error-screen"><span className="empty-icon"><SearchX size={27} /></span><h1>Page not found</h1><p>This page may have moved, or the address may be incomplete.</p><Link className="button button-primary" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</Link></main>;
}
