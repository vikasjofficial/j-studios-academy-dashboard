
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Course {
  id: string;
  name: string;
}

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse: string | null;
  onSelectCourse: (courseId: string) => void;
}

export function CourseSelector({ courses, selectedCourse, onSelectCourse }: CourseSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={selectedCourse === course.id ? "default" : "outline"}
            onClick={() => onSelectCourse(course.id)}
            size="sm"
            className={selectedCourse === course.id 
              ? "bg-primary text-primary-foreground font-medium shadow-md" 
              : "bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground border-primary/20"
            }
          >
            {course.name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
