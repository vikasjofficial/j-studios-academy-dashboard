
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">This page is under construction.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="h-5 w-5" />
            Under Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Hammer className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              The {title} page is still being developed. Please check back later for updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
