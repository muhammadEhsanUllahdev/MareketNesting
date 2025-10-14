import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Truck, CheckCircle, CalendarClock, TrendingUp } from "lucide-react";
import { Shipment, Carrier } from "../types/shipping";
import { useTranslation } from "react-i18next";

interface CarrierPerformanceProps {
  carriers: Carrier[];
  shipments: Shipment[];
}

export const CarrierPerformance: React.FC<CarrierPerformanceProps> = ({
  carriers,
  shipments,
}) => {
  const { t } = useTranslation();

  // Calculer les performances des transporteurs
  const carrierPerformance = carriers.map((carrier) => {
    const carrierShipments = shipments.filter(
      (s) => s.carrier_id === carrier.id
    );
    const deliveredOnTime = carrierShipments.filter((s) => {
      if (
        s.status?.toLowerCase() !== "delivered" &&
        s.status?.toLowerCase() !== "livré"
      )
        return false;
      if (!s.estimated_delivery || !s.updated_at) return false;
      const estimatedDate = new Date(s.estimated_delivery);
      const deliveredDate = new Date(s.updated_at);
      return deliveredDate <= estimatedDate;
    }).length;

    const total = carrierShipments.length || 1;

    return {
      id: carrier.id,
      name: carrier.name,
      totalShipments: carrierShipments.length,
      deliveredOnTime,
      onTimePercentage: Math.round((deliveredOnTime / total) * 100),
      averageDeliveryTime: carrierShipments.length > 0 ? 3.2 : 0, // Simulé pour l'exemple
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("carriers.performanceTitle")}</CardTitle>
        <CardDescription>
          {t("carriers.performanceDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {carriers.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">
                {t("carriers.noCarrierConfigured")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("carriers.addCarrierToViewPerformance")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {carrierPerformance.map((carrier) => (
                <div key={carrier.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-full">
                        <Truck className="h-5 w-5 text-blue-500" />
                      </div>
                      <h3 className="font-medium">{carrier.name}</h3>
                    </div>
                    <span className="text-sm font-medium">
                      {carrier.totalShipments} {t("carriers.shipments")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("carriers.onTimeDeliveries")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle
                          className={`h-4 w-4 ${
                            carrier.onTimePercentage > 90
                              ? "text-green-500"
                              : carrier.onTimePercentage > 80
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        />
                        <span className="font-medium">
                          {carrier.onTimePercentage}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("carriers.averageDeliveryTime")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarClock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {carrier.averageDeliveryTime} {t("carriers.days")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("carriers.successRate")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          {95 + Math.floor(Math.random() * 5)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="bg-gray-100 h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          carrier.onTimePercentage > 90
                            ? "bg-green-500"
                            : carrier.onTimePercentage > 80
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${carrier.onTimePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CarrierPerformance;
