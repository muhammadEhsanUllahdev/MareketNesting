// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";

// // ✅ Schema for Packages
// const packageSchema = z.object({
//   name: z.string().min(1, "Package name is required"),
//   description: z.string().optional(),
//   price: z.coerce.number().positive("Price must be positive"),
//   billing: z.enum(["monthly", "yearly"]),
//   commission: z.coerce.number().min(0).max(100, "Commission must be 0–100%"),
//   maxProducts: z.coerce
//     .number()
//     .int()
//     .positive("Max products must be positive"),
//   isActive: z.boolean().default(true),
// });

// export type PackageFormData = z.infer<typeof packageSchema>;

// interface PackageModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (data: PackageFormData) => void;
//   isEdit?: boolean;
//   viewOnly?: boolean;
//   initialData?: Partial<PackageFormData>;
// }

// export default function PackageModal({
//   isOpen,
//   onClose,
//   onSave,
//   isEdit = false,
//   viewOnly = false,
//   initialData,
// }: PackageModalProps) {
//   const form = useForm<PackageFormData>({
//     resolver: zodResolver(packageSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       price: 0,
//       billing: "monthly",
//       commission: 0,
//       maxProducts: 1,
//       isActive: true,
//     },
//   });

//   // ✅ Reset values when modal opens
//   useEffect(() => {
//     if (isOpen && initialData) {
//       form.reset(initialData);
//     } else {
//       form.reset({
//         name: "",
//         description: "",
//         price: 0,
//         billing: "monthly",
//         commission: 0,
//         maxProducts: 1,
//         isActive: true,
//       });
//     }
//   }, [isOpen, initialData, form]);

//   const handleSubmit = (data: PackageFormData) => {
//     if (!viewOnly) {
//       onSave(data);
//       onClose();
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {viewOnly
//               ? "View Package"
//               : isEdit
//               ? "Edit Package"
//               : "Add New Package"}
//           </DialogTitle>
//           <DialogDescription>
//             {viewOnly
//               ? "Package details (read only)"
//               : isEdit
//               ? "Update the package details below."
//               : "Fill in the package details to create a new one."}
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(handleSubmit)}
//             className="space-y-6"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Package Name */}
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Package Name *</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Starter Package"
//                         {...field}
//                         disabled={viewOnly}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Price */}
//               <FormField
//                 control={form.control}
//                 name="price"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Price (DA) *</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         step="0.01"
//                         {...field}
//                         disabled={viewOnly}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Billing */}
//               <FormField
//                 control={form.control}
//                 name="billing"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Billing *</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       value={field.value}
//                       disabled={viewOnly}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select billing" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="monthly">Monthly</SelectItem>
//                         <SelectItem value="yearly">Yearly</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Commission */}
//               <FormField
//                 control={form.control}
//                 name="commission"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Commission (%) *</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         step="0.01"
//                         {...field}
//                         disabled={viewOnly}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Max Products */}
//               <FormField
//                 control={form.control}
//                 name="maxProducts"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Max Products *</FormLabel>
//                     <FormControl>
//                       <Input type="number" {...field} disabled={viewOnly} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* Description */}
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="md:col-span-2">
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Short description..."
//                         {...field}
//                         disabled={viewOnly}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {/* Active Toggle */}
//             <FormField
//               control={form.control}
//               name="isActive"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                   <FormLabel>Active</FormLabel>
//                   <FormControl>
//                     <Switch
//                       checked={field.value}
//                       onCheckedChange={field.onChange}
//                       disabled={viewOnly}
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={onClose}>
//                 Close
//               </Button>
//               {!viewOnly && (
//                 <Button type="submit">
//                   {isEdit ? "Update Package" : "Create Package"}
//                 </Button>
//               )}
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
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
import { useTranslation } from "react-i18next";

// ✅ Schema for Packages
const packageSchema = z.object({
  name: z.string().min(1, "packages.form.nameRequired"),
  description: z.string().optional(),
  price: z.coerce.number().positive("packages.form.pricePositive"),
  billing: z.enum(["monthly", "yearly"]),
  commission: z.coerce
    .number()
    .min(0)
    .max(100, "packages.form.commissionRange"),
  maxProducts: z.coerce.number().int().positive("packages.form.maxProductsPositive"),
  isActive: z.boolean().default(true),
});

export type PackageFormData = z.infer<typeof packageSchema>;

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PackageFormData) => void;
  isEdit?: boolean;
  viewOnly?: boolean;
  initialData?: Partial<PackageFormData>;
}

export default function PackageModal({
  isOpen,
  onClose,
  onSave,
  isEdit = false,
  viewOnly = false,
  initialData,
}: PackageModalProps) {
  const { t } = useTranslation();

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      billing: "monthly",
      commission: 0,
      maxProducts: 1,
      isActive: true,
    },
  });

  // ✅ Reset values when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        billing: "monthly",
        commission: 0,
        maxProducts: 1,
        isActive: true,
      });
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = (data: PackageFormData) => {
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
              ? t("packages.modal.viewTitle")
              : isEdit
              ? t("packages.modal.editTitle")
              : t("packages.modal.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {viewOnly
              ? t("packages.modal.viewDescription")
              : isEdit
              ? t("packages.modal.editDescription")
              : t("packages.modal.addDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Package Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("packages.form.nameLabel")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("packages.form.namePlaceholder")}
                        {...field}
                        disabled={viewOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("packages.form.priceLabel")}</FormLabel>
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

              {/* Billing */}
              <FormField
                control={form.control}
                name="billing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("packages.form.billingLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={viewOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("packages.form.billingPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t("packages.form.monthly")}
                        </SelectItem>
                        <SelectItem value="yearly">
                          {t("packages.form.yearly")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Commission */}
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("packages.form.commissionLabel")}</FormLabel>
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

              {/* Max Products */}
              <FormField
                control={form.control}
                name="maxProducts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("packages.form.maxProductsLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={viewOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("packages.form.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("packages.form.descriptionPlaceholder")}
                        {...field}
                        disabled={viewOnly}
                      />
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
                  <FormLabel>{t("packages.form.activeLabel")}</FormLabel>
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
                    ? t("packages.form.updateButton")
                    : t("packages.form.createButton")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
