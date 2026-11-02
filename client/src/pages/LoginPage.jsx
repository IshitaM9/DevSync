import { useState } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const featureList = [
  'Shared workspace visibility',
  'Sprint planning and delivery',
  'Role-aware team permissions'
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'demo@devsync.app', password: 'Demo123!' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#283140] bg-[#0f172a] shadow-[0_30px_80px_rgba(2,6,23,0.65)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative space-y-8 overflow-hidden bg-[#0b0f14] p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_40%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6366f1] text-lg font-bold text-white">D</div>
            <div>
              <div className="text-2xl font-semibold tracking-tight">DevSync</div>
              <div className="text-sm text-slate-400">Team delivery, aligned.</div>
            </div>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#283140] bg-[#151b23] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">
              <LockKeyhole size={12} /> Secure workspace
            </div>
            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.05em] text-white">Build momentum across every project.</h1>
            <p className="max-w-lg text-base text-slate-300">Plan, ship, and coordinate work in one polished workspace built for modern product teams.</p>
          </div>

          <div className="relative z-10 space-y-4">
            {featureList.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#1d2836] bg-[#111827]/70 px-4 py-3 text-sm text-slate-200">
                <CheckCircle2 size={17} className="text-[#34d399]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] p-8 lg:p-10">
          <div className="mb-8 flex items-center gap-2 text-[#a5b4fc]">
            <ShieldCheck size={18} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Secure sign in</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">Use the demo workspace or create a new team account.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                className="input-shell"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                className="input-shell"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <button type="submit" className="primary-btn w-full py-3 text-base">
              Sign in
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-[#283140] bg-[#0d1117] p-3 text-sm text-slate-300">
            Demo account: <span className="font-medium text-white">demo@devsync.app</span> / <span className="font-medium text-white">Demo123!</span>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            Need an account? <Link to="/register" className="font-semibold text-[#a5b4fc]">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
