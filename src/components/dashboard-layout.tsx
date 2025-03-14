
import { useAuth } from "@/context/auth-context";
import { AdminNavigation } from "./admin-navigation";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-b from-background to-background/80">        
        {user?.role === 'admin' && <AdminNavigation />}
        
        <div className="flex w-full flex-1">
          {/* Left Sidebar */}
          <LeftSidebar />
          
          {/* Main Content */}
          <SidebarInset>
            <div className="flex-1 p-3 sm:p-4 md:p-6 w-full">
              <main className="pb-12 w-full mx-auto max-w-[1200px]">
                {children}
              </main>
            </div>
          </SidebarInset>
          
          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </SidebarProvider>
  );
}
