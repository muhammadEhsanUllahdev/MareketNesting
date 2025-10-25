// import React from "react";
// import { Checkbox } from "@/components/ui/checkbox";
// // import { useLanguage } from '@/contexts/LanguageContext';
// import { useTranslation } from "react-i18next";

// const ShippingFilter = () => {
//   const { t } = useTranslation();

//   return (
//     <div className="flex items-start space-x-2 mb-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors">
//       <Checkbox
//         id="freeShipping"
//         className="mt-0.5 data-[state=checked]:bg-cebleu-purple-600"
//       />
//       <div className="grid gap-1.5">
//         <label
//           htmlFor="freeShipping"
//           className="text-xs font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700"
//         >
//           {t("products.freeShippingFilter")}
//         </label>
//         <p className="text-[10px] text-cebleu-purple-500">
//           {t("products.freeShippingDestination")}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ShippingFilter;
import React from "react";

interface ShippingFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ShippingFilter: React.FC<ShippingFilterProps> = ({
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>Free Shipping</span>
    </label>
  );
};

export default ShippingFilter;
