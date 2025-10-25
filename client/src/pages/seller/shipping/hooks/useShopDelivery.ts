// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";

// interface DeliveryZone {
//   id: string;
//   zone_name: string;
//   price: number;
//   estimated_days: number;
//   is_active: boolean;
// }

// interface ShopDelivery {
//   id: string;
//   shop_id: string;
//   order_id: string;
//   delivery_zone_id: string;
//   tracking_number: string;
//   status: string;
//   estimated_delivery: string;
//   actual_delivery?: string;
//   delivery_notes?: string;
//   customer_address: string;
//   customer_phone?: string;
// }

// interface DeliveryEvent {
//   id: string;
//   shop_delivery_id: string;
//   status: string;
//   location?: string;
//   description?: string;
//   timestamp: string;
// }

// // Mock data
// const mockZones: DeliveryZone[] = [
//   {
//     id: "1",
//     zone_name: "Local Zone",
//     price: 5,
//     estimated_days: 2,
//     is_active: true,
//   },
//   {
//     id: "2",
//     zone_name: "National Zone",
//     price: 15,
//     estimated_days: 5,
//     is_active: true,
//   },
// ];

// const mockDeliveries: ShopDelivery[] = [
//   {
//     id: "101",
//     shop_id: "shop_1",
//     order_id: "order_1",
//     delivery_zone_id: "1",
//     tracking_number: "TRK-123456",
//     status: "pending",
//     estimated_delivery: "2025-10-10",
//     customer_address: "123 Rue Example",
//     customer_phone: "0555555555",
//   },
// ];

// let mockEvents: DeliveryEvent[] = [
//   {
//     id: "evt-1",
//     shop_delivery_id: "101",
//     status: "pending",
//     description: "Livraison créée",
//     timestamp: new Date().toISOString(),
//   },
// ];

// export const useShopDelivery = (shopId?: string) => {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   // Delivery zones
//   const { data: deliveryZones = [], isLoading: isLoadingZones } = useQuery({
//     queryKey: ["delivery-zones", shopId],
//     queryFn: async () => {
//       return mockZones.filter((z) => z.is_active);
//     },
//     enabled: !!shopId,
//   });

//   // Deliveries
//   const { data: shopDeliveries = [], isLoading: isLoadingDeliveries } =
//     useQuery({
//       queryKey: ["shop-deliveries", shopId],
//       queryFn: async () => {
//         return mockDeliveries.filter((d) => d.shop_id === shopId);
//       },
//       enabled: !!shopId,
//     });

//   // Add zone
//   const addDeliveryZone = useMutation({
//     mutationFn: async (
//       zone: Omit<DeliveryZone, "id"> & { shop_id: string }
//     ) => {
//       const newZone: DeliveryZone = { ...zone, id: Date.now().toString() };
//       mockZones.push(newZone);
//       return newZone;
//     },
//     onSuccess: () => {
//       toast({ title: "Zone de livraison ajoutée" });
//       queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
//     },
//   });

//   // Update zone
//   const updateDeliveryZone = useMutation({
//     mutationFn: async ({ id, ...zone }: DeliveryZone & { shop_id: string }) => {
//       const idx = mockZones.findIndex((z) => z.id === id);
//       if (idx > -1) mockZones[idx] = { ...mockZones[idx], ...zone };
//       return mockZones[idx];
//     },
//     onSuccess: () => {
//       toast({ title: "Zone mise à jour" });
//       queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
//     },
//   });

//   // Delete zone
//   const deleteDeliveryZone = useMutation({
//     mutationFn: async (id: string) => {
//       const idx = mockZones.findIndex((z) => z.id === id);
//       if (idx > -1) mockZones.splice(idx, 1);
//       return id;
//     },
//     onSuccess: () => {
//       toast({ title: "Zone supprimée" });
//       queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
//     },
//   });

//   // Create delivery
//   const createDelivery = useMutation({
//     mutationFn: async (
//       delivery: Omit<ShopDelivery, "id" | "tracking_number">
//     ) => {
//       const trackingNumber = `TRK-${Math.floor(Math.random() * 1000000)
//         .toString()
//         .padStart(6, "0")}`;

//       const newDelivery: ShopDelivery = {
//         ...delivery,
//         id: Date.now().toString(),
//         tracking_number: trackingNumber,
//       };

//       mockDeliveries.push(newDelivery);

//       mockEvents.push({
//         id: `evt-${Date.now()}`,
//         shop_delivery_id: newDelivery.id,
//         status: "pending",
//         description: "Livraison créée",
//         timestamp: new Date().toISOString(),
//       });

//       return newDelivery;
//     },
//     onSuccess: (data) => {
//       toast({
//         title: "Livraison créée",
//         description: `Tracking: ${data.tracking_number}`,
//       });
//       queryClient.invalidateQueries({ queryKey: ["shop-deliveries"] });
//     },
//   });

//   // Update delivery status
//   const updateDeliveryStatus = useMutation({
//     mutationFn: async ({
//       id,
//       status,
//       location,
//       description,
//     }: {
//       id: string;
//       status: string;
//       location?: string;
//       description?: string;
//     }) => {
//       const idx = mockDeliveries.findIndex((d) => d.id === id);
//       if (idx > -1) {
//         mockDeliveries[idx].status = status;
//         mockEvents.push({
//           id: `evt-${Date.now()}`,
//           shop_delivery_id: id,
//           status,
//           location,
//           description: description || `Statut mis à jour: ${status}`,
//           timestamp: new Date().toISOString(),
//         });
//         return mockDeliveries[idx];
//       }
//       throw new Error("Delivery not found");
//     },
//     onSuccess: () => {
//       toast({ title: "Statut mis à jour" });
//       queryClient.invalidateQueries({ queryKey: ["shop-deliveries"] });
//     },
//   });

//   // Get delivery events
//   const getDeliveryEvents = async (deliveryId: string) => {
//     return mockEvents.filter((e) => e.shop_delivery_id === deliveryId);
//   };

//   return {
//     deliveryZones,
//     shopDeliveries,
//     isLoadingZones,
//     isLoadingDeliveries,
//     addDeliveryZone,
//     updateDeliveryZone,
//     deleteDeliveryZone,
//     createDelivery,
//     updateDeliveryStatus,
//     getDeliveryEvents,
//   };
// };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface DeliveryZone {
  id: string;
  zone_name: string;
  price: number;
  estimated_days: number;
  is_active: boolean;
}

interface ShopDelivery {
  id: string;
  shop_id: string;
  order_id: string;
  delivery_zone_id: string;
  tracking_number: string;
  status: string;
  estimated_delivery: string;
  actual_delivery?: string;
  delivery_notes?: string;
  customer_address: string;
  customer_phone?: string;
}

interface DeliveryEvent {
  id: string;
  shop_delivery_id: string;
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
}

const mockZones: DeliveryZone[] = [
  {
    id: "1",
    zone_name: "Local Zone",
    price: 5,
    estimated_days: 2,
    is_active: true,
  },
  {
    id: "2",
    zone_name: "National Zone",
    price: 15,
    estimated_days: 5,
    is_active: true,
  },
];

const mockDeliveries: ShopDelivery[] = [
  {
    id: "101",
    shop_id: "shop_1",
    order_id: "order_1",
    delivery_zone_id: "1",
    tracking_number: "TRK-123456",
    status: "pending",
    estimated_delivery: "2025-10-10",
    customer_address: "123 Rue Example",
    customer_phone: "0555555555",
  },
];

let mockEvents: DeliveryEvent[] = [
  {
    id: "evt-1",
    shop_delivery_id: "101",
    status: "pending",
    description: "Livraison créée",
    timestamp: new Date().toISOString(),
  },
];

export const useShopDelivery = (shopId?: string) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: deliveryZones = [], isLoading: isLoadingZones } = useQuery({
    queryKey: ["delivery-zones", shopId],
    queryFn: async () => {
      return mockZones.filter((z) => z.is_active);
    },
    enabled: !!shopId,
  });

  const { data: shopDeliveries = [], isLoading: isLoadingDeliveries } =
    useQuery({
      queryKey: ["shop-deliveries", shopId],
      queryFn: async () => {
        return mockDeliveries.filter((d) => d.shop_id === shopId);
      },
      enabled: !!shopId,
    });

  const addDeliveryZone = useMutation({
    mutationFn: async (
      zone: Omit<DeliveryZone, "id"> & { shop_id: string }
    ) => {
      const newZone: DeliveryZone = { ...zone, id: Date.now().toString() };
      mockZones.push(newZone);
      return newZone;
    },
    onSuccess: () => {
      toast({ title: t("delivery.zoneAdded") });
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
    },
  });

  const updateDeliveryZone = useMutation({
    mutationFn: async ({ id, ...zone }: DeliveryZone & { shop_id: string }) => {
      const idx = mockZones.findIndex((z) => z.id === id);
      if (idx > -1) mockZones[idx] = { ...mockZones[idx], ...zone };
      return mockZones[idx];
    },
    onSuccess: () => {
      toast({ title: t("delivery.zoneUpdated") });
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
    },
  });

  const deleteDeliveryZone = useMutation({
    mutationFn: async (id: string) => {
      const idx = mockZones.findIndex((z) => z.id === id);
      if (idx > -1) mockZones.splice(idx, 1);
      return id;
    },
    onSuccess: () => {
      toast({ title: t("delivery.zoneDeleted") });
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
    },
  });

  const createDelivery = useMutation({
    mutationFn: async (
      delivery: Omit<ShopDelivery, "id" | "tracking_number">
    ) => {
      const trackingNumber = `TRK-${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`;

      const newDelivery: ShopDelivery = {
        ...delivery,
        id: Date.now().toString(),
        tracking_number: trackingNumber,
      };

      mockDeliveries.push(newDelivery);

      mockEvents.push({
        id: `evt-${Date.now()}`,
        shop_delivery_id: newDelivery.id,
        status: "pending",
        description: t("delivery.created"),
        timestamp: new Date().toISOString(),
      });

      return newDelivery;
    },
    onSuccess: (data) => {
      toast({
        title: t("delivery.created"),
        description: `${t("delivery.tracking")}: ${data.tracking_number}`,
      });
      queryClient.invalidateQueries({ queryKey: ["shop-deliveries"] });
    },
  });

  const updateDeliveryStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      location,
      description,
    }: {
      id: string;
      status: string;
      location?: string;
      description?: string;
    }) => {
      const idx = mockDeliveries.findIndex((d) => d.id === id);
      if (idx > -1) {
        mockDeliveries[idx].status = status;
        mockEvents.push({
          id: `evt-${Date.now()}`,
          shop_delivery_id: id,
          status,
          location,
          description: description || `${t("delivery.statusUpdated")}: ${status}`,
          timestamp: new Date().toISOString(),
        });
        return mockDeliveries[idx];
      }
      throw new Error(t("delivery.notFound"));
    },
    onSuccess: () => {
      toast({ title: t("delivery.statusUpdated") });
      queryClient.invalidateQueries({ queryKey: ["shop-deliveries"] });
    },
  });

  const getDeliveryEvents = async (deliveryId: string) => {
    return mockEvents.filter((e) => e.shop_delivery_id === deliveryId);
  };

  return {
    deliveryZones,
    shopDeliveries,
    isLoadingZones,
    isLoadingDeliveries,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    createDelivery,
    updateDeliveryStatus,
    getDeliveryEvents,
  };
};
