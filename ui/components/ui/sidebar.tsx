import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { IoMenu } from 'react-icons/io5';
import { Button } from './button';

type SidebarContextType = {
  open: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return ctx;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  const toggleSidebar = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  useEffect(() => {
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
  if (!open) {
    return null;
  }
  return <>{children}</>;
}

export function SidebarRail({ className = '' }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar();
  return (
    <div className={`pointer-events-none ${className}`}>
      <Button
        aria-label={open ? 'Hide sidebar' : 'Show sidebar'}
        className={`pointer-events-auto fixed ${open ? 'left-[17rem]' : 'left-3'} top-3 z-[60] rounded-full border border-gray-200 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white dark:border-gray-600 dark:bg-gray-800/90 dark:hover:bg-gray-800`}
        onClick={toggleSidebar}
        size="icon"
        title={open ? 'Hide sidebar' : 'Show sidebar'}
        type="button"
        variant="ghost"
      >
        <IoMenu className="h-4 w-4 text-gray-700 dark:text-gray-300" />
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
      className={className}
      onClick={toggleSidebar}
      type="button"
      {...props}
    >
      {children}
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}
