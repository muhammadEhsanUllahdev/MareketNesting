import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RefundOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  orderId: string;
  totalAmount: number;
  onConfirm: (data: {
    type: "partial" | "full";
    amount: number;
    reason: string;
    restockItems: boolean;
    notifyCustomer: boolean;
    notes: string;
  }) => Promise<void>;
}

const RefundOrderDialog = ({
  open,
  onOpenChange,
  orderNumber,
  orderId,
  totalAmount,
  onConfirm,
}: RefundOrderDialogProps) => {
  const [refundType, setRefundType] = useState<"partial" | "full">("full");
  const [amount, setAmount] = useState(totalAmount);
  const [reason, setReason] = useState("");
  const [restockItems, setRestockItems] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const refundReasons = [
    {
      value: "customer_request",
      label: t("refundDialog.reasons.customerRequest"),
    },
    { value: "defective_item", label: t("refundDialog.reasons.defectiveItem") },
    { value: "wrong_item", label: t("refundDialog.reasons.wrongItem") },
    {
      value: "damaged_shipping",
      label: t("refundDialog.reasons.damagedShipping"),
    },
    { value: "late_delivery", label: t("refundDialog.reasons.lateDelivery") },
    {
      value: "duplicate_order",
      label: t("refundDialog.reasons.duplicateOrder"),
    },
    {
      value: "fraud_prevention",
      label: t("refundDialog.reasons.fraudPrevention"),
    },
    { value: "other", label: t("refundDialog.reasons.other") },
  ];

  const handleTypeChange = (type: "partial" | "full") => {
    setRefundType(type);
    if (type === "full") {
      setAmount(totalAmount);
    } else {
      setAmount(0);
    }
  };

  const refundMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: refundType,
          amount,
          reason,
          restockItems,
          notifyCustomer,
          notes,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
       throw new Error(err.error || t("error.refundFailed"));
      }
      return res.json();
    },
    onSuccess: () => {
      // refresh orders list
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: t("refundDialog.success.title"),
        description: t("refundDialog.success.description", {
          amount: amount.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          }),
        }),
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t("refundDialog.error.title"),
        description: error.message || "Refund failed",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (!reason) {
        toast({
          title: t("refundDialog.error.missingReason.title"),
          description: t("refundDialog.error.missingReason.description"),
          variant: "destructive",
        });
        return;
      }

      if (amount <= 0 || amount > totalAmount) {
        toast({
          title: t("refundDialog.error.invalidAmount.title"),
          description: t("refundDialog.error.invalidAmount.description"),
          variant: "destructive",
        });
        return;
      }

      await refundMutation.mutateAsync();
    } catch (error) {
      toast({
        title: t("refundDialog.error.general.title"),
        description: t("refundDialog.error.general.description"),
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {t("refundDialog.title", { orderNumber })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>{t("refundDialog.typeLabel")}</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  checked={refundType === "full"}
                  onChange={() => handleTypeChange("full")}
                  className="text-primary"
                />
                <span>{t("refundDialog.fullRefund")}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  checked={refundType === "partial"}
                  onChange={() => handleTypeChange("partial")}
                  className="text-primary"
                />
                <span>{t("refundDialog.partialRefund")}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              {t("refundDialog.amountLabel", {
                max: totalAmount.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }),
              })}
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={totalAmount}
              min={0}
              step="0.01"
              disabled={refundType === "full"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("refundDialog.reasonLabel")}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("refundDialog.reasonPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {refundReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="restock"
                checked={restockItems}
                onCheckedChange={(checked) =>
                  setRestockItems(checked as boolean)
                }
              />
              <Label htmlFor="restock" className="text-sm">
                {t("refundDialog.restockItems")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifyCustomer}
                onCheckedChange={(checked) =>
                  setNotifyCustomer(checked as boolean)
                }
              />
              <Label htmlFor="notify" className="text-sm">
                {t("refundDialog.notifyCustomer")}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("refundDialog.notesLabel")}</Label>
            <Textarea
              id="notes"
              placeholder={t("refundDialog.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">{t("refundDialog.warningTitle")}</p>
                <p>{t("refundDialog.warningMessage")}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("refundDialog.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading
              ? t("refundDialog.submitting")
              : t("refundDialog.submit", {
                  amount: amount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }),
                })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundOrderDialog;
