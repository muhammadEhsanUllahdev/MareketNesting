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
import { Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

interface ValidateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  onConfirm: (data: { priority: string; notes: string }) => Promise<void>;
}

const ValidateOrderDialog = ({
  open,
  onOpenChange,
  orderNumber,
  onConfirm,
}: ValidateOrderDialogProps) => {
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onConfirm({ priority, notes });
      toast({
        title: t("validateDialog.success.title"),
        description: t("validateDialog.success.description", { orderNumber }),
      });
      onOpenChange(false);
      setPriority("normal");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["sellerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    } catch (error) {
      toast({
        title: t("validateDialog.error.title"),
        description: t("validateDialog.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            {t("validateDialog.title", { orderNumber })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="priority">
              {t("validateDialog.priorityLabel")}
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="normal">
                  {t("validateDialog.priority.normal")}
                </SelectItem>
                <SelectItem value="urgent">
                  {t("validateDialog.priority.urgent")}
                </SelectItem>
                <SelectItem value="express">
                  {t("validateDialog.priority.express")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("validateDialog.notesLabel")}</Label>
            <Textarea
              id="notes"
              placeholder={t("validateDialog.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">
                  {t("validateDialog.autoActions.title")}
                </p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>{t("validateDialog.autoActions.notify")}</li>
                  <li>{t("validateDialog.autoActions.prepSlip")}</li>
                  <li>{t("validateDialog.autoActions.stockUpdate")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("validateDialog.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? t("validateDialog.submitting")
              : t("validateDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidateOrderDialog;
