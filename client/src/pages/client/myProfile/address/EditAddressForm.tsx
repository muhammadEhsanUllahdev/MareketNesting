import React, { useEffect, useState } from "react";
import { Address } from "../Profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

interface EditAddressFormProps {
  newAddress: any;
  onUpdate: (id: string, address: any) => void;
  onCancel: () => void;
}

const EditAddressForm = ({
  newAddress,
  onUpdate,
  onCancel,
}: EditAddressFormProps) => {
  const { t } = useTranslation();
  const [editedAddress, setEditedAddress] = useState({
    fullName: newAddress.fullName || "",
    phone: newAddress.phone || "",
    street: newAddress.street || "",
    city: newAddress.city || "",
    state: newAddress.state || "",
    postalCode: newAddress.postalCode || "",
    country: newAddress.country || "Algérie",
    is_default: newAddress.is_default || false,
    is_delivery: newAddress.is_delivery || false,
  });

  useEffect(() => {
    if (newAddress) {
      setEditedAddress({
        fullName: newAddress.fullName || "",
        phone: newAddress.phone || "",
        street: newAddress.street || "",
        city: newAddress.city || "",
        state: newAddress.state || "",
        postalCode: newAddress.postalCode || "",
        country: newAddress.country || "Algérie",
        is_default: newAddress.is_default || false,
        is_delivery: newAddress.is_delivery || false,
      });
    }
  }, [newAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (name: string, checked: boolean) => {
    setEditedAddress((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(newAddress.id, editedAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>{t("address.fullName")}</Label>
          <Input
            name="fullName"
            value={editedAddress.fullName}
            onChange={handleChange}
            placeholder={t("address.enterFullName")}
          />
        </div>
        <div>
          <Label>{t("address.phone")}</Label>
          <Input
            name="phone"
            value={editedAddress.phone}
            onChange={handleChange}
            placeholder={t("address.enterPhone")}
          />
        </div>
      </div>

      <div>
        <Label>{t("address.street")}</Label>
        <Input
          name="street"
          value={editedAddress.street}
          onChange={handleChange}
          placeholder={t("address.streetPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>{t("address.city")}</Label>
          <Input
            name="city"
            value={editedAddress.city}
            onChange={handleChange}
            placeholder={t("address.cityPlaceholder")}
          />
        </div>
        <div>
          <Label>{t("address.state")}</Label>
          <Input
            name="state"
            value={editedAddress.state}
            onChange={handleChange}
            placeholder={t("address.statePlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>{t("address.postalCode")}</Label>
          <Input
            name="postalCode"
            value={editedAddress.postalCode}
            onChange={handleChange}
            placeholder={t("address.postalCodePlaceholder")}
          />
        </div>
        <div>
          <Label>{t("address.country")}</Label>
          <Input
            name="country"
            value={editedAddress.country}
            onChange={handleChange}
            placeholder={t("address.countryPlaceholder")}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="default-switch"
          checked={editedAddress.is_default}
          onCheckedChange={(checked) => handleSwitch("is_default", checked)}
        />
        <Label htmlFor="default-switch">{t("address.defaultAddress")}</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="delivery-switch"
          checked={editedAddress.is_delivery}
          onCheckedChange={(checked) => handleSwitch("is_delivery", checked)}
        />
        <Label htmlFor="delivery-switch">{t("address.deliveryAddress")}</Label>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </div>
    </form>
  );
};

export default EditAddressForm;
