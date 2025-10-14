import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TrackingDetails from "./tracking/TrackingDetails";
import { useTranslation } from "react-i18next";

interface ShipmentDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  shipment: any;
  onUpdateStatus: (id: string, status: string) => void;
}

export const ShipmentDetailsDialog: React.FC<ShipmentDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  shipment,
  onUpdateStatus,
}) => {
  const { t } = useTranslation();

  if (!shipment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t("shipment.details.title", { id: shipment.packageId })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <TrackingDetails trackingItem={shipment} />

          <div className="border-t pt-4 flex flex-wrap justify-end gap-2">
            <Select
              onValueChange={(value) => {
                onUpdateStatus(shipment.id, value);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("shipment.details.updateStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("shipment.status.pending")}</SelectItem>
                <SelectItem value="in_transit">{t("shipment.status.inTransit")}</SelectItem>
                <SelectItem value="delivered">{t("shipment.status.delivered")}</SelectItem>
                <SelectItem value="delayed">{t("shipment.status.delayed")}</SelectItem>
                <SelectItem value="returned">{t("shipment.status.returned")}</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-green-600 hover:bg-green-700">
              {t("shipment.details.addEvent")}
            </Button>

            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetailsDialog;
