
import { useAuth } from "@/context/auth-context";
import { SidebarProvider, SidebarInset, useSidebar } from "./ui/sidebar";
import { LeftSidebar } from "./left-sidebar";
import { Button } from "./ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="fixed top-20 left-0 z-50 h-8 w-8 rounded-r-full bg-background/80 backdrop-blur border-border/50 shadow-md"
      onClick={toggleSidebar}
      aria-label="Toggle Left Sidebar"
    >
      {state === "expanded" ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
    </Button>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-background/80">        
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
