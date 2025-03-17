
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type?: string;
}

export interface CalendarCardProps {
  title?: string;
  events?: CalendarEvent[];
}

export function CalendarCard({ title = "Calendar", events = [] }: CalendarCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="border-b pb-2 last:border-0 last:pb-0">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-muted-foreground">{event.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-sm text-muted-foreground">
            No upcoming events.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
