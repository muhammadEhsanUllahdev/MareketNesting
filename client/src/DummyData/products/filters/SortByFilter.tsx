// import React from "react";
// // import { useLanguage } from '@/contexts/LanguageContext';
// import { useTranslation } from "react-i18next";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const SortByFilter = () => {
//   const { t } = useTranslation();

//   return (
//     <Select>
//       <SelectTrigger className="w-full text-xs h-8">
//         <SelectValue placeholder={t("products.sortByPopularity")} />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="popularity">
//           {t("products.sortByPopularity")}
//         </SelectItem>
//         <SelectItem value="newest">{t("products.sortNewest")}</SelectItem>
//         <SelectItem value="high-to-low">
//           {t("products.sortHighToLow")}
//         </SelectItem>
//         <SelectItem value="low-to-high">
//           {t("products.sortLowToHigh")}
//         </SelectItem>
//       </SelectContent>
//     </Select>
//   );
// };

// export default SortByFilter;
import React from "react";

interface SortByFilterProps {
  value: string | null;
  onChange: (value: string) => void;
}

const SortByFilter: React.FC<SortByFilterProps> = ({ value, onChange }) => {
  const options = [
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating_desc", label: "Highest Rated" },
  ];

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded p-1"
    >
      <option value="">Default</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SortByFilter;
