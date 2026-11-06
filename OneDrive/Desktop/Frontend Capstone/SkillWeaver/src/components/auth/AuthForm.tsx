"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, GraduationCap, LoaderCircle } from "lucide-react";
import { Notice } from "@/components/shared/Notice";

type AuthFormProps = { mode: "login" | "register" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to continue.");
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
      <section className="auth-card" aria-labelledby="auth-title">
        <Link href="/login" className="brand auth-brand"><span className="brand-mark"><GraduationCap size={23} /></span><span>SkillWeaver</span></Link>
        <div className="auth-heading">
          <span className="eyebrow">YOUR PERSONAL LEARNING SPACE</span>
          <h1 id="auth-title">{isRegister ? "Make room for progress." : "Welcome back."}</h1>
          <p>{isRegister ? "Create an account and start building your learning rhythm." : "Sign in to pick up where your learning left off."}</p>
        </div>
        {error ? <Notice kind="error">{error}</Notice> : null}
        <form className="form-stack" onSubmit={handleSubmit}>
          {isRegister ? <label className="field"><span>Full name</span><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" minLength={2} maxLength={60} required /></label> : null}
          <label className="field"><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
          <label className="field"><span>Password</span><span className="password-field"><input type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? "At least 8 characters" : "Your password"} minLength={isRegister ? 8 : 1} maxLength={72} required /><button type="button" className="icon-button password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : null}{busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}<ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">{isRegister ? "Already have an account?" : "New to SkillWeaver?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
        <p className="auth-footnote">Your workspace starts private to your account. You can add sample goals after signing in.</p>
      </section>
    </main>
  );
}
