
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog } from "@/components/ui/dialog";
import { ComposeMessageForm } from "./ComposeMessageForm";
import * as z from "zod";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const handleSubmit = async (data: z.infer<typeof messageSchema>) => {
    if (onSubmit) {
      await onSubmit(data);
    }
    if (onMessageSent) {
      await onMessageSent();
    }
    handleOpenChange(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
    </Dialog>
  );
}
