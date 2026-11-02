import { useEffect, useState } from 'react';
import { Mail, Plus, Search, ShieldCheck, Users } from 'lucide-react';
import api from '../api/client';

export default function TeamPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [members, setMembers] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MEMBER' });
  const [message, setMessage] = useState('');

  async function loadWorkspaceMembers() {
    if (!workspaceId) return;

    try {
      const response = await api.get(`/workspaces/${workspaceId}`);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to load members', error);
    }
  }

  useEffect(() => {
    async function load() {
      const response = await api.get('/workspaces');
      const currentWorkspaces = response.data.workspaces || [];
      setWorkspaces(currentWorkspaces);

      if (currentWorkspaces[0]) {
        setWorkspaceId(currentWorkspaces[0].id);
      }
    }

    load();
  }, []);

  useEffect(() => {
    loadWorkspaceMembers();
  }, [workspaceId]);

  const handleInviteMember = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, inviteForm);
      setMessage('Invitation sent successfully.');
      setInviteForm({ email: '', role: 'MEMBER' });
      await loadWorkspaceMembers();
    } catch (error) {
      setMessage(error.message || 'Invitation failed.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">Team</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">People behind the product</h1>
        </div>

        <select
          value={workspaceId}
          onChange={(event) => setWorkspaceId(event.target.value)}
          className="input-shell max-w-[240px]"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
          ))}
        </select>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="surface-soft rounded-[24px] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Members</h2>
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#283140] bg-[#111827] px-2.5 py-1.5 text-xs text-slate-300">
              <Users size={12} />
              {members.length} active
            </div>
          </div>

          <div className="mb-4 relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-shell pl-9" placeholder="Search teammates" />
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#283140] bg-[#0d1117] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6366f1] text-sm font-semibold text-white">
                    {member.user?.avatar || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-white">{member.user?.name}</div>
                    <div className="text-xs text-slate-400">{member.user?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#283140] bg-[#111827] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-300">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="surface-soft rounded-[24px] p-4">
          <h2 className="text-lg font-semibold text-white">Invite member</h2>
          <form onSubmit={handleInviteMember} className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                value={inviteForm.email}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))}
                className="input-shell"
                placeholder="member@company.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
              <select
                value={inviteForm.role}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))}
                className="input-shell"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            {message ? <div className="text-sm text-emerald-400">{message}</div> : null}

            <button type="submit" className="primary-btn w-full">
              <Plus size={15} />
              Send invite
            </button>

            <div className="rounded-2xl border border-[#283140] bg-[#0d1117] p-3 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-indigo-300">
                <ShieldCheck size={14} />
                Permission-aware access control enabled.
              </div>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
