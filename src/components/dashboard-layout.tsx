
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Top of page on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Animated shapes */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="animate-float absolute top-[10%] right-[15%] w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"></div>
            <div className="animate-float animation-delay-2000 absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
            <div className="animate-pulse animation-delay-1000 absolute top-[40%] left-[25%] w-48 h-48 rounded-full bg-orange-500/10 blur-3xl"></div>
            <div className="animate-pulse absolute bottom-[10%] right-[20%] w-72 h-72 rounded-full bg-pink-500/10 blur-3xl"></div>
          </div>
          
          <ScrollArea className="flex-1 h-screen">
            <main className="flex-1 p-6 relative z-10 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
              <div className="fade-in slide-in-from-bottom-2 duration-300 mx-auto">
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
