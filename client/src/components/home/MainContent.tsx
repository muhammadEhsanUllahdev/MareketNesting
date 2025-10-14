import React from "react";
import SellerBuyerTabs from "./SellerBuyerTabs";
import AdventureCard from "./AdventureCard";
import FeaturesGrid from "./FeaturesGrid";
import InfoBanner from "./InfoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import CategoryMenu from "../SubComponents/CategoryMenu";
import PopularSearches from "../SubComponents/PopularSearches";

const MainContent = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <div className="space-y-3 sm:space-y-4">
      {isMobile && (
        <div className="bg-white rounded-lg p-3 border border-cebleu-purple-200 shadow-sm mb-3">
          <CategoryMenu />
        </div>
      )}
      <SellerBuyerTabs />
      <AdventureCard />
      <FeaturesGrid />
      <InfoBanner />
      {isMobile && (
        <div className="mt-3">
          <PopularSearches />
        </div>
      )}
    </div>
  );
};

export default MainContent;
