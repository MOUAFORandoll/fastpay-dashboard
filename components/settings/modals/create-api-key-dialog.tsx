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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Key, Loader2 } from "lucide-react";

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading?: boolean;
}

export const CreateApiKeyDialog = ({
  open,
  onOpenChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  onSubmit,
  isLoading = false,
}: CreateApiKeyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Create API Key</DialogTitle>
          <DialogDescription className="text-base">
            Generate a new API key for programmatic access to your organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="api-key-title"
              placeholder="e.g., Production API Key"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key-description">Description (Optional)</Label>
            <Textarea
              id="api-key-description"
              placeholder="Enter a description for this API key"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={isLoading}
              rows={3}
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
              disabled={isLoading || !title.trim()}
              className="text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create API Key"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

