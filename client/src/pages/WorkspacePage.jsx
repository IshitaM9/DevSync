import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MEMBER' });
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');

  async function loadWorkspace() {
    const response = await api.get(`/workspaces/${workspaceId}`);
    setWorkspace(response.data.workspace);
    setMembers(response.data.members || []);
    setProjects(response.data.projects || []);
  }

  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  const handleInviteMember = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, inviteForm);
      setMessage('Invitation sent successfully.');
      setInviteForm({ email: '', role: 'MEMBER' });
      await loadWorkspace();
    } catch (error) {
      setMessage(error.message || 'Invitation failed.');
    }
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    try {
      await api.post('/projects', { workspaceId, ...projectForm });
      setMessage('Project created successfully.');
      setProjectForm({ name: '', description: '' });
      await loadWorkspace();
    } catch (error) {
      setMessage(error.message || 'Project creation failed.');
    }
  };

  if (!workspace) return <div className="text-slate-600">Loading workspace...</div>;

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Workspace</p>
        <h1 className="mt-3 text-3xl font-bold">{workspace.name}</h1>
        <p className="mt-2 max-w-2xl text-slate-300">{workspace.description}</p>
      </header>

      {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Projects</h2>
            <span className="badge bg-brand-100 text-brand-700">{projects.length} total</span>
          </div>

          <form onSubmit={handleCreateProject} className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-semibold text-slate-800">Create project</h3>
            <div className="grid gap-3 md:grid-cols-[1.2fr_1.2fr]">
              <input
                value={projectForm.name}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-brand-500"
                placeholder="Project name"
              />
              <input
                value={projectForm.description}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-brand-500"
                placeholder="Project description"
              />
            </div>
            <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white">Create project</button>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                  <span className="badge bg-brand-100 text-brand-700">{project.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-slate-900">Members</h2>
            <div className="mt-5 space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">{member.user?.avatar || 'U'}</div>
                    <div>
                      <div className="font-medium text-slate-800">{member.user?.name}</div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleInviteMember} className="card p-6">
            <h2 className="text-xl font-bold text-slate-900">Invite member</h2>
            <div className="mt-4 space-y-3">
              <input
                value={inviteForm.email}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-brand-500"
                placeholder="member@email.com"
              />
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-brand-500"
              >
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="VIEWER">VIEWER</option>
              </select>
              <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white">Send invite</button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
