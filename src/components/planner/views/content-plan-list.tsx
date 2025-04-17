
import { useState } from "react";
import { Plan } from "../types";
import PlanItem from "../plan-item";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface ContentPlanListProps {
  plans: Plan[];
  onUpdatePlan: (plan: Plan) => void;
  onDeletePlan: (id: string) => void;
}

const ContentPlanList = ({ plans, onUpdatePlan, onDeletePlan }: ContentPlanListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  
  // Get unique platforms
  const platforms = Array.from(new Set(plans.map(plan => plan.platform).filter(Boolean)));
  
  // Sort plans by date (most recent first)
  const sortedPlans = [...plans].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Filter plans by search term, status, and platform
  const filteredPlans = sortedPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    
    const matchesPlatform = platformFilter === "all" || plan.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });
  
  // Group plans by month/year
  const groupedPlans: Record<string, Plan[]> = {};
  
  filteredPlans.forEach(plan => {
    const date = typeof plan.date === 'string' ? parseISO(plan.date) : plan.date;
    const monthYear = format(date, "MMMM yyyy");
    
    if (!groupedPlans[monthYear]) {
      groupedPlans[monthYear] = [];
    }
    
    groupedPlans[monthYear].push(plan);
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search plans..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          {platforms.length > 0 && (
            <Select 
              value={platformFilter} 
              onValueChange={setPlatformFilter}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map(platform => platform && (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      {Object.keys(groupedPlans).length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-dashed">
          <p className="text-muted-foreground">No content creation plans found.</p>
        </div>
      ) : (
        Object.entries(groupedPlans).map(([monthYear, plans]) => (
          <div key={monthYear} className="space-y-3">
            <h3 className="font-medium text-lg sticky top-0 bg-background pt-2 pb-1 z-10">
              {monthYear}
            </h3>
            
            <div className="space-y-3">
              {plans.map(plan => (
                <PlanItem 
                  key={plan.id} 
                  plan={plan} 
                  onUpdatePlan={onUpdatePlan} 
                  onDeletePlan={onDeletePlan}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContentPlanList;
