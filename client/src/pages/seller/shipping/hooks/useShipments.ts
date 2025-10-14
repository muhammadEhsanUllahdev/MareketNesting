import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shipment } from "../types/shipping";

export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    // Load static mock data only
    const fetchShipments = async () => {
      try {
        setIsLoading(true);

        const mockShipments: Shipment[] = [
          {
            id: "1",
            tracking_number: "YAL123456",
            customer_name: "Ahmed Benali",
            destination: "Alger",
            status: "en transit",
            created_at: "2024-06-05T10:30:00Z",
            carrier_id: "1",
            customer_address: "123 Rue de la Liberté, Alger",
            origin: "Oran",
            estimated_delivery: "2024-06-07T10:30:00Z",
            carrier: { name: "Yalidine" },
          },
          {
            id: "2",
            tracking_number: "ZOO789012",
            customer_name: "Fatima Krim",
            destination: "Oran",
            status: "livré",
            created_at: "2024-06-04T15:45:00Z",
            carrier_id: "2",
            customer_address: "456 Avenue Mohamed V, Oran",
            origin: "Alger",
            estimated_delivery: "2024-06-06T15:45:00Z",
            carrier: { name: "Zoom Delivery" },
          },
        ];

        setShipments(mockShipments);
      } catch (err) {
        console.error("Error loading shipments:", err);
        toast({
          title: "Error",
          description: "Erreur lors du chargement des expéditions",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipments();
  }, [toast]);

  const updateShipmentStatus = useMutation({
    mutationFn: async ({
      shipmentId,
      status,
    }: {
      shipmentId: string;
      status: string;
    }) => {
      // Just update local state (no DB yet)
      setShipments((prev) =>
        prev.map((shipment) =>
          shipment.id === shipmentId ? { ...shipment, status } : shipment
        )
      );
      return { id: shipmentId, status };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Statut mis à jour: ${data.status}`,
      });
    },
    onError: (error) => {
      console.error("Error updating shipment status:", error);
      toast({
        title: "Error",
        description: "Erreur lors de la mise à jour du statut",
      });
    },
  });

  return {
    shipments,
    isLoading,
    updateShipmentStatus,
  };
};
