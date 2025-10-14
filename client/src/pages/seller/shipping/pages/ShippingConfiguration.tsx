import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Package } from "lucide-react";
import CarriersList from "../CarriersList";
import CarrierForm from "../CarrierForm";
import ShippingOptions from "../ShippingOptions";
import { useCarriers } from "../hooks/carriers";
import { MerchantDeliveryConfig } from "../MerchantDeliveryConfig";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

const ShippingConfiguration = () => {
  const [activeTab, setActiveTab] = useState("transporteurs");
  const [isAddingCarrier, setIsAddingCarrier] = useState(false);
  const [shopId, setShopId] = useState<string>("");
  const { carriers, addCarrier } = useCarriers();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  React.useEffect(() => {
    fetchCurrentShop();
  }, []);

  const fetchCurrentShop = async () => {
    console.log("Fetcheddddddddddd");
  };

  const handleAddCarrier = (carrier: any) => {
    addCarrier.mutate(carrier);
    setIsAddingCarrier(false);
  };
  const handleNavigateToShipping = () => {
    setLocation("/shop/shipping");
  };

  const handleNavigateToTracking = () => {
    setLocation("/shop/tracking");
  };
  return (
    <DashboardLayout title={t("shippingConfig.title")}>
      <div className="space-y-6">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {t("shippingConfig.heading")}
              </h2>
              <p className="text-gray-500 text-sm">
                {t("shippingConfig.subheading")}
              </p>
            </div>

            <div className="flex mb-6 gap-2">
              <Button
                variant={activeTab === "transporteurs" ? "default" : "outline"}
                onClick={() => setActiveTab("transporteurs")}
                className="flex items-center gap-2"
              >
                <Truck className="h-4 w-4" />
                {t("shippingConfig.tabs.carriers")}
              </Button>
              <Button
                variant={activeTab === "options" ? "default" : "outline"}
                onClick={() => setActiveTab("options")}
              >
                {t("shippingConfig.tabs.options")}
              </Button>
              <Button
                variant={activeTab === "limites" ? "default" : "outline"}
                onClick={() => setActiveTab("limites")}
              >
                {t("shippingConfig.tabs.limits")}
              </Button>
              <Button
                variant={activeTab === "personnalise" ? "default" : "outline"}
                onClick={() => setActiveTab("personnalise")}
                className="flex items-center gap-2"
              >
                <Truck className="h-4 w-4" />
                {t("shippingConfig.tabs.custom")}
              </Button>
            </div>

            {activeTab === "transporteurs" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">
                      {t("shippingConfig.carriers.title")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("shippingConfig.carriers.description")}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddingCarrier(true)}
                    className="flex items-center gap-2"
                  >
                    {t("shippingConfig.carriers.add")}
                  </Button>
                </div>

                <div className="bg-white border rounded-lg">
                  {carriers && carriers.length > 0 ? (
                    <CarriersList />
                  ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Truck className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="font-medium">
                        {t("shippingConfig.carriers.empty.title")}
                      </h3>
                      <p className="text-gray-500 max-w-md mb-6">
                        {t("shippingConfig.carriers.empty.description")}
                      </p>
                      <Button onClick={() => setIsAddingCarrier(true)}>
                        {t("shippingConfig.carriers.add")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "options" && (
              <div className="space-y-6">
                <ShippingOptions />
              </div>
            )}

            {activeTab === "limites" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">
                  {t("shippingConfig.limits.title")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border rounded-lg p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">
                      {t("shippingConfig.limits.maxWeight")}
                    </h4>
                    <div className="flex items-center">
                      <input
                        type="number"
                        className="border rounded px-3 py-2 w-24 text-right"
                        defaultValue="15"
                      />
                      <span className="ml-2">kg</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">
                      {t("shippingConfig.limits.defaultDimensions")}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="w-24">{t("shippingConfig.limits.length")}</span>
                        <input
                          type="number"
                          className="border rounded px-3 py-2 w-24 text-right"
                          defaultValue="30"
                        />
                        <span className="ml-2">cm</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-24">{t("shippingConfig.limits.width")}</span>
                        <input
                          type="number"
                          className="border rounded px-3 py-2 w-24 text-right"
                          defaultValue="20"
                        />
                        <span className="ml-2">cm</span>
                      </div>

                      <div className="flex items-center">
                        <span className="w-24">{t("shippingConfig.limits.height")}</span>
                        <input
                          type="number"
                          className="border rounded px-3 py-2 w-24 text-right"
                          defaultValue="15"
                        />
                        <span className="ml-2">cm</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button>{t("shippingConfig.save")}</Button>
                </div>
              </div>
            )}

            {activeTab === "personnalise" && shopId && (
              <div className="space-y-6">
                <MerchantDeliveryConfig shopId={shopId} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleNavigateToShipping}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            {t("shippingConfig.manageShipments")}
          </Button>
          <Button
            onClick={handleNavigateToTracking}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            {t("shippingConfig.tracking")}
          </Button>
        </div>
      </div>

      <CarrierForm
        open={isAddingCarrier}
        onOpenChange={setIsAddingCarrier}
        onSubmit={handleAddCarrier}
      />
    </DashboardLayout>
  );
};

export default ShippingConfiguration;
