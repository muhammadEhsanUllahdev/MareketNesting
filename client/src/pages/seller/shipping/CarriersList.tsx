import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Phone,
  Globe,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import { useCarriers } from "./hooks/useCarriers";
import { CarrierForm } from "./CarrierForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "./utils/utils";
import type { Carrier } from "./hooks/useCarriers";
import { useTranslation } from "react-i18next";

interface CarrierItemProps {
  carrier: Carrier;
  onEdit: (carrier: Carrier) => void;
  onDelete: (id: string) => void;
}

const CarrierItem = ({ carrier, onEdit, onDelete }: CarrierItemProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="bg-gray-100 p-2 rounded-full">
          <Truck className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <h3 className="font-medium flex items-center gap-2">
            {carrier.name}
            <Badge
              className={
                carrier.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {carrier.isActive ? t("common.active") : t("common.inactive")}
            </Badge>
            {carrier.name === "Livraison par le marchand" && (
              <Badge className="bg-blue-100 text-blue-800">{t("carrier.custom")}</Badge>
            )}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            {carrier.supportPhone && (
              <div className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1" />
                {carrier.supportPhone}
              </div>
            )}
            {carrier.website && (
              <div className="flex items-center">
                <Globe className="h-3.5 w-3.5 mr-1" />
                {carrier.website}
              </div>
            )}
            {carrier.maxWeight && (
              <div className="flex items-center">
                <Package className="h-3.5 w-3.5 mr-1" />
               {t("carrier.max")}: {carrier.maxWeight} kg
              </div>
            )}
            {carrier.basePrice && carrier.basePrice > 0 && (
              <div className="flex items-center">
                {t("carrier.basePrice")}: {formatCurrency(carrier.basePrice)} DA
              </div>
            )}
          </div>
          {carrier.description && (
            <p className="text-sm text-gray-500 mt-1">{carrier.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(carrier)}
          className="flex items-center gap-1"
        >
          <Pencil className="h-4 w-4" />
          <span className="hidden sm:inline">{t("common.edit")}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(carrier.id || "")}
          className="text-red-600 flex items-center gap-1"
          disabled={carrier.name === "Livraison par le marchand"}
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t("common.delete")}</span>
        </Button>
      </div>
    </div>
  );
};

export const CarriersList: React.FC = () => {
  const { carriers, updateCarrier, deleteCarrier, isLoadingCarriers } =
    useCarriers();
  const { t } = useTranslation();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(
    undefined
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carrierToDelete, setCarrierToDelete] = useState<string | null>(null);

  const handleEdit = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setFormOpen(true);
  };

  const handleUpdate = (carrier: Carrier) => {
    if (selectedCarrier?.id) {
      updateCarrier.mutate({ ...carrier, id: selectedCarrier.id });
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setCarrierToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (carrierToDelete) {
      deleteCarrier.mutate(carrierToDelete);
    }
    setDeleteDialogOpen(false);
    setCarrierToDelete(null);
  };

  const handleOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setSelectedCarrier(undefined);
    }
  };

  if (isLoadingCarriers) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!carriers || carriers.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg">
        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="font-medium text-gray-600 mb-1">{t("carrier.noCarriers")}</h3>
        <p className="text-gray-500 text-sm mb-4">
          {t("carrier.addFirstCarrier")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        {carriers.map((carrier) => (
          <CarrierItem
            key={carrier.id}
            carrier={carrier}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <CarrierForm
        open={formOpen}
        onOpenChange={handleOpenChange}
        carrier={selectedCarrier}
        onSubmit={handleUpdate}
        onCancel={() => handleOpenChange(false)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.areYouSure")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("carrier.deleteWarning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CarriersList;
