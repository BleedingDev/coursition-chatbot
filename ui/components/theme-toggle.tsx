import { useEffect, useState } from 'react';
import { IoMoon, IoSunny } from 'react-icons/io5';
import { Button } from '@/components/ui/button';

function getInitialTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
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
    } catch {
      console.error('Failed to save theme');
    }
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  return (
    <Button
      aria-label="Toggle theme"
      className={`pointer-events-auto rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white dark:border-gray-600 dark:bg-gray-800/90 dark:hover:bg-gray-800 ${className}`}
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      size="icon"
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      variant="ghost"
    >
      {theme === 'dark' ? (
        <IoSunny className="h-4 w-4 text-gray-100" />
      ) : (
        <IoMoon className="h-4 w-4 text-gray-700" />
      )}
    </Button>
  );
}

export default ThemeToggle;
