import React from 'react';
import { Button } from './button';
import { PanelLeft } from 'lucide-react';

type SidebarContextType = {
  open: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

const COOKIE = 'sidebar:state';

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState<boolean>(() => {
    try {
      const m = document.cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
      if (m && (m[1] === 'true' || m[1] === 'false')) return m[1] === 'true';
    } catch {}
    return defaultOpen;
  });

  const toggleSidebar = React.useCallback(
    () =>
      setOpen((v) => {
        const next = !v;
        try {
          document.cookie = `${COOKIE}=${String(next)}; path=/; max-age=${60 * 60 * 24 * 7}`;
        } catch {}
        return next;
      }),
    []
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  if (!open) return null;
  return <>{children}</>;
}

export function SidebarRail({ className = '' }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar();
  return (
    <div className={'pointer-events-none ' + className}>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={toggleSidebar}
        aria-label={open ? 'Hide sidebar' : 'Show sidebar'}
        className={`pointer-events-auto fixed ${open ? 'left-[17rem]' : 'left-3'} top-3 z-[60] shadow`}
        title={open ? 'Hide sidebar' : 'Show sidebar'}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function SidebarTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
}) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={className}
      {...props}
    >
      {children}
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}
