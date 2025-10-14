// // components/admin/PromotionModal.tsx
// import React, { useEffect, useState } from "react";

// type PromotionForm = {
//   promoCode: string;
//   discountType: "percentage" | "fixed" | "";
//   value: number | "";
//   startDate: string;
//   endDate: string;
//   minimumPurchase: number | "";
//   usageLimit: number | "";
//   isActive: boolean;
// };

// export function PromotionModal({
//   isOpen,
//   onClose,
//   onSave,
//   promotion,
//   viewOnly = false,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (data: PromotionForm) => void;
//   promotion?: any; // backend Promotion object
//   viewOnly?: boolean;
// }) {
//   const empty: PromotionForm = {
//     promoCode: "",
//     discountType: "",
//     value: "",
//     startDate: "",
//     endDate: "",
//     minimumPurchase: "",
//     usageLimit: "",
//     isActive: true,
//   };

//   const [form, setForm] = useState<PromotionForm>(empty);

//   useEffect(() => {
//     if (promotion) {
//       // promotion.startDate may be JS Date or ISO string - normalize to 'YYYY-MM-DD'
//       const toYMD = (d: any) => {
//         if (!d) return "";
//         const date = typeof d === "string" ? new Date(d) : d;
//         return date instanceof Date && !Number.isNaN(date.getTime())
//           ? date.toISOString().slice(0, 10)
//           : "";
//       };

//       setForm({
//         promoCode: promotion.promoCode || "",
//         discountType: promotion.discountType || "",
//         value: promotion.value ?? "",
//         startDate: toYMD(promotion.startDate),
//         endDate: toYMD(promotion.endDate),
//         minimumPurchase: promotion.minimumPurchase ?? "0",
//         usageLimit: promotion.usageLimit ?? "",
//         isActive: Boolean(promotion.isActive),
//       });
//     } else {
//       setForm(empty);
//     }
//   }, [promotion, isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//       <div className="w-full max-w-2xl bg-white rounded shadow-lg p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold">
//             {viewOnly
//               ? "View Promotion"
//               : promotion
//               ? "Edit Promotion"
//               : "Create Promotion"}
//           </h3>
//           <button onClick={onClose} className="text-sm text-gray-600">
//             Close
//           </button>
//         </div>

//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             if (!viewOnly) onSave(form);
//           }}
//           className="grid grid-cols-2 gap-3"
//         >
//           <input
//             type="text"
//             placeholder="Promo Code"
//             value={form.promoCode}
//             onChange={(e) =>
//               setForm((s) => ({ ...s, promoCode: e.target.value }))
//             }
//             disabled={viewOnly}
//             className="border rounded px-2 py-2"
//             required
//           />

//           <select
//             value={form.discountType}
//             onChange={(e) =>
//               setForm((s) => ({ ...s, discountType: e.target.value as any }))
//             }
//             disabled={viewOnly}
//             className="border rounded px-2 py-2"
//             required
//           >
//             <option value="">Discount Type</option>
//             <option value="percentage">Percentage</option>
//             <option value="fixed">Fixed</option>
//           </select>

//           <input
//             type="number"
//             placeholder="Value"
//             value={form.value}
//             onChange={(e) =>
//               setForm((s) => ({
//                 ...s,
//                 value: e.target.value === "" ? "" : Number(e.target.value),
//               }))
//             }
//             disabled={viewOnly}
//             className="border rounded px-2 py-2"
//             required
//             step="0.01"
//             min="0"
//           />

//           <input
//             type="date"
//             value={form.startDate}
//             onChange={(e) =>
//               setForm((s) => ({ ...s, startDate: e.target.value }))
//             }
//             disabled={viewOnly}
//             className="border rounded px-2 py-2"
//             required
//           />

//           <input
//             type="date"
//             value={form.endDate}
//             onChange={(e) =>
//               setForm((s) => ({ ...s, endDate: e.target.value }))
//             }
//             disabled={viewOnly}
//             className="border rounded px-2 py-2"
//             required
//           />

//           <input
//             type="number"
//             placeholder="Minimum Purchase (DA)"
//             value={form.minimumPurchase}
//             onChange={(e) =>
//               setForm((s) => ({
//                 ...s,
//                 minimumPurchase:
//                   e.target.value === "" ? "" : Number(e.target.value),
//               }))
//             }
//             disabled={viewOnly}
//             step="0.01"
//             className="border rounded px-2 py-2"
//           />

//           <input
//             type="number"
//             placeholder="Usage Limit"
//             value={String(form.usageLimit ?? "")}
//             onChange={(e) =>
//               setForm((s) => ({
//                 ...s,
//                 usageLimit:
//                   e.target.value === "" ? "" : parseInt(e.target.value, 10),
//               }))
//             }
//             disabled={viewOnly}
//             className="border rounded px-2 py-2"
//           />

//           <label className="flex items-center gap-2 col-span-2">
//             <input
//               type="checkbox"
//               checked={form.isActive}
//               onChange={(e) =>
//                 setForm((s) => ({ ...s, isActive: e.target.checked }))
//               }
//               disabled={viewOnly}
//             />
//             <span>Active Immediately</span>
//           </label>

//           <div className="col-span-2 flex justify-end gap-2 mt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border rounded"
//             >
//               Cancel
//             </button>
//             {!viewOnly && (
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded"
//               >
//                 {promotion ? "Update Promotion" : "Create Promotion"}
//               </button>
//             )}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next"; // ✅ Added translation hook

// ✅ Schema with translated messages
const promotionSchema = z.object({
  promoCode: z.string().min(3, { message: "promotions.validation.promoCode" }),
  discountType: z.enum(["percentage", "fixed"], {
    required_error: "promotions.validation.discountType",
  }),
  value: z.coerce.number().positive({ message: "promotions.validation.value" }),
  startDate: z.string().min(1, { message: "promotions.validation.startDate" }),
  endDate: z.string().min(1, { message: "promotions.validation.endDate" }),
  minimumPurchase: z.coerce.number().default(0),
  usageLimit: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

export type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromotionFormData) => void;
  isEdit?: boolean;
  viewOnly?: boolean;
  initialData?: Partial<PromotionFormData>;
}

export default function PromotionModal({
  isOpen,
  onClose,
  onSave,
  isEdit = false,
  viewOnly = false,
  initialData,
}: PromotionModalProps) {
  const { t } = useTranslation(); // ✅ Translation hook
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      promoCode: "",
      discountType: "percentage",
      value: 0,
      startDate: "",
      endDate: "",
      minimumPurchase: 0,
      usageLimit: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        ...initialData,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().slice(0, 10)
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().slice(0, 10)
          : "",
      });
    } else {
      form.reset({
        promoCode: "",
        discountType: "percentage",
        value: 0,
        startDate: "",
        endDate: "",
        minimumPurchase: 0,
        usageLimit: undefined,
        isActive: true,
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = (data: PromotionFormData) => {
    if (!viewOnly) {
      onSave(data);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {viewOnly
              ? t("promotions.modal.viewTitle")
              : isEdit
              ? t("promotions.modal.editTitle")
              : t("promotions.modal.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {viewOnly
              ? t("promotions.modal.viewDescription")
              : isEdit
              ? t("promotions.modal.editDescription")
              : t("promotions.modal.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Promo Code */}
              <FormField
                control={form.control}
                name="promoCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("promotions.form.promoCode")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("promotions.form.promoCodePlaceholder")}
                        {...field}
                        disabled={viewOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount Type */}
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("promotions.form.discountType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={viewOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "promotions.form.discountTypePlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">
                          {t("promotions.form.percentage")}
                        </SelectItem>
                        <SelectItem value="fixed">
                          {t("promotions.form.fixed")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Value */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("promotions.form.value")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={viewOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Minimum Purchase */}
              <FormField
                control={form.control}
                name="minimumPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("promotions.form.minimumPurchase")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={viewOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Usage Limit */}
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("promotions.form.usageLimit")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={viewOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("promotions.form.startDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={viewOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("promotions.form.endDate")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={viewOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Toggle */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <FormLabel>{t("promotions.form.activeLabel")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={viewOnly}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.close")}
              </Button>
              {!viewOnly && (
                <Button type="submit">
                  {isEdit
                    ? t("promotions.form.updateButton")
                    : t("promotions.form.createButton")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

