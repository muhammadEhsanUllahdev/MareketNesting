import React from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SortByFilter = () => {
  const { t } = useTranslation();

  return (
    <Select>
      <SelectTrigger className="w-full text-xs h-8">
        <SelectValue placeholder={t("products.sortByPopularity")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popularity">
          {t("products.sortByPopularity")}
        </SelectItem>
        <SelectItem value="newest">{t("products.sortNewest")}</SelectItem>
        <SelectItem value="high-to-low">
          {t("products.sortHighToLow")}
        </SelectItem>
        <SelectItem value="low-to-high">
          {t("products.sortLowToHigh")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortByFilter;
