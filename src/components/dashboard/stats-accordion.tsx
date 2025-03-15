
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatsCard } from './stats-card';
import { DownloadIcon } from 'lucide-react';

// Define the array of color schemes
const colorSchemes = [
  { bg: "bg-amber-300", text: "text-black" },       // Yellow like Progress card
  { bg: "bg-orange-300", text: "text-black" },      // Orange like Time card
  { bg: "bg-green-300", text: "text-black" },       // Green like Streak card
  { bg: "bg-purple-300", text: "text-black" },      // Purple like Level card
  { bg: "bg-sky-300", text: "text-black" },         // Blue like Badges card
  { bg: "bg-pink-300", text: "text-black" },        // Pink option
  { bg: "bg-indigo-500", text: "text-white" },      // Indigo option
  { bg: "bg-emerald-500", text: "text-white" },     // Emerald option
  { bg: "bg-rose-500", text: "text-white" },        // Rose option
];

// Function to get a random color scheme
const getRandomColorScheme = () => {
  const randomIndex = Math.floor(Math.random() * colorSchemes.length);
  return colorSchemes[randomIndex];
};

export interface StatsData {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsAccordionProps {
  items: StatsData[];
  defaultValue?: string;
}

export function StatsAccordion({ items, defaultValue }: StatsAccordionProps) {
  // Assign a random color scheme to each item but ensure they're consistent on re-renders
  const [itemColors] = React.useState(() => 
    items.map(() => getRandomColorScheme())
  );

  return (
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      {items.map((item, index) => {
        const colorScheme = itemColors[index];
        
        return (
          <AccordionItem key={item.id} value={item.id} className="border-b-0 mb-4">
            <AccordionTrigger className="py-0 hover:no-underline">
              <StatsCard
                title={item.title}
                value={item.value}
                description={item.description}
                icon={item.icon}
                trend={item.trend}
                color={colorScheme.bg}
                textColor={colorScheme.text}
                className="w-full transition-all"
              />
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-2">
              <div className={`rounded-md p-4 ${colorScheme.bg} ${colorScheme.text} bg-opacity-50`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">More details about {item.title}</h4>
                    <p className="text-sm mt-1">This section provides additional information and actions related to {item.title.toLowerCase()}.</p>
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${colorScheme.text === "text-white" ? "bg-white/20" : "bg-black/10"}`}>
                    <DownloadIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
