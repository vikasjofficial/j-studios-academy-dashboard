
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, ScreenShare, MessageSquare, PhoneOff } from "lucide-react";
import { AgoraRTCProvider, useRtcEngine, useJoin, usePublish, useRemoteUsers, useLocalCameraTrack, useLocalMicrophoneTrack, RemoteUser } from "agora-rtc-react";
import VideoPlayer from './video-player';
import ChatPanel from './chat-panel';
import { cn } from '@/lib/utils';

interface VideoCallProps {
  channelName: string;
  appId: string;
  token?: string;
  onLeave?: () => void;
}

export function VideoCallContent({ channelName, onLeave }: VideoCallProps) {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<any>(null);
  
  const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
  const engine = useRtcEngine();
  const remoteUsers = useRemoteUsers();
  
  // Join the channel
  useJoin({
    channel: channelName,
    uid: user?.id || Math.floor(Math.random() * 100000),
    token: undefined,
  });
  
  // Publish local tracks
  usePublish([localMicrophoneTrack, localCameraTrack].filter(Boolean));
  
  // Handle mic toggle
  const toggleMic = async () => {
    if (localMicrophoneTrack) {
      await localMicrophoneTrack.setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };
  
  // Handle video toggle
  const toggleVideo = async () => {
    if (localCameraTrack) {
      await localCameraTrack.setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };
  
  // Handle screen sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenTrack = await navigator.mediaDevices.getDisplayMedia({ video: true })
          .then(stream => stream.getVideoTracks()[0]);
          
        const track = await engine.createScreenVideoTrack({
          screenVideoTrackInitConfig: {
            optimizationMode: "detail",
            encoderConfig: "1080p_2",
          }
        }, "auto");
        
        if (localCameraTrack) {
          await engine.unpublish(localCameraTrack);
        }
        
        await engine.publish(track);
        setScreenTrack(track);
        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    } else {
      if (screenTrack) {
        await engine.unpublish(screenTrack);
        screenTrack.stop();
        setScreenTrack(null);
      }
      
      if (localCameraTrack) {
        await engine.publish(localCameraTrack);
      }
      
      setIsScreenSharing(false);
    }
  };
  
  // Leave the channel
  const handleLeave = async () => {
    if (localCameraTrack) {
      await localCameraTrack.stop();
    }
    if (localMicrophoneTrack) {
      await localMicrophoneTrack.stop();
    }
    if (screenTrack) {
      await screenTrack.stop();
    }
    
    await engine.leave();
    onLeave?.();
  };
  
  // Grid layout calculation
  const getGridLayout = () => {
    const totalUsers = remoteUsers.length + 1; // +1 for local user
    if (totalUsers === 1) return "grid-cols-1";
    if (totalUsers === 2) return "grid-cols-1 md:grid-cols-2";
    if (totalUsers <= 4) return "grid-cols-2";
    return "grid-cols-2 md:grid-cols-3";
  };
  
  const isLoading = isLoadingMic || isLoadingCam;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 p-2 bg-muted/30 rounded-md">
        <div className="flex items-center gap-2">
          <span className="animate-pulse p-1.5 rounded-full bg-green-500"></span>
          <h2 className="font-medium">Room: {channelName}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleMic}
            className={isMuted ? "bg-red-500/20 hover:bg-red-500/30" : ""}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleVideo}
            className={isVideoOff ? "bg-red-500/20 hover:bg-red-500/30" : ""}
          >
            {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleScreenShare}
            className={isScreenSharing ? "bg-primary/20 hover:bg-primary/30" : ""}
          >
            <ScreenShare size={18} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? "bg-primary/20 hover:bg-primary/30" : ""}
          >
            <MessageSquare size={18} />
          </Button>
          
          <Button 
            variant="destructive" 
            size="icon"
            onClick={handleLeave}
          >
            <PhoneOff size={18} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className={cn(
          "flex-1 grid gap-2", 
          getGridLayout(),
          showChat ? "w-2/3" : "w-full"
        )}>
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <VideoPlayer 
                track={isScreenSharing ? screenTrack : localCameraTrack}
                username={`${user?.name || 'You'} ${user?.role === 'admin' ? '(Teacher)' : '(Student)'}`}
                muted
                isLocal
                hasVideo={!isVideoOff && (isScreenSharing || !!localCameraTrack)}
              />
              
              {remoteUsers.map((remoteUser) => (
                <VideoPlayer
                  key={remoteUser.uid}
                  remoteUser={remoteUser}
                  username={`User ${remoteUser.uid}`}
                />
              ))}
            </>
          )}
        </div>
        
        {showChat && (
          <div className="w-1/3 border-l border-muted ml-2">
            <ChatPanel channelName={channelName} />
          </div>
        )}
      </div>
    </div>
  );
}

export function VideoCall(props: VideoCallProps) {
  return (
    <Card className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle>Video Classroom</CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-hidden">
        <AgoraRTCProvider client={{mode: "rtc", codec: "vp8"}} appId={props.appId}>
          <VideoCallContent {...props} />
        </AgoraRTCProvider>
      </CardContent>
    </Card>
  );
}
