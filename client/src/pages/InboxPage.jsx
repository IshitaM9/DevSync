import { useEffect, useMemo, useState } from 'react';
import { BellRing, Inbox as InboxIcon, Sparkles } from 'lucide-react';
import api from '../api/client';

const TYPE_STYLES = {
  task: 'badge badge-indigo',
  project: 'badge badge-emerald',
  workspace: 'badge badge-amber',
  default: 'badge badge-slate'
};

export default function InboxPage() {
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInbox() {
      try {
        const notificationsResponse = await api.get('/notifications');
        const allNotifications = notificationsResponse.data.notifications || [];
        setNotifications(allNotifications);

        const workspacesResponse = await api.get('/workspaces');
        const workspaces = workspacesResponse.data.workspaces || [];

        const taskLists = await Promise.all(
          workspaces.map(async (workspace) => {
            const workspaceDetails = await api.get(`/workspaces/${workspace.id}`);
            const projects = workspaceDetails.data.projects || [];

            const projectTasks = await Promise.all(
              projects.map(async (project) => {
                const tasksResponse = await api.get(`/tasks?projectId=${project.id}`);
                return (tasksResponse.data.tasks || []).map((task) => ({
                  ...task,
                  projectName: project.name,
                  workspaceName: workspace.name
                }));
              })
            );

            return projectTasks.flat();
          })
        );

        setTasks(taskLists.flat().slice(0, 6));
      } catch (error) {
        console.error('Failed to load inbox', error);
      } finally {
        setLoading(false);
      }
    }

    loadInbox();
  }, []);

  const recentItems = useMemo(
    () => [
      ...notifications.map((notification) => ({
        id: notification.id,
        kind: 'notification',
        title: notification.message,
        meta: notification.type?.toUpperCase() || 'UPDATE',
        date: notification.createdAt
      })),
      ...tasks.map((task) => ({
        id: task.id,
        kind: 'task',
        title: `${task.title} · ${task.projectName}`,
        meta: task.status,
        date: task.dueDate || task.createdAt
      }))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    [notifications, tasks]
  );

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">Inbox</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Activity and updates</h1>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-[#283140] bg-[#111827] px-3 py-2 text-sm text-slate-300">
          <BellRing size={15} />
          {notifications.length} unread updates
        </div>
      </header>

      {loading ? (
        <div className="surface-soft rounded-[24px] p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-700/80" />
          <div className="mt-5 space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-700/60" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="surface-soft rounded-[24px] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Latest activity</h2>
            </div>

            <div className="space-y-3">
              {recentItems.length ? (
                recentItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#283140] bg-[#0d1117] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={item.kind === 'notification' ? TYPE_STYLES[item.meta.toLowerCase()] || TYPE_STYLES.default : 'badge badge-indigo'}>
                            {item.kind === 'notification' ? item.meta : item.meta}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{item.kind}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-200">{item.title}</p>
                      </div>
                      <div className="text-[11px] text-slate-500">{item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#283140] bg-[#0d1117] p-6 text-center text-sm text-slate-400">
                  No updates found in your inbox.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="surface-soft rounded-[24px] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                  <InboxIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Priority queue</h3>
                  <p className="text-sm text-slate-400">Recently due work</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {tasks.length ? (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                      <div className="text-sm font-medium text-white">{task.title}</div>
                      <div className="mt-1 text-xs text-slate-400">{task.projectName}</div>
                      <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-slate-400">
                        <span>{task.status}</span>
                        <span>{task.dueDate || 'No date'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#283140] bg-[#0d1117] p-4 text-sm text-slate-400">
                    No high-priority tasks currently queued.
                  </div>
                )}
              </div>
            </div>

            <div className="surface-soft rounded-[24px] p-4">
              <div className="flex items-center gap-3 text-indigo-300">
                <Sparkles size={18} />
                <span className="text-sm font-medium uppercase tracking-[0.18em]">Focus</span>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Keep the next milestone visible, review due work, and triage new notifications before end-of-day handoff.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
