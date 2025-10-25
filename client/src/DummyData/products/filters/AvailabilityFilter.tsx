// import React from "react";
// import { Checkbox } from "@/components/ui/checkbox";
// // import { useLanguage } from '@/contexts/LanguageContext';
// import { useTranslation } from "react-i18next";

// const AvailabilityFilter = () => {
//   const { t } = useTranslation();

//   return (
//     <div className="flex items-start space-x-2 mb-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors">
//       <Checkbox
//         id="inStock"
//         className="mt-0.5 data-[state=checked]:bg-cebleu-purple-600"
//       />
//       <div className="grid gap-1.5">
//         <label
//           htmlFor="inStock"
//           className="text-xs font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700"
//         >
//           {t("products.inStock")}
//         </label>
//       </div>
//     </div>
//   );
// };

// export default AvailabilityFilter;
import React from "react";

interface AvailabilityFilterProps {
  value: string | null;
  onChange: (value: string) => void;
}

const AvailabilityFilter: React.FC<AvailabilityFilterProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="availability"
          checked={value === "inStock"}
          onChange={() => onChange("inStock")}
        />
        In Stock
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="availability"
          checked={value === "outOfStock"}
          onChange={() => onChange("outOfStock")}
        />
        Out of Stock
      </label>
    </div>
  );
};

export default AvailabilityFilter;
