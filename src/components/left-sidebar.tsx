
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "./ui/sidebar";
import { Home, Users, BookOpen, CheckSquare, Calendar, MessageSquare, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Navigation items based on user role
  const adminNavItems = [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/students', icon: Users, label: 'Students' },
    { href: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { href: '/admin/gradebook', icon: CheckSquare, label: 'Gradebook' },
    { href: '/admin/attendance', icon: Calendar, label: 'Attendance' },
    { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const studentNavItems = [
    { href: '/student', icon: Home, label: 'Dashboard' },
    { href: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { href: '/student/attendance', icon: Calendar, label: 'My Attendance' },
    { href: '/student/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-col items-center px-2 py-3">
          <img 
            src="https://i.ibb.co/ccDKFZgD/logo.png" 
            alt="J-Studios Logo" 
            className="h-9.5 w-auto" // Increased by approx 20% from h-8
          />
          <div className="flex flex-col items-center mt-2">
            <div className="font-semibold">J Studios Academy</div>
            <div className="text-xs text-muted-foreground">Pimpri-Pune</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Help & Documentation">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Documentation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">
          <p>© 2023 J-Studios Academy</p>
          <p>All rights reserved</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
