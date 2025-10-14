import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const PromotionsFilter = () => {
  const { t } = useTranslation();

  return (
    <>
      {[
        { id: "allDiscounts", label: t("products.allDiscounts") },
        { id: "flashSales", label: t("products.flashSales") },
      ].map((item) => (
        <div
          key={item.id}
          className="flex items-center space-x-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors"
        >
          <Checkbox
            id={item.id}
            className="data-[state=checked]:bg-cebleu-purple-600"
          />
          <label
            htmlFor={item.id}
            className="text-xs font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700"
          >
            {item.label}
          </label>
        </div>
      ))}
    </>
  );
};

export default PromotionsFilter;
