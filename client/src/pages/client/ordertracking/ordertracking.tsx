"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useTranslation } from "react-i18next";

const trackingSteps = [
  { key: "received", label: "Package received", location: "Algiers" },
  { key: "preparation", label: "In preparation", location: "Algiers" },
  { key: "shipped", label: "Shipped", location: "Algiers" },
  { key: "in_transit", label: "In transit", location: "Sorting Center" },
  { key: "delivered", label: "Delivered", location: "Destination" },
  { key: "cancelled", label: "Cancelled", location: "System" },
];

const statusMap: Record<string, string> = {
  pending: "preparation",
  cancelled: "cancelled",
  shipped: "shipped",
  in_transit: "in_transit",
  delivered: "delivered",
};

export default function ClientOrderTracking() {
  const { t } = useTranslation();
  const user = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  return (
    <DashboardLayout
      title={t("tracking.orderTracking")}
      subtitle={t("tracking.realTimeTracking")}
    >
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{t("tracking.orderTracking")}</CardTitle>
            <CardDescription>
              {t("tracking.realTimeTracking")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">{t("tracking.loading")}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tracking.parcelId")}</TableHead>
                    <TableHead>{t("tracking.customer")}</TableHead>
                    <TableHead>{t("tracking.origin")}</TableHead>
                    <TableHead>{t("tracking.destination")}</TableHead>
                    <TableHead>{t("tracking.status")}</TableHead>
                    <TableHead>{t("tracking.estimatedDelivery")}</TableHead>
                    <TableHead>{t("tracking.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        {t("tracking.noOrdersFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          {order.items[0]?.vendorName || t("tracking.notAvailable")}
                        </TableCell>
                        <TableCell>{order.shippingAddress.city}</TableCell>
                        <TableCell>
                          <Badge>{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.deliveryDate).toLocaleDateString() ||
                            t("tracking.notAvailable")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{t("tracking.details")}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("tracking.packageDetails")} # {selectedOrder.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  {t("tracking.trackingNumber")}: {selectedOrder.trackingNumber}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("tracking.packageInfo")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      <strong>{t("tracking.estimatedDelivery")}:</strong>{" "}
                      {new Date(
                        selectedOrder.deliveryDate
                      ).toLocaleDateString() || t("tracking.notAvailable")}
                    </p>
                    <p>
                      <strong>{t("tracking.status")}:</strong>{" "}
                      <Badge>{selectedOrder.status}</Badge>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("tracking.deliveryDetails")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      <strong>{t("tracking.customer")}:</strong>{" "}
                      {selectedOrder.customerName}
                    </p>
                    <p>
                      <strong>{t("tracking.origin")}:</strong>{" "}
                      {selectedOrder.items[0]?.vendorName ||
                        t("tracking.notAvailable")}
                    </p>
                    <p>
                      <strong>{t("tracking.destination")}:</strong>{" "}
                      {selectedOrder.shippingAddress.city}
                    </p>
                    <p>
                      <strong>{t("tracking.contact")}:</strong>{" "}
                      {selectedOrder.customerPhone ||
                        selectedOrder.shippingAddress.phone}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  {t("tracking.trackingHistory")}
                </h3>
                <div className="relative border-l border-gray-200 dark:border-gray-700 pl-6 space-y-6">
                  {(() => {
                    const mappedStatus =
                      statusMap[selectedOrder.status] || "received";
                    const currentIndex = trackingSteps.findIndex(
                      (s) => s.key === mappedStatus
                    );

                    const visibleSteps = trackingSteps.slice(
                      0,
                      currentIndex + 1
                    );

                    return visibleSteps.map((step, idx) => {
                      const isCompleted = idx < currentIndex;
                      const isActive = idx === currentIndex;

                      return (
                        <div key={step.key} className="relative">
                          <div
                            className={`absolute -left-[26px] top-1 w-4 h-4 rounded-full ${
                              isActive
                                ? "bg-blue-500"
                                : isCompleted
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <p
                            className={`font-medium ${
                              isActive
                                ? "text-blue-600"
                                : isCompleted
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {t(`tracking.statusLabel.${step.key}`)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {step.location}
                          </p>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
