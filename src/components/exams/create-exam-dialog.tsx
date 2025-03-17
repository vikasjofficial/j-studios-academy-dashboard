
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Exam, ExamType } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookPlus, Folder } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ExamFolder {
  id: string;
  name: string;
  exam_type: ExamType;
  created_at: string;
}

const formSchema = z.object({
  name: z.string().min(3, "Exam name must be at least 3 characters"),
  description: z.string().optional(),
  total_time_minutes: z.number().min(1, "Exam must have a duration"),
  exam_type: z.enum(["oral", "written", "practical"]),
  folder_id: z.string().optional(),
});

interface CreateExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateExam: (exam: Partial<Exam>) => Promise<Exam | null>;
  examType: ExamType;
  folders: ExamFolder[];
}

export function CreateExamDialog({
  open,
  onOpenChange,
  onCreateExam,
  examType,
  folders,
}: CreateExamDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form when the exam type changes or dialog opens/closes
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      total_time_minutes: 60,
      exam_type: examType,
      folder_id: "",
    },
  });

  // Update exam_type when examType prop changes
  useState(() => {
    form.setValue("exam_type", examType);
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Ensure the exam_type is correctly set based on the active tab
      const examData = {
        ...values,
        exam_type: examType, // Use the examType from props to ensure correct type
        folder_id: values.folder_id && values.folder_id !== "none" ? values.folder_id : null,
      };
      
      console.log("Creating exam with data:", examData);
      
      await onCreateExam(examData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="h-5 w-5" />
            Create New {examType.charAt(0).toUpperCase() + examType.slice(1)} Exam
          </DialogTitle>
          <DialogDescription>
            Create a new {examType} exam. The exam will appear in the {examType} exams tab.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Semester 1 Final Exam" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="folder_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a folder (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No folder</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center">
                            <Folder className="h-4 w-4 mr-2" />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter exam description..." 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_time_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden field to store the exam type */}
            <input 
              type="hidden" 
              {...form.register("exam_type")} 
              value={examType} // Ensure correct exam type
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Exam"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
