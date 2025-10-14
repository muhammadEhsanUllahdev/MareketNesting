import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus } from "lucide-react";
import CarriersList from "../CarriersList";
import CarrierForm from "../CarrierForm";
import { useCarriers } from "../hooks/carriers";
import { useTranslation } from "react-i18next";

const ShippingCarriers = () => {
  const [isAddingCarrier, setIsAddingCarrier] = useState(false);
  const { addCarrier } = useCarriers();
   const { t } = useTranslation();
  const handleAddCarrier = (carrier: any) => {
    addCarrier.mutate(carrier);
    setIsAddingCarrier(false);
  };
  return (
    <DashboardLayout title={t("carriers.title")}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("carriers.heading")}</h1>
            <p className="text-muted-foreground">{t("carriers.description")}</p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsAddingCarrier(true)}
          >
            <Plus className="h-4 w-4" />
            {t("carriers.addCarrier")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t("carriers.listTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CarriersList />
          </CardContent>
        </Card>

        <CarrierForm
          open={isAddingCarrier}
          onOpenChange={setIsAddingCarrier}
          onSubmit={handleAddCarrier}
        />
      </div>
    </DashboardLayout>
  );
};

export default ShippingCarriers;
