import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import MainContent from "@/components/home/MainContent";

import CarAdvertisement from "./CarAdvertisement";
import RealEstateAd from "./RealEstateAd";
import TechAdvertisement from "./TechAdvertisement";
import BestSellers from "./BestSellers";
import HeroContent from "../SubComponents/HeroContent";
import ExtendedCategoryMenu from "../SubComponents/ExtendedCategoryMenu";
// import { useLanguage } from '@/contexts/LanguageContext';

const MainLayout = () => {
  const isMobile = useIsMobile();
  // const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-6">
      <div className="hidden md:block md:col-span-3 animate-on-scroll">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm h-full overflow-visible">
          <ExtendedCategoryMenu />
        </div>
      </div>

      <div className="col-span-1 md:col-span-6">
        <MainContent />
        <CarAdvertisement />
      </div>

      <div className="hidden md:flex md:col-span-3 md:items-center flex-col space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm w-full overflow-visible">
          <HeroContent />
        </div>

        <RealEstateAd />
        <TechAdvertisement />
      </div>

      {/* BestSellers positioned below all content, spanning all columns with proper padding */}
      <div className="col-span-1 md:col-span-12 mt-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <BestSellers />
      </div>
    </div>
  );
};

export default MainLayout;
