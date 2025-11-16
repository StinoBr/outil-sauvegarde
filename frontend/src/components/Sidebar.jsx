import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Backups', path: '/backup', icon: '💾' },
  { label: 'Restore', path: '/restore', icon: '🧩' },
  { label: 'Logs', path: '/logs', icon: '📜' },
  { label: 'Bases', path: '/databases', icon: '🗄️' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-surface border border-muted flex flex-col py-6 px-4">
      <div className="px-2 mb-6">
        <p className="text-xs text-muted-foreground">Sauvegarde SGBD</p>
        <h1 className="text-2xl font-bold">Atlas Backup</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-md transition-base text-sm font-medium',
                isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="text-xs text-muted-foreground px-4">
        v1.0.0 • backups orchestrator
      </div>
    </aside>
  );
}
