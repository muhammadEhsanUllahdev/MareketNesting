import React from "react";
import { Star } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const RatingFilter = () => {
  const { t } = useTranslation();

  return (
    <RadioGroup defaultValue="all">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div
          key={rating}
          className="flex items-center space-x-2 hover:bg-cebleu-purple-50/30 p-2 rounded-md transition-colors"
        >
          <RadioGroupItem
            value={`${rating}`}
            id={`rating-${rating}`}
            className="text-cebleu-purple-600"
          />
          <label
            htmlFor={`rating-${rating}`}
            className="text-xs font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-cebleu-purple-700 flex items-center"
          >
            {Array(rating)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-cebleu-gold text-cebleu-gold mr-0.5"
                />
              ))}
            {Array(5 - rating)
              .fill(0)
              .map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-gray-300 mr-0.5" />
              ))}
            <span className="ml-1">{t("products.andMore")}</span>
          </label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default RatingFilter;
