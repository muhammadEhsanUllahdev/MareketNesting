// import React from "react";
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
// import { Address } from "../Profile";

// interface AddAddressFormProps {
//   newAddress: Omit<Address, "id">;
//   onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onAdd: () => void;
//   onCancel: () => void;
// }

// const AddAddressForm = ({
//   newAddress,
//   onInputChange,
//   onCheckboxChange,
//   onAdd,
//   onCancel,
// }: AddAddressFormProps) => {
//   return (
//     <div className="space-y-4 border rounded-lg p-4">
//       <h3 className="text-lg font-medium">Ajouter une nouvelle adresse</h3>

//       <div className="space-y-2">
//         <Label htmlFor="type">Type d'adresse</Label>
//         <Select
//           value={newAddress.type}
//           onValueChange={(value) => {
//             const event = {
//               target: {
//                 name: "type",
//                 value: value,
//               },
//             } as React.ChangeEvent<HTMLInputElement>;
//             onInputChange(event);
//           }}
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
//         <Label htmlFor="street">Rue et numéro</Label>
//         <Input
//           id="street"
//           name="street"
//           value={newAddress.street}
//           onChange={onInputChange}
//           placeholder="123 Rue des Roses"
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="city">Ville</Label>
//           <Input
//             id="city"
//             name="city"
//             value={newAddress.city}
//             onChange={onInputChange}
//             placeholder="Alger"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="postal_code">Code postal</Label>
//           <Input
//             id="postal_code"
//             name="postal_code"
//             value={newAddress.postal_code}
//             onChange={onInputChange}
//             placeholder="16000"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="state">Wilaya</Label>
//         <Input
//           id="state"
//           name="state"
//           value={newAddress.state || ""}
//           onChange={onInputChange}
//           placeholder="Alger"
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="country">Pays</Label>
//         <Input
//           id="country"
//           name="country"
//           value={newAddress.country}
//           onChange={onInputChange}
//           placeholder="Algérie"
//         />
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="is_default"
//           name="is_default"
//           checked={newAddress.is_default}
//           onCheckedChange={(checked) => {
//             const event = {
//               target: {
//                 name: "is_default",
//                 checked,
//               },
//             } as unknown as React.ChangeEvent<HTMLInputElement>;
//             onCheckboxChange(event);
//           }}
//         />
//         <Label htmlFor="is_default">Adresse par défaut</Label>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="is_delivery"
//           name="is_delivery"
//           checked={newAddress.is_delivery}
//           onCheckedChange={(checked) => {
//             const event = {
//               target: {
//                 name: "is_delivery",
//                 checked,
//               },
//             } as unknown as React.ChangeEvent<HTMLInputElement>;
//             onCheckboxChange(event);
//           }}
//         />
//         <Label htmlFor="is_delivery">Adresse de livraison</Label>
//       </div>

//       <div className="flex justify-end space-x-2">
//         <Button variant="outline" onClick={onCancel}>
//           Annuler
//         </Button>
//         <Button onClick={onAdd}>Ajouter</Button>
//       </div>
//     </div>
//   );
// };

// export default AddAddressForm;

// import React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";

// interface AddAddressFormProps {
//   newAddress: any;
//   onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onAdd: () => void;
//   onCancel: () => void;
// }

// export default function AddAddressForm({
//   newAddress,
//   onInputChange,
//   onCheckboxChange,
//   onAdd,
//   onCancel,
// }: AddAddressFormProps) {
//   return (
//     <div className="space-y-3">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div>
//           <Label>Nom complet</Label>
//           <Input
//             name="full_name"
//             value={newAddress.full_name || ""}
//             onChange={onInputChange}
//             placeholder="Entrez votre nom complet"
//             required
//           />
//         </div>
//         <div>
//           <Label>Téléphone</Label>
//           <Input
//             name="phone"
//             value={newAddress.phone || ""}
//             onChange={onInputChange}
//             placeholder="Entrez votre téléphone"
//             required
//           />
//         </div>
//       </div>

//       <div>
//         <Label>Rue</Label>
//         <Input
//           name="street"
//           value={newAddress.street}
//           onChange={onInputChange}
//           placeholder="Rue / Adresse"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div>
//           <Label>Ville</Label>
//           <Input
//             name="city"
//             value={newAddress.city}
//             onChange={onInputChange}
//             placeholder="Ville"
//           />
//         </div>
//         <div>
//           <Label>État / Province</Label>
//           <Input
//             name="state"
//             value={newAddress.state}
//             onChange={onInputChange}
//             placeholder="État / Province"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div>
//           <Label>Code postal</Label>
//           <Input
//             name="postal_code"
//             value={newAddress.postal_code}
//             onChange={onInputChange}
//             placeholder="Code postal"
//           />
//         </div>
//         <div>
//           <Label>Pays</Label>
//           <Input
//             name="country"
//             value={newAddress.country}
//             onChange={onInputChange}
//             placeholder="Pays"
//           />
//         </div>
//       </div>

//       <div className="flex justify-end gap-2 pt-3">
//         <Button variant="outline" onClick={onCancel}>
//           Annuler
//         </Button>
//         <Button onClick={onAdd}>Enregistrer l’adresse</Button>
//       </div>
//     </div>
//   );
// }

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
