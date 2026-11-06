"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Circle, Clock3, Code2, GraduationCap, Plus, Sparkles, Target, TrendingUp } from "lucide-react";
import type { Goal, Task, User, WorkspaceData } from "@/lib/types";
import { appDateKey, formatDate, getGoalProgress, getWorkspaceStats } from "@/lib/format";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";

type DashboardViewProps = { user: User; workspace: WorkspaceData; todayLabel: string };

export function DashboardView({ user, workspace, todayLabel }: DashboardViewProps) {
  const stats = getWorkspaceStats(workspace);
  const currentGoal = workspace.goals.map((goal) => getGoalProgress(goal, workspace.tasks)).sort((a, b) => b.progress - a.progress)[0];
  const pendingTasks = workspace.tasks.filter((task) => !task.completed).slice(0, 4);
  const featuredGoals = workspace.goals.slice(0, 3);

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div><span className="eyebrow">{todayLabel.toUpperCase()}</span><h1>Welcome back, {user.name.split(" ")[0]}.</h1><p>Small steps. Real progress. Your next chapter starts here.</p><div className="welcome-actions"><Link href="/goals" className="button button-primary"><Plus size={17} /> New learning goal</Link><Link href="/tasks" className="button button-quiet">View tasks <ArrowRight size={16} /></Link></div></div>
        <div className="welcome-art" aria-hidden="true"><div className="welcome-art-orbit orbit-one" /><div className="welcome-art-orbit orbit-two" /><div className="welcome-art-core"><GraduationCap size={47} /></div><span className="art-spark art-spark-one">✦</span><span className="art-spark art-spark-two">✧</span></div>
      </section>

      <section className="stats-grid" aria-label="Learning summary">
        <article className="stat-card"><span className="stat-icon stat-icon-cyan"><Target size={21} /></span><div><p>Active learning goals</p><strong>{stats.activeGoals}</strong><small>{stats.activeGoals ? "Keep your momentum going" : "Start with one clear goal"}</small></div><span className="stat-trend"><ArrowUpRight size={16} /></span></article>
        <article className="stat-card"><span className="stat-icon stat-icon-blue"><CheckCircle2 size={21} /></span><div><p>Tasks completed</p><strong>{stats.completedTasks}<em> / {stats.totalTasks}</em></strong><small>{stats.totalTasks ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% of all tasks` : "Your first win is waiting"}</small></div><span className="stat-trend"><CheckCircle2 size={16} /></span></article>
        <article className="stat-card"><span className="stat-icon stat-icon-violet"><TrendingUp size={21} /></span><div><p>Average goal progress</p><strong>{stats.averageProgress}%</strong><small>{stats.averageProgress ? "Across your learning goals" : "Progress grows with tasks"}</small></div><span className="stat-trend"><ArrowUpRight size={16} /></span></article>
      </section>

      <div className="dashboard-main-grid">
        <section className="panel current-goal-panel"><div className="section-heading"><div><span className="eyebrow">YOUR FOCUS</span><h2>Current learning goal</h2></div><Link href="/goals" className="text-link">All goals <ArrowRight size={15} /></Link></div>
          {currentGoal ? <><div className="current-goal-title"><span className="goal-symbol"><Code2 size={22} /></span><div><h3>{currentGoal.title}</h3><p>{currentGoal.category} · {currentGoal.totalTasks} linked tasks</p></div><strong>{currentGoal.progress}%</strong></div><ProgressBar value={currentGoal.progress} label={`${currentGoal.title} progress`} /><div className="goal-panel-footer"><span><Clock3 size={15} /> Target: {formatDate(currentGoal.targetDate)}</span><span>{currentGoal.completedTasks} of {currentGoal.totalTasks} tasks completed</span></div></> : <EmptyState icon="goals" title="Your next goal starts here" description="Add a learning goal to give your effort a clear direction." action={<Link href="/goals" className="button button-primary button-small">Create a goal <ArrowRight size={15} /></Link>} />}
        </section>
        <section className="panel sprint-panel"><div className="section-heading"><div><span className="eyebrow">MAKE TODAY COUNT</span><h2>Today's sprint</h2></div><Link href="/tasks" className="text-link">See all <ArrowRight size={15} /></Link></div>
          {pendingTasks.length ? <div className="sprint-list">{pendingTasks.map((task) => <SprintTask key={task.id} task={task} />)}</div> : <EmptyState icon="tasks" title="A clear slate" description="No pending tasks right now. Add one small next step." action={<Link href="/tasks" className="button button-quiet button-small">Add a task <Plus size={15} /></Link>} />}
          <div className="sprint-footer"><span>{stats.dueToday} task{stats.dueToday === 1 ? "" : "s"} due today</span><Link href="/tasks">Plan your day <ArrowRight size={14} /></Link></div>
        </section>
      </div>

      <section className="panel goals-panel"><div className="section-heading"><div><span className="eyebrow">YOUR BIG PICTURE</span><h2>Learning goals</h2></div><Link href="/goals" className="text-link">Manage goals <ArrowRight size={15} /></Link></div>
        {featuredGoals.length ? <div className="goal-card-grid">{featuredGoals.map((goal) => <GoalPreview key={goal.id} goal={goal} tasks={workspace.tasks} />)}</div> : <EmptyState icon="goals" title="No goals yet" description="Create your first goal, then break it into tasks you can finish one at a time." action={<Link href="/goals" className="button button-primary button-small">Create first goal <Plus size={15} /></Link>} />}
      </section>

      <section className="insight-strip"><span className="insight-icon"><Sparkles size={20} /></span><div><strong>A useful reminder</strong><p>Build a rhythm you can repeat. A small finished task is better than an ambitious plan that stays untouched.</p></div><Link href="/progress" className="text-link">View progress <ArrowRight size={15} /></Link></section>
    </div>
  );
}


function SprintTask({ task }: { task: Task }) {
  return <div className="sprint-item"><span className="task-unchecked"><Circle size={20} /></span><span className="sprint-item-title">{task.title}</span><span className={`priority-dot priority-${task.priority}`} title={`${task.priority} priority`} /></div>;
}

function GoalPreview({ goal, tasks }: { goal: Goal; tasks: Task[] }) {
  const item = getGoalProgress(goal, tasks);
  return <Link href="/goals" className="goal-preview-card"><span className="goal-preview-icon"><BookOpen size={21} /></span><span className="goal-preview-category">{goal.category}</span><strong>{goal.title}</strong><ProgressBar value={item.progress} label={`${goal.title} progress`} size="sm" /><span className="goal-preview-meta">{item.completedTasks}/{item.totalTasks} tasks · {formatDate(goal.targetDate)}</span></Link>;
}
