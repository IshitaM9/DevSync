import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');

  async function loadWorkspaces() {
    const response = await api.get('/workspaces');
    setWorkspaces(response.data.workspaces || []);
  }

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();
    try {
      await api.post('/workspaces', form);
      setMessage('Workspace created successfully.');
      setForm({ name: '', description: '' });
      await loadWorkspaces();
    } catch (error) {
      setMessage(error.message || 'Workspace creation failed.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-600">Workspaces</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Operating spaces</h1>
        </div>
      </header>

      <section className="card p-6">
        <h2 className="text-xl font-bold text-slate-900">Create new workspace</h2>
        <form onSubmit={handleCreateWorkspace} className="mt-4 grid gap-4 md:grid-cols-[1fr_1.4fr_auto]">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-brand-500"
            placeholder="Workspace name"
          />
          <input
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-brand-500"
            placeholder="Short description"
          />
          <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2.5 font-medium text-white">Create</button>
        </form>
        {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link key={workspace.id} to={`/workspaces/${workspace.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:border-brand-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="badge bg-emerald-100 text-emerald-700">Active</span>
              <span className="text-xs text-slate-500">Workspace</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{workspace.name}</h2>
            <p className="mt-3 text-sm text-slate-600">{workspace.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
