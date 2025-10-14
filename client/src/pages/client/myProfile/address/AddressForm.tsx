
// import React from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';

// interface AddressFormProps {
//   onSubmit: (address: any) => void;
//   onCancel: () => void;
//   initialValues?: any;
// }

// export const AddressForm = ({ onSubmit, onCancel, initialValues = {} }: AddressFormProps) => {
//   const [address, setAddress] = React.useState({
//     type: initialValues.type || 'personal',
//     street: initialValues.street || '',
//     city: initialValues.city || '',
//     postal_code: initialValues.postal_code || '',
//     country: initialValues.country || 'Algérie',
//     state: initialValues.state || '',
//     is_default: initialValues.is_default || false,
//     is_delivery: initialValues.is_delivery || false
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setAddress(prev => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (name: string, checked: boolean) => {
//     setAddress(prev => ({ ...prev, [name]: checked }));
//   };

//   const handleSelectChange = (name: string, value: string) => {
//     setAddress(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(address);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="type">Type d'adresse</Label>
//         <Select 
//           value={address.type}
//           onValueChange={(value) => handleSelectChange('type', value)}
//         >
//           <SelectTrigger id="type">
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
//           value={address.street}
//           onChange={handleChange}
//           placeholder="123 rue de l'Exemple" 
//         />
//       </div>
      
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="city">Ville</Label>
//           <Input 
//             id="city" 
//             name="city" 
//             value={address.city}
//             onChange={handleChange}
//             placeholder="Alger" 
//           />
//         </div>
        
//         <div className="space-y-2">
//           <Label htmlFor="postal_code">Code Postal</Label>
//           <Input 
//             id="postal_code" 
//             name="postal_code" 
//             value={address.postal_code}
//             onChange={handleChange}
//             placeholder="16000" 
//           />
//         </div>
//       </div>
      
//       <div className="space-y-2">
//         <Label htmlFor="state">Wilaya</Label>
//         <Input 
//           id="state" 
//           name="state" 
//           value={address.state}
//           onChange={handleChange}
//           placeholder="Alger" 
//         />
//       </div>
      
//       <div className="space-y-2">
//         <Label htmlFor="country">Pays</Label>
//         <Input 
//           id="country" 
//           name="country" 
//           value={address.country}
//           onChange={handleChange}
//           placeholder="Algérie" 
//         />
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch 
//           id="is_default"
//           checked={address.is_default}
//           onCheckedChange={(checked) => handleCheckboxChange('is_default', checked)}
//         />
//         <Label htmlFor="is_default">Adresse par défaut</Label>
//       </div>
      
//       <div className="flex items-center space-x-2">
//         <Switch 
//           id="is_delivery"
//           checked={address.is_delivery}
//           onCheckedChange={(checked) => handleCheckboxChange('is_delivery', checked)}
//         />
//         <Label htmlFor="is_delivery">Adresse de livraison</Label>
//       </div>

//       <div className="flex justify-end space-x-2 pt-4">
//         <Button type="button" variant="outline" onClick={onCancel}>
//           Annuler
//         </Button>
//         <Button type="submit">
//           Enregistrer
//         </Button>
//       </div>
//     </form>
//   );
// };

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';

interface AddressFormProps {
  onSubmit: (address: any) => void;
  onCancel: () => void;
  initialValues?: any;
}

export const AddressForm = ({ onSubmit, onCancel, initialValues = {} }: AddressFormProps) => {
  const { t } = useTranslation();

  const [address, setAddress] = React.useState({
    type: initialValues.type || 'personal',
    street: initialValues.street || '',
    city: initialValues.city || '',
    postal_code: initialValues.postal_code || '',
    country: initialValues.country || 'Algérie',
    state: initialValues.state || '',
    is_default: initialValues.is_default || false,
    is_delivery: initialValues.is_delivery || false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setAddress(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">{t("addressForm.typeLabel")}</Label>
        <Select 
          value={address.type}
          onValueChange={(value) => handleSelectChange('type', value)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder={t("addressForm.typePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">{t("addressForm.type.personal")}</SelectItem>
            <SelectItem value="delivery1">{t("addressForm.type.delivery1")}</SelectItem>
            <SelectItem value="delivery2">{t("addressForm.type.delivery2")}</SelectItem>
            <SelectItem value="billing">{t("addressForm.type.billing")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="street">{t("addressForm.streetLabel")}</Label>
        <Input 
          id="street" 
          name="street" 
          value={address.street}
          onChange={handleChange}
          placeholder={t("addressForm.streetPlaceholder")} 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">{t("addressForm.cityLabel")}</Label>
          <Input 
            id="city" 
            name="city" 
            value={address.city}
            onChange={handleChange}
            placeholder={t("addressForm.cityPlaceholder")} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postal_code">{t("addressForm.postalCodeLabel")}</Label>
          <Input 
            id="postal_code" 
            name="postal_code" 
            value={address.postal_code}
            onChange={handleChange}
            placeholder={t("addressForm.postalCodePlaceholder")} 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="state">{t("addressForm.stateLabel")}</Label>
        <Input 
          id="state" 
          name="state" 
          value={address.state}
          onChange={handleChange}
          placeholder={t("addressForm.statePlaceholder")} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="country">{t("addressForm.countryLabel")}</Label>
        <Input 
          id="country" 
          name="country" 
          value={address.country}
          onChange={handleChange}
          placeholder={t("addressForm.countryPlaceholder")} 
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="is_default"
          checked={address.is_default}
          onCheckedChange={(checked) => handleCheckboxChange('is_default', checked)}
        />
        <Label htmlFor="is_default">{t("addressForm.defaultAddressLabel")}</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="is_delivery"
          checked={address.is_delivery}
          onCheckedChange={(checked) => handleCheckboxChange('is_delivery', checked)}
        />
        <Label htmlFor="is_delivery">{t("addressForm.deliveryAddressLabel")}</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("addressForm.cancelButton")}
        </Button>
        <Button type="submit">
          {t("addressForm.saveButton")}
        </Button>
      </div>
    </form>
  );
};
