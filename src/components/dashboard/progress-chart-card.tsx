
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import cardStyles from '@/styles/card.module.css';

interface ProgressData {
  name: string;
  mark: number;
  average: number;
}

interface ProgressChartCardProps {
  title: string;
  data: ProgressData[];
  className?: string;
}

export function ProgressChartCard({ title, data, className }: ProgressChartCardProps) {
  return (
    <div className={cn(
      "relative p-6 rounded-xl overflow-hidden backdrop-blur-md transition-all",
      "bg-white/5 border border-white/10 hover:bg-white/10",
      cardStyles.glassMorphism,
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
          <BarChart2 className="h-5 w-5" />
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" fontSize={12} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
            <YAxis fontSize={12} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 30, 30, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', color: 'rgba(255,255,255,0.7)' }} />
            <Bar
              dataKey="mark"
              name="Your Mark"
              fill="rgba(59, 130, 246, 0.8)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="average"
              name="Class Average"
              fill="rgba(255, 255, 255, 0.2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
