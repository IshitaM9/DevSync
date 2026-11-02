import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, CalendarDays, CheckCircle2, FolderOpen, ListTodo, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

const tabs = ['Overview', 'Board', 'List', 'Timeline', 'Activity'];

const statusColors = {
  TODO: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/20',
  IN_PROGRESS: 'bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20',
  IN_REVIEW: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
  DONE: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
};

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const workspacesResponse = await api.get('/workspaces');
        const workspaces = workspacesResponse.data.workspaces || [];
        let foundWorkspace = null;
        let foundProject = null;

        for (const item of workspaces) {
          const details = await api.get(`/workspaces/${item.id}`);
          const match = (details.data.projects || []).find((projectItem) => projectItem.id === projectId);
          if (match) {
            foundWorkspace = item;
            foundProject = match;
            break;
          }
        }

        if (!foundProject || !foundWorkspace) {
          setProject(null);
          setWorkspace(null);
          return;
        }

        setWorkspace(foundWorkspace);
        setProject(foundProject);

        const taskResponse = await api.get(`/tasks?projectId=${projectId}`);
        setTasks(taskResponse.data.tasks || []);
      } catch (error) {
        console.error('Failed to load project details', error);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'DONE').length;
    const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
    const review = tasks.filter((task) => task.status === 'IN_REVIEW').length;
    const dueSoon = tasks.filter((task) => task.dueDate).length;

    return {
      total,
      completed,
      inProgress,
      review,
      dueSoon,
      progress: total ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  const tasksByStatus = useMemo(() => ({
    TODO: tasks.filter((task) => task.status === 'TODO'),
    IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS'),
    IN_REVIEW: tasks.filter((task) => task.status === 'IN_REVIEW'),
    DONE: tasks.filter((task) => task.status === 'DONE')
  }), [tasks]);

  if (loading) {
    return <div className="surface-soft rounded-[24px] p-10 text-slate-400">Loading project details...</div>;
  }

  if (!project || !workspace) {
    return <div className="surface-soft rounded-[24px] p-10 text-center text-slate-400">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border border-[#283140] bg-[#111827] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">{workspace.name}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{project.description || 'Project overview for the current engagement.'}</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-[#283140] bg-[#0d1117] px-3 py-2 text-sm text-slate-300">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            {project.status || 'ACTIVE'}
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="kpi-card">
          <div className="kpi-label">Total tasks</div>
          <div className="kpi-value">{stats.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Completed</div>
          <div className="kpi-value">{stats.completed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">In progress</div>
          <div className="kpi-value">{stats.inProgress}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Progress</div>
          <div className="kpi-value">{stats.progress}%</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              activeTab === tab ? 'bg-[#6366f1] text-white' : 'border border-[#283140] bg-[#111827] text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-4">
            <section className="surface-soft rounded-[24px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Project summary</h2>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#283140] bg-[#0d1117] px-2.5 py-1 text-xs text-slate-300">
                  <ArrowUpRight size={12} />
                  {stats.progress}% complete
                </div>
              </div>

              <div className="rounded-2xl border border-[#283140] bg-[#0d1117] p-4">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-500">
                  <span>Delivery progress</span>
                  <span>{stats.progress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#1a2430]">
                  <div className="h-full rounded-full bg-[#8b7cff]" style={{ width: `${stats.progress}%` }} />
                </div>
              </div>
            </section>

            <section className="surface-soft rounded-[24px] p-4">
              <h2 className="text-lg font-semibold text-white">Latest tasks</h2>
              <div className="mt-4 space-y-3">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-white">{task.title}</div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusColors[task.status] || statusColors.TODO}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">{task.description || 'No description provided.'}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="surface-soft rounded-[24px] p-4">
              <h2 className="text-lg font-semibold text-white">Project members</h2>
              <div className="mt-4 space-y-3">
                {['user_demo', 'user_nisha', 'user_chetan'].map((member) => (
                  <div key={member} className="flex items-center justify-between rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6366f1] text-xs font-semibold text-white">AS</div>
                      <div>
                        <div className="text-sm font-medium text-white">Team member</div>
                        <div className="text-xs text-slate-400">Member</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}

      {activeTab === 'Board' && (
        <div className="grid gap-4 xl:grid-cols-4">
          {Object.entries(tasksByStatus).map(([status, laneTasks]) => (
            <div key={status} className="surface-soft rounded-[24px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">{status.replace('_', ' ')}</h2>
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[#283140] bg-[#0d1117] px-2 text-xs text-slate-300">{laneTasks.length}</span>
              </div>

              <div className="space-y-3">
                {laneTasks.length ? (
                  laneTasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-[#283140] bg-[#111827] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-white">{task.title}</div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusColors[task.status] || statusColors.TODO}`}>
                          {task.priority || 'MEDIUM'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">{task.dueDate || 'No due date'}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#283140] bg-[#0d1117] p-4 text-sm text-slate-400">No tasks here.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'List' && (
        <section className="surface-soft rounded-[24px] p-4">
          <div className="overflow-hidden rounded-2xl border border-[#283140]">
            <table className="min-w-full divide-y divide-[#283140] text-left text-sm text-slate-300">
              <thead className="bg-[#0d1117] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#283140] bg-[#111827]">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-3 font-medium text-white">{task.title}</td>
                    <td className="px-4 py-3">{task.status}</td>
                    <td className="px-4 py-3">{task.dueDate || '—'}</td>
                    <td className="px-4 py-3">{task.priority || 'MEDIUM'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'Timeline' && (
        <section className="surface-soft rounded-[24px] p-4">
          <div className="space-y-4">
            {tasks.filter((task) => task.dueDate).map((task) => (
              <div key={task.id} className="flex gap-4 rounded-2xl border border-[#283140] bg-[#0d1117] p-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300">
                  <CalendarDays size={15} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{task.title}</div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusColors[task.status] || statusColors.TODO}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{task.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'Activity' && (
        <section className="surface-soft rounded-[24px] p-4">
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex gap-4 rounded-2xl border border-[#283140] bg-[#0d1117] p-4">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                  <Activity size={15} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{task.title}</div>
                  <div className="mt-1 text-sm text-slate-400">Status changed to {task.status || 'TODO'} · {index + 1}h ago</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
