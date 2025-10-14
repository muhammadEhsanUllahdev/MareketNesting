import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Carrier, ShippingOption } from "./types";

export function useCarriers() {
  const queryClient = useQueryClient();

  // ✅ Fetch carriers
  const { data: carriers = [], isLoading: isLoadingCarriers } = useQuery<
    Carrier[]
  >({
    queryKey: ["carriers"],
    queryFn: async () => {
      const res = await fetch("/api/carriers");
      if (!res.ok) throw new Error("Failed to fetch carriers");
      return res.json();
    },
  });

  const { data: shippingOptions = [], isLoading: isLoadingOptions } = useQuery<
    ShippingOption[]
  >({
    queryKey: ["shippingOptions"],
    queryFn: async () => {
      const res = await fetch("/api/shipping-options");
      if (!res.ok) throw new Error("Failed to fetch shipping options");
      return res.json();
    },
  });

  const createShippingOption = useMutation({
    mutationFn: async (data: ShippingOption & { carrierId: string }) => {
      const res = await fetch(
        `/api/carriers/${data.carrierId}/shipping-options`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to create option");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingOptions"] });
    },
  });

  // ✅ Mutations
  const addCarrier = useMutation({
    mutationFn: async (carrier: Carrier) => {
      const res = await fetch("/api/carriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carrier),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
    },
  });
  const updateShippingOption = useMutation({
    mutationFn: async (data: ShippingOption) => {
      const res = await fetch(`/api/shipping-options/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update option");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingOptions"] });
    },
  });

  const updateCarrier = useMutation({
    mutationFn: async (carrier: Carrier) => {
      const res = await fetch(`/api/carriers/${carrier.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carrier),
      });
      if (!res.ok) throw new Error("Failed to update carrier");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
    },
  });

  const deleteCarrier = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/carriers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete carrier");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
    },
  });

  const useCarrierOptions = (carrierId: string) =>
    useQuery<ShippingOption[]>({
      queryKey: ["shipping-options", carrierId],
      queryFn: async () => {
        const res = await fetch(`/api/carriers/${carrierId}/options`);
        if (!res.ok) throw new Error("Failed to fetch shipping options");
        return res.json();
      },
      enabled: !!carrierId, // only run if carrierId exists
    });

  return {
    carriers,
    isLoadingCarriers,
    isLoadingOptions,
    shippingOptions,
    addCarrier,
    updateCarrier,
    deleteCarrier,
    useCarrierOptions,
    createShippingOption,
    updateShippingOption,
  };
}
