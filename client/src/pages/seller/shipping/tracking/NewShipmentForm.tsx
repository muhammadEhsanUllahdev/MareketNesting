import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface NewShipmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewShipmentForm: React.FC<NewShipmentFormProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("shipment.successTitle"),
      description: t("shipment.successDescription"),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shipment.createTitle")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">{t("shipment.customer")}</Label>
            <Input
              id="customer"
              placeholder={t("shipment.customerPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">{t("shipment.origin")}</Label>
              <Select defaultValue="alger">
                <SelectTrigger>
                  <SelectValue placeholder={t("shipment.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alger">
                    {t("shipment.cities.alger")}
                  </SelectItem>
                  <SelectItem value="oran">
                    {t("shipment.cities.oran")}
                  </SelectItem>
                  <SelectItem value="constantine">
                    {t("shipment.cities.constantine")}
                  </SelectItem>
                  <SelectItem value="annaba">
                    {t("shipment.cities.annaba")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">{t("shipment.destination")}</Label>
              <Select defaultValue="oran">
                <SelectTrigger>
                  <SelectValue placeholder={t("shipment.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alger">
                    {t("shipment.cities.alger")}
                  </SelectItem>
                  <SelectItem value="oran">
                    {t("shipment.cities.oran")}
                  </SelectItem>
                  <SelectItem value="constantine">
                    {t("shipment.cities.constantine")}
                  </SelectItem>
                  <SelectItem value="annaba">
                    {t("shipment.cities.annaba")}
                  </SelectItem>
                  <SelectItem value="tlemcen">
                    {t("shipment.cities.tlemcen")}
                  </SelectItem>
                  <SelectItem value="batna">
                    {t("shipment.cities.batna")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carrier">{t("shipment.carrier")}</Label>
              <Select defaultValue="expressdz">
                <SelectTrigger>
                  <SelectValue placeholder={t("shipment.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expressdz">
                    {t("shipment.carriers.expressdz")}
                  </SelectItem>
                  <SelectItem value="rapideshipping">
                    {t("shipment.carriers.rapideshipping")}
                  </SelectItem>
                  <SelectItem value="transportdz">
                    {t("shipment.carriers.transportdz")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDelivery">
                {t("shipment.estimatedDelivery")}
              </Label>
              <Input id="estimatedDelivery" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageDetails">
              {t("shipment.packageDetails")}
            </Label>
            <Input
              id="packageDetails"
              placeholder={t("shipment.packageDetailsPlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{t("shipment.weight")}</Label>
              <Input
                id="weight"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">
                {t("shipment.trackingNumber")}
              </Label>
              <Input
                id="trackingNumber"
                placeholder={t("shipment.trackingNumberPlaceholder")}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("shipment.createButton")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
