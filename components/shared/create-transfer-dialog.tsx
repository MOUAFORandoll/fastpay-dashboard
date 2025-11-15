"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Shield } from "lucide-react";
import { useTransfersStore } from "@/stores/transfers.store";
import type { CreateTransfertDto } from "@/types/api";
import type { ServiceMobileResponseDto } from "@/types/api";

interface Beneficiary {
  id: string;
  name: string;
  phone: string;
  country_id: string;
  code_phone?: string;
  [key: string]: unknown;
}

interface CreateTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceMobileResponseDto[];
  beneficiaries?: Beneficiary[];
  onCreateTransfer: (data: CreateTransfertDto) => Promise<void>;
  isLoading?: boolean;
}

interface TransferFormData {
  amount: number;
  name: string;
  phone: string;
  service_mobile_code: string;
  beneficiary_id?: string;
}

type WizardStep = "form" | "otp";
type BeneficiaryMode = "select" | "manual";

export const CreateTransferDialog = ({
  open,
  onOpenChange,
  services,
  beneficiaries = [],
  onCreateTransfer,
  isLoading = false,
}: CreateTransferDialogProps) => {
  const { sendTransferOtp, isLoading: isSendingOtp } = useTransfersStore();
  const [currentStep, setCurrentStep] = React.useState<WizardStep>("form");
  const [beneficiaryMode, setBeneficiaryMode] = React.useState<BeneficiaryMode>(
    beneficiaries.length > 0 ? "select" : "manual"
  );
  const [otp, setOtp] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isSendingOtpLocal, setIsSendingOtpLocal] = React.useState(false);
  const [transferData, setTransferData] = React.useState<TransferFormData | null>(null);

  const form = useForm<TransferFormData>({
    defaultValues: {
      amount: 0,
      name: "",
      phone: "",
      service_mobile_code: "",
      beneficiary_id: "",
    },
    mode: "onChange",
  });

  // Update mode when beneficiaries change (only if mode becomes invalid)
  React.useEffect(() => {
    if (beneficiaries.length === 0 && beneficiaryMode === "select") {
      setBeneficiaryMode("manual");
    }
  }, [beneficiaries.length, beneficiaryMode]);

  // Handle beneficiary selection
  const handleBeneficiaryChange = (beneficiaryId: string) => {
    const beneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
    if (beneficiary) {
      form.setValue("beneficiary_id", beneficiaryId);
      form.setValue("name", beneficiary.name);
      form.setValue("phone", beneficiary.phone);
    }
  };

  // Reset form when mode changes
  React.useEffect(() => {
    if (beneficiaryMode === "select") {
      form.setValue("name", "");
      form.setValue("phone", "");
      form.setValue("beneficiary_id", "");
    } else {
      form.setValue("beneficiary_id", "");
    }
  }, [beneficiaryMode, form]);

  const handleFormSubmit = async (data: TransferFormData) => {
    if (!data.service_mobile_code) {
      form.setError("service_mobile_code", {
        type: "required",
        message: "Mobile service is required",
      });
      return;
    }

    if (beneficiaryMode === "select" && !data.beneficiary_id) {
      form.setError("beneficiary_id", {
        type: "required",
        message: "Please select a beneficiary",
      });
      return;
    }

    if (beneficiaryMode === "manual") {
      if (!data.name) {
        form.setError("name", {
          type: "required",
          message: "Recipient name is required",
        });
        return;
      }
      if (!data.phone) {
        form.setError("phone", {
          type: "required",
          message: "Phone number is required",
        });
        return;
      }
    }

    setIsSendingOtpLocal(true);
    try {
      await sendTransferOtp();
      setTransferData(data);
      setCurrentStep("otp");
      toast.success("OTP sent to your registered email");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtpLocal(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP code");
      return;
    }

    if (!transferData) {
      toast.error("Transfer data is missing");
      return;
    }

    setIsVerifying(true);
    try {
      await onCreateTransfer({
        amount: transferData.amount,
        name: transferData.name,
        phone: transferData.phone,
        service_mobile_code: transferData.service_mobile_code,
        otp_code: otp,
      });
      toast.success("Transfer created successfully");
      handleClose();
    } catch (error) {
      toast.error("Failed to create transfer. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setCurrentStep("form");
    setOtp("");
    setTransferData(null);
    setBeneficiaryMode(beneficiaries.length > 0 ? "select" : "manual");
    form.reset();
    onOpenChange(false);
  };

  const handleBack = () => {
    setCurrentStep("form");
    setOtp("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "form" ? "Create New Transfer" : "Verify Transfer"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "form"
              ? "Enter the transfer details to proceed"
              : "Enter the OTP code sent to your email to confirm the transfer"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === "form" ? (
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                {...form.register("amount", {
                  required: "Amount is required",
                  min: { value: 0.01, message: "Amount must be greater than 0" },
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Beneficiary Selection Mode */}
            {beneficiaries.length > 0 && (
              <div className="space-y-3 rounded-lg border p-4">
                <Label>Beneficiary *</Label>
                <RadioGroup
                  value={beneficiaryMode}
                  onValueChange={(value) => setBeneficiaryMode(value as BeneficiaryMode)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="select" id="select-beneficiary" />
                    <Label htmlFor="select-beneficiary" className="font-normal cursor-pointer">
                      Select from list
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual-beneficiary" />
                    <Label htmlFor="manual-beneficiary" className="font-normal cursor-pointer">
                      Enter manually
                    </Label>
                  </div>
                </RadioGroup>

                {beneficiaryMode === "select" ? (
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary_id">Select Beneficiary *</Label>
                    <Select
                      value={form.watch("beneficiary_id")}
                      onValueChange={handleBeneficiaryChange}
                      disabled={beneficiaries.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            beneficiaries.length === 0
                              ? "No beneficiaries available"
                              : "Select a beneficiary"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {beneficiaries.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No beneficiaries available
                          </div>
                        ) : (
                          beneficiaries.map((beneficiary) => (
                            <SelectItem key={beneficiary.id} value={beneficiary.id}>
                              {beneficiary.name} - {beneficiary.code_phone && `${beneficiary.code_phone} `}
                              {beneficiary.phone}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.beneficiary_id && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.beneficiary_id.message}
                      </p>
                    )}
                    {form.watch("beneficiary_id") && (
                      <div className="rounded-md bg-muted/50 p-3 text-sm">
                        <div className="font-medium">
                          {beneficiaries.find((b) => b.id === form.watch("beneficiary_id"))?.name}
                        </div>
                        <div className="text-muted-foreground">
                          {beneficiaries.find((b) => b.id === form.watch("beneficiary_id"))?.code_phone && 
                            `${beneficiaries.find((b) => b.id === form.watch("beneficiary_id"))?.code_phone} `}
                          {beneficiaries.find((b) => b.id === form.watch("beneficiary_id"))?.phone}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Recipient Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter recipient name"
                        {...form.register("name", {
                          required: beneficiaryMode === "manual" ? "Recipient name is required" : false,
                        })}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        {...form.register("phone", {
                          required: beneficiaryMode === "manual" ? "Phone number is required" : false,
                        })}
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Manual Entry (when no beneficiaries or manual mode selected) */}
            {beneficiaries.length === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Recipient Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter recipient name"
                    {...form.register("name", {
                      required: "Recipient name is required",
                    })}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    {...form.register("phone", {
                      required: "Phone number is required",
                    })}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="service_mobile_code">Mobile Service *</Label>
              <Select
                value={form.watch("service_mobile_code")}
                onValueChange={(value) => {
                  form.setValue("service_mobile_code", value, { shouldValidate: true });
                }}
                disabled={services.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    services.length === 0 
                      ? "No services available" 
                      : "Select mobile service"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {services.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No active services available
                    </div>
                  ) : (
                    services
                      .filter((service) => service.isActive)
                      .map((service) => (
                        <SelectItem key={service.id} value={service.code_prefix}>
                          {service.name} ({service.code_prefix})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.service_mobile_code && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.service_mobile_code.message}
                </p>
              )}
              {services.length > 0 && services.filter((s) => s.isActive).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No active mobile services available. Please contact support.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isSendingOtp || isSendingOtpLocal}>
                {isLoading || isSendingOtp || isSendingOtpLocal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Transfer Summary */}
            {transferData && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "XOF",
                    }).format(transferData.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium">{transferData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{transferData.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{transferData.service_mobile_code}</span>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Enter the 4-digit OTP code</span>
              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isVerifying || isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Check your email for the OTP code
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isVerifying || isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleOtpSubmit}
                disabled={isVerifying || isLoading || otp.length !== 4}
              >
                {isVerifying || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Confirm Transfer"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

