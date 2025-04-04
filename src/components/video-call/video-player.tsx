
import React, { useRef, useEffect } from 'react';
import { ILocalVideoTrack } from "agora-rtc-react";
import { Mic, MicOff, User } from "lucide-react";
import { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  track?: ILocalVideoTrack;
  remoteUser?: IAgoraRTCRemoteUser;
  username: string;
  muted?: boolean;
  isLocal?: boolean;
  hasVideo?: boolean;
}

export default function VideoPlayer({ 
  track, 
  remoteUser, 
  username, 
  muted = false,
  isLocal = false,
  hasVideo = true
}: VideoPlayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    if (isLocal && track) {
      track.play(ref.current);
      return () => {
        track.stop();
      };
    } else if (remoteUser) {
      const videoTrack = remoteUser.videoTrack;
      if (videoTrack) {
        videoTrack.play(ref.current);
        return () => {
          videoTrack.stop();
        };
      }
    }
  }, [track, remoteUser, isLocal]);
  
  const isMuted = isLocal ? muted : remoteUser?.hasAudio === false;
  const noVideo = isLocal ? !hasVideo : remoteUser?.hasVideo === false;
  
  return (
    <div className="relative bg-black/80 rounded-lg overflow-hidden h-52 md:h-64">
      {noVideo ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <User className="h-16 w-16 text-muted-foreground/60" />
        </div>
      ) : (
        <div ref={ref} className="absolute inset-0"></div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex justify-between items-center">
        <span className="text-white text-xs truncate max-w-[80%]">{username}</span>
        {isMuted ? <MicOff size={14} className="text-red-500" /> : <Mic size={14} className="text-green-500" />}
      </div>
    </div>
  );
}
