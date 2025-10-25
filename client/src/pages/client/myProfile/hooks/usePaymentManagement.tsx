import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const usePaymentManagement = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await fetch("/api/user/payments", { credentials: "include" });
      if (!res.ok) throw new Error(t("error.loadPayments"));
      return res.json();
    },
  });

  const addPayment = useMutation({
    mutationFn: async (payment) => {
      const res = await fetch("/api/user/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("error.addPayment"));
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });

  const updatePayment = useMutation({
    mutationFn: async (payment: { id: string; [key: string]: any }) => {
      const { id, ...data } = payment;
      const res = await fetch(`/api/user/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("error.updatePayment"));
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });

  const deletePayment = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/user/payments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("error.deletePayment"));
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments"] }),
  });

  return { payments, isLoading, addPayment, updatePayment, deletePayment };
};
