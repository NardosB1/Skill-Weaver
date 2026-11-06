"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { Bell, BookOpen, ChevronDown, LayoutDashboard, ListTodo, LogOut, Menu, Search, Settings, Target, TrendingUp, X, GraduationCap } from "lucide-react";
import type { User } from "@/lib/types";
import { initials } from "@/lib/format";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My goals", href: "/goals", icon: Target },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Progress", href: "/progress", icon: TrendingUp },
];

type WorkspaceShellProps = { user: User; children: ReactNode };

export function WorkspaceShell({ user, children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) router.push(`/tasks?q=${encodeURIComponent(query.trim())}`);
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function navLinks(mobile = false) {
    return navigation.map((item) => {
      const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
      const Icon = item.icon;
      return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`nav-link ${active ? "nav-link-active" : ""} ${mobile ? "nav-link-mobile" : ""}`} aria-current={active ? "page" : undefined}><Icon size={19} strokeWidth={1.9} /><span>{item.label}</span></Link>;
    });
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <aside className="sidebar">
        <Link href="/dashboard" className="brand"><span className="brand-mark"><GraduationCap size={24} /></span><span>SkillWeaver</span></Link>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">{navLinks()}</nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="sidebar-note-icon"><BookOpen size={17} /></span><strong>Keep weaving progress</strong><p>Small, consistent steps make a strong learning path.</p></div>
          <Link href="/settings" className={`nav-link ${pathname === "/settings" ? "nav-link-active" : ""}`}><Settings size={19} /><span>Settings</span></Link>
          <div className="sidebar-user"><span className="avatar">{initials(user.name)}</span><span className="sidebar-user-copy"><strong>{user.name}</strong><small>{user.email}</small></span><button className="icon-button" onClick={logout} disabled={loggingOut} aria-label="Sign out"><LogOut size={17} /></button></div>
        </div>
      </aside>

      {mobileOpen ? <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}
      <aside className={`mobile-drawer ${mobileOpen ? "mobile-drawer-open" : ""}`} aria-label="Mobile navigation" aria-hidden={!mobileOpen} inert={!mobileOpen}>
        <div className="mobile-drawer-header"><Link href="/dashboard" className="brand" onClick={() => setMobileOpen(false)}><span className="brand-mark"><GraduationCap size={24} /></span><span>SkillWeaver</span></Link><button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
        <nav className="sidebar-nav">{navLinks(true)}</nav>
        <Link href="/settings" onClick={() => setMobileOpen(false)} className="nav-link"><Settings size={19} /><span>Settings</span></Link>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
          <form className="topbar-search" role="search" onSubmit={handleSearch}><Search size={18} /><input aria-label="Search tasks" placeholder="Search your tasks..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>Enter</kbd></form>
          <div className="topbar-actions"><span className="topbar-notice" aria-hidden="true"><Bell size={19} /><span className="notification-dot" /></span><span className="topbar-divider" /><Link className="topbar-profile" href="/settings"><span className="avatar avatar-small">{initials(user.name)}</span><span>{user.name.split(" ")[0]}</span><ChevronDown size={15} /></Link></div>
        </header>
        <main id="main-content" className="page-content">{children}</main>
        <footer className="app-footer"><span>SkillWeaver</span><span>Learn with intention. Grow with consistency.</span><Link href="/settings">Settings</Link></footer>
      </div>
    </div>
  );
}
