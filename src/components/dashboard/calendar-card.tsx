
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assignment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn("overflow-hidden transition-all hover-card-animation", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <div key={event.id} className="p-4 flex flex-col space-y-2 hover:bg-muted/40 transition-colors">
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
