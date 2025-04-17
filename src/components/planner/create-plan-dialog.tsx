
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Music, Megaphone } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useMusicPlans } from "./hooks/use-music-plans";
import { useContentPlans } from "./hooks/use-content-plans";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

// Platforms for content creation
const contentPlatforms = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Twitter/X",
  "Facebook",
  "LinkedIn",
  "Blog",
  "Podcast",
  "Other"
];

// Platforms for music release
const musicPlatforms = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "SoundCloud",
  "Amazon Music",
  "Bandcamp",
  "Tidal",
  "Deezer",
  "Other"
];

const planFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  date: z.date({
    required_error: "Please select a date.",
  }),
  platform: z.string().optional(),
});

export interface CreatePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "music" | "content";
}

export function CreatePlanDialog({ isOpen, onClose, type }: CreatePlanDialogProps) {
  const { addPlan: addMusicPlan } = useMusicPlans();
  const { addPlan: addContentPlan } = useContentPlans();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
    },
  });
  
  const onSubmit = async (values: z.infer<typeof planFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to create a plan");
      return;
    }

    const newPlan = {
      title: values.title,
      description: values.description || "",
      date: values.date,
      platform: values.platform,
      status: "planned" as const,
      type: type
    };
    
    if (type === "music") {
      await addMusicPlan(newPlan);
    } else {
      await addContentPlan(newPlan);
    }
    
    form.reset();
    onClose();
  };

  const platforms = type === "music" ? musicPlatforms : contentPlatforms;
  const Icon = type === "music" ? Music : Megaphone;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {type === "music" ? "Create Music Release Plan" : "Create Content Plan"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder={type === "music" ? "New Single Release" : "YouTube Tutorial"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={type === "music" ? "Details about the release..." : "What will this content cover?"}
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Add any additional details or notes about this plan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Plan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
