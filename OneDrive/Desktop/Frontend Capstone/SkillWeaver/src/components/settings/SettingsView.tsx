"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Download, RefreshCcw, Save, ShieldCheck, UserRound } from "lucide-react";
import type { User } from "@/lib/types";
import { apiRequest } from "@/lib/client-api";
import { initials } from "@/lib/format";
import { Notice } from "@/components/shared/Notice";

export function SettingsView({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice(""); setError("");
    try { await apiRequest("/api/settings", "PUT", { name }); setNotice("Profile updated."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your profile."); }
    finally { setBusy(false); }
  }

  async function loadSample() {
    setBusy(true); setNotice(""); setError("");
    try { await apiRequest("/api/settings", "POST", { action: "sample" }); setNotice("Sample workspace loaded."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load sample data."); }
    finally { setBusy(false); }
  }

  async function resetData() {
    if (!window.confirm("Delete all of your goals and tasks? This cannot be undone.")) return;
    setBusy(true); setNotice(""); setError("");
    try { await apiRequest("/api/settings", "DELETE"); setNotice("Your workspace has been cleared."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not reset your workspace."); }
    finally { setBusy(false); }
  }

  return <div className="page-stack">
    <section className="page-intro"><div><span className="eyebrow">MAKE THIS SPACE YOURS</span><h1>Settings</h1><p>Manage your profile and the data in your learning workspace.</p></div><span className="intro-icon"><UserRound size={24} /></span></section>
    {notice ? <Notice kind="success">{notice}</Notice> : null}{error ? <Notice kind="error">{error}</Notice> : null}
    <section className="panel settings-panel"><div className="section-heading"><div><span className="eyebrow">PROFILE</span><h2>Personal details</h2></div></div><div className="profile-summary"><span className="avatar avatar-large">{initials(user.name)}</span><div><strong>{user.name}</strong><p>{user.email}</p><span className="verified-label"><ShieldCheck size={14} /> Account signed in</span></div></div><form className="settings-form" onSubmit={saveProfile}><label className="field"><span>Display name</span><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required /></label><label className="field"><span>Email address</span><input value={user.email} disabled readOnly /></label><div className="form-actions"><button className="button button-primary" type="submit" disabled={busy}><Save size={16} /> {busy ? "Saving..." : "Save profile"}</button></div></form></section>
    <section className="panel settings-panel"><div className="section-heading"><div><span className="eyebrow">WORKSPACE DATA</span><h2>Sample data and reset</h2></div><span className="settings-panel-icon"><Database size={21} /></span></div><p className="settings-description">New accounts start with an empty workspace. Load a sample set to explore the dashboard, goal tracking, task filters, and progress chart. Sample data can only be loaded when your workspace is empty.</p><div className="settings-actions"><button className="button button-secondary" onClick={loadSample} disabled={busy}><Download size={16} /> Load sample workspace</button><button className="button button-danger-outline" onClick={resetData} disabled={busy}><RefreshCcw size={16} /> Reset goals and tasks</button></div></section>
    <section className="settings-footnote"><ShieldCheck size={18} /><div><strong>Your workspace is private to your signed-in account.</strong><p>Each saved goal and task is linked to your account on the server. For deployment guidance and the file-storage limitation, see the project documentation.</p></div></section>
  </div>;
}
