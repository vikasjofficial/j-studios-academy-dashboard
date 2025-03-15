
import { Calendar, CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import cardStyles from '@/styles/card.module.css';

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
  
  // Generate the days for the mini calendar at the top
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDay - 3 + i);
    return {
      day: date.getDate(),
      weekday: daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1],
      isToday: i === 3,
    };
  });

  return (
    <div className={cn(
      "relative p-6 rounded-xl overflow-hidden backdrop-blur-md transition-all",
      "bg-white/5 border border-white/10 hover:bg-white/10",
      cardStyles.glassMorphism,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
          <Calendar className="h-5 w-5" />
        </div>
      </div>
      
      {/* Mini calendar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-foreground/70">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            Today
          </button>
        </div>
        
        <div className="flex justify-between mt-4">
          {days.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "flex flex-col items-center justify-center w-10 h-10 rounded-full",
                day.isToday ? "bg-primary text-primary-foreground" : "hover:bg-white/10"
              )}
            >
              <span className="text-xs">{day.weekday}</span>
              <span className="text-sm font-semibold">{day.day}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 w-1 rounded-full",
                i === 3 ? "bg-primary" : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Events list */}
      <div className="space-y-2">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div 
              key={event.id} 
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
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
          <div className="p-4 text-center text-muted-foreground bg-white/5 rounded-lg">
            No upcoming events
          </div>
        )}
      </div>
    </div>
  );
}
