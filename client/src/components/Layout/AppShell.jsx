import { useEffect, useState } from 'react';
import { Bell, BriefcaseBusiness, CalendarDays, ChevronDown, Command, FolderKanban, Inbox, LayoutDashboard, LogOut, Map, MoonStar, Plus, Search, Settings, Sparkles, SunMedium, Users } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', to: '/my-tasks', icon: BriefcaseBusiness },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Roadmap', to: '/roadmap', icon: Map },
  { label: 'Inbox', to: '/inbox', icon: Inbox },
  { label: 'Workspaces', to: '/workspaces', icon: Users },
  { label: 'Team', to: '/team', icon: Users },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Kanban', to: '/kanban', icon: FolderKanban }
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('devsync-theme') || 'dark');
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    }

    if (user) loadNotifications();
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('devsync-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
      }

      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickActions = [
    { label: 'Open dashboard', to: '/dashboard' },
    { label: 'View my tasks', to: '/my-tasks' },
    { label: 'Browse projects', to: '/projects' },
    { label: 'Open calendar', to: '/calendar' },
    { label: 'Open roadmap', to: '/roadmap' },
    { label: 'Open inbox', to: '/inbox' },
    { label: 'Go to workspaces', to: '/workspaces' },
    { label: 'Open settings', to: '/settings' }
  ];

  const filteredQuickActions = quickActions.filter((action) => {
    if (!commandQuery.trim()) return true;
    return `${action.label}`.toLowerCase().includes(commandQuery.toLowerCase());
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const currentLabel = navItems.find((item) => location.pathname.startsWith(item.to))?.label || 'Overview';

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#0d1117] text-slate-50'}`}>
      <aside className={`fixed inset-y-0 left-0 z-30 overflow-y-auto border-r border-[#283140] transition-all duration-200 ${theme === 'light' ? 'bg-slate-50 text-slate-800' : 'bg-[#0b0f14] text-slate-50'} ${collapsed ? 'w-24' : 'w-72'}`}>
        <div className="flex min-h-full flex-col">
          <div className={`flex items-center gap-3 border-b border-[#1e2a35] px-4 py-4 ${collapsed ? 'justify-center px-2' : ''}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366f1] text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
              D
            </div>
            {!collapsed && (
              <div>
                <div className="text-base font-semibold tracking-tight">DevSync</div>
                <div className="text-[11px] text-slate-400">Workspace OS</div>
              </div>
            )}
          </div>

          <div className={`px-3 pt-4 ${collapsed ? 'px-2' : ''}`}>
            <button className={`flex w-full items-center ${collapsed ? 'justify-center' : 'justify-between'} rounded-xl border border-[#283140] bg-[#111827] px-3 py-2.5 text-left text-sm text-slate-200`}>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#a78bfa] text-xs font-bold text-slate-900">L</div>
                {!collapsed && (
                  <div>
                    <div className="font-medium">LaunchPad</div>
                    <div className="text-[10px] text-slate-400">Studio</div>
                  </div>
                )}
              </div>
              {!collapsed && <ChevronDown size={14} className="text-slate-400" />}
            </button>
          </div>

          <nav className="mt-5 space-y-1 px-3">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-[#151b23] text-white ring-1 ring-inset ring-[#303b4d]' : 'text-slate-400 hover:bg-[#101827] hover:text-slate-100'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
              >
                <Icon size={17} />
                {!collapsed && label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 px-3">
            <div className={`mb-3 flex items-center justify-between ${collapsed ? 'hidden' : ''}`}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Quick access</span>
            </div>
            <div className={`space-y-2 ${collapsed ? 'space-y-3' : ''}`}>
              {['Inbox', 'My Tasks', 'Settings'].map((item, index) => (
                <button
                  key={item}
                  className={`flex w-full items-center ${collapsed ? 'justify-center' : 'justify-between'} rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-[#111827] hover:text-white`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#101827] text-[10px] text-slate-300">{item.slice(0, 1)}</span>
                    {!collapsed && item}
                  </span>
                  {!collapsed && index === 2 ? <Settings size={14} className="text-slate-500" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto border-t border-[#1a2430] p-3">
            <div className={`relative flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3 rounded-xl bg-[#111827] px-3 py-2.5`}>
              <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6366f1] text-xs font-bold text-white">
                      {user?.avatar || 'U'}
                  </div>
                    {!collapsed && (
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{user?.name}</div>
                        <div className="truncate text-[11px] text-slate-400">{user?.email}</div>
                      </div>
                    )}
                  </button>
                </div>
                {!collapsed && (
                  <button onClick={handleLogout} className="rounded-lg border border-[#283140] p-2 text-slate-300 hover:bg-[#1a2532]">
                    <LogOut size={15} />
                  </button>
                )}

                {profileOpen && !collapsed && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-[#283140] bg-[#111827] p-2 shadow-xl">
                    <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-[#1a2030]">
                      <Settings size={14} />
                      Profile settings
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-[#1a2030]"
                    >
                      {theme === 'dark' ? <SunMedium size={14} /> : <MoonStar size={14} />}
                      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
      </aside>

      <div className={`transition-all duration-200 ${collapsed ? 'ml-24' : 'ml-72'}`}>
        <header className={`sticky top-0 z-20 border-b border-[#1d2836] ${theme === 'light' ? 'bg-white/90 text-slate-800' : 'bg-[#0d1117]/90 text-slate-50'} backdrop-blur-xl`}>
          <div className="flex items-center justify-between gap-4 px-6 py-3.5">
            <div className="flex items-center gap-3">
              <button onClick={() => setCollapsed((prev) => !prev)} className="rounded-lg border border-[#283140] bg-[#111827] p-2 text-slate-300 hover:border-slate-500">
                <Sparkles size={15} />
              </button>
              <div className="hidden text-xs uppercase tracking-[0.2em] text-slate-500 md:block">Workspace / {currentLabel}</div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCommandPalette(true)}
                className={`hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm md:flex ${theme === 'light' ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-[#283140] bg-[#111827] text-slate-400'}`}
              >
                <Search size={15} />
                <span>Search</span>
                <span className={`ml-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${theme === 'light' ? 'border-slate-200 bg-white text-slate-600' : 'border-[#283140] bg-[#0b0f14] text-slate-300'}`}>
                  <Command size={10} /> K
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowCommandPalette(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6366f1] px-3 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20"
              >
                <Plus size={15} />
                Quick create
              </button>

              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className={`rounded-xl border p-2.5 ${theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#283140] bg-[#111827] text-slate-300'}`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className={`relative rounded-xl border p-2.5 transition ${theme === 'light' ? 'border-slate-200 bg-white text-slate-700' : 'border-[#283140] bg-[#111827] text-slate-300 hover:border-slate-500'}`}
                >
                  <Bell size={16} />
                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className={`absolute right-0 z-20 mt-3 w-80 rounded-2xl border p-3 shadow-2xl ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#283140] bg-[#111827]'}`}>
                    <div className={`mb-2 px-1 text-sm font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Recent notifications</div>
                    <div className="space-y-2">
                      {notifications.length ? (
                        notifications.map((item) => (
                          <div key={item.id} className={`rounded-xl border p-3 text-sm ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-[#283140] bg-[#0d1117] text-slate-300'}`}>
                            {item.message}
                          </div>
                        ))
                      ) : (
                        <div className={`rounded-xl border p-3 text-sm ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-[#283140] bg-[#0d1117] text-slate-400'}`}>No notifications yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 md:px-8">{children}</main>
      </div>

      {showCommandPalette && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-[#020817]/70 p-6 pt-20 backdrop-blur-sm" onClick={() => setShowCommandPalette(false)}>
          <div className={`w-full max-w-2xl rounded-[28px] border p-4 shadow-[0_30px_80px_rgba(2,6,23,0.7)] ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#283140] bg-[#111827]'}`} onClick={(event) => event.stopPropagation()}>
            <div className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-[#283140] bg-[#0d1117] text-slate-400'}`}>
              <Search size={15} />
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                className={`w-full bg-transparent text-sm placeholder:text-slate-500 focus:outline-none ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}
                placeholder="Search or jump to..."
              />
              <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${theme === 'light' ? 'border-slate-200 bg-white text-slate-600' : 'border-[#283140] bg-[#0b0f14] text-slate-300'}`}>
                <Command size={10} /> K
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {filteredQuickActions.length ? (
                filteredQuickActions.map((action) => (
                  <button
                    key={action.to}
                    type="button"
                    onClick={() => {
                      navigate(action.to);
                      setShowCommandPalette(false);
                      setCommandQuery('');
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:text-slate-900' : 'border-[#283140] bg-[#0d1117] text-slate-300 hover:border-indigo-500/40 hover:text-white'}`}
                  >
                    <span>{action.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Go</span>
                  </button>
                ))
              ) : (
                <div className={`rounded-2xl border px-3 py-4 text-sm ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-[#283140] bg-[#0d1117] text-slate-400'}`}>
                  No matching shortcuts found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
