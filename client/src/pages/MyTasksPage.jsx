import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCheck, Filter, Search, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';

const tabs = [
  { id: 'ALL', label: 'All' },
  { id: 'TODAY', label: 'Today' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'COMPLETED', label: 'Completed' }
];

const priorityClasses = {
  LOW: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
  HIGH: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
  URGENT: 'bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-500/20'
};

function formatDueDate(date) {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function MyTasksPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const workspacesResponse = await api.get('/workspaces');
        const workspaces = workspacesResponse.data.workspaces || [];
        if (!workspaces.length) {
          setTasks([]);
          setWorkspaceId('');
          return;
        }

        const workspace = workspaces[0];
        setWorkspaceId(workspace.id);

        const workspaceDetails = await api.get(`/workspaces/${workspace.id}`);
        const currentProjects = workspaceDetails.data.projects || [];

        const tasksByProject = await Promise.all(
          currentProjects.map(async (project) => {
            const response = await api.get(`/tasks?projectId=${project.id}`);
            return (response.data.tasks || []).map((task) => ({
              ...task,
              workspaceName: workspace.name,
              projectName: project.name
            }));
          })
        );

        setTasks(tasksByProject.flat());
      } catch (error) {
        console.error('Failed to fetch tasks', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const visibleTasks = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !normalized ||
        task.title.toLowerCase().includes(normalized) ||
        task.description.toLowerCase().includes(normalized) ||
        task.projectName.toLowerCase().includes(normalized);

      if (!matchesSearch) return false;

      const today = new Date();
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      switch (activeTab) {
        case 'TODAY':
          return dueDate && dueDate.toDateString() === today.toDateString();
        case 'UPCOMING':
          return dueDate && dueDate > today && task.status !== 'DONE';
        case 'OVERDUE':
          return dueDate && dueDate < today && task.status !== 'DONE';
        case 'COMPLETED':
          return task.status === 'DONE';
        default:
          return true;
      }
    });
  }, [activeTab, search, tasks]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">My tasks</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Focus on the work that matters</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#283140] bg-[#111827] px-3 py-2 text-sm text-slate-300">
          <CalendarClock size={15} />
          {workspaceId ? 'Workspace view' : 'No workspace'}
        </div>
      </header>

      <section className="surface-soft rounded-[24px] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-[#6366f1] text-white'
                    : 'border border-[#283140] bg-[#111827] text-slate-300 hover:border-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input-shell pl-9"
                placeholder="Search tasks"
              />
            </div>
            <button type="button" className="secondary-btn">
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {loading ? (
          <div className="surface-soft rounded-[24px] p-8 text-slate-400">Loading tasks...</div>
        ) : visibleTasks.length ? (
          visibleTasks.map((task) => (
            <article key={task.id} className="surface-soft rounded-[24px] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg border border-[#283140] bg-[#0d1117] p-2 text-slate-300">
                    <CheckCheck size={15} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-white">{task.title}</h2>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityClasses[task.priority] || priorityClasses.MEDIUM}`}>
                        {task.priority || 'MEDIUM'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{task.projectName} · {task.workspaceName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="rounded-full border border-[#283140] bg-[#0d1117] px-2.5 py-1 text-xs uppercase tracking-[0.1em] text-slate-300">
                    {task.status}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#283140] bg-[#0d1117] px-2.5 py-1 text-xs text-slate-300">
                    <CalendarClock size={12} />
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{task.description || 'No description provided yet.'}</p>
            </article>
          ))
        ) : (
          <div className="surface-soft rounded-[24px] p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#283140] bg-[#111827] text-slate-300">
              <Filter size={18} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">No tasks match this view</h2>
            <p className="mt-2 text-sm text-slate-400">Try another tab or create a fresh task in your project board.</p>
          </div>
        )}
      </section>
    </div>
  );
}
