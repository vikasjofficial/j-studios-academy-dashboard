
import { useAuth } from "@/context/auth-context";
import { TopNavigation } from "./top-navigation";
import { AdminNavigation } from "./admin-navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <TopNavigation />
      
      {user?.role === 'admin' && <AdminNavigation />}
      
      <div className="flex mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex-1 min-w-0 py-6">
          <main className="pb-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
