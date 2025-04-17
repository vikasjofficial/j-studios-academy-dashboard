
import { useState } from "react";
import { Calendar, CalendarDays, ListMusic, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MonthlyCalendarView from "./views/monthly-calendar-view";
import MusicPlanList from "./views/music-plan-list";
import { useMusicPlans } from "./hooks/use-music-plans";

const MusicReleasePlanner = () => {
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "grid">("calendar");
  const { plans, isLoading, addPlan, updatePlan, deletePlan } = useMusicPlans();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg text-muted-foreground">Loading your music plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToday}
            className="min-w-28"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            Next
          </Button>
        </div>
        
        <Tabs defaultValue="calendar" value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-auto">
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger value="calendar" className="flex items-center gap-1 px-2 text-xs">
              <CalendarDays className="h-3 w-3" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1 px-2 text-xs">
              <ListMusic className="h-3 w-3" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-1 px-2 text-xs">
              <Grid3X3 className="h-3 w-3" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <TabsContent value="calendar" className="mt-0">
          <MonthlyCalendarView 
            plans={plans.filter(p => p.type === 'music')} 
            currentMonth={currentMonth} 
            onUpdatePlan={updatePlan}
          />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <MusicPlanList 
            plans={plans.filter(p => p.type === 'music')} 
            onUpdatePlan={updatePlan} 
            onDeletePlan={deletePlan}
          />
        </TabsContent>
        
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.filter(p => p.type === 'music').map(plan => (
              <div 
                key={plan.id} 
                className="p-4 rounded-md bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-lg">{plan.title}</h3>
                <p className="text-sm text-muted-foreground">{new Date(plan.date).toLocaleDateString()}</p>
                <div className="mt-2 text-sm">{plan.description}</div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => updatePlan({...plan, status: plan.status === 'completed' ? 'planned' : 'completed'})}>
                    {plan.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </div>
    </div>
  );
};

export default MusicReleasePlanner;
