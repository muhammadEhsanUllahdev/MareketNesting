import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const FeaturedSportsItem = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-cebleu-purple-800 flex items-center">
          <ShoppingBag className="w-4 h-4 mr-2 text-cebleu-gold" />
          {t("products.featuredSports")}
        </h3>
        <span className="text-xs text-gray-500">{t("products.sponsored")}</span>
      </div>
      <div className="flex items-center justify-center h-64 mt-4 border border-gray-100 rounded-lg p-2 overflow-hidden relative">
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -30%
        </div>
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
          alt="Premium sport shoes"
          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-bold">Premium Running Shoes</h4>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-cebleu-purple-800">
              €89.99
            </span>
            <span className="text-sm line-through text-gray-500 ml-2">
              €129.99
            </span>
          </div>
          <Button
            variant="link"
            className="p-0 text-sm text-cebleu-purple-600 font-medium hover:text-cebleu-purple-800"
          >
            {t("products.learnMore")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSportsItem;
