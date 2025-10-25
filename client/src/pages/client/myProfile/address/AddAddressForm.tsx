import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AddAddressFormProps {
  newAddress: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export default function AddAddressForm({
  newAddress,
  onInputChange,
  onCheckboxChange,
  onAdd,
  onCancel,
}: AddAddressFormProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>{t("addressForm.fullNameLabel")}</Label>
          <Input
            name="full_name"
            value={newAddress.full_name || ""}
            onChange={onInputChange}
            placeholder={t("addressForm.fullNamePlaceholder")}
            required
          />
        </div>
        <div>
          <Label>{t("addressForm.phoneLabel")}</Label>
          <Input
            name="phone"
            value={newAddress.phone || ""}
            onChange={onInputChange}
            placeholder={t("addressForm.phonePlaceholder")}
            required
          />
        </div>
      </div>

      <div>
        <Label>{t("addressForm.streetLabel")}</Label>
        <Input
          name="street"
          value={newAddress.street}
          onChange={onInputChange}
          placeholder={t("addressForm.streetPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>{t("addressForm.cityLabel")}</Label>
          <Input
            name="city"
            value={newAddress.city}
            onChange={onInputChange}
            placeholder={t("addressForm.cityPlaceholder")}
          />
        </div>
        <div>
          <Label>{t("addressForm.stateLabel")}</Label>
          <Input
            name="state"
            value={newAddress.state}
            onChange={onInputChange}
            placeholder={t("addressForm.statePlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label>{t("addressForm.postalCodeLabel")}</Label>
          <Input
            name="postal_code"
            value={newAddress.postal_code}
            onChange={onInputChange}
            placeholder={t("addressForm.postalCodePlaceholder")}
          />
        </div>
        <div>
          <Label>{t("addressForm.countryLabel")}</Label>
          <Input
            name="country"
            value={newAddress.country}
            onChange={onInputChange}
            placeholder={t("addressForm.countryPlaceholder")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <Button variant="outline" onClick={onCancel}>
          {t("addressForm.cancelButton")}
        </Button>
        <Button onClick={onAdd}>{t("addressForm.saveButton")}</Button>
      </div>
    </div>
  );
}
