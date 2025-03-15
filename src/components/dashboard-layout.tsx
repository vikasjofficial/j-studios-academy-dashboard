
import { useAuth } from "@/context/auth-context";
import { SidebarProvider, SidebarInset, useSidebar } from "./ui/sidebar";
import { LeftSidebar } from "./left-sidebar";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar();
  
  return (
    <div className="fixed top-20 right-4 z-50 flex gap-2">
      {/* Left sidebar toggle */}
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur border-border/50 shadow-md" 
        onClick={toggleSidebar}
        aria-label="Toggle Left Sidebar"
      >
        {state === "expanded" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-background/80">        
        <div className="flex w-full flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <LeftSidebar />
          
          {/* Main Content */}
          <SidebarInset className="overflow-y-auto overflow-x-hidden flex-1">
            <div className={`${styles.mainContent} p-3 sm:p-4 md:p-5 w-full`}>
              <main className="pb-12 w-full mx-auto max-w-[1600px] overflow-x-hidden">
                {children}
              </main>
            </div>
            
            {/* Sidebar Toggle Button */}
            <SidebarToggle />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
