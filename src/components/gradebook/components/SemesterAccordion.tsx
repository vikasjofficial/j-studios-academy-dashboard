
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Semester, Grade } from "../types";
import { GradesList } from "./GradesList";
import { motion } from "framer-motion";

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
        <motion.div
          key={semester.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <AccordionItem value={`semester-${index}`} className="border-b overflow-hidden">
            <AccordionTrigger className="py-3 transition-colors hover:bg-muted/30">
              <div className="flex justify-between w-full pr-4">
                <span className="font-semibold text-primary-foreground">{semester.name}</span>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Average: {calculateSemesterAverage(semester.id)}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="transition-all duration-300 ease-in-out">
              <GradesList 
                topics={semester.topics} 
                getGrade={getGrade} 
                getScoreColor={getScoreColor} 
              />
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  );
}
