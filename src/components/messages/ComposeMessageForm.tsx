
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
  message_type: z.string().min(1, { message: "Please select a message type" })
});

interface ComposeMessageFormProps {
  onSubmit: (data: z.infer<typeof messageSchema>) => Promise<void>;
  isSending: boolean;
  onCancel: () => void;
}

export function ComposeMessageForm({ onSubmit, isSending, onCancel }: ComposeMessageFormProps) {
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      message_type: "General"
    },
  });

  return (
    <div className="relative p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-100">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-grid-pattern"></div>
      <div className="relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message_type"
              render={({ field }) => (
                <FormItem>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a message type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Leave Request">Leave Request</SelectItem>
                      <SelectItem value="Absent Request">Absent Request</SelectItem>
                      <SelectItem value="Submission Request">Submission Request</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <Textarea 
                      placeholder="Type your message here..." 
                      className="min-h-[100px] resize-none border-gray-200 focus:border-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-2">
              <Button 
                type="button"
                variant="ghost" 
                onClick={onCancel}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                className="px-4"
                disabled={isSending || form.formState.isSubmitting}
              >
                {isSending || form.formState.isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
