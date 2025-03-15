
import { useAuth } from "@/context/auth-context";
import { SidebarProvider, SidebarInset, useSidebar } from "./ui/sidebar";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import styles from "@/styles/layout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function MobileMenuButton() {
  const { toggleSidebar, openMobile } = useSidebar();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="fixed top-4 right-4 z-50 md:hidden" 
      onClick={toggleSidebar}
      aria-label="Toggle Menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
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
          
          {/* Mobile Menu Toggle Button */}
          <MobileMenuButton />
          
          {/* Main Content */}
          <SidebarInset className="overflow-y-auto overflow-x-hidden flex-1">
            <div className={`${styles.mainContent} p-3 sm:p-4 md:p-5 w-full`}>
              <main className="pb-12 w-full mx-auto max-w-[1600px] overflow-x-hidden">
                {children}
              </main>
            </div>
          </SidebarInset>
          
          {/* Right Sidebar - Don't show on mobile */}
          {!isMobile && <RightSidebar />}
        </div>
      </div>
    </SidebarProvider>
  );
}
