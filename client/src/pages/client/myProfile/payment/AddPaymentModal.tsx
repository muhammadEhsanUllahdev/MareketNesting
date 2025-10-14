// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// interface AddPaymentModalProps {
//   open: boolean;
//   onClose: () => void;
//   onAdd: (data: any) => void;
// }

// export const AddPaymentModal = ({
//   open,
//   onClose,
//   onAdd,
// }: AddPaymentModalProps) => {
//   const [payment, setPayment] = useState({
//     type: "",
//     holderName: "",
//     cardNumber: "",
//     expiry: "",
//     isDefault: false,
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
//     setPayment({ ...payment, [e.target.name]: e.target.value });

//   const handleSubmit = () => {
//     onAdd(payment);
//     onClose();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Ajouter un moyen de paiement</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-3">
//           <Label>Type</Label>
//           <Input name="type" onChange={handleChange} />
//           <Label>Nom du titulaire</Label>
//           <Input name="holderName" onChange={handleChange} />
//           <Label>Numéro de carte</Label>
//           <Input name="cardNumber" onChange={handleChange} />
//           <Label>Date d’expiration</Label>
//           <Input name="expiry" onChange={handleChange} />
//         </div>
//         <div className="flex justify-end gap-2 mt-4">
//           <Button variant="outline" onClick={onClose}>
//             Annuler
//           </Button>
//           <Button onClick={handleSubmit}>Enregistrer</Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export const AddPaymentModal = ({
  open,
  onClose,
  onAdd,
}: AddPaymentModalProps) => {
  const { t } = useTranslation();
  const [payment, setPayment] = useState({
    type: "",
    holderName: "",
    cardNumber: "",
    expiry: "",
    isDefault: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPayment({ ...payment, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    onAdd(payment);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("payment.addTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label>{t("payment.type")}</Label>
          <Input name="type" onChange={handleChange} />
          <Label>{t("payment.holderName")}</Label>
          <Input name="holderName" onChange={handleChange} />
          <Label>{t("payment.cardNumber")}</Label>
          <Input name="cardNumber" onChange={handleChange} />
          <Label>{t("payment.expiryDate")}</Label>
          <Input name="expiry" onChange={handleChange} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("common.save")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

