// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// interface EditPaymentModalProps {
//   open: boolean;
//   onClose: () => void;
//   payment: any;
//   onUpdate: (id: string, data: any) => void;
// }

// export const EditPaymentModal = ({
//   open,
//   onClose,
//   payment,
//   onUpdate,
// }: EditPaymentModalProps) => {
//   const [form, setForm] = useState({
//     type: "",
//     holderName: "",
//     cardNumber: "",
//     expiry: "",
//     isDefault: false,
//   });

//   useEffect(() => {
//     if (payment) {
//       setForm({
//         type: payment.type || "",
//         holderName: payment.holderName || "",
//         cardNumber: payment.cardNumber || "",
//         expiry: payment.expiry || "",
//         isDefault: payment.isDefault || false,
//       });
//     }
//   }, [payment]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     if (!payment?.id) return;
//     onUpdate(payment.id, form);
//     onClose();
//   };

//   if (!payment) return null;

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Modifier le moyen de paiement</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-3">
//           <Label>Type</Label>
//           <Input name="type" value={form.type} onChange={handleChange} />

//           <Label>Nom du titulaire</Label>
//           <Input
//             name="holderName"
//             value={form.holderName}
//             onChange={handleChange}
//           />

//           <Label>Numéro de carte</Label>
//           <Input
//             name="cardNumber"
//             value={form.cardNumber}
//             onChange={handleChange}
//           />

//           <Label>Date d’expiration</Label>
//           <Input name="expiry" value={form.expiry} onChange={handleChange} />
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


import React, { useState, useEffect } from "react";
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

interface EditPaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: any;
  onUpdate: (id: string, data: any) => void;
}

export const EditPaymentModal = ({
  open,
  onClose,
  payment,
  onUpdate,
}: EditPaymentModalProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    type: "",
    holderName: "",
    cardNumber: "",
    expiry: "",
    isDefault: false,
  });

  useEffect(() => {
    if (payment) {
      setForm({
        type: payment.type || "",
        holderName: payment.holderName || "",
        cardNumber: payment.cardNumber || "",
        expiry: payment.expiry || "",
        isDefault: payment.isDefault || false,
      });
    }
  }, [payment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!payment?.id) return;
    onUpdate(payment.id, form);
    onClose();
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("payment.editTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Label>{t("payment.type")}</Label>
          <Input name="type" value={form.type} onChange={handleChange} />

          <Label>{t("payment.holderName")}</Label>
          <Input
            name="holderName"
            value={form.holderName}
            onChange={handleChange}
          />

          <Label>{t("payment.cardNumber")}</Label>
          <Input
            name="cardNumber"
            value={form.cardNumber}
            onChange={handleChange}
          />

          <Label>{t("payment.expiryDate")}</Label>
          <Input name="expiry" value={form.expiry} onChange={handleChange} />
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
