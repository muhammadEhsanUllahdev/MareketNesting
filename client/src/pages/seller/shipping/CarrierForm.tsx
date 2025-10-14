import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Carrier } from "./hooks/useCarriers";
import { Switch } from "@/components/ui/switch";
import { algerianTransporters } from "./data/algerianWilayas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

interface CarrierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (carrier: Carrier) => void;
  carrier?: Carrier;
  onCancel?: () => void;
}

export const CarrierForm = ({
  open,
  onOpenChange,
  onSubmit,
  carrier,
  onCancel,
}: CarrierFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Carrier>({
    id: "",
    name: "",
    description: "",
    website: "",
    supportPhone: "",
    maxWeight: 0,
    isActive: true,
    apiKey: "",
    basePrice: 0,
    deliversNationwide: false,
    contactInfo: "",
    service_areas: [],
  });
  const [selectedTab, setSelectedTab] = useState<string>("manual");

  useEffect(() => {
    if (carrier) {
      setFormData({
        ...carrier,
      });
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        website: "",
        supportPhone: "",
        maxWeight: 0,
        isActive: true,
        apiKey: "",
        basePrice: 0,
        deliversNationwide: false,
        contactInfo: "",
        service_areas: [],
      });
    }
  }, [carrier, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === "maxWeight" || id === "basePrice" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTransporterSelect = (
    transporter: (typeof algerianTransporters)[number]
  ) => {
    setFormData({
      ...formData,
      name: transporter.name,
      description: transporter.description,
      website: transporter.website,
      supportPhone: "",
      maxWeight: transporter.maxWeight,
      isActive: true,
      apiKey: "",
      basePrice: transporter.basePrice,
      deliversNationwide: transporter.coverage === "national",
    });
    setSelectedTab("manual");
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      deliversNationwide: checked,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {carrier ? t("carrier.editTitle") : t("carrier.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {carrier ? t("carrier.editDescription") : t("carrier.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">{t("carrier.tabs.algerianCarriers")}</TabsTrigger>
            <TabsTrigger value="manual">{t("carrier.tabs.manualConfig")}</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("carrier.availableAlgerianCarriers")}</h3>
              <div className="grid gap-4">
                {algerianTransporters.map((transporter) => (
                  <div
                    key={transporter.id}
                    className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTransporterSelect(transporter)}
                  >
                    <div>
                      <h4 className="font-medium">{transporter.name}</h4>
                      <p className="text-sm text-gray-500">
                        {transporter.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {transporter.website}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t("carrier.select")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("carrier.fields.name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("carrier.fields.description")}</Label>
                  <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t("carrier.fields.website")}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ""}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportPhone">{t("carrier.fields.supportPhone")}</Label>
                  <Input
                    id="supportPhone"
                    type="tel"
                    value={formData.supportPhone || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxWeight">{t("carrier.fields.maxWeight")}</Label>
                    <Input
                      id="maxWeight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.maxWeight || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice">{t("carrier.fields.basePrice")}</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      min="0"
                      value={formData.basePrice || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t("carrier.fields.apiKey")}</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey || ""}
                    onChange={handleChange}
                    placeholder={t("carrier.fields.apiKeyPlaceholder")}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isActive">{t("carrier.fields.active")}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="deliversNationwide"
                    checked={formData.deliversNationwide}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="deliversNationwide">
                     {t("carrier.fields.nationwideDelivery")}
                  </Label>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">
                  {carrier ? t("common.update") : t("common.add")}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CarrierForm;
