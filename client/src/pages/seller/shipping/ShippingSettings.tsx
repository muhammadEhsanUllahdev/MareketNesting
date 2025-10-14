import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, TruckIcon, PackageIcon } from "lucide-react";
import { CarriersList } from "./CarriersList";
import { ShippingOptions } from "./ShippingOptions";
import { CarrierForm } from "./CarrierForm";
import { useCarriers } from "./hooks/useCarriers";
import { Carrier } from "./types/shipping";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const ShippingSettings = () => {
  const { t } = useTranslation();
  const { carriers, addCarrier, updateCarrier, isLoadingCarriers } =
    useCarriers();
  const [isAddCarrierOpen, setIsAddCarrierOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("carriers");
  const { toast } = useToast();

  const [packageLimits, setPackageLimits] = useState({
    maxWeight: 15,
    defaultDimensions: {
      length: 30,
      width: 20,
      height: 15,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleAddCarrier = (carrier: any) => {
    const carrierWithDefaults = {
      ...carrier,
      base_price: carrier.base_price || 0,
      is_active: carrier.is_active !== undefined ? carrier.is_active : true,
    };

    addCarrier.mutate(carrierWithDefaults);
    setIsAddCarrierOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (id.startsWith("dim-")) {
      const dimension = id.replace("dim-", "");
      setPackageLimits({
        ...packageLimits,
        defaultDimensions: {
          ...packageLimits.defaultDimensions,
          [dimension]: parseFloat(value) || 0,
        },
      });
    } else {
      setPackageLimits({
        ...packageLimits,
        [id]: parseFloat(value) || 0,
      });
    }
  };

  const saveLimits = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: t("shippingLimits.savedTitle"),
        description: t("shippingLimits.savedDescription"),
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t("shippingSettings.title")}</h2>
          <p className="text-gray-500">{t("shippingSettings.description")}</p>
        </div>

        <div className="flex gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            onClick={() => setActiveTab("carriers")}
            className={
              activeTab === "carriers"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            }
          >
            <TruckIcon className="h-4 w-4 mr-2" />
            {t("shippingSettings.carriersTab")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("options")}
            className={
              activeTab === "options"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            }
          >
            {t("shippingSettings.optionsTab")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab("limits")}
            className={
              activeTab === "limits"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : ""
            }
          >
            <PackageIcon className="h-4 w-4 mr-2" />
            {t("shippingSettings.limitsTab")}
          </Button>
        </div>
      </div>

      {activeTab === "carriers" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>{t("shippingSettings.carriers")}</CardTitle>
              <CardDescription>
                {t("shippingSettings.carriersDescription")}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddCarrierOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" /> {t("shippingSettings.add")}
            </Button>
          </CardHeader>
          <CardContent>
            <CarriersList />
          </CardContent>
        </Card>
      )}

      {activeTab === "options" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("shippingSettings.options")}</CardTitle>
            <CardDescription>
              {t("shippingSettings.optionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShippingOptions />
          </CardContent>
        </Card>
      )}

      {activeTab === "limits" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("shippingLimits.title")}</CardTitle>
            <CardDescription>
              {t("shippingLimits.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="maxWeight">{t("shippingLimits.maxWeight")}</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  value={packageLimits.maxWeight}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  {t("shippingLimits.maxWeightDescription")}
                </p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <Label>{t("shippingLimits.defaultDimensions")}</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dim-length" className="text-sm">
                      {t("shippingLimits.length")}
                    </Label>
                    <Input
                      id="dim-length"
                      type="number"
                      value={packageLimits.defaultDimensions.length}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dim-width" className="text-sm">
                      {t("shippingLimits.width")}
                    </Label>
                    <Input
                      id="dim-width"
                      type="number"
                      value={packageLimits.defaultDimensions.width}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dim-height" className="text-sm">
                      {t("shippingLimits.height")}
                    </Label>
                    <Input
                      id="dim-height"
                      type="number"
                      value={packageLimits.defaultDimensions.height}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("shippingLimits.defaultDimensionsDescription")}
                </p>
              </div>

              <div className="pt-4">
                <Button onClick={saveLimits} disabled={isSaving}>
                  {isSaving
                    ? t("shippingLimits.saving")
                    : t("shippingLimits.saveButton")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <CarrierForm
        open={isAddCarrierOpen}
        onOpenChange={setIsAddCarrierOpen}
        onSubmit={handleAddCarrier}
        onCancel={() => setIsAddCarrierOpen(false)}
      />
    </div>
  );
};

export default ShippingSettings;
