// import React, { useState } from "react";
// import { Address } from "../Profile";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";

// interface EditAddressFormProps {
//   address: Address;
//   onUpdate: (id: string, address: Address) => void;
//   onCancel: () => void;
// }

// const EditAddressForm = ({
//   address,
//   onUpdate,
//   onCancel,
// }: EditAddressFormProps) => {
//   const [editedAddress, setEditedAddress] = useState<Address>({ ...address });

//   const handleChange = (field: keyof Address, value: string | boolean) => {
//     setEditedAddress((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onUpdate(address.id || "", editedAddress);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="edit-type">Type d'adresse</Label>
//         <Select
//           value={editedAddress.type}
//           onValueChange={(value) =>
//             handleChange(
//               "type",
//               value as "personal" | "delivery1" | "delivery2" | "billing"
//             )
//           }
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Sélectionnez un type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="personal">Adresse personnelle</SelectItem>
//             <SelectItem value="delivery1">Adresse de livraison 1</SelectItem>
//             <SelectItem value="delivery2">Adresse de livraison 2</SelectItem>
//             <SelectItem value="billing">Adresse de facturation</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="edit-street">Rue et numéro</Label>
//         <Input
//           id="edit-street"
//           value={editedAddress.street}
//           onChange={(e) => handleChange("street", e.target.value)}
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="edit-city">Ville</Label>
//           <Input
//             id="edit-city"
//             value={editedAddress.city}
//             onChange={(e) => handleChange("city", e.target.value)}
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="edit-postal">Code Postal</Label>
//           <Input
//             id="edit-postal"
//             value={editedAddress.postalCode}
//             onChange={(e) => handleChange("postalCode", e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="edit-state">Wilaya</Label>
//         <Input
//           id="edit-state"
//           value={editedAddress.state || ""}
//           onChange={(e) => handleChange("state", e.target.value)}
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="edit-country">Pays</Label>
//         <Input
//           id="edit-country"
//           value={editedAddress.country}
//           onChange={(e) => handleChange("country", e.target.value)}
//         />
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="edit-default"
//           checked={editedAddress.is_default}
//           onCheckedChange={(checked) => handleChange("is_default", checked)}
//         />
//         <Label htmlFor="edit-default">Adresse par défaut</Label>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="edit-delivery"
//           checked={editedAddress.is_delivery}
//           onCheckedChange={(checked) => handleChange("is_delivery", checked)}
//         />
//         <Label htmlFor="edit-delivery">Adresse de livraison</Label>
//       </div>

//       <div className="flex justify-end space-x-2 pt-4">
//         <Button type="button" variant="outline" onClick={onCancel}>
//           Annuler
//         </Button>
//         <Button type="submit">Enregistrer</Button>
//       </div>
//     </form>
//   );
// };

// export default EditAddressForm;


// import React, { useEffect, useState } from "react";
// import { Address } from "../Profile";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";

// interface EditAddressFormProps {
//   newAddress: any;
//   onUpdate: (id: string, address: any) => void;
//   onCancel: () => void;
// }

// const EditAddressForm = ({
//   newAddress,
//   onUpdate,
//   onCancel,
// }: EditAddressFormProps) => {
//   const [editedAddress, setEditedAddress] = useState({
//     fullName: newAddress.fullName || "",
//     phone: newAddress.phone || "",
//     street: newAddress.street || "",
//     city: newAddress.city || "",
//     state: newAddress.state || "",
//     postalCode: newAddress.postalCode || "",
//     country: newAddress.country || "Algérie",
//     is_default: newAddress.is_default || false,
//     is_delivery: newAddress.is_delivery || false,
//   });

//   useEffect(() => {
//     if (newAddress) {
//       setEditedAddress({
//         fullName: newAddress.fullName || "",
//         phone: newAddress.phone || "",
//         street: newAddress.street || "",
//         city: newAddress.city || "",
//         state: newAddress.state || "",
//         postalCode: newAddress.postalCode || "",
//         country: newAddress.country || "Algérie",
//         is_default: newAddress.is_default || false,
//         is_delivery: newAddress.is_delivery || false,
//       });
//     }
//   }, [newAddress]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setEditedAddress((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSwitch = (name: string, checked: boolean) => {
//     setEditedAddress((prev) => ({ ...prev, [name]: checked }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onUpdate(newAddress.id, editedAddress);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div>
//           <Label>Nom complet</Label>
//           <Input
//             name="fullName"
//             value={editedAddress.fullName}
//             onChange={handleChange}
//             placeholder="Entrez votre nom complet"
//           />
//         </div>
//         <div>
//           <Label>Téléphone</Label>
//           <Input
//             name="phone"
//             value={editedAddress.phone}
//             onChange={handleChange}
//             placeholder="Entrez votre téléphone"
//           />
//         </div>
//       </div>

//       <div>
//         <Label>Rue</Label>
//         <Input
//           name="street"
//           value={editedAddress.street}
//           onChange={handleChange}
//           placeholder="Rue / Adresse"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div>
//           <Label>Ville</Label>
//           <Input
//             name="city"
//             value={editedAddress.city}
//             onChange={handleChange}
//             placeholder="Ville"
//           />
//         </div>
//         <div>
//           <Label>État / Province</Label>
//           <Input
//             name="state"
//             value={editedAddress.state}
//             onChange={handleChange}
//             placeholder="État / Province"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div>
//           <Label>Code postal</Label>
//           <Input
//             name="postalCode"
//             value={editedAddress.postalCode}
//             onChange={handleChange}
//             placeholder="Code postal"
//           />
//         </div>
//         <div>
//           <Label>Pays</Label>
//           <Input
//             name="country"
//             value={editedAddress.country}
//             onChange={handleChange}
//             placeholder="Pays"
//           />
//         </div>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="default-switch"
//           checked={editedAddress.is_default}
//           onCheckedChange={(checked) => handleSwitch("is_default", checked)}
//         />
//         <Label htmlFor="default-switch">Adresse par défaut</Label>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="delivery-switch"
//           checked={editedAddress.is_delivery}
//           onCheckedChange={(checked) => handleSwitch("is_delivery", checked)}
//         />
//         <Label htmlFor="delivery-switch">Adresse de livraison</Label>
//       </div>

//       <div className="flex justify-end gap-2 pt-3">
//         <Button type="button" variant="outline" onClick={onCancel}>
//           Annuler
//         </Button>
//         <Button type="submit">Enregistrer</Button>
//       </div>
//     </form>
//   );
// };

// export default EditAddressForm;


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
