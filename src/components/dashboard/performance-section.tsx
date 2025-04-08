
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { StudentGradebookView } from "@/components/gradebook/student-gradebook-view";

export function PerformanceSection() {
  return (
    <div className="mt-8 w-full">
      <Accordion type="multiple" defaultValue={["item-0"]} className="w-full">
        <AccordionItem value="item-0" className="border-b">
          <AccordionTrigger className="text-xl font-semibold">Semester Performance</AccordionTrigger>
          <AccordionContent>
            <StudentGradebookView />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
