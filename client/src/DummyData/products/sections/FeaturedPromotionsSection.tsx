import React from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import FeaturedPromotions from "./FeaturedPromotions";
import { getFeaturedSections } from "../data/productGroupsData";

const FeaturedPromotionsSection = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();
  const featuredSections = getFeaturedSections(t);

  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold text-cebleu-purple-800 mb-2">
        {t("products.featuredPromotions")}
      </h2>
      <p className="text-cebleu-purple-600 text-sm">
        {t("products.specialOffers")}
      </p>
      <div className="grid grid-cols-1 gap-6 mb-8 mt-8">
        <FeaturedPromotions featuredSections={featuredSections} />
      </div>
    </div>
  );
};

export default FeaturedPromotionsSection;
