import React from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

interface PriceFilterProps {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
}

const PriceFilter = ({ priceRange, setPriceRange }: PriceFilterProps) => {
  // const { t } = useLanguage();
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-4 px-2">
        <Slider
          defaultValue={[0, 12500]}
          max={20000}
          step={100}
          value={priceRange}
          onValueChange={setPriceRange}
          className="my-6"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs font-medium text-cebleu-purple-600">
            {priceRange[0]}€
          </span>
          <span className="text-xs font-medium text-cebleu-purple-600">
            {priceRange[1] === 12500
              ? `12500€ ${t("products.andMore")}`
              : `${priceRange[1]}€`}
          </span>
        </div>
      </div>

      <div className="space-y-0.5">
        {[
          { id: "under25", label: `${t("products.upTo")} 25€` },
          { id: "25to50", label: "25€ - 50€" },
          { id: "50to100", label: "50€ - 100€" },
          { id: "100to200", label: "100€ - 200€" },
          { id: "200plus", label: `200€ ${t("products.andMore")}` },
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
      </div>
    </>
  );
};

export default PriceFilter;
