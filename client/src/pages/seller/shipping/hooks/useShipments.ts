// import { useState, useEffect } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";
// import { Shipment } from "../types/shipping";

// const API_URL = "/api/seller/shipments";

// export const useShipments = () => {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { toast } = useToast();

//   const fetchShipments = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(API_URL, { credentials: "include" });
//       if (!res.ok) throw new Error("Erreur API");
//       const data = await res.json();
//       setShipments(data);
//     } catch (err) {
//       toast({
//         title: "Erreur",
//         description: "Erreur lors du chargement des expéditions",
//         variant: "destructive",
//       });
//       setShipments([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShipments();
//   }, []);

//   // Mutation for updating shipment status
//   const updateShipmentStatus = useMutation({
//     mutationFn: async ({
//       shipmentId,
//       status,
//     }: {
//       shipmentId: string;
//       status: string;
//     }) => {
//       const res = await fetch(`${API_URL}/${shipmentId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ status }),
//       });
//       if (!res.ok) throw new Error("Erreur API");
//       toast({ title: "Statut mis à jour" });
//       fetchShipments();
//       return { id: shipmentId, status };
//     },
//     onError: () => {
//       toast({
//         title: "Erreur",
//         description: "Impossible de mettre à jour le statut",
//         variant: "destructive",
//       });
//     },
//   });

//   // Mutation for deleting shipment
//   const deleteShipment = useMutation({
//     mutationFn: async (shipmentId: string) => {
//       const res = await fetch(`${API_URL}/${shipmentId}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Erreur API");
//       toast({ title: "Expédition supprimée" });
//       fetchShipments();
//       return shipmentId;
//     },
//     onError: () => {
//       toast({
//         title: "Erreur",
//         description: "Impossible de supprimer l'expédition",
//         variant: "destructive",
//       });
//     },
//   });

//   return {
//     shipments,
//     isLoading,
//     updateShipmentStatus,
//     deleteShipment,
//     fetchShipments,
//   };
// };

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Shipment } from "../types/shipping";
import { useTranslation } from "react-i18next";

const API_URL = "/api/seller/shipments";

export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      if (!res.ok) throw new Error(t("errors.api"));
      const data = await res.json();
      setShipments(data);
    } catch (err) {
      toast({
        title: t("errors.title"),
        description: t("errors.fetchShipments"),
        variant: "destructive",
      });
      setShipments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const updateShipmentStatus = useMutation({
    mutationFn: async ({
      shipmentId,
      status,
    }: {
      shipmentId: string;
      status: string;
    }) => {
      const res = await fetch(`${API_URL}/${shipmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(t("errors.api"));
      toast({ title: t("shipment.statusUpdated") });
      fetchShipments();
      return { id: shipmentId, status };
    },
    onError: () => {
      toast({
        title: t("errors.title"),
        description: t("errors.updateShipmentStatus"),
        variant: "destructive",
      });
    },
  });

  const deleteShipment = useMutation({
    mutationFn: async (shipmentId: string) => {
      const res = await fetch(`${API_URL}/${shipmentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("errors.api"));
      toast({ title: t("shipment.deleted") });
      fetchShipments();
      return shipmentId;
    },
    onError: () => {
      toast({
        title: t("errors.title"),
        description: t("errors.deleteShipment"),
        variant: "destructive",
      });
    },
  });

  return {
    shipments,
    isLoading,
    updateShipmentStatus,
    deleteShipment,
    fetchShipments,
  };
};
