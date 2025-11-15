"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import type { NewPaymentGroupedResponseDto } from "@/types/api";

interface GroupedPaymentSuccessData {
  currency: string;
  when_created: string;
  launch_url: string;
  reference: string;
  reason?: string;
}

interface GroupedPaymentSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: GroupedPaymentSuccessData | null;
}

export const GroupedPaymentSuccessDialog = ({
  open,
  onOpenChange,
  paymentData,
}: GroupedPaymentSuccessDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!paymentData?.launch_url) return;

    try {
      await navigator.clipboard.writeText(paymentData.launch_url);
      setCopied(true);
      toast.success("Payment link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenLink = () => {
    if (paymentData?.launch_url) {
      window.open(paymentData.launch_url, "_blank", "noopener,noreferrer");
    }
  };

  if (!paymentData) return null;

  const formattedDate = new Date(paymentData.when_created).toLocaleString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-green-400">
            Group Payment Link Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Your group payment link has been created. Share it with your group to start receiving payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reason */}
          {paymentData.reason && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Reason
              </label>
              <p className="text-sm font-medium">{paymentData.reason}</p>
            </div>
          )}

          {/* Reference */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Reference
            </label>
            <p className="text-sm font-mono font-medium">
              {paymentData.reference}
            </p>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Currency
            </label>
            <p className="text-sm font-medium">{paymentData.currency}</p>
          </div>

          {/* Created Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Created
            </label>
            <p className="text-sm font-medium">{formattedDate}</p>
          </div>

          {/* Payment Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Payment Link
            </label>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">
                {paymentData.launch_url}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                title="Copy payment link"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleOpenLink}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Link
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

