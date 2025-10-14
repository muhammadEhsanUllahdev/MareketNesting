import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const ContinueShopping = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-cebleu-purple-50 to-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-cebleu-purple-800 flex items-center">
          <ShoppingCart className="w-4 h-4 mr-2 text-cebleu-gold" />
          {t("products.continueShoppingTitle")}
        </h3>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-3 group cursor-pointer hover:bg-cebleu-purple-50 p-2 rounded-lg transition-all">
          <div className="w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
              alt="Wireless Headphones"
              className="w-full h-full object-cover group-hover:scale-105 transition-all"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium">Wireless Headphones</h4>
            <p className="text-xs text-gray-500">Premium Sound Quality</p>
            <p className="text-sm font-bold text-cebleu-purple-800 mt-1">
              €129.99
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 group cursor-pointer hover:bg-cebleu-purple-50 p-2 rounded-lg transition-all">
          <div className="w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"
              alt="Smart Watch"
              className="w-full h-full object-cover group-hover:scale-105 transition-all"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium">Smart Watch Series 7</h4>
            <p className="text-xs text-gray-500">Fitness Tracker + GPS</p>
            <p className="text-sm font-bold text-cebleu-purple-800 mt-1">
              €199.99
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            className="w-full border-cebleu-purple-300 text-cebleu-purple-700 hover:bg-cebleu-purple-50"
          >
            {t("products.viewMore")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContinueShopping;
