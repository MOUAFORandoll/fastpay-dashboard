"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NewCreateGroupedPaymentDto } from "@/types/api";

interface GroupedPaymentFormData {
  reason: string;
}

interface CreateGroupedPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: NewCreateGroupedPaymentDto) => Promise<void>;
  isLoading?: boolean;
}

export const CreateGroupedPaymentDialog = ({
  open,
  onOpenChange,
  onCreate,
  isLoading = false,
}: CreateGroupedPaymentDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<GroupedPaymentFormData>({
    defaultValues: {
      reason: "",
    },
  });

  const handleSubmit = async (data: GroupedPaymentFormData) => {
    setIsCreating(true);
    try {
      await onCreate({
        reason: data.reason,
      });
      toast.success("Grouped payment link created successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group Payment Link</DialogTitle>
          <DialogDescription>
            Create a payment link that can be shared with multiple people. Each person can make their own payment using this link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for this group payment (e.g., Event tickets, Group donation, etc.)"
              {...form.register("reason", {
                required: "Reason is required",
                minLength: {
                  value: 3,
                  message: "Reason must be at least 3 characters",
                },
              })}
              disabled={isCreating || isLoading}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating || isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isLoading}>
              {isCreating ? "Creating..." : "Create Payment Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

