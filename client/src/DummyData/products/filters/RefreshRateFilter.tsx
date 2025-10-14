import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const RefreshRateFilter = () => {
  const { t } = useTranslation();

  return (
    <>
      {[60, 120, 144].map((rate) => (
        <div
          key={rate}
          className="flex items-center space-x-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors"
        >
          <Checkbox
            id={`${rate}hz`}
            className="data-[state=checked]:bg-cebleu-purple-600"
          />
          <label
            htmlFor={`${rate}hz`}
            className="text-xs font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700"
          >
            {rate}Hz {t("products.andMore")}
          </label>
        </div>
      ))}
    </>
  );
};

export default RefreshRateFilter;
