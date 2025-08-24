import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

function getInitialTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());

  useEffect(() => {
    const isDark = theme === 'dark';
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  return (
    <Button
      size="icon"
      variant="secondary"
      className={'pointer-events-auto ' + className}
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

export default ThemeToggle;
