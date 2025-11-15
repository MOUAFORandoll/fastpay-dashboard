"use client";

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
import { Key, Loader2 } from "lucide-react";

interface GenerateSecretConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isGenerating?: boolean;
}

export const GenerateSecretConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isGenerating = false,
}: GenerateSecretConfirmDialogProps) => {
  const handleOpenChange = (newOpen: boolean) => {
    if (!isGenerating) {
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
            <Key className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <AlertDialogTitle className="text-xl">Generate New Secret Key</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Generating a new secret key will override the previous one. The old secret key
            will no longer be valid and cannot be recovered. Make sure you have saved your
            current secret key before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isGenerating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isGenerating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Secret Key"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

