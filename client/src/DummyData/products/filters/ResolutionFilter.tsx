import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const ResolutionFilter = () => {
  const { t } = useTranslation();

  return (
    <>
      {[
        { id: "hd", label: "720p HD" },
        { id: "fullhd", label: "1080p Full HD" },
        { id: "2k", label: "1440p QHD" },
        { id: "4k", label: "4K UHD" },
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

export default ResolutionFilter;
