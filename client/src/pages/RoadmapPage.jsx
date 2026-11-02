import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, MapPinned, Target } from 'lucide-react';
import api from '../api/client';

const statusTone = {
  TODO: 'badge badge-amber',
  IN_PROGRESS: 'badge badge-indigo',
  DONE: 'badge badge-emerald'
};

export default function RoadmapPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const response = await api.get('/workspaces');
        const workspaces = response.data.workspaces || [];

        const projectData = await Promise.all(
          workspaces.map(async (workspace) => {
            const workspaceDetails = await api.get(`/workspaces/${workspace.id}`);
            const workspaceProjects = workspaceDetails.data.projects || [];

            const projectTasks = await Promise.all(
              workspaceProjects.map(async (project) => {
                const tasksResponse = await api.get(`/tasks?projectId=${project.id}`);
                return {
                  ...project,
                  workspaceName: workspace.name,
                  tasks: tasksResponse.data.tasks || []
                };
              })
            );

            return projectTasks;
          })
        );

        setProjects(projectData.flat());
      } catch (error) {
        console.error('Failed to load roadmap', error);
      } finally {
        setLoading(false);
      }
    }

    loadRoadmap();
  }, []);

  const milestoneGroups = useMemo(() => {
    return projects
      .filter((project) => project.tasks?.length)
      .map((project) => {
        const orderedTasks = [...project.tasks].sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
        const upcoming = orderedTasks.filter((task) => task.dueDate && new Date(task.dueDate) >= new Date());
        return {
          ...project,
          tasks: orderedTasks,
          nextMilestone: upcoming[0] || orderedTasks[0]
        };
      })
      .sort((a, b) => new Date(a.nextMilestone?.dueDate || 0) - new Date(b.nextMilestone?.dueDate || 0));
  }, [projects]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">Roadmap</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Delivery timeline</h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#283140] bg-[#111827] px-3 py-2 text-sm text-slate-300">
          <CalendarRange size={15} />
          {projects.length} active projects
        </div>
      </header>

      {loading ? (
        <div className="surface-soft rounded-[24px] p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-700/80" />
          <div className="mt-5 space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-700/60" />
            ))}
          </div>
        </div>
      ) : milestoneGroups.length === 0 ? (
        <div className="surface-soft rounded-[24px] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
            <MapPinned size={22} />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">No roadmap entries yet</h2>
          <p className="mt-2 text-sm text-slate-400">Create or assign tasks to project milestones to populate the delivery timeline.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestoneGroups.map((project) => (
            <section key={project.id} className="surface-soft rounded-[24px] p-5">
              <div className="flex flex-col gap-3 border-b border-[#283140] pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-indigo-300">
                    <Target size={15} />
                    {project.workspaceName}
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white">{project.name}</h2>
                </div>

                <div className="text-sm text-slate-400">
                  {project.nextMilestone?.dueDate ? `Next milestone: ${project.nextMilestone.dueDate}` : 'No due date assigned'}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {project.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="rounded-2xl border border-[#283140] bg-[#0d1117] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className={statusTone[task.status] || 'badge badge-indigo'}>{task.status.replace('_', ' ')}</span>
                      <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{task.priority}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">{task.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-400">{task.description || 'No description provided for this task.'}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>{task.dueDate || 'No due date'}</span>
                      <span>{task.assigneeId || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
