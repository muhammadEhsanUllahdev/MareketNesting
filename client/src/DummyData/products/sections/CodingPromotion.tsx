import React from "react";
import { Button } from "@/components/ui/button";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const CodingPromotion = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300">
      <h3 className="font-bold text-lg text-cebleu-purple-800 mb-2">
        {t("products.learnCoding")}
      </h3>
      <div className="flex flex-col md:flex-row lg:flex-col gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-700 mb-2">
            {t("products.freeCodingCourse")}
          </p>
          <Button
            variant="link"
            className="p-0 text-sm text-cebleu-purple-600 font-medium"
          >
            {t("products.learnMore")}
          </Button>
        </div>
        <div className="flex-1">
          <img
            src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&q=80"
            alt="Coding"
            className="w-full h-28 object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      </div>

      <div className="mt-6 p-4 border border-gray-100 rounded-lg">
        <div className="flex items-center">
          <div className="flex-1">
            <h4 className="text-lg font-medium uppercase text-gray-800">
              KRUPS
            </h4>
            <p className="text-xs text-gray-600 italic mt-1">
              {t("products.createdForTaste")}
            </p>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                <span className="text-yellow-500">★★★★☆</span>
              </div>
              <span className="text-xs ml-1">551</span>
            </div>
            <p className="font-bold mt-2">525,00€</p>
          </div>
          <div className="w-24 h-24">
            <img
              src="https://images.unsplash.com/photo-1570354930395-5179aa201e14?w=500&q=80"
              alt="Coffee machine"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 text-right mt-1">
          {t("products.sponsored")}
        </p>
      </div>
    </div>
  );
};

export default CodingPromotion;
