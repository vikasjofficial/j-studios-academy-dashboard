
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
    <div className="flex h-full">
      {/* Transparent left sidebar div */}
      <div className="w-64 bg-transparent dark:bg-transparent border-r border-gray-200/20 dark:border-slate-700/20 p-4">
        {/* Placeholder for future sidebar content */}
      </div>

      <div className="flex-1 space-y-6 p-6 bg-slate-900 text-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Planner</h1>
            <p className="text-slate-400">
              Plan your music releases and content creation schedule
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300" 
              onClick={() => handleCreatePlan("music")}
            >
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">New Music Plan</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300" 
              onClick={() => handleCreatePlan("content")}
            >
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">New Content Plan</span>
            </Button>
            <Button 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700" 
              onClick={() => handleCreatePlan(activeTab as "music" | "content")}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Plan</span>
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl text-white">Your Creative Journey</CardTitle>
            <CardDescription className="text-slate-400">
              Organize your music releases and content creation all in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="music" value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 bg-slate-800 border border-slate-700">
                <TabsTrigger 
                  value="music" 
                  className="flex items-center gap-2 data-[state=active]:bg-indigo-700 data-[state=active]:text-white"
                >
                  <Music className="h-4 w-4" />
                  <span>Music Releases</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="flex items-center gap-2 data-[state=active]:bg-indigo-700 data-[state=active]:text-white"
                >
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
    </div>
  );
};

export default PlannerPage;
