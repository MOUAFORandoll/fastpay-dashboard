"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Copy } from "lucide-react";
import { toast } from "sonner";

interface ShowApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKeyData: {
    key: string;
    secret: string;
  } | null;
  onConfirm: () => void;
}

export const ShowApiKeyDialog = ({
  open,
  onOpenChange,
  apiKeyData,
  onConfirm,
}: ShowApiKeyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
            <Key className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-2xl">API Key Created</DialogTitle>
          <DialogDescription className="text-base">
            Your API key and secret have been generated. Please copy them now as
            they will not be shown again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                {apiKeyData?.key}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (apiKeyData?.key) {
                    navigator.clipboard.writeText(apiKeyData.key);
                    toast.success("API key copied to clipboard");
                  }
                }}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secret Key</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                {apiKeyData?.secret}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (apiKeyData?.secret) {
                    navigator.clipboard.writeText(apiKeyData.secret);
                    toast.success("Secret key copied to clipboard");
                  }
                }}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Store both the API key and secret securely.
              You will not be able to view the secret again. If you lose it, you'll
              need to generate a new API key, which will discard the previous one.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onConfirm}>I've copied both keys</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

