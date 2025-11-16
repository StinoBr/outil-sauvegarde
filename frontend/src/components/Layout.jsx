import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useThemeStore from '../store/useThemeStore';

export default function Layout({ children }) {
  const { initTheme } = useThemeStore((state) => ({ initTheme: state.initTheme }));

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 px-8 py-6 bg-background">
          <div className="max-w-full space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
