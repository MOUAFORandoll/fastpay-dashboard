"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Webhook } from "lucide-react";
import { toast } from "sonner";

interface DeleteWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: {
    id: string;
    link: string;
    title?: string;
  } | null;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteWebhookDialog = ({
  open,
  onOpenChange,
  webhook,
  onConfirm,
  isDeleting = false,
}: DeleteWebhookDialogProps) => {
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setDeleteConfirmationText("");
      }
    }
  };

  const handleConfirm = async () => {
    if (deleteConfirmationText.trim().toLowerCase() !== "delete") {
      toast.error("Please type 'delete' to confirm");
      return;
    }
    await onConfirm();
    setDeleteConfirmationText("");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
            <Webhook className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-xl">Delete Webhook</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            This action cannot be undone. This will permanently delete the webhook
            {webhook?.title && (
              <>
                {" "}
                <strong className="font-semibold">"{webhook.title}"</strong>
              </>
            )}
            . The webhook URL{" "}
            <strong className="font-mono text-sm">{webhook?.link}</strong> will no longer
            receive notifications.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="delete-webhook-confirmation" className="text-sm font-medium">
              Type <span className="font-mono text-destructive">delete</span> to confirm:
            </Label>
            <Input
              id="delete-webhook-confirmation"
              placeholder="Type 'delete' to confirm"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              disabled={isDeleting}
              className="font-mono"
              autoFocus
            />
          </div>
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> This action will immediately stop all webhook
              notifications to this URL. Any integrations relying on this webhook will stop
              receiving updates.
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || deleteConfirmationText.trim().toLowerCase() !== "delete"}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Webhook
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

