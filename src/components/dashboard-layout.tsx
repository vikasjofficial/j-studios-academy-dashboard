
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Create a persistent sidebar toggle button component
function PersistentSidebarToggle() {
  const { toggleSidebar, state } = useSidebar();
  const isMobile = useIsMobile();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSidebar}
      className={`fixed top-3 ${isMobile ? 'left-3' : 'right-4'} z-50 bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-md hover:bg-primary/20 transition-all md:right-6`}
      aria-label="Toggle Sidebar"
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        {/* Grid pattern background */}
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none z-0"></div>
        
        <AppSidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Persistent sidebar toggle button */}
          <PersistentSidebarToggle />
          
          {/* Subtle gradient background shapes */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="animate-float absolute top-[5%] right-[10%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="animate-float animation-delay-2000 absolute bottom-[10%] left-[5%] w-96 h-96 rounded-full bg-blue-400/5 blur-3xl"></div>
            <div className="animate-pulse animation-delay-1000 absolute top-[35%] left-[15%] w-64 h-64 rounded-full bg-accent/5 blur-3xl"></div>
          </div>
          
          <ScrollArea className="flex-1 h-screen scrollbar-none">
            <main className="flex-1 p-4 md:p-6 relative z-10 pt-14 md:pt-6">
              <div className="mx-auto max-w-7xl animate-in-subtle">
                {children}
              </div>
            </main>
          </ScrollArea>
        </div>
        <Toaster position="top-right" />
      </div>
    </SidebarProvider>
  );
}
