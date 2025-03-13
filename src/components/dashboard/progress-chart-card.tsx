
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <Card className={cn(
      "overflow-hidden glass-morphism border-0 relative",
      "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-orange-500/30 before:to-transparent before:opacity-20 before:-z-10",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20 text-orange-500">
          <BarChart2 className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
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
                  borderRadius: '4px',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', color: 'rgba(255,255,255,0.7)' }} />
              <Bar
                dataKey="mark"
                name="Your Mark"
                fill="#FF9500"
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
      </CardContent>
    </Card>
  );
}
