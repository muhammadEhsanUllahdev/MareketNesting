import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import PromotionModal from "@/components/modals/promotion-modal";
import { Edit, Eye, Gift, Package, Search, Trash, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next"; // ✅ i18n hook added

// types
type Promo = {
  id: string;
  promoCode: string;
  discountType: string;
  value: string;
  startDate: string;
  endDate: string;
  minimumPurchase: string;
  usageLimit: number;
  isActive: boolean;
  createdAt: string;
};

export default function AdminPromotions() {
  const { t } = useTranslation(); // ✅ i18n translation instance
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Promo | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<Promo | null>(null);
  const { toast } = useToast();

  function DeletePromotionModal({
    isOpen,
    onClose,
    promotion,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    promotion: any;
    onConfirm: () => void;
  }) {
    if (!promotion) return null;
    const promoName = promotion.promoCode || t("promotions.unnamedPromotion");

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("promotions.deleteTitle")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("promotions.deleteConfirmation")}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              {t("promotions.deleteWarning")}{" "}
              <span className="font-medium">{promoName}</span>.{" "}
              {t("promotions.actionCannotBeUndone")}
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-amber-400 rounded-full flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <strong>{t("promotions.warningLabel")}</strong>{" "}
                  {t("promotions.deleteImpact")}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirm}
            >
              {t("common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { data: promotions = [], isLoading } = useQuery<Promo[]>({
    queryKey: ["/api/admin/promotions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/promotions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(t("promotions.fetchError"));
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t("promotions.createError"));
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("promotions.created"),
        description: t("promotions.createSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t("promotions.updateError"));
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t("promotions.updated"),
        description: t("promotions.updateSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204)
        throw new Error(t("promotions.deleteError"));
      return true;
    },
    onSuccess: () => {
      toast({
        title: t("promotions.deleted"),
        description: t("promotions.deleteSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      setDeleteModalOpen(false);
      setPromoToDelete(null);
    },
  });

  const handleCreate = (formData: any) => {
    createMutation.mutate({
      ...formData,
    });
  };

  const handleUpdate = (formData: any) => {
    if (!selected) return;
    updateMutation.mutate({ id: selected.id, payload: formData });
  };

  const handleOpenCreate = () => {
    setSelected(null);
    setViewOnly(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (promo: Promo) => {
    setSelected(promo);
    setViewOnly(false);
    setModalOpen(true);
  };

  const handleOpenView = (promo: Promo) => {
    setSelected(promo);
    setViewOnly(true);
    setModalOpen(true);
  };

  const filteredPromotions = promotions.filter((p) => {
    return (
      !searchQuery ||
      p.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.discountType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) return <p className="p-4">{t("promotions.loading")}</p>;

  return (
    <DashboardLayout title={t("promotions.title")}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            {t("promotions.managementTitle")}
          </h1>
          <div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {t("promotions.addPromotion")}
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("promotions.searchPlaceholder")}
            className="pl-10 w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader className="text-lg font-medium p-4 border-b">
            {t("promotions.listTitle")}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("promotions.code")}</TableHead>
                  <TableHead>{t("promotions.type")}</TableHead>
                  <TableHead>{t("promotions.value")}</TableHead>
                  <TableHead>{t("promotions.start")}</TableHead>
                  <TableHead>{t("promotions.end")}</TableHead>
                  <TableHead>{t("promotions.minPurchase")}</TableHead>
                  <TableHead>{t("promotions.usageLimit")}</TableHead>
                  <TableHead>{t("promotions.status")}</TableHead>
                  <TableHead>{t("promotions.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length === 0 ? (
                   <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t("promotions.noPromotions")}
                        </h3>
                        <p className="text-gray-600">
                          {t("promotions.noPromotionsDetails")}
                        </p>
                      </TableCell>
                    </TableRow>
                  // <TableRow>
                  //   <TableCell colSpan={9}>
                  //     {t("promotions.noPromotions")}
                  //   </TableCell>
                  // </TableRow>
                ) : (
                  filteredPromotions.map((p: Promo) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.promoCode}</TableCell>
                      <TableCell>{p.discountType}</TableCell>
                      <TableCell>{p.value}</TableCell>
                      <TableCell>
                        {new Date(p.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(p.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{p.minimumPurchase}</TableCell>
                      <TableCell>{p.usageLimit}</TableCell>
                      <TableCell>
                        {p.isActive
                          ? t("promotions.active")
                          : t("promotions.inactive")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenView(p)}
                            className="text-sm text-gray-600"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="text-sm text-blue-600"
                          >
                            <Edit size={16} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModalOpen(true);
                              setPromoToDelete(p);
                            }}
                            className="text-sm text-red-600"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {deleteModalOpen && (
        <DeletePromotionModal
          isOpen={deleteModalOpen}
          promotion={promoToDelete}
          onClose={() => {
            setDeleteModalOpen(false);
            setPromoToDelete(null);
          }}
          onConfirm={() => {
            if (promoToDelete) {
              deleteMutation.mutate(promoToDelete.id);
            }
          }}
        />
      )}

      <PromotionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isEdit={!!selected}
        initialData={selected || undefined}
        viewOnly={viewOnly}
        onSave={(form) => {
          if (selected) handleUpdate(form);
          else handleCreate(form);
        }}
      />
    </DashboardLayout>
  );
}
