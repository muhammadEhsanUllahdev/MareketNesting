import React from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import ProductGroupCard from "./ProductGroupCard";
import { getProductGroups } from "../data/productGroupsData";

const ProductGroupsSection = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();
  const productGroups = getProductGroups(t);

  return (
    <div className="bg-gradient-to-b from-white to-cebleu-purple-50/30 py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-cebleu-purple-800 mb-2">
            {t("products.shopByCategory")}
          </h2>
          <p className="text-cebleu-purple-600 text-sm">
            {t("products.discoverUnique")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {productGroups.map((group, index) => (
            <ProductGroupCard
              key={index}
              title={group.title}
              iconName={group.iconName}
              items={group.items}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGroupsSection;
