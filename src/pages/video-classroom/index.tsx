
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import DashboardLayout from "@/components/dashboard-layout";
import { VideoCall } from "@/components/video-call/video-call";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Video, Users } from "lucide-react";

// Replace with your actual Agora App ID
const AGORA_APP_ID = "your-agora-app-id";

export default function VideoClassroomPage() {
  const { user } = useAuth();
  const [channelName, setChannelName] = useState("");
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  
  const startCall = () => {
    if (!channelName.trim()) {
      toast.error("Please enter a classroom name");
      return;
    }
    
    setActiveChannel(channelName);
  };
  
  const endCall = () => {
    setActiveChannel(null);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Video Classroom</h1>
        
        {!activeChannel ? (
          <Card>
            <CardHeader>
              <CardTitle>Start or Join a Classroom</CardTitle>
              <CardDescription>
                {user?.role === 'admin' 
                  ? "Create a new classroom or join an existing one to start teaching" 
                  : "Join an existing classroom by entering the classroom name provided by your teacher"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  placeholder="Enter classroom name"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={startCall}>
                  {user?.role === 'admin' ? 'Create Classroom' : 'Join Classroom'}
                </Button>
              </div>
              
              {user?.role === 'admin' && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Quick Start Classrooms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Physics-101', 'Chemistry-Advanced', 'Mathematics-Finals'].map((room) => (
                      <Card 
                        key={room} 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => {
                          setChannelName(room);
                          setActiveChannel(room);
                        }}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <Video className="h-10 w-10 text-primary" />
                          <div>
                            <p className="font-medium">{room}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" /> Available now
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <VideoCall
            channelName={activeChannel}
            appId={AGORA_APP_ID}
            onLeave={endCall}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
