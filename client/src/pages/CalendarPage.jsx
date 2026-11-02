import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/client';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function load() {
      try {
        const workspacesResponse = await api.get('/workspaces');
        const workspaces = workspacesResponse.data.workspaces || [];

        const projectTasks = await Promise.all(
          workspaces.map(async (workspace) => {
            const details = await api.get(`/workspaces/${workspace.id}`);
            const projects = details.data.projects || [];

            const tasksForWorkspace = await Promise.all(
              projects.map(async (project) => {
                const response = await api.get(`/tasks?projectId=${project.id}`);
                return (response.data.tasks || []).map((task) => ({
                  ...task,
                  projectName: project.name,
                  workspaceName: workspace.name
                }));
              })
            );

            return tasksForWorkspace.flat();
          })
        );

        setTasks(projectTasks.flat());
      } catch (error) {
        console.error('Failed to load calendar data', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOffset = monthStart.getDay();
  const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ day: null, key: `empty-${i}` });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({ day, key: `day-${day}` });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ day: null, key: `empty-end-${cells.length}` });
    }

    return cells;
  }, [startOffset, totalDays]);

  const tasksByDate = useMemo(() => {
    const map = {};

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      map[task.dueDate] = (map[task.dueDate] || []).concat(task);
    });

    return map;
  }, [tasks]);

  const upcomingTasks = useMemo(
    () => tasks.filter((task) => task.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5),
    [tasks]
  );

  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Delivery schedule</h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#283140] bg-[#111827] px-3 py-2 text-sm text-slate-300">
          <CalendarRange size={15} />
          {monthLabel}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section className="surface-soft rounded-[24px] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="rounded-xl border border-[#283140] bg-[#111827] p-2 text-slate-300"
              >
                <ChevronLeft size={15} />
              </button>
              <h2 className="text-xl font-semibold text-white">{monthLabel}</h2>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="rounded-xl border border-[#283140] bg-[#111827] p-2 text-slate-300"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.14em] text-slate-500">
            {weekDays.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarCells.map((cell) => {
              if (!cell.day) {
                return <div key={cell.key} className="h-24 rounded-2xl border border-dashed border-[#1b2430] bg-[#0b0f14]" />;
              }

              const dateKey = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), cell.day).toISOString().slice(0, 10);
              const dayTasks = tasksByDate[dateKey] || [];

              return (
                <div key={cell.key} className="min-h-24 rounded-2xl border border-[#283140] bg-[#0d1117] p-2">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-200">{cell.day}</span>
                    {dayTasks.length > 0 && <span className="text-indigo-300">{dayTasks.length}</span>}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div key={task.id} className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-1 text-[10px] text-indigo-100">
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="surface-soft rounded-[24px] p-4">
            <h2 className="text-lg font-semibold text-white">Upcoming deadlines</h2>
            <div className="mt-4 space-y-3">
              {upcomingTasks.length ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                    <div className="text-sm font-medium text-white">{task.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{task.projectName}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.12em] text-indigo-300">{task.dueDate}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#283140] bg-[#0d1117] p-4 text-sm text-slate-400">
                  No due dates assigned yet.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
