
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
    <Card className={cn("overflow-hidden transition-all hover-card-animation", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <BarChart2 className="h-5 w-5 text-muted-foreground" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar
                dataKey="mark"
                name="Your Mark"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="average"
                name="Class Average"
                fill="rgba(0, 0, 0, 0.2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
