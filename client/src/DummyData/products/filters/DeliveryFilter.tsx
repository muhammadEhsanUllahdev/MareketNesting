import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck } from "lucide-react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const DeliveryFilter = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center space-x-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors">
        <Checkbox
          id="receiveTomorrow"
          className="data-[state=checked]:bg-cebleu-purple-600"
        />
        <label
          htmlFor="receiveTomorrow"
          className="text-xs font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700"
        >
          {t("products.receiveTomorrow")}
        </label>
      </div>

      <div className="flex items-center space-x-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors">
        <Checkbox
          id="expressDelivery"
          className="data-[state=checked]:bg-cebleu-purple-600"
        />
        <div className="flex items-center">
          <Truck className="h-3.5 w-3.5 text-cebleu-purple-600 mr-1" />
          <label
            htmlFor="expressDelivery"
            className="text-xs font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700"
          >
            {t("products.expressDelivery")}
          </label>
        </div>
      </div>
    </>
  );
};

export default DeliveryFilter;
