
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Semester, Grade } from "../types";
import { GradesList } from "./GradesList";

interface SemesterAccordionProps {
  semesters: Semester[];
  getGrade: (topicId: string) => Grade | null;
  getScoreColor: (score: number) => string;
  calculateSemesterAverage: (semesterId: string) => string;
}

export function SemesterAccordion({ 
  semesters, 
  getGrade, 
  getScoreColor,
  calculateSemesterAverage 
}: SemesterAccordionProps) {
  return (
    <Accordion 
      type="multiple" 
      defaultValue={semesters?.map((_, i) => `semester-${i}`) || []}
      className="w-full"
    >
      {semesters.map((semester, index) => (
        <AccordionItem key={semester.id} value={`semester-${index}`} className="border-b">
          <AccordionTrigger className="py-3">
            <div className="flex justify-between w-full pr-4">
              <span className="font-semibold">{semester.name}</span>
              <span className="text-sm font-medium">
                Average: {calculateSemesterAverage(semester.id)}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <GradesList 
              topics={semester.topics} 
              getGrade={getGrade} 
              getScoreColor={getScoreColor} 
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
