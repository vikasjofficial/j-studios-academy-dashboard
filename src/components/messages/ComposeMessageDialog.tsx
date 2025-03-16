
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ComposeMessageForm } from "./ComposeMessageForm";
import * as z from "zod";
import { useState, useEffect } from "react";

const messageSchema = z.object({
  content: z.string().min(1, { message: "Message cannot be empty" }),
  message_type: z.string().min(1, { message: "Please select a message type" })
});

interface ComposeMessageDialogProps {
  onSubmit?: (data: z.infer<typeof messageSchema>) => Promise<void>;
  onClose?: () => void;
  isSending?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMessageSent?: () => Promise<void>;
}

export function ComposeMessageDialog({ 
  onSubmit, 
  onClose, 
  isSending = false, 
  onOpenChange,
  onMessageSent
}: ComposeMessageDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const handleSubmit = async (data: z.infer<typeof messageSchema>) => {
    if (onSubmit) {
      await onSubmit(data);
    }
    if (onMessageSent) {
      await onMessageSent();
    }
    setIsOpen(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
  };

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
          onSubmit={handleSubmit} 
          isSending={isSending} 
          onCancel={handleClose}
        />
      </div>
    </DialogContent>
  );
}
