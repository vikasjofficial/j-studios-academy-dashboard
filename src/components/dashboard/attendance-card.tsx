
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className={cn(
      "overflow-hidden glass-morphism border-0 relative",
      "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-orange-500/30 before:to-transparent before:opacity-20 before:-z-10",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 text-orange-500">
          <CheckSquare className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold">{percentage}%</span>
          <span className="text-sm text-muted-foreground">
            {present} of {total} days
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-2 bg-white/10" 
          indicatorClassName={cn(getProgressColor(percentage), "bg-gradient-to-r from-orange-500 to-orange-400")} 
        />
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="flex flex-col items-center rounded-md p-2 bg-white/5 border border-white/10">
            <span className="text-xs text-muted-foreground">Present</span>
            <span className="font-medium">{present}</span>
          </div>
          <div className="flex flex-col items-center rounded-md p-2 bg-white/5 border border-white/10">
            <span className="text-xs text-muted-foreground">Absent</span>
            <span className="font-medium">{total - present}</span>
          </div>
          <div className="flex flex-col items-center rounded-md p-2 bg-white/5 border border-white/10">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-medium">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
