import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePaymentManagement } from "../hooks/usePaymentManagement";
import { AddPaymentModal } from "../payment/AddPaymentModal";
import { EditPaymentModal } from "../payment/EditPaymentModal";
import { DeletePaymentModal } from "../payment/DeletePaymentModal";
import { useTranslation } from "react-i18next";

const PaymentTab = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { payments, isLoading, addPayment, updatePayment, deletePayment } =
    usePaymentManagement();

  const [isAdding, setIsAdding] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<any | null>(null);

  if (isLoading) return <p>{t("common.loading")}</p>;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{t("payment.manageDescription")}</p>

      {payments.map((p) => (
        <div
          key={p.id}
          className="flex justify-between items-center p-3 border rounded-md"
        >
          <div>
            <p className="font-medium">{p.type}</p>
            <p className="text-sm text-muted-foreground">
              {p.cardNumber ? `${t("payment.hiddenNumber")} ${p.cardNumber.slice(-4)}` : t("common.notAvailable")} (
              {p.expiry || t("common.notAvailable")})
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingPayment(p)}
            >
              {t("common.edit")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeletingPayment(p)}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>
      ))}

      <Button className="w-full" onClick={() => setIsAdding(true)}>
        {t("payment.addNew")}
      </Button>

      {/* Add */}
      <AddPaymentModal
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onAdd={(payment) => {
          addPayment.mutate(payment, {
            onSuccess: () => toast({ title: t("payment.addSuccess") }),
            onError: () =>
              toast({ title: t("common.error"), variant: "destructive" }),
          });
        }}
      />

      {/* Edit */}
      {editingPayment && (
        <EditPaymentModal
          open={!!editingPayment}
          onClose={() => setEditingPayment(null)}
          payment={editingPayment}
          onUpdate={(id, data) =>
            updatePayment.mutate(
              { id, ...data },
              {
                onSuccess: () => {
                  toast({ title: t("payment.updateSuccess") });
                  setEditingPayment(null);
                },
                onError: () =>
                  toast({
                    title: t("payment.updateError"),
                    variant: "destructive",
                  }),
              }
            )
          }
        />
      )}

      {/* Delete */}
      {deletingPayment && (
        <DeletePaymentModal
          open={!!deletingPayment}
          onClose={() => setDeletingPayment(null)}
          onConfirm={() => {
            deletePayment.mutate(deletingPayment.id, {
              onSuccess: () => {
                toast({ title: t("payment.deleteSuccess") });
                setDeletingPayment(null);
              },
              onError: () =>
                toast({
                  title: t("payment.deleteError"),
                  variant: "destructive",
                }),
            });
          }}
        />
      )}
    </div>
  );
};

export default PaymentTab;
