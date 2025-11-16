import createStore from './createStore';

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const useThemeStore = createStore((set) => ({
  theme: 'light',
  hydrated: false,
  initTheme: () => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('backup:theme') : null;
    const nextTheme = stored || (prefersDark() ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', nextTheme);
    set({ theme: nextTheme, hydrated: true });
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('backup:theme', next);
        document.documentElement.setAttribute('data-theme', next);
      }
      return { theme: next };
    }),
}));

export default useThemeStore;
