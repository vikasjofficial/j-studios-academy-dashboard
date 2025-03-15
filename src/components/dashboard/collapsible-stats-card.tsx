
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatsCard } from './stats-card';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CollapsibleStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  textColor?: string;
  detailContent?: React.ReactNode;
}

export function CollapsibleStatsCard({
  title,
  value,
  description,
  icon,
  trend,
  color = "bg-card",
  textColor = "text-card-foreground",
  detailContent
}: CollapsibleStatsCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg overflow-hidden transition-all duration-200"
    >
      <CollapsibleTrigger className="w-full text-left">
        <StatsCard
          title={title}
          value={value}
          description={description}
          icon={icon}
          trend={trend}
          color={color}
          textColor={textColor}
          className="rounded-none border-0"
        />
        <div className={cn("flex justify-end px-6 pb-2", color)}>
          <ChevronDown className={cn("h-4 w-4 transition-transform", 
            isOpen ? "transform rotate-180" : "",
            textColor === "text-white" ? "text-white/70" : "text-muted-foreground"
          )} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn("p-4 border-t", color, textColor)}>
          {detailContent || (
            <div className="py-2">
              <p className={cn("text-sm", textColor === "text-white" ? "text-white/70" : "text-muted-foreground")}>
                Additional details for {title.toLowerCase()} will be displayed here.
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
