import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { ShieldAlert, AlertTriangle, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface FlagOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  orderId: string;
  customerName: string;
  onConfirm: (data: {
    reason: string;
    severity: string;
    description: string;
    freezeFunds: boolean;
    notifyTeam: boolean;
    escalate: boolean;
  }) => Promise<void>;
}

const FlagOrderDialog = ({
  open,
  onOpenChange,
  orderNumber,
  orderId,
  customerName,
  onConfirm,
}: FlagOrderDialogProps) => {
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [freezeFunds, setFreezeFunds] = useState(false);
  const [notifyTeam, setNotifyTeam] = useState(true);
  const [escalate, setEscalate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const flagReasons = [
    {
      value: "suspicious_payment",
      label: t("flagDialog.reasons.suspiciousPayment"),
    },
    { value: "fake_address", label: t("flagDialog.reasons.fakeAddress") },
    {
      value: "multiple_accounts",
      label: t("flagDialog.reasons.multipleAccounts"),
    },
    { value: "chargeback_risk", label: t("flagDialog.reasons.chargebackRisk") },
    {
      value: "unusual_behavior",
      label: t("flagDialog.reasons.unusualBehavior"),
    },
    {
      value: "high_value_order",
      label: t("flagDialog.reasons.highValueOrder"),
    },
    { value: "ip_mismatch", label: t("flagDialog.reasons.ipMismatch") },
    { value: "stolen_card", label: t("flagDialog.reasons.stolenCard") },
    { value: "velocity_check", label: t("flagDialog.reasons.velocityCheck") },
    { value: "manual_review", label: t("flagDialog.reasons.manualReview") },
    { value: "other", label: t("flagDialog.reasons.other") },
  ];

  const severityLevels = [
    {
      value: "low",
      label: t("flagDialog.severity.low"),
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      value: "medium",
      label: t("flagDialog.severity.medium"),
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      value: "high",
      label: t("flagDialog.severity.high"),
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      value: "critical",
      label: t("flagDialog.severity.critical"),
      color: "text-red-800",
      bg: "bg-red-100",
    },
  ];

  const flagOrderMutation = useMutation({
    mutationFn: async (data: {
      reason: string;
      severity: string;
      description: string;
      freezeFunds: boolean;
      notifyTeam: boolean;
      escalate: boolean;
    }) => {
      const res = await fetch(`/api/orders/${orderId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("flagDialog.error.failed"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("flagDialog.success.title"),
        description: t("flagDialog.success.description", { orderNumber }),
      });
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: t("flagDialog.error.title"),
        description: t("flagDialog.error.description"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!reason || !description.trim()) {
      toast({
        title: t("flagDialog.missing.title"),
        description: t("flagDialog.missing.description"),
        variant: "destructive",
      });
      return;
    }

    flagOrderMutation.mutate({
      reason,
      severity,
      description,
      freezeFunds,
      notifyTeam,
      escalate,
    });
  };

  const currentSeverity = severityLevels.find((s) => s.value === severity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            {t("flagDialog.title", { orderNumber })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{t("flagDialog.reasonLabel")}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={t("flagDialog.reasonPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {flagReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">{t("flagDialog.severityLabel")}</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <Flag className={`h-3 w-3 ${level.color}`} />
                      {level.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {t("flagDialog.descriptionLabel")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("flagDialog.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="freeze"
                checked={freezeFunds}
                onCheckedChange={(checked) =>
                  setFreezeFunds(checked as boolean)
                }
              />
              <Label htmlFor="freeze" className="text-sm">
                {t("flagDialog.freezeFunds")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifyTeam}
                onCheckedChange={(checked) => setNotifyTeam(checked as boolean)}
              />
              <Label htmlFor="notify" className="text-sm">
                {t("flagDialog.notifyTeam")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="escalate"
                checked={escalate}
                onCheckedChange={(checked) => setEscalate(checked as boolean)}
              />
              <Label htmlFor="escalate" className="text-sm">
                {t("flagDialog.escalate")}
              </Label>
            </div>
          </div>

          {currentSeverity && (
            <div className={`p-3 rounded-lg ${currentSeverity.bg}`}>
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={`h-4 w-4 ${currentSeverity.color} mt-0.5`}
                />
                <div className={`text-sm ${currentSeverity.color}`}>
                  <p className="font-medium">
                    {t("flagDialog.severityLevel", {
                      level: currentSeverity.label,
                    })}
                  </p>
                  <p className="mt-1">
                    {severity === "critical" &&
                      t("flagDialog.severityMessages.critical")}
                    {severity === "high" &&
                      t("flagDialog.severityMessages.high")}
                    {severity === "medium" &&
                      t("flagDialog.severityMessages.medium")}
                    {severity === "low" && t("flagDialog.severityMessages.low")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>{t("flagDialog.customer")}: </strong> {customerName}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {t("flagDialog.historyNote")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("flagDialog.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={flagOrderMutation.isPending}
            variant="destructive"
          >
            {flagOrderMutation.isPending
              ? t("flagDialog.submitting")
              : t("flagDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlagOrderDialog;
