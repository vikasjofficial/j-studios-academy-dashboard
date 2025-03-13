
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className={cn(
      "overflow-hidden glass-morphism border-0 relative",
      "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-orange-500/30 before:to-transparent before:opacity-20 before:-z-10",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-foreground/70">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 text-orange-500">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-3">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className={cn(
              "text-xs font-medium flex items-center px-2 py-0.5 rounded",
              trend.isPositive 
                ? "text-green-500 bg-green-500/10" 
                : "text-red-500 bg-red-500/10"
            )}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
