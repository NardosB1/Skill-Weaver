"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Edit3, Plus, Search, Target, Trash2, X } from "lucide-react";
import type { Goal, GoalCategory, Task, GoalInput } from "@/lib/types";
import { apiRequest } from "@/lib/client-api";
import { formatDate, getGoalProgress } from "@/lib/format";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Notice } from "@/components/shared/Notice";

const categories: GoalCategory[] = ["Frontend", "Backend", "Career", "University", "Personal"];
type GoalsManagerProps = { initialGoals: Goal[]; tasks: Task[]; searchQuery?: string };

export function GoalsManager({ initialGoals, tasks, searchQuery = "" }: GoalsManagerProps) {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [query, setQuery] = useState(searchQuery);
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const filtered = useMemo(() => goals.filter((goal) => (category === "All" || goal.category === category) && `${goal.title} ${goal.description}`.toLowerCase().includes(query.toLowerCase())), [goals, category, query]);

  async function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload: GoalInput = { title: String(form.get("title") || ""), description: String(form.get("description") || ""), category: String(form.get("category") || "Frontend") as GoalCategory, targetDate: String(form.get("targetDate") || "") || null };
    try {
      if (editing) {
        const result = await apiRequest<{ goal: Goal }>("/api/goals", "PUT", { ...payload, id: editing.id });
        setGoals((items) => items.map((item) => item.id === editing.id ? result.goal : item));
        setNotice("Goal updated.");
      } else {
        const result = await apiRequest<{ goal: Goal }>("/api/goals", "POST", payload);
        setGoals((items) => [result.goal, ...items]);
        setNotice("Goal created.");
      }
      setEditing(null); setShowForm(false); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save goal."); }
    finally { setBusy(false); }
  }

  async function deleteGoal(goal: Goal) {
    if (!window.confirm(`Delete "${goal.title}"? Its tasks will stay in your list without a linked goal.`)) return;
    setError(""); setNotice("");
    try { await apiRequest("/api/goals", "DELETE", { id: goal.id }); setGoals((items) => items.filter((item) => item.id !== goal.id)); setNotice("Goal deleted."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete goal."); }
  }

  function openEdit(goal: Goal) { setEditing(goal); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditing(null); }

  return <div className="page-stack">
    <section className="page-intro"><div><span className="eyebrow">MAKE YOUR NEXT STEP CLEAR</span><h1>My learning goals</h1><p>Turn the skills you want into milestones you can actually reach.</p></div><button className="button button-primary" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={17} /> New goal</button></section>
    {notice ? <Notice kind="success">{notice}</Notice> : null}{error ? <Notice kind="error">{error}</Notice> : null}
    {showForm ? <section className="panel form-panel"><div className="section-heading"><div><span className="eyebrow">{editing ? "REFINE YOUR PLAN" : "START WITH A CLEAR TARGET"}</span><h2>{editing ? "Edit goal" : "Create a learning goal"}</h2></div><button className="icon-button" onClick={closeForm} aria-label="Close form"><X size={19} /></button></div><form className="entity-form" onSubmit={saveGoal} key={editing?.id ?? "new-goal"}><label className="field field-wide"><span>Goal title</span><input name="title" defaultValue={editing?.title ?? ""} placeholder="e.g. Build a React portfolio" minLength={3} maxLength={90} required /></label><label className="field field-wide"><span>Description</span><textarea name="description" defaultValue={editing?.description ?? ""} placeholder="What will achieving this goal look like?" rows={3} maxLength={500} /></label><label className="field"><span>Category</span><select name="category" defaultValue={editing?.category ?? "Frontend"}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Target date</span><input name="targetDate" type="date" defaultValue={editing?.targetDate ?? ""} /></label><div className="form-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create goal"}</button><button className="button button-quiet" type="button" onClick={closeForm}>Cancel</button></div></form></section> : null}
    <section className="panel"><div className="toolbar"><div className="toolbar-title"><Target size={20} /><strong>{goals.length} learning goal{goals.length === 1 ? "" : "s"}</strong></div><div className="toolbar-filters"><label className="search-control"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search goals" aria-label="Search goals" /></label><select aria-label="Filter goals by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div></div>
      {filtered.length ? <div className="manager-grid">{filtered.map((goal) => <GoalCard key={goal.id} goal={goal} tasks={tasks} onEdit={() => openEdit(goal)} onDelete={() => deleteGoal(goal)} />)}</div> : <EmptyState icon="goals" title={goals.length ? "No matching goals" : "Your goals are waiting"} description={goals.length ? "Try another search or category filter." : "Create a learning goal and give your next step a direction."} action={!goals.length ? <button className="button button-primary button-small" onClick={() => setShowForm(true)}>Create your first goal <Plus size={15} /></button> : undefined} />}
    </section>
  </div>;
}

function GoalCard({ goal, tasks, onEdit, onDelete }: { goal: Goal; tasks: Task[]; onEdit: () => void; onDelete: () => void }) {
  const item = getGoalProgress(goal, tasks);
  return <article className="entity-card"><div className="entity-card-top"><span className="entity-icon"><Target size={21} /></span><span className="category-pill">{goal.category}</span><div className="entity-actions"><button className="icon-button" onClick={onEdit} aria-label={`Edit ${goal.title}`}><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={onDelete} aria-label={`Delete ${goal.title}`}><Trash2 size={16} /></button></div></div><h3>{goal.title}</h3><p className="entity-description">{goal.description || "No description added yet."}</p><div className="entity-progress-label"><span>Progress</span><strong>{item.progress}%</strong></div><ProgressBar value={item.progress} label={`${goal.title} progress`} showValue={false} size="sm" /><div className="entity-card-footer"><span><CalendarDays size={14} /> {formatDate(goal.targetDate)}</span><span>{item.completedTasks}/{item.totalTasks} tasks</span></div></article>;
}
