import React from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import ContinueShopping from "./ContinueShopping";
import FeaturedSportsItem from "./FeaturedSportsItem";
import TrendingItems from "./TrendingItems";
import { getTrendingItems } from "../data/productGroupsData";

const ShoppingGridSection = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();
  const trendingItems = getTrendingItems(t);

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
      {/* First column - Continue Shopping */}
      <ContinueShopping />

      {/* Second column - Featured Sports Item */}
      <FeaturedSportsItem />

      {/* Third and Fourth columns - Resume Shopping items */}
      <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <TrendingItems
          title={t("products.resumeShoppingWhere")}
          items={trendingItems.slice(0, 2)}
        />

        <TrendingItems
          title={t("products.resumeShoppingWhere")}
          items={trendingItems.slice(2, 4)}
        />
      </div>
    </div>
  );
};

export default ShoppingGridSection;
