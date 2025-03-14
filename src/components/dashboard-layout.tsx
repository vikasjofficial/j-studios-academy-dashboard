
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopNavigation } from './top-navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex w-full flex-col bg-background relative">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none z-0"></div>
      
      {/* Top Navigation */}
      <TopNavigation />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle gradient background shapes */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="animate-float absolute top-[5%] right-[10%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="animate-float animation-delay-2000 absolute bottom-[10%] left-[5%] w-96 h-96 rounded-full bg-blue-400/5 blur-3xl"></div>
          <div className="animate-pulse animation-delay-1000 absolute top-[35%] left-[15%] w-64 h-64 rounded-full bg-accent/5 blur-3xl"></div>
        </div>
        
        <ScrollArea className="flex-1 h-screen scrollbar-none">
          <main className="flex-1 p-4 md:p-6 relative z-10">
            <div className="mx-auto max-w-7xl animate-in-subtle">
              {children}
            </div>
          </main>
        </ScrollArea>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
