import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShipments } from "./hooks/useShipments";
import { useCarriers } from "./hooks/useCarriers";
import ShipmentFilters from "./ShipmentFilters";
import ShipmentsTable from "./ShipmentsTable";
import ShipmentDetailsDialog from "./ShipmentDetailsDialog";
import { convertToTrackingItem, filterShipments } from "./utils/trackingUtils";
import { useTranslation } from "react-i18next";

export function ShipmentTrackingManager() {
  const { shipments, isLoading, updateShipmentStatus } = useShipments();
  const { carriers } = useCarriers();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCarrier, setSelectedCarrier] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);

  // Filter shipments by search term, carrier and status
  const filteredShipments = filterShipments(
    shipments,
    searchTerm,
    statusFilter,
    selectedCarrier
  );

  const handleViewDetails = (shipment: any) => {
    setSelectedShipment(convertToTrackingItem(shipment));
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateShipmentStatus.mutateAsync({
        shipmentId: id,
        status: newStatus,
      });
      setIsDetailsOpen(false); // Close the dialog after updating
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <ShipmentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedCarrier={selectedCarrier}
        setSelectedCarrier={setSelectedCarrier}
        carriers={carriers}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{t("shipment.tracking.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentsTable
            shipments={filteredShipments}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <ShipmentDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        shipment={selectedShipment}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default ShipmentTrackingManager;
