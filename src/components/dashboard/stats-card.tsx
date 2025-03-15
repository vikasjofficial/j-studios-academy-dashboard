
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";

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
  color?: string;
  textColor?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
  trend,
  color = "bg-card",
  textColor = "text-card-foreground"
}: StatsCardProps) {
  return (
    <Card className={cn("h-full", color, className)}>
      <CardContent className={cn("pt-6", textColor)}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={cn("text-sm font-medium", textColor)}>{title}</h3>
            {icon && <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", textColor === "text-white" ? "bg-white/20 text-white" : "bg-primary/20 text-primary")}>
              {icon}
            </div>}
          </div>
          
          <div className="flex items-baseline space-x-3">
            <div className={cn("text-2xl font-bold", textColor)}>{value}</div>
            {trend && <div className={cn("text-xs font-medium flex items-center px-2 py-0.5 rounded-full", 
              trend.isPositive 
                ? textColor === "text-white" ? "text-green-200 bg-green-800/30" : "text-green-500 bg-green-500/10" 
                : textColor === "text-white" ? "text-red-200 bg-red-800/30" : "text-red-500 bg-red-500/10"
            )}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </div>}
          </div>
          
          {description && <p className={cn("text-sm", textColor === "text-white" ? "text-white/70" : "text-muted-foreground")}>{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
