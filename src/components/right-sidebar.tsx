import { useAuth } from "@/context/auth-context";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Button } from "./ui/button";
import { BellRing, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function RightSidebar() {
  const { user } = useAuth();
  const today = new Date();
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const handleToggle = () => {
      setVisible(prev => !prev);
    };
    
    const toggleBtn = document.querySelector('[data-right-sidebar-toggle="true"]');
    toggleBtn?.addEventListener('click', handleToggle);
    
    return () => {
      toggleBtn?.removeEventListener('click', handleToggle);
    };
  }, []);
  
  const notifications = [
    { id: 1, title: "New grade posted", time: "10 minutes ago", read: false },
    { id: 2, title: "Attendance updated", time: "1 hour ago", read: false },
    { id: 3, title: "New course available", time: "2 hours ago", read: true },
  ];
  
  const upcomingEvents = [
    { id: 1, title: "Math Exam", date: "Tomorrow, 10:00 AM" },
    { id: 2, title: "Science Project Due", date: "Friday, 11:59 PM" },
    { id: 3, title: "Parent-Teacher Meeting", date: "Next Monday, 3:00 PM" },
  ];

  return (
    <Sidebar side="right" variant="floating">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <span className="font-medium">Quick View</span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <AppSidebar />
        
        <SidebarGroup>
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            <Card className="border border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {format(today, "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <p>Current Time: {format(today, "h:mm a")}</p>
                </div>
              </CardContent>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <BellRing className="h-3 w-3" />
            Notifications
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "text-xs p-2 rounded-md",
                    notification.read 
                      ? "bg-muted/50" 
                      : "bg-primary/10 border-l-2 border-primary"
                  )}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-muted-foreground text-[10px]">{notification.time}</div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View All Notifications
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Upcoming Events
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id}
                  className="text-xs p-2 rounded-md bg-muted/50"
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-muted-foreground text-[10px]">{event.date}</div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View Calendar
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2 text-xs text-center text-muted-foreground">
          Last updated: {format(today, "h:mm a")}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
