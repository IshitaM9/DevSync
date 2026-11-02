import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, FolderOpen, FolderPlus, ListTodo, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const chartColors = ['#06b6d4', '#f59e0b', '#10b981'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalMembers: 0,
    tasksCompleted: 0,
    tasksInProgress: 0,
    distribution: { TODO: 0, IN_PROGRESS: 0, DONE: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [projectForm, setProjectForm] = useState({ workspaceId: '', name: '', description: '' });
  const [projectMessage, setProjectMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/workspaces');
        const activeWorkspaces = response.data.workspaces || [];
        setWorkspaces(activeWorkspaces);

        if (activeWorkspaces[0]) {
          setProjectForm((prev) => ({ ...prev, workspaceId: activeWorkspaces[0].id }));
          const analyticsResponse = await api.get(`/workspaces/${activeWorkspaces[0].id}/analytics`);
          setAnalytics(analyticsResponse.data.analytics || analytics);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const pieData = useMemo(
    () => [
      { name: 'Todo', value: analytics.distribution.TODO, fill: chartColors[0] },
      { name: 'In progress', value: analytics.distribution.IN_PROGRESS, fill: chartColors[1] },
      { name: 'Done', value: analytics.distribution.DONE, fill: chartColors[2] }
    ],
    [analytics.distribution]
  );

  const statCards = [
    { label: 'Active projects', value: analytics.totalProjects, icon: FolderOpen, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Team members', value: analytics.totalMembers, icon: Users, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Tasks complete', value: analytics.tasksCompleted, icon: ListTodo, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Velocity', value: `${Math.max(0, analytics.tasksCompleted * 5)}%`, icon: Activity, tone: 'bg-amber-50 text-amber-600' }
  ];

  const handleCreateProject = async (event) => {
    event.preventDefault();
    try {
      await api.post('/projects', projectForm);
      setProjectMessage('Project created successfully.');
      setProjectForm((prev) => ({ ...prev, name: '', description: '' }));
      const ws = projectForm.workspaceId || workspaces[0]?.id;
      const response = await api.get(`/workspaces/${ws}/analytics`);
      setAnalytics(response.data.analytics || analytics);
    } catch (error) {
      setProjectMessage(error.message || 'Project creation failed.');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{user?.name || 'Your workspace'}</h1>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110">
          <FolderPlus size={16} />
          New project
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.tone}`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Your workspaces</h2>
              <p className="text-sm text-slate-400">Quick access to active spaces and projects.</p>
            </div>
            <Link to="/workspaces" className="link">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="h-18 animate-pulse rounded-2xl border border-[#283140] bg-[#101827]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <Link key={workspace.id} to={`/workspaces/${workspace.id}`} className="block rounded-2xl border border-[#283140] bg-[#0d1117] p-4 transition hover:border-indigo-500/40 hover:bg-[#111827]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{workspace.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{workspace.description}</p>
                    </div>
                    <span className="badge badge-emerald">Active</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold text-white">Team activity</h2>
          <div className="mt-6 space-y-4">
            {[
              ['Aarav updated onboarding checklist', '3 hours ago'],
              ['Nisha scheduled a sprint review', 'Today'],
              ['Chetan commented on launch copy', 'Yesterday']
            ].map(([text, time]) => (
              <div key={text} className="flex gap-3 rounded-xl border border-[#283140] bg-[#0d1117] p-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
                <div>
                  <p className="text-sm font-medium text-slate-100">{text}</p>
                  <p className="text-xs text-slate-400">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1.1fr]">
        <section className="card p-6">
          <h2 className="text-xl font-semibold text-white">Project analytics</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b374a" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #283140',
                    borderRadius: '12px',
                    color: '#e2e8f0'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold text-white">Quick project setup</h2>
          <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Workspace</label>
              <select
                value={projectForm.workspaceId}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, workspaceId: e.target.value }))}
                className="w-full rounded-xl border border-[#283140] bg-[#0d1117] px-3 py-2.5 text-slate-100 outline-none transition focus:border-indigo-500"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Project name</label>
              <input
                value={projectForm.name}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-[#283140] bg-[#0d1117] px-3 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500"
                placeholder="Launch portal refresh"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full rounded-xl border border-[#283140] bg-[#0d1117] px-3 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500"
                placeholder="Define the project scope and primary outcome."
              />
            </div>

            {projectMessage ? <p className="text-sm text-emerald-400">{projectMessage}</p> : null}

            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110">
              <ArrowUpRight size={16} />
              Create project
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
