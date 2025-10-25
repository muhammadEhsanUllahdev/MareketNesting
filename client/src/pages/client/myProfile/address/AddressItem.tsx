import React from "react";
import { Address } from "../Profile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface AddressItemProps {
  newAddress: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onSetDelivery: (id: string) => void;
}

const AddressItem = ({
  newAddress,
  onEdit,
  onDelete,
  onSetDefault,
  onSetDelivery,
}: AddressItemProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-2">
      <div className="font-medium">{newAddress.fullName}</div>
      <div className="font-medium">{newAddress.phone}</div>
      <div className="font-medium">
        {newAddress.street}, {newAddress.city}
      </div>
      <div className="text-sm text-muted-foreground">
        {newAddress.postalCode} - {newAddress.country}
      </div>
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={`default-${newAddress.id}`}
          className="text-sm font-medium"
        >
          {t("addressItem.defaultLabel")}
        </Label>
        <Checkbox
          id={`default-${newAddress.id}`}
          checked={newAddress.is_default}
          onCheckedChange={() => onSetDefault(newAddress.id || "")}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={`delivery-${newAddress.id}`}
          className="text-sm font-medium"
        >
          {t("addressItem.deliveryLabel")}
        </Label>
        <Checkbox
          id={`delivery-${newAddress.id}`}
          checked={newAddress.is_delivery}
          onCheckedChange={() => onSetDelivery(newAddress.id || "")}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(newAddress.id || "")}
        >
          <Edit className="h-4 w-4 mr-2" />
          {t("addressItem.editButton")}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              {t("addressItem.deleteButton")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("addressItem.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("addressItem.confirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("addressItem.cancelButton")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(newAddress.id || "")}>
                {t("addressItem.confirmDeleteButton")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AddressItem;
