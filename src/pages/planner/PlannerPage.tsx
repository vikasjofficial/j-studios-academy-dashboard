
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Music, Megaphone } from "lucide-react";
import MusicReleasePlanner from "@/components/planner/music-release-planner";
import ContentCreationPlanner from "@/components/planner/content-creation-planner";
import { Button } from "@/components/ui/button";
import { CreatePlanDialog } from "@/components/planner/create-plan-dialog";

const PlannerPage = () => {
  const [activeTab, setActiveTab] = useState("music");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [planType, setPlanType] = useState<"music" | "content">("music");

  const handleCreatePlan = (type: "music" | "content") => {
    setPlanType(type);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planner</h1>
          <p className="text-muted-foreground">
            Plan your music releases and content creation schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={() => handleCreatePlan("music")}
          >
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">New Music Plan</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={() => handleCreatePlan("content")}
          >
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">New Content Plan</span>
          </Button>
          <Button 
            className="flex items-center gap-2" 
            onClick={() => handleCreatePlan(activeTab as "music" | "content")}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">Your Creative Journey</CardTitle>
          <CardDescription>
            Organize your music releases and content creation all in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="music" value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span>Music Releases</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>Content Creation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="music" className="mt-0">
              <MusicReleasePlanner />
            </TabsContent>

            <TabsContent value="content" className="mt-0">
              <ContentCreationPlanner />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreatePlanDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        type={planType}
      />
    </div>
  );
};

export default PlannerPage;
