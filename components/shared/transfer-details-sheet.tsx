"use client";

import * as React from "react";
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
import { Copy, Check, Calendar, DollarSign, User, Phone, CreditCard, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Transfer {
  id: string;
  amount: number;
  reference?: string;
  status?: string;
  createdAt?: string;
  beneficiary?: {
    id: string;
    name?: string | null;
    phone?: string;
    [key: string]: unknown;
  };
  service_mobile?: {
    id: string;
    name?: string;
    country?: string;
    code_prefix?: string;
    api_endpoint?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TransferDetailsSheetProps {
  transfer: Transfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  INIT: "bg-gray-100 text-gray-800",
  INEXECUTION: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETE: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  TIMEOUT: "bg-orange-100 text-orange-800",
};

export const TransferDetailsSheet = ({
  transfer,
  open,
  onOpenChange,
}: TransferDetailsSheetProps) => {
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

  if (!transfer) return null;

  const status = transfer.status || "INIT";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-8">
        <SheetHeader>
          <SheetTitle>Transfer Details</SheetTitle>
          <SheetDescription>
            View complete information about this transfer
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badge - Prominent Display */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Transfer Status</p>
                  <Badge
                    variant="outline"
                    className={`${statusColors[status] || statusColors.INIT} text-base px-3 py-1`}
                  >
                    {status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                  <p className="text-2xl font-bold">
                    {typeof transfer.amount === "number"
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "XOF",
                        }).format(transfer.amount)
                      : transfer.amount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Transfer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Transfer Information</h3>
            <Card>
              <CardContent className="pt-4 space-y-4">
                {/* Reference */}
                {transfer.reference && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Hash className="h-3.5 w-3.5" />
                      Reference
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                        {transfer.reference}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleCopy(transfer.reference!, "reference")}
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

                {/* Transfer ID */}
                {transfer.id && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transfer ID</div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-muted-foreground break-all">{transfer.id}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleCopy(transfer.id, "transfer-id")}
                      >
                        {copied === "transfer-id" ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Recipient Information */}
          {transfer.beneficiary && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Recipient</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    {transfer.beneficiary.name && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <User className="h-3.5 w-3.5" />
                          Name
                        </div>
                        <p className="text-sm font-medium">{transfer.beneficiary.name}</p>
                      </div>
                    )}
                    {transfer.beneficiary.phone && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <Phone className="h-3.5 w-3.5" />
                          Phone Number
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono">{transfer.beneficiary.phone}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleCopy(transfer.beneficiary!.phone!, "recipient-phone")}
                          >
                            {copied === "recipient-phone" ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {transfer.beneficiary.id && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Beneficiary ID</div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-muted-foreground break-all">{transfer.beneficiary.id}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleCopy(transfer.beneficiary!.id, "beneficiary-id")}
                          >
                            {copied === "beneficiary-id" ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Service Mobile Information */}
          {transfer.service_mobile && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Mobile Service</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    {transfer.service_mobile.name && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <CreditCard className="h-3.5 w-3.5" />
                          Service Name
                        </div>
                        <p className="text-sm font-medium">{transfer.service_mobile.name}</p>
                      </div>
                    )}
                    {transfer.service_mobile.code_prefix && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Code Prefix</div>
                        <Badge variant="outline" className="font-mono">
                          {transfer.service_mobile.code_prefix}
                        </Badge>
                      </div>
                    )}
                    {transfer.service_mobile.isActive !== undefined && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</div>
                        <Badge variant={transfer.service_mobile.isActive ? "default" : "secondary"}>
                          {transfer.service_mobile.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    )}
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
                {transfer.createdAt && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Calendar className="h-3.5 w-3.5" />
                      Created At
                    </div>
                    <p className="text-sm">
                      {new Date(transfer.createdAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

