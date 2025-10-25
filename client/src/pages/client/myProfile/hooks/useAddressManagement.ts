import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useAddressManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: async () => {
      const res = await fetch("/api/user/addresses", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("address.fetchError"));
      return res.json();
    },
  });

  const addAddress = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t("address.addError"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    },
  });

  const updateAddress = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(t("address.updateError"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("address.deleteError"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    },
  });

  return { addresses, isLoading, addAddress, updateAddress, deleteAddress };
}
