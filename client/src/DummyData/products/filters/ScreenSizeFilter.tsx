import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const ScreenSizeFilter = () => {
  const { t } = useTranslation();

  return (
    <>
      {[21, 24, 27, 32].map((size) => (
        <div
          key={size}
          className="flex items-center space-x-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors"
        >
          <Checkbox
            id={`size${size}`}
            className="data-[state=checked]:bg-cebleu-purple-600"
          />
          <label
            htmlFor={`size${size}`}
            className="text-xs font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700"
          >
            {size}" {t("products.andMore")}
          </label>
        </div>
      ))}
    </>
  );
};

export default ScreenSizeFilter;
