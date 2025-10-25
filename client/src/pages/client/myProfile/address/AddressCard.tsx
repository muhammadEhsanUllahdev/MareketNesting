import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash,
  Check,
  Truck,
  Home,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Address } from "../Profile";
import { useTranslation } from "react-i18next";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onSetDefault: (id: string) => void;
  onSetDelivery: (id: string) => void;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  onSetDelivery,
}: AddressCardProps) => {
  const { t } = useTranslation();

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "personal":
        return <Home className="h-4 w-4" />;
      case "delivery1":
      case "delivery2":
        return <Truck className="h-4 w-4" />;
      case "billing":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case "personal":
        return t("addressCard.type.personal");
      case "delivery1":
        return t("addressCard.type.delivery1");
      case "delivery2":
        return t("addressCard.type.delivery2");
      case "billing":
        return t("addressCard.type.billing");
      default:
        return t("addressCard.type.other");
    }
  };

  return (
    <Card
      className={`${address.is_default ? "border-primary" : ""} ${
        address.is_delivery ? "border-green-500" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getAddressTypeIcon(address.type)}
            <div>
              <p className="font-medium">{getAddressTypeLabel(address.type)}</p>
              <p className="text-sm text-muted-foreground">{address.street}</p>
              <p className="text-sm text-muted-foreground">
                {address.postal_code}, {address.city}
              </p>
              {address.state && (
                <p className="text-sm text-muted-foreground">{address.state}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex gap-1 mr-2">
              {address.is_default && (
                <Badge className="bg-primary" variant="secondary">
                  <Check className="h-3 w-3 mr-1" />
                  {t("  ")}
                </Badge>
              )}
              {address.is_delivery && (
                <Badge className="bg-green-500 text-white" variant="secondary">
                  <Truck className="h-3 w-3 mr-1" />
                  {t("addressCard.deliveryBadge")}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(address)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(address)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex mt-2 gap-2">
          {!address.is_default && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => address.id && onSetDefault(address.id)}
            >
              {t("addressCard.setDefaultButton")}
            </Button>
          )}

          {!address.is_delivery && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-green-600 border-green-600 hover:bg-green-100"
              onClick={() => address.id && onSetDelivery(address.id)}
            >
              {t("addressCard.useForDeliveryButton")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
