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
import { Truck, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { query } from "express";

interface ShipOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  orderId: string;
  orderCarrier?: string;
  estimatedDeliveryDate?: string;
  onConfirm: (data: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    notes: string;
  }) => Promise<void>;
}

const ShipOrderDialog = ({
  open,
  onOpenChange,
  orderNumber,
  orderId,
  orderCarrier,
  estimatedDeliveryDate,
  onConfirm,
}: ShipOrderDialogProps) => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const shipOrderMutation = useMutation({
    mutationFn: async (data: { trackingNumber: string; notes: string }) => {
      const res = await fetch(`/api/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("shipDialog.error.submit"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("shipDialog.success.title"),
        description: t("shipDialog.success.description", { orderNumber }),
      });
      onOpenChange(false);
      setTrackingNumber("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: t("shipDialog.error.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!trackingNumber) {
      toast({
        title: t("shipDialog.error.missingInfo.title"),
        description: t("shipDialog.error.missingInfo.description"),
        variant: "destructive",
      });
      return;
    }

    shipOrderMutation.mutate({
      trackingNumber,
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            {t("shipDialog.title", { orderNumber })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">{t("shipDialog.carrierLabel")}</Label>
            <Input
              id="carrier"
              value={orderCarrier || t("shipDialog.noCarrier")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">{t("shipDialog.trackingLabel")}</Label>
            <Input
              id="tracking"
              placeholder={t("shipDialog.trackingPlaceholder")}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery">{t("shipDialog.deliveryLabel")}</Label>
            <Input
              id="delivery"
              type="text"
              value={
                estimatedDeliveryDate
                  ? estimatedDeliveryDate
                  : t("shipDialog.noDeliveryDate")
              }
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("shipDialog.notesLabel")}</Label>
            <Textarea
              id="notes"
              placeholder={t("shipDialog.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">
                  {t("shipDialog.autoActions.title")}
                </p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>{t("shipDialog.autoActions.confirmationEmail")}</li>
                  <li>{t("shipDialog.autoActions.trackingLink")}</li>
                  <li>{t("shipDialog.autoActions.statusUpdate")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("shipDialog.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={shipOrderMutation.isPending}>
            {shipOrderMutation.isPending
              ? t("shipDialog.submitting")
              : t("shipDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShipOrderDialog;
