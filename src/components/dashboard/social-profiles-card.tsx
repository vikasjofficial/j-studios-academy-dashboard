import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, Youtube, Music, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import styles from "@/styles/card.module.css";
import { useIsMobile } from "@/hooks/use-mobile";

interface SocialProfile {
  id: string;
  platform: string;
  url: string;
}

export function SocialProfilesCard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<string>("");
  const isMobile = useIsMobile();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (user?.id) {
      fetchSocialProfiles();
    }
  }, [user?.id]);

  const fetchSocialProfiles = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching social profiles for user:", user?.id);
      
      const { data, error } = await supabase
        .from("student_social_profiles")
        .select("*")
        .eq("student_id", user?.id);
      
      if (error) {
        console.error("Error details from general fetch:", error);
        throw error;
      }
      
      console.log("Profiles for current user:", data);
      
      setProfiles(data as SocialProfile[] || []);
    } catch (error) {
      console.error("Error fetching social profiles:", error);
      toast.error("Failed to load social profiles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (platform: string) => {
    setCurrentPlatform(platform);
    const existingProfile = profiles.find(p => p.platform === platform);
    
    if (existingProfile) {
      setValue("url", existingProfile.url);
    } else {
      setValue("url", "");
    }
    
    setOpenDialog(true);
  };

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }
    
    try {
      console.log("Saving social profile:", {
        student_id: user.id,
        platform: currentPlatform,
        url: data.url
      });
      
      const { data: existingProfile } = await supabase
        .from("student_social_profiles")
        .select("id")
        .eq("student_id", user.id)
        .eq("platform", currentPlatform)
        .single();
      
      let result;
      
      if (existingProfile) {
        console.log("Updating existing profile:", existingProfile.id);
        result = await supabase
          .from("student_social_profiles")
          .update({ url: data.url })
          .eq("id", existingProfile.id);
      } else {
        console.log("Inserting new profile");
        result = await supabase
          .from("student_social_profiles")
          .insert({
            student_id: user.id,
            platform: currentPlatform,
            url: data.url
          });
      }
      
      if (result.error) {
        console.error("Error saving social profile:", result.error);
        throw result.error;
      }
      
      console.log("Profile saved successfully");
      
      fetchSocialProfiles();
      
      toast.success(`${currentPlatform} profile saved successfully`);
      setOpenDialog(false);
    } catch (error: any) {
      console.error("Error saving social profile:", error);
      toast.error(`Failed to save social profile: ${error.message || "Unknown error"}`);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram size={24} />;
      case 'youtube':
        return <Youtube size={24} />;
      case 'spotify':
      case 'soundcloud':
        return <Music size={24} />;
      default:
        return <MoveUpRight size={24} />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-r from-[#833AB4] to-[#E1306C] hover:from-[#833AB4]/90 hover:to-[#E1306C]/90';
      case 'youtube':
        return 'bg-[#FF0000] hover:bg-[#FF0000]/90';
      case 'spotify':
        return 'bg-[#1DB954] hover:bg-[#1DB954]/90';
      case 'soundcloud':
        return 'bg-[#FF7700] hover:bg-[#FF7700]/90';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  const getProfileLink = (platform: string) => {
    return profiles.find(p => p.platform.toLowerCase() === platform.toLowerCase())?.url || null;
  };

  const platformButtons = [
    { name: 'Instagram', icon: <Instagram size={18} /> },
    { name: 'YouTube', icon: <Youtube size={18} /> },
    { name: 'Spotify', icon: <Music size={18} /> },
    { name: 'SoundCloud', icon: <Music size={18} /> }
  ];

  return (
    <Card className={`overflow-hidden shadow-lg mb-6 ${styles.glassMorphism}`}>
      <CardHeader className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <MoveUpRight className="mr-2 h-5 w-5 text-white" />
          Social Profiles
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-2">
            <div className="h-5 w-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {platformButtons.map((platform) => {
              const profileExists = getProfileLink(platform.name);
              return (
                <div key={platform.name} className="flex flex-col items-center">
                  <Button
                    onClick={() => handleOpenDialog(platform.name)}
                    variant="outline"
                    className={`w-full h-12 mb-1 ${profileExists ? 'border-green-500 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30' : 'border-muted-foreground/20'}`}
                  >
                    {React.cloneElement(platform.icon, { 
                      className: profileExists ? 'text-black' : '' 
                    })}
                    <span className={`ml-2 hidden md:inline ${profileExists ? 'text-black' : ''}`}>
                      {platform.name}
                    </span>
                  </Button>
                  
                  {profileExists && (
                    <a 
                      href={profileExists}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline truncate max-w-full"
                    >
                      View Profile
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className={styles.glassMorphism}>
            <DialogHeader className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
              <DialogTitle className="flex items-center">
                {getPlatformIcon(currentPlatform)}
                <span className="ml-2">{currentPlatform} Profile</span>
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Enter your {currentPlatform} profile URL below
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Profile URL</Label>
                  <Input
                    id="url"
                    placeholder={`Enter your ${currentPlatform} profile URL`}
                    {...register("url", { 
                      required: "URL is required",
                      pattern: {
                        value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                        message: "Please enter a valid URL"
                      }
                    })}
                  />
                  {errors.url && (
                    <p className="text-sm text-red-500">
                      {errors.url.message as string}
                    </p>
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  Make sure to include https:// for external links
                </p>
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className={`${getPlatformColor(currentPlatform)} text-white`}
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
