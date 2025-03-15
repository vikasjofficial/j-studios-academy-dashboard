
import { CheckSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AttendanceCardProps {
  title: string;
  percentage: number;
  present: number;
  total: number;
  className?: string;
}

export function AttendanceCard({ title, percentage, present, total, className }: AttendanceCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className={cn(
        "relative p-4 rounded-xl overflow-hidden glass-morphism transition-all duration-300",
        "hover:bg-black/30 hover:border-white/20 group",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:to-transparent",
        "hover:before:from-primary/40 hover:before:to-primary/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        "after:absolute after:inset-0 after:rounded-xl after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]",
        "after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated spotlight effect */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.1), transparent 40%)',
        }}
        onMouseMove={(e) => {
          if (!hovered) return;
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold group-hover:text-white transition-colors duration-300">{title}</h3>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary group-hover:bg-primary/50 group-hover:text-white transition-all duration-300">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold group-hover:text-white transition-colors duration-300">{percentage}%</span>
          <span className="text-xs text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
            {present} of {total} days
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className="h-1.5 bg-white/10" 
          indicatorClassName={cn("bg-gradient-to-r from-primary to-primary/70 group-hover:from-white group-hover:to-primary/90 transition-colors duration-500")} 
        />
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center p-2 rounded-lg bg-black/20 border border-white/10 group-hover:border-white/30 transition-colors duration-300">
            <span className="text-xs text-muted-foreground mb-0.5 group-hover:text-white/70 transition-colors duration-300">Present</span>
            <span className="text-sm font-medium group-hover:text-white transition-colors duration-300">{present}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-black/20 border border-white/10 group-hover:border-white/30 transition-colors duration-300">
            <span className="text-xs text-muted-foreground mb-0.5 group-hover:text-white/70 transition-colors duration-300">Absent</span>
            <span className="text-sm font-medium group-hover:text-white transition-colors duration-300">{total - present}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-black/20 border border-white/10 group-hover:border-white/30 transition-colors duration-300">
            <span className="text-xs text-muted-foreground mb-0.5 group-hover:text-white/70 transition-colors duration-300">Total</span>
            <span className="text-sm font-medium group-hover:text-white transition-colors duration-300">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
