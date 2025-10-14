import React from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import ProductGroupsSection from "./sections/ProductGroupsSection";
import FeaturedPromotionsSection from "./sections/FeaturedPromotionsSection";
import ShoppingGridSection from "./sections/ShoppingGridSection";
import AdditionalSections from "./sections/AdditionalSections";

const ProductGroups = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Product Groups Section */}
      <ProductGroupsSection />

      {/* Featured Promotions Section */}
      <div className="bg-cebleu-purple-50/50 py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <FeaturedPromotionsSection />
          <ShoppingGridSection />
          <AdditionalSections />
        </div>
      </div>
    </>
  );
};

export default ProductGroups;
