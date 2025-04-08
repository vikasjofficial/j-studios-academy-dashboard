
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
  viewMode?: 'table' | 'grid';
}

export function SemesterAccordion({ 
  semesters, 
  getGrade, 
  getScoreColor,
  calculateSemesterAverage,
  viewMode = 'grid'
}: SemesterAccordionProps) {
  if (semesters.length === 0) return null;
  
  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {semesters.map((semester, index) => (
            <motion.div
              key={semester.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card/90 rounded-lg shadow-sm border border-border/50 overflow-hidden"
            >
              <div className="bg-muted/20 p-3 flex justify-between items-center">
                <h3 className="font-semibold text-primary-foreground">{semester.name}</h3>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {calculateSemesterAverage(semester.id)}
                </span>
              </div>
              <div className="p-3">
                <GradesList 
                  topics={semester.topics} 
                  getGrade={getGrade} 
                  getScoreColor={getScoreColor}
                  viewMode={viewMode}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

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
                viewMode={viewMode}
              />
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      ))}
    </Accordion>
  );
}
