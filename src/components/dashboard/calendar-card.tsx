
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'lecture' | 'assignment' | 'exam';
}

interface CalendarCardProps {
  title: string;
  events: Event[];
  className?: string;
}

export function CalendarCard({ title, events, className }: CalendarCardProps) {
  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const getEventTypeStyles = (type: Event['type']) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'assignment':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'exam':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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
          <Calendar className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/10">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <div key={event.id} className="p-4 flex flex-col space-y-2 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <Badge variant="outline" className={cn("text-xs", getEventTypeStyles(event.type))}>
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  <span className="mr-3">{event.date}</span>
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{event.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No upcoming events
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
