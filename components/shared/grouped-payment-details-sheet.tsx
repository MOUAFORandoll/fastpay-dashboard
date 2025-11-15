"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink, Calendar, FileText, Building2, Hash, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface GroupedPayment {
  id: string;
  reference?: string;
  reason?: string;
  launch_url?: string;
  currency?: string;
  when_created?: string;
  createdAt?: string;
  organisation?: {
    id: string;
    libelle?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    apiKeys?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GroupedPaymentDetailsSheetProps {
  groupedPayment: GroupedPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string, reference?: string) => void;
}

export const GroupedPaymentDetailsSheet = ({
  groupedPayment,
  open,
  onOpenChange,
  onDelete,
}: GroupedPaymentDetailsSheetProps) => {
  const router = useRouter();
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleOpenLink = () => {
    if (groupedPayment?.launch_url) {
      window.open(groupedPayment.launch_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewTransactions = () => {
    if (groupedPayment?.id) {
      router.push(`/merchant/payments/grouped/${groupedPayment.id}`);
      onOpenChange(false);
    }
  };

  if (!groupedPayment) return null;

  const createdDate = groupedPayment.createdAt || groupedPayment.when_created;
  const formattedDate = createdDate
    ? new Date(createdDate as string).toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-8">
        <SheetHeader>
          <SheetTitle>Group Payment Details</SheetTitle>
          <SheetDescription>
            View complete information about this group payment link
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Group Payment Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Group Payment Information</h3>
            <Card>
              <CardContent className="pt-4 space-y-4">
                {/* ID */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Hash className="h-3.5 w-3.5" />
                    ID
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                      {groupedPayment.id}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleCopy(groupedPayment.id, "id")}
                    >
                      {copied === "id" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Reference */}
                {groupedPayment.reference && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Hash className="h-3.5 w-3.5" />
                      Reference
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                        {groupedPayment.reference}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleCopy(groupedPayment.reference!, "reference")}
                      >
                        {copied === "reference" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <FileText className="h-3.5 w-3.5" />
                    Reason
                  </div>
                  <p className="text-sm font-medium">{groupedPayment.reason || "-"}</p>
                </div>

                {/* Currency */}
                {groupedPayment.currency && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Currency</div>
                    <Badge variant="secondary">{groupedPayment.currency}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Organisation */}
          {groupedPayment.organisation && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Organisation</h3>
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Building2 className="h-3.5 w-3.5" />
                      Name
                    </div>
                    <p className="text-sm font-medium">{groupedPayment.organisation.libelle || "-"}</p>
                  </div>
                  {groupedPayment.organisation.description && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</div>
                      <p className="text-sm text-muted-foreground">
                        {groupedPayment.organisation.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {groupedPayment.organisation && <Separator />}

          {/* Payment Link */}
          {groupedPayment.launch_url && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Payment Link</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <ExternalLink className="h-3.5 w-3.5" />
                        URL
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0 rounded-md border bg-muted px-3 py-2 font-mono text-xs break-all">
                          {groupedPayment.launch_url}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => handleCopy(groupedPayment.launch_url!, "link")}
                        >
                          {copied === "link" ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenLink}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Payment Link
                    </Button>
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
            <Card>
              <CardContent className="pt-4 space-y-3">
                {formattedDate && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Calendar className="h-3.5 w-3.5" />
                      Created At
                    </div>
                    <p className="text-sm">{formattedDate}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="default"
                className="w-full"
                onClick={handleViewTransactions}
              >
                <Users className="mr-2 h-4 w-4" />
                View Transactions
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    onDelete(groupedPayment.id, groupedPayment.reference);
                    onOpenChange(false);
                  }}
                >
                  Delete Group Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

