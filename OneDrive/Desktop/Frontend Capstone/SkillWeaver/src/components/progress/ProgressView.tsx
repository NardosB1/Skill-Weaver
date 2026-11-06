import { Activity, Award, CheckCircle2, Clock3, Target, TrendingUp } from "lucide-react";
import type { WorkspaceData } from "@/lib/types";
import { getGoalProgress, getWorkspaceStats } from "@/lib/format";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";

type ProgressViewProps = { workspace: WorkspaceData };

export function ProgressView({ workspace }: ProgressViewProps) {
  const stats = getWorkspaceStats(workspace);
  const goals = workspace.goals.map((goal) => getGoalProgress(goal, workspace.tasks));
  const completed = workspace.tasks.filter((task) => task.completed);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      count: completed.filter((task) => task.completedAt?.slice(0, 10) === key).length,
    };
  });
  const maxCount = Math.max(1, ...days.map((day) => day.count));
  const maxStreak = days.reduce((streak, day) => day.count > 0 ? streak + 1 : 0, 0);

  return <div className="page-stack">
    <section className="page-intro"><div><span className="eyebrow">NOTICE THE WORK YOU'RE DOING</span><h1>Your progress</h1><p>Use your activity to spot patterns, celebrate follow-through, and choose the next step.</p></div><span className="intro-icon"><TrendingUp size={24} /></span></section>
    <section className="stats-grid progress-stats"><article className="stat-card"><span className="stat-icon stat-icon-cyan"><Target size={21} /></span><div><p>Learning goals</p><strong>{stats.activeGoals}</strong><small>Goals you're working toward</small></div></article><article className="stat-card"><span className="stat-icon stat-icon-blue"><CheckCircle2 size={21} /></span><div><p>Completed tasks</p><strong>{stats.completedTasks}</strong><small>Finished actions</small></div></article><article className="stat-card"><span className="stat-icon stat-icon-violet"><Award size={21} /></span><div><p>Average progress</p><strong>{stats.averageProgress}%</strong><small>Across all goals</small></div></article></section>
    <section className="panel chart-panel"><div className="section-heading"><div><span className="eyebrow">LAST SEVEN DAYS</span><h2>Weekly activity</h2><p className="section-subtitle">Tasks you marked complete each day.</p></div><span className="chart-total"><Activity size={17} /> {days.reduce((sum, day) => sum + day.count, 0)} completed</span></div><div className="bar-chart" role="img" aria-label={`Weekly task activity: ${days.map((day) => `${day.label} ${day.count}`).join(", ")}`}><div className="chart-y-labels"><span>{maxCount}</span><span>{Math.ceil(maxCount / 2)}</span><span>0</span></div><div className="chart-columns">{days.map((day) => <div className="chart-column" key={day.label}><span className="chart-count">{day.count || ""}</span><div className="chart-bar-track"><div className="chart-bar" style={{ height: `${Math.max(day.count ? 12 : 3, (day.count / maxCount) * 100)}%` }} /></div><span className="chart-day">{day.label}</span></div>)}</div></div></section>
    <div className="progress-bottom-grid"><section className="panel"><div className="section-heading"><div><span className="eyebrow">BY GOAL</span><h2>Goal breakdown</h2></div></div>{goals.length ? <div className="goal-breakdown-list">{goals.map((goal) => <div className="goal-breakdown-item" key={goal.id}><div className="goal-breakdown-heading"><strong>{goal.title}</strong><span>{goal.progress}%</span></div><ProgressBar value={goal.progress} label={`${goal.title} completion`} showValue={false} size="sm" /><small>{goal.completedTasks} of {goal.totalTasks} linked tasks completed</small></div>)}</div> : <EmptyState icon="goals" title="No progress to chart yet" description="Create a goal and link tasks to it. Your progress will appear here." />}</section><section className="panel"><div className="section-heading"><div><span className="eyebrow">YOUR RHYTHM</span><h2>Activity notes</h2></div></div><div className="activity-note"><span className="activity-note-icon"><Clock3 size={19} /></span><div><strong>{stats.dueToday} tasks due today</strong><p>Keep today's list realistic. You can adjust dates from the Tasks page.</p></div></div><div className="activity-note"><span className="activity-note-icon"><CheckCircle2 size={19} /></span><div><strong>{stats.completedTasks} tasks completed overall</strong><p>Every checked task contributes to your learning picture.</p></div></div><div className="activity-note"><span className="activity-note-icon"><TrendingUp size={19} /></span><div><strong>{maxStreak} consecutive active days at the end of this week</strong><p>This is a simple recent activity indicator, not a lifetime streak.</p></div></div></section></div>
  </div>;
}
