"use client";

import { useState, useEffect } from "react";
import { useOrganisationsStore } from "@/stores/organisations.store";
import { resetOrganizationStores } from "@/stores";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Building2, ChevronDown, Plus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface OrganizationSwitcherProps {
  align?: "start" | "end";
  fullWidth?: boolean;
}

export const OrganizationSwitcher = ({
  align = "end",
  fullWidth = false,
}: OrganizationSwitcherProps) => {
  const {
    organisations,
    organisation,
    currentOrganisationId,
    getCurrentOrganisation,
    setCurrentOrganisationId,
    fetchMyOrganisations,
    createOrganisation,
    isLoading,
    error,
    clearError,
  } = useOrganisationsStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [libelle, setLibelle] = useState("");
  const [webSite, setWebSite] = useState("");
  const [description, setDescription] = useState("");

  // Fetch organizations on mount
  useEffect(() => {
    if (organisations.length === 0) {
      fetchMyOrganisations();
    }
  }, [organisations.length, fetchMyOrganisations]);

  const currentOrg = getCurrentOrganisation();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!libelle.trim()) {
      toast.error("Organization name is required");
      return;
    }

    if (!webSite.trim()) {
      toast.error("Website is required");
      return;
    }

    try {
      await createOrganisation({
        libelle: libelle.trim(),
        web_site: webSite.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Organization created successfully!");
      setIsCreateDialogOpen(false);
      setLibelle("");
      setWebSite("");
      setDescription("");
    } catch (error) {
      // Error is already handled by the store/API
      console.error("Failed to create organization:", error);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSwitchClick = (orgId: string) => {
    // Don't show confirmation if clicking on the same organization
    if (orgId === currentOrganisationId) {
      return;
    }
    setSwitchingOrgId(orgId);
    setIsSwitchDialogOpen(true);
  };

  const handleSwitchOrganization = async () => {
    if (!switchingOrgId) return;

    setIsSwitching(true);
    try {
      // Reset all organization-specific stores to clear old context
      resetOrganizationStores();
      
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set the new organization ID
      setCurrentOrganisationId(switchingOrgId);
      
      toast.success("Organization switched successfully");
      setIsSwitchDialogOpen(false);
      setSwitchingOrgId(null);
      
      // Reload the app to fully reinitialize with new organization context
      // This ensures all components re-fetch data for the new organization
      window.location.reload();
    } catch (error) {
      toast.error("Failed to switch organization");
      console.error("Failed to switch organization:", error);
      setIsSwitching(false);
    }
  };

  const getSwitchingOrg = () => {
    if (!switchingOrgId) return null;
    return organisations.find(org => org.id === switchingOrgId);
  };

  if (!currentOrg && organisations.length === 0) {
    return null;
  }

  const displayOrg = currentOrg || organisations[0];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
            variant="outline"
            disabled={isSwitching}
            className={`flex items-center gap-2 whitespace-nowrap ${
              fullWidth ? "w-full justify-between" : ""
            }`}
          >
            {isSwitching ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span className={`truncate ${fullWidth ? "flex-1" : "max-w-[200px]"}`}>
                  Switching...
                </span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4 shrink-0" />
                <span className={`truncate ${fullWidth ? "flex-1" : "max-w-[200px]"}`}>
                  {displayOrg?.libelle || "Select Organization"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-64">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organisations.length > 0 ? (
            <>
              {organisations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => handleSwitchClick(org.id)}
                  disabled={isSwitching || currentOrganisationId === org.id}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-medium truncate w-full">{org.libelle}</span>
                    {org.web_site && (
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {org.web_site}
                      </span>
                    )}
                  </div>
                  {currentOrganisationId === org.id && (
                    <Check className="h-4 w-4 ml-2 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </>
          ) : (
            <DropdownMenuItem disabled>
              No organizations found
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleOpenCreateDialog}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl">
              Create New Organization
            </DialogTitle>
            <DialogDescription className="text-base">
              Create a new organization to manage your payments, transfers, and
              other merchant activities.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-libelle">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-libelle"
                placeholder="Enter organization name"
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-web_site">
                Website <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-web_site"
                type="url"
                placeholder="https://example.com"
                value={webSite}
                onChange={(e) => setWebSite(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-description">
                Description (Optional)
              </Label>
              <Input
                id="new-description"
                placeholder="Enter organization description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !libelle.trim() || !webSite.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={isSwitchDialogOpen} 
        onOpenChange={(open) => {
          if (!isSwitching) {
            setIsSwitchDialogOpen(open);
            if (!open) {
              setSwitchingOrgId(null);
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to{" "}
              <strong>{getSwitchingOrg()?.libelle}</strong>? This will change the
              current organization context for all your operations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSwitching}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSwitchOrganization}
              disabled={isSwitching}
            >
              {isSwitching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching...
                </>
              ) : (
                "Switch"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

