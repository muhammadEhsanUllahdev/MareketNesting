import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useShippingRates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rates = [], isLoading: isLoadingRates } = useQuery({
    queryKey: ["shippingRates"],
    queryFn: async () => {
      const res = await fetch("/api/shipping-rates");
      if (!res.ok) throw new Error(t("error.failedToFetchRates"));
      return res.json();
    },
  });
const { t } = useTranslation();
  const createRate = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["shippingRates"] }),
    toast({
      title: t("toast.rateAdded"),
      description: t("toast.rateCreatedSuccessfully"),
    });
},
onError: () => {
  toast({
    title: t("toast.error"),
    description: t("toast.failedToAddRate"),
  });
},

  });

  const updateRate = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/shipping-rates/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["shippingRates"] }),
    toast({
      title: t("toast.rateUpdated"),
      description: t("toast.rateUpdatedSuccessfully"),
    });
},
onError: () => {
  toast({
    title: t("toast.error"),
    description: t("toast.failedToUpdateRate"),
  });
},
  });

  const deleteRate = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shipping-rates/${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["shippingRates"] }),
    toast({
      title: t("toast.rateDeleted"),
      description: t("toast.rateDeletedSuccessfully"),
    });
},
onError: () => {
  toast({
    title: t("toast.error"),
    description: t("toast.failedToDeleteRate"),
  });
},
  });

 const { data: config, isLoading: isLoadingConfig } = useQuery({
  queryKey: ["shippingConfig"],
  queryFn: async () => {
    const res = await fetch("/api/shipping-config");
    if (!res.ok) throw new Error(t("error.failedToFetchShippingConfig"));
    return res.json();
  },
});


  const updateConfig = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/shipping-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
   onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["shippingConfig"] }),
    toast({
      title: t("toast.configSaved"),
      description: t("toast.shippingSettingsUpdated"),
    });
},
onError: () => {
  toast({
    title: t("toast.error"),
    description: t("toast.failedToSaveConfig"),
  });
},

  });

  return {
    rates,
    isLoadingRates,
    createRate,
    updateRate,
    deleteRate,
    config,
    isLoadingConfig,
    updateConfig,
  };
}
