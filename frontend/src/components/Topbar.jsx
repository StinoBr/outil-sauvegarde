import Button from './Button';
import useThemeStore from '../store/useThemeStore';

export default function Topbar() {
  const { theme, toggleTheme } = useThemeStore((state) => ({ theme: state.theme, toggleTheme: state.toggleTheme }));

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-muted bg-surface">
      <div>
        <p className="text-xs text-muted-foreground">Backup Control Plane</p>
        <h2 className="text-xl font-semibold">Bienvenue 👋</h2>
      </div>
      <div className="flex items-center gap-3">
        <input className="w-64" placeholder="Rechercher un job..." />
        <Button variant="ghost" onClick={toggleTheme}>
          {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        </Button>
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-semibold">
          OP
        </div>
      </div>
    </header>
  );
}
