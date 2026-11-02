import { useState } from 'react';
import { Bell, MoonStar, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: 'Aarav Sharma', email: 'demo@devsync.app' });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Workspace and account preferences</h1>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-soft rounded-[24px] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl border border-[#283140] bg-[#111827] p-2 text-indigo-300">
              <UserRound size={16} />
            </div>
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
              <input
                value={profile.name}
                onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                className="input-shell"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                value={profile.email}
                onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                className="input-shell"
              />
            </div>
            <button type="button" className="primary-btn">Save profile</button>
          </div>
        </section>

        <section className="surface-soft rounded-[24px] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl border border-[#283140] bg-[#111827] p-2 text-emerald-300">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>

          <div className="space-y-3">
            {['Two-factor authentication', 'Session activity', 'Password manager'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-[#283140] bg-[#0d1117] px-3 py-2.5 text-sm text-slate-300">
                <span>{item}</span>
                <button type="button" className="secondary-btn px-3 py-1.5 text-xs">Manage</button>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-soft rounded-[24px] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl border border-[#283140] bg-[#111827] p-2 text-amber-300">
              <Bell size={16} />
            </div>
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>

          <div className="space-y-3">
            {['Task mentions', 'Daily digest', 'Comments', 'Project updates'].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-2xl border border-[#283140] bg-[#0d1117] px-3 py-2.5 text-sm text-slate-300">
                <span>{item}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#6366f1]" />
              </label>
            ))}
          </div>
        </section>

        <section className="surface-soft rounded-[24px] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl border border-[#283140] bg-[#111827] p-2 text-violet-300">
              <MoonStar size={16} />
            </div>
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>

          <div className="space-y-3">
            {['Dark theme', 'Compact density', 'Reduced motion'].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-2xl border border-[#283140] bg-[#0d1117] px-3 py-2.5 text-sm text-slate-300">
                <span>{item}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#6366f1]" />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
