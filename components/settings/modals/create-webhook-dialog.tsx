"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Webhook, Loader2 } from "lucide-react";

interface CreateWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: string;
  onLinkChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading?: boolean;
  isUpdateMode?: boolean;
}

export const CreateWebhookDialog = ({
  open,
  onOpenChange,
  link,
  onLinkChange,
  title,
  onTitleChange,
  onSubmit,
  isLoading = false,
  isUpdateMode = false,
}: CreateWebhookDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Webhook className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl">
            {isUpdateMode ? "Update Webhook" : "Create Webhook"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isUpdateMode
              ? "Update the webhook endpoint for this API key. Only one webhook is allowed per API key."
              : "Add a webhook endpoint for this API key. Only one webhook is allowed per API key."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-link">
              Webhook URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="webhook-link"
              type="url"
              placeholder="https://example.com/webhook"
              value={link}
              onChange={(e) => onLinkChange(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-title">Title (Optional)</Label>
            <Input
              id="webhook-title"
              placeholder="e.g., Payment Notifications"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white"
              disabled={isLoading || !link.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUpdateMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isUpdateMode ? "Update Webhook" : "Create Webhook"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

