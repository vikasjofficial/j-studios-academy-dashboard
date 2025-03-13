
import { CheckSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AttendanceCardProps {
  title: string;
  percentage: number;
  present: number;
  total: number;
  className?: string;
}

export function AttendanceCard({ title, percentage, present, total, className }: AttendanceCardProps) {
  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 75) return 'bg-blue-500';
    if (value >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn(
      "relative p-6 rounded-xl overflow-hidden backdrop-blur-md transition-all",
      "bg-white/5 border border-white/10 hover:bg-white/10",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
          <CheckSquare className="h-5 w-5" />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl font-bold">{percentage}%</span>
        <span className="text-sm text-muted-foreground">
          {present} of {total} days
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 bg-white/10" 
        indicatorClassName={cn("bg-gradient-to-r from-primary to-primary/70")} 
      />
      
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs text-muted-foreground mb-1">Present</span>
          <span className="font-medium">{present}</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs text-muted-foreground mb-1">Absent</span>
          <span className="font-medium">{total - present}</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs text-muted-foreground mb-1">Total</span>
          <span className="font-medium">{total}</span>
        </div>
      </div>
    </div>
  );
}
