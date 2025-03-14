
import { useAuth } from "@/context/auth-context";
import { TopNavigation } from "./top-navigation";
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
        <TopNavigation />
        
        {user?.role === 'admin' && <AdminNavigation />}
        
        <div className="flex w-full flex-1 pt-16">
          {/* Left Sidebar */}
          <LeftSidebar />
          
          {/* Main Content */}
          <SidebarInset>
            <div className="flex-1 p-6 w-full">
              <main className="pb-12 w-full mx-auto">
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
