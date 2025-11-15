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
import { Copy, Check, ExternalLink, Calendar, DollarSign, FileText, Building2, Hash, User, Phone, CreditCard, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Payment {
  id: string;
  reference?: string;
  amount: number;
  description?: string;
  status: string;
  transaction_type?: string;
  createdAt?: string;
  launch_url?: string;
  organisation?: {
    id: string;
    libelle?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    apiKeys?: unknown[];
    [key: string]: unknown;
  };
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

interface PaymentDetailsSheetProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string, reference?: string) => void;
}

const statusColors: Record<string, string> = {
  INIT: "bg-gray-100 text-gray-800",
  INEXECUTION: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETE: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  TIMEOUT: "bg-orange-100 text-orange-800",
};

export const PaymentDetailsSheet = ({
  payment,
  open,
  onOpenChange,
  onDelete,
}: PaymentDetailsSheetProps) => {
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
    if (payment?.launch_url) {
      window.open(payment.launch_url, "_blank");
    }
  };

  if (!payment) return null;

  const status = payment.status || "INIT";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-8">
        <SheetHeader>
          <SheetTitle>Payment Details</SheetTitle>
          <SheetDescription>
            View complete information about this payment
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badge - Prominent Display */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Payment Status</p>
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
                    {typeof payment.amount === "number"
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "XOF",
                        }).format(payment.amount)
                      : payment.amount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Payment Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Payment Information</h3>
            <Card>
              <CardContent className="pt-4 space-y-4">
                {/* Reference */}
                {payment.reference && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Hash className="h-3.5 w-3.5" />
                      Reference
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                        {payment.reference}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleCopy(payment.reference!, "reference")}
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

                {/* Description */}
                {payment.description && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <FileText className="h-3.5 w-3.5" />
                      Description
                    </div>
                    <p className="text-sm">{payment.description}</p>
                  </div>
                )}

                {/* Transaction Type */}
                {payment.transaction_type && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transaction Type</div>
                    <Badge variant="secondary">{payment.transaction_type}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Beneficiary Information */}
          {payment.beneficiary && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Beneficiary</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    {payment.beneficiary.name && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <User className="h-3.5 w-3.5" />
                          Name
                        </div>
                        <p className="text-sm font-medium">{payment.beneficiary.name}</p>
                      </div>
                    )}
                    {payment.beneficiary.phone && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <Phone className="h-3.5 w-3.5" />
                          Phone Number
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono">{payment.beneficiary.phone}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleCopy(payment.beneficiary!.phone!, "beneficiary-phone")}
                          >
                            {copied === "beneficiary-phone" ? (
                              <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {payment.beneficiary.id && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID</div>
                        <p className="text-xs font-mono text-muted-foreground">{payment.beneficiary.id}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Service Mobile Information */}
          {payment.service_mobile && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Mobile Service</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    {payment.service_mobile.name && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <CreditCard className="h-3.5 w-3.5" />
                          Service Name
                        </div>
                        <p className="text-sm font-medium">{payment.service_mobile.name}</p>
                      </div>
                    )}
                    {payment.service_mobile.code_prefix && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Code Prefix</div>
                        <Badge variant="outline" className="font-mono">
                          {payment.service_mobile.code_prefix}
                        </Badge>
                      </div>
                    )}
                    {payment.service_mobile.isActive !== undefined && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</div>
                        <Badge variant={payment.service_mobile.isActive ? "default" : "secondary"}>
                          {payment.service_mobile.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Organisation */}
          {payment.organisation && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Organisation</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <Building2 className="h-3.5 w-3.5" />
                        Name
                      </div>
                      <p className="text-sm font-medium">{payment.organisation.libelle || "-"}</p>
                    </div>
                    {payment.organisation.description && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</div>
                        <p className="text-sm text-muted-foreground">
                          {payment.organisation.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Payment Link */}
          {payment.launch_url && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Payment Link</h3>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <Globe className="h-3.5 w-3.5" />
                        URL
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-xs break-all">
                          {payment.launch_url}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => handleCopy(payment.launch_url!, "link")}
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
                {payment.createdAt && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Calendar className="h-3.5 w-3.5" />
                      Created At
                    </div>
                    <p className="text-sm">
                      {new Date(payment.createdAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                {payment.id && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payment ID</div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-muted-foreground break-all">{payment.id}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleCopy(payment.id, "payment-id")}
                      >
                        {copied === "payment-id" ? (
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

          {/* Actions */}
          {onDelete && (
            <>
              <Separator />
              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    onDelete(payment.id, payment.reference);
                    onOpenChange(false);
                  }}
                >
                  Delete Payment
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

