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
        className={`pointer-events-auto fixed ${open ? 'left-[17rem]' : 'left-3'} top-3 z-[60] shadow`}
        onClick={toggleSidebar}
        size="icon"
        title={open ? 'Hide sidebar' : 'Show sidebar'}
        type="button"
        variant="secondary"
      >
        <IoMenu className="h-4 w-4" />
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
