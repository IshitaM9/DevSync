import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, FolderOpen, Search, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const statusClasses = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20',
  ARCHIVED: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/20',
  DRAFT: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20'
};

export default function ProjectsPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/workspaces');
        const currentWorkspaces = response.data.workspaces || [];
        setWorkspaces(currentWorkspaces);

        if (currentWorkspaces.length) {
          const primaryWorkspace = currentWorkspaces[0];
          setSelectedWorkspaceId(primaryWorkspace.id);
          const details = await api.get(`/workspaces/${primaryWorkspace.id}`);
          const projectList = details.data.projects || [];
          setProjects(projectList);
          setMembers(details.data.members || []);
        }
      } catch (error) {
        console.error('Failed to load projects', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function loadWorkspaceProjects() {
      if (!selectedWorkspaceId) return;

      try {
        const details = await api.get(`/workspaces/${selectedWorkspaceId}`);
        setProjects(details.data.projects || []);
        setMembers(details.data.members || []);
      } catch (error) {
        console.error('Failed to load selected workspace projects', error);
      }
    }

    loadWorkspaceProjects();
  }, [selectedWorkspaceId]);

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (!query) return true;
      return (
        project.name.toLowerCase().includes(query) ||
        (project.description || '').toLowerCase().includes(query)
      );
    });
  }, [projects, search]);

  const overview = useMemo(() => {
    const activeCount = projects.filter((project) => project.status === 'ACTIVE').length;
    const draftCount = projects.filter((project) => project.status === 'DRAFT').length;
    return { activeCount, draftCount, memberCount: members.length };
  }, [members.length, projects]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Portfolio and delivery work</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedWorkspaceId}
            onChange={(event) => setSelectedWorkspaceId(event.target.value)}
            className="input-shell max-w-[220px]"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
            ))}
          </select>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="kpi-label">Active projects</div>
              <div className="kpi-value">{overview.activeCount}</div>
            </div>
            <div className="rounded-xl border border-[#283140] bg-[#111827] p-3 text-indigo-300">
              <FolderOpen size={18} />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="kpi-label">Drafts</div>
              <div className="kpi-value">{overview.draftCount}</div>
            </div>
            <div className="rounded-xl border border-[#283140] bg-[#111827] p-3 text-amber-300">
              <Sparkles size={18} />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="kpi-label">Team members</div>
              <div className="kpi-value">{overview.memberCount}</div>
            </div>
            <div className="rounded-xl border border-[#283140] bg-[#111827] p-3 text-emerald-300">
              <Users size={18} />
            </div>
          </div>
        </div>
      </section>

      <section className="surface-soft rounded-[24px] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-shell pl-9"
              placeholder="Search projects"
            />
          </div>
          <button type="button" className="primary-btn">
            <ArrowUpRight size={15} />
            New project
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full surface-soft rounded-[24px] p-8 text-slate-400">Loading project portfolio...</div>
        ) : visibleProjects.length ? (
          visibleProjects.map((project) => (
            <Link key={project.id} to={`/workspaces/${selectedWorkspaceId}`} className="surface-soft rounded-[24px] p-5 transition hover:border-indigo-500/40 hover:bg-[#121c2b]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Project</div>
                  <h2 className="mt-2 text-xl font-semibold text-white">{project.name}</h2>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusClasses[project.status] || statusClasses.ACTIVE}`}>
                  {project.status || 'ACTIVE'}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">{project.description || 'No description provided yet.'}</p>

              <div className="mt-5 rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-500">
                  <span>Progress</span>
                  <span>72%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#1a2430]">
                  <div className="h-full w-[72%] rounded-full bg-[#8b7cff]" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full surface-soft rounded-[24px] p-10 text-center text-slate-400">
            No projects match your search in this workspace.
          </div>
        )}
      </section>
    </div>
  );
}
