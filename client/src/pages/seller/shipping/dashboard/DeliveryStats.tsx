import React from "react";
import { Package, Truck, CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shipment } from "../types/shipping";
import { useTranslation } from "react-i18next";

interface DeliveryStatsProps {
  shipments: Shipment[];
  isLoading: boolean;
}

export const DeliveryStats: React.FC<DeliveryStatsProps> = ({
  shipments,
  isLoading,
}) => {
  const { t } = useTranslation();

  const getDeliveryStats = () => {
    if (isLoading || !shipments)
      return {
        total: 0,
        inTransit: 0,
        delivered: 0,
        delayed: 0,
        returned: 0,
        todayDeliveries: 0,
      };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: shipments.length,
      inTransit: shipments.filter(
        (s) =>
          s.status?.toLowerCase() === "in_transit" ||
          s.status?.toLowerCase() === "en transit"
      ).length,
      delivered: shipments.filter(
        (s) =>
          s.status?.toLowerCase() === "delivered" ||
          s.status?.toLowerCase() === "livré"
      ).length,
      delayed: shipments.filter(
        (s) =>
          s.status?.toLowerCase() === "delayed" ||
          s.status?.toLowerCase() === "retardé"
      ).length,
      returned: shipments.filter(
        (s) =>
          s.status?.toLowerCase() === "returned" ||
          s.status?.toLowerCase() === "retourné"
      ).length,
      todayDeliveries: shipments.filter((s) => {
        if (!s.estimated_delivery) return false;
        const deliveryDate = new Date(s.estimated_delivery);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate.getTime() === today.getTime();
      }).length,
    };
  };

  const stats = getDeliveryStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-primary/5">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("deliveryStats.totalShipments")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.delivered} {t("deliveryStats.completedDeliveries")}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-blue-50">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("deliveryStats.inTransit")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round((stats.inTransit / (stats.total || 1)) * 100)}%{" "}
            {t("deliveryStats.ofShipments")}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-green-50">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("deliveryStats.todayDeliveries")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.todayDeliveries}</div>
            <div className="p-2 bg-green-100 rounded-full">
              <CalendarClock className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("deliveryStats.scheduledForToday")}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-red-50">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("deliveryStats.delayedDeliveries")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{stats.delayed}</div>
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.returned} {t("deliveryStats.returnedShipments")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryStats;
