
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Plan } from "../types";
import PlanItem from "../plan-item";
import { cn } from "@/lib/utils";

interface MonthlyCalendarViewProps {
  plans: Plan[];
  currentMonth: Date;
  onUpdatePlan: (plan: Plan) => void;
}

const MonthlyCalendarView = ({ plans, currentMonth, onUpdatePlan }: MonthlyCalendarViewProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Create a 7-column grid with empty cells for proper alignment
  const firstDayOfMonth = monthStart.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const daysInWeek = 7;
  
  // Create day headers (Sun, Mon, etc.)
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-md shadow-sm border border-slate-700 dark:border-slate-700 overflow-hidden">
      <div className="text-center p-4 border-b border-slate-700 dark:border-slate-700 font-semibold text-lg bg-slate-800 dark:bg-slate-800 text-white">
        {format(currentMonth, "MMMM yyyy")}
      </div>
      
      <div className="grid grid-cols-7 border-b border-slate-700 dark:border-slate-700">
        {dayHeaders.map((day, i) => (
          <div 
            key={i} 
            className="py-2 text-center text-sm font-medium text-slate-300 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 min-h-[650px]">
        {/* Add empty cells for days before the first day of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div 
            key={`empty-start-${index}`} 
            className="border-r border-b border-slate-700 dark:border-slate-700 p-1 bg-slate-850/50 dark:bg-slate-900/50"
          />
        ))}
        
        {/* Render each day of the month */}
        {monthDays.map(day => {
          const dayPlans = plans.filter(plan => {
            // Handle both Date objects and ISO strings
            const planDate = plan.date instanceof Date ? plan.date : new Date(plan.date);
            return isSameDay(planDate, day);
          });
          
          return (
            <div 
              key={day.toString()} 
              className={cn(
                "border-r border-b border-slate-700 dark:border-slate-700 p-2 min-h-24",
                !isSameMonth(day, currentMonth) && "bg-slate-850/50 dark:bg-slate-900/50",
                isToday(day) && "bg-indigo-900/20 dark:bg-indigo-900/10"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div 
                  className={cn(
                    "h-6 w-6 text-center text-sm rounded-full flex items-center justify-center",
                    isToday(day) && "bg-indigo-600 text-white font-medium"
                  )}
                >
                  {format(day, "d")}
                </div>
                {dayPlans.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-indigo-600/20 text-indigo-300 border-indigo-600/30">
                    {dayPlans.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1">
                {dayPlans.map(plan => (
                  <PlanItem 
                    key={plan.id} 
                    plan={plan} 
                    compact={true}
                    onUpdatePlan={onUpdatePlan} 
                  />
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Add empty cells for days after the last day of the month */}
        {Array.from({ length: (daysInWeek - ((firstDayOfMonth + monthDays.length) % daysInWeek)) % daysInWeek }).map((_, index) => (
          <div 
            key={`empty-end-${index}`} 
            className="border-r border-b border-slate-700 dark:border-slate-700 p-1 bg-slate-850/50 dark:bg-slate-900/50"
          />
        ))}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
