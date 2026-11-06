"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Circle, Edit3, ListTodo, Plus, Search, Trash2, X } from "lucide-react";
import type { Goal, Priority, Task, TaskInput } from "@/lib/types";
import { apiRequest } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/shared/EmptyState";
import { Notice } from "@/components/shared/Notice";

 type TasksManagerProps = { initialTasks: Task[]; goals: Goal[]; searchQuery?: string };

export function TasksManager({ initialTasks, goals, searchQuery = "" }: TasksManagerProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [query, setQuery] = useState(searchQuery);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const filtered = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || (status === "Completed" ? task.completed : !task.completed);
    const matchesPriority = priority === "All" || task.priority === priority.toLowerCase();
    return matchesQuery && matchesStatus && matchesPriority;
  }).sort((a, b) => Number(a.completed) - Number(b.completed)), [tasks, query, status, priority]);

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload: TaskInput = { title: String(form.get("title") || ""), description: String(form.get("description") || ""), goalId: String(form.get("goalId") || "") || null, priority: String(form.get("priority") || "medium") as Priority, dueDate: String(form.get("dueDate") || "") || null };
    try {
      if (editing) {
        const result = await apiRequest<{ task: Task }>("/api/tasks", "PUT", { ...payload, id: editing.id, completed: editing.completed });
        setTasks((items) => items.map((item) => item.id === editing.id ? result.task : item)); setNotice("Task updated.");
      } else {
        const result = await apiRequest<{ task: Task }>("/api/tasks", "POST", payload);
        setTasks((items) => [result.task, ...items]); setNotice("Task created.");
      }
      setEditing(null); setShowForm(false); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save task."); }
    finally { setBusy(false); }
  }

  async function toggle(task: Task) {
    setError("");
    try { const result = await apiRequest<{ task: Task }>("/api/tasks", "PATCH", { id: task.id, action: "toggle" }); setTasks((items) => items.map((item) => item.id === task.id ? result.task : item)); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update task."); }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try { await apiRequest("/api/tasks", "DELETE", { id: task.id }); setTasks((items) => items.filter((item) => item.id !== task.id)); setNotice("Task deleted."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete task."); }
  }

  return <div className="page-stack">
    <section className="page-intro"><div><span className="eyebrow">TURN PLANS INTO ACTION</span><h1>Tasks</h1><p>Keep the next useful action visible and manageable.</p></div><button className="button button-primary" onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus size={17} /> Add task</button></section>
    {notice ? <Notice kind="success">{notice}</Notice> : null}{error ? <Notice kind="error">{error}</Notice> : null}
    {showForm ? <section className="panel form-panel"><div className="section-heading"><div><span className="eyebrow">ONE NEXT ACTION</span><h2>{editing ? "Edit task" : "Create a task"}</h2></div><button className="icon-button" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close form"><X size={19} /></button></div><form className="entity-form" onSubmit={saveTask} key={editing?.id ?? "new-task"}><label className="field field-wide"><span>Task title</span><input name="title" defaultValue={editing?.title ?? ""} placeholder="e.g. Build a responsive navbar" minLength={3} maxLength={100} required /></label><label className="field field-wide"><span>Description</span><textarea name="description" defaultValue={editing?.description ?? ""} placeholder="Optional details" rows={2} maxLength={500} /></label><label className="field"><span>Learning goal</span><select name="goalId" defaultValue={editing?.goalId ?? ""}><option value="">No linked goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select></label><label className="field"><span>Priority</span><select name="priority" defaultValue={editing?.priority ?? "medium"}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="field"><span>Due date</span><input type="date" name="dueDate" defaultValue={editing?.dueDate ?? ""} /></label><div className="form-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create task"}</button><button className="button button-quiet" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button></div></form></section> : null}
    <section className="panel"><div className="toolbar"><div className="toolbar-title"><ListTodo size={20} /><strong>{tasks.length} task{tasks.length === 1 ? "" : "s"}</strong></div><div className="toolbar-filters"><label className="search-control"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /></label><select aria-label="Filter task status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Pending</option><option>Completed</option></select><select aria-label="Filter priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div></div>
      {filtered.length ? <div className="task-manager-list">{filtered.map((task) => <article key={task.id} className={`task-row ${task.completed ? "task-row-completed" : ""}`}><button className={`task-check ${task.completed ? "task-check-done" : ""}`} onClick={() => toggle(task)} aria-label={task.completed ? `Mark ${task.title} as pending` : `Complete ${task.title}`}>{task.completed ? <Check size={16} /> : <Circle size={19} />}</button><div className="task-row-main"><strong>{task.title}</strong>{task.description ? <p>{task.description}</p> : null}<div className="task-row-meta"><span className={`priority-label priority-label-${task.priority}`}>{task.priority} priority</span><span><CalendarDays size={13} /> {formatDate(task.dueDate)}</span>{task.goalId ? <span>{goals.find((goal) => goal.id === task.goalId)?.title ?? "Unlinked goal"}</span> : null}</div></div><div className="entity-actions"><button className="icon-button" onClick={() => { setEditing(task); setShowForm(true); }} aria-label={`Edit ${task.title}`}><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={() => deleteTask(task)} aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button></div></article>)}</div> : <EmptyState icon="tasks" title={tasks.length ? "No tasks match these filters" : "Nothing on the list yet"} description={tasks.length ? "Change the search or filters to see more tasks." : "Add a small, specific action to get your learning moving."} action={!tasks.length ? <button className="button button-primary button-small" onClick={() => setShowForm(true)}>Add your first task <Plus size={15} /></button> : undefined} />}
    </section>
  </div>;
}
