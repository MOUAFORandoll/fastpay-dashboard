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
import { Building2, Loader2 } from "lucide-react";
import type { UpdateOrganisationDto } from "@/types/api";

interface EditOrganisationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisation: {
    id: string;
    libelle: string;
    web_site?: string;
    description?: string;
  };
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading?: boolean;
}

export const EditOrganisationDialog = ({
  open,
  onOpenChange,
  organisation,
  description,
  onDescriptionChange,
  onSubmit,
  isLoading = false,
}: EditOrganisationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Edit Company Information</DialogTitle>
          <DialogDescription className="text-base">
            Update your organization details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={organisation.libelle}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Organization name cannot be changed
            </p>
          </div>

          {organisation.web_site && (
            <div className="space-y-2">
              <Label htmlFor="org-website">Website</Label>
              <Input
                id="org-website"
                value={organisation.web_site}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Website cannot be changed
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              placeholder="Enter organization description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={isLoading}
              rows={4}
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
            <Button type="submit" className="text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

