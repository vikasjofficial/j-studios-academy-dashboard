
import { CheckCircle, Circle, Trash, Music, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plan } from "./types";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlanItemProps {
  plan: Plan;
  compact?: boolean;
  onUpdatePlan: (plan: Plan) => void;
  onDeletePlan?: (id: string) => void;
}

const PlanItem = ({ plan, compact = false, onUpdatePlan, onDeletePlan }: PlanItemProps) => {
  const handleToggleComplete = () => {
    onUpdatePlan({
      ...plan,
      status: plan.status === "completed" ? "planned" : "completed"
    });
  };

  // Get the appropriate icon component based on plan type
  const TypeIcon = plan.type === "music" ? Music : Megaphone;

  if (compact) {
    return (
      <div 
        className={cn(
          "text-xs p-1.5 rounded border-l-2 flex items-center gap-1.5 mb-1 hover:bg-slate-700/30 transition-colors",
          plan.status === "completed" 
            ? "bg-green-950/20 border-green-600 dark:bg-green-950/20 dark:border-green-600 line-through opacity-70" 
            : plan.type === "music"
              ? "bg-slate-800/80 dark:bg-slate-800/80 border-indigo-500 text-indigo-100"
              : "bg-slate-800/80 dark:bg-slate-800/80 border-cyan-500 text-cyan-100",
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0" 
                onClick={handleToggleComplete}
              >
                {plan.status === "completed" ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <Circle className="h-3 w-3 text-slate-400" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
              {plan.status === "completed" ? "Mark as incomplete" : "Mark as complete"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TypeIcon className="h-3 w-3 shrink-0" />
        <span className="truncate">{plan.title}</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "p-3 rounded-md border flex items-start gap-3",
        plan.status === "completed" 
          ? "bg-green-950/20 border-green-900 dark:bg-green-950/20 dark:border-green-900" 
          : "bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-700",
      )}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-5 w-5 p-0 mt-0.5" 
        onClick={handleToggleComplete}
      >
        {plan.status === "completed" ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4 shrink-0" />
          <h3 className={cn(
            "font-medium text-slate-200",
            plan.status === "completed" && "line-through"
          )}>
            {plan.title}
          </h3>
        </div>
        
        <p className="text-sm text-slate-400 mt-1">
          {typeof plan.date === 'string' 
            ? format(new Date(plan.date), "PPP") 
            : format(plan.date, "PPP")}
        </p>
        
        {plan.description && (
          <p className={cn(
            "text-sm mt-2 text-slate-300",
            plan.status === "completed" && "line-through opacity-70"
          )}>
            {plan.description}
          </p>
        )}
        
        {plan.platform && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800/50 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
              {plan.platform}
            </span>
          </div>
        )}
      </div>
      
      {onDeletePlan && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500 hover:bg-slate-700/30" 
          onClick={() => onDeletePlan(plan.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default PlanItem;
