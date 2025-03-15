
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ComposeMessageForm } from "./ComposeMessageForm";
import * as z from "zod";

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
  message_type: z.string().min(1, { message: "Please select a message type" })
});

interface ComposeMessageDialogProps {
  onSubmit: (data: z.infer<typeof messageSchema>) => Promise<void>;
  onClose: () => void;
  isSending: boolean;
}

export function ComposeMessageDialog({ onSubmit, onClose, isSending }: ComposeMessageDialogProps) {
  return (
    <DialogContent className="sm:max-w-md" aria-describedby="compose-message-description">
      <DialogHeader>
        <DialogTitle>New Message</DialogTitle>
        <DialogDescription id="compose-message-description">
          Send a message to your instructors and administrators
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <ComposeMessageForm 
          onSubmit={onSubmit} 
          isSending={isSending} 
          onCancel={onClose}
        />
      </div>
    </DialogContent>
  );
}
