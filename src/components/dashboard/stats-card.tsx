
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
  trend
}: StatsCardProps) {
  return (
    <div className={cn(
      "relative p-6 rounded-xl overflow-hidden backdrop-blur-md transition-all",
      "bg-white/5 border border-white/10 hover:bg-white/10",
      className
    )}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground/70">{title}</h3>
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-3">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={cn(
              "text-xs font-medium flex items-center px-2 py-0.5 rounded-full",
              trend.isPositive 
                ? "text-green-500 bg-green-500/10" 
                : "text-red-500 bg-red-500/10"
            )}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
