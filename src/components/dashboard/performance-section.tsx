
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { StudentGradebookView } from "@/components/gradebook/student-gradebook-view";

interface PerformanceSectionProps {
  viewMode?: 'table' | 'grid';
}

export function PerformanceSection({ viewMode = 'grid' }: PerformanceSectionProps) {
  return (
    <div className="w-full">
      <Accordion type="multiple" defaultValue={["item-0"]} className="w-full">
        <AccordionItem value="item-0" className="border-b">
          <AccordionTrigger className="text-xl font-semibold">Semester Performance</AccordionTrigger>
          <AccordionContent>
            <StudentGradebookView viewMode={viewMode} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
