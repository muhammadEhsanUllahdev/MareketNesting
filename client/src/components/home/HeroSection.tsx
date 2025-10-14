import React from "react";

import { useTranslation } from "react-i18next";
import CategoryMenu from "../SubComponents/CategoryMenu";
import ImageBanner from "../SubComponents/ImageBanner";
import PopularSearches from "../SubComponents/PopularSearches";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 animate-on-scroll opacity-0">
        <div className="bg-white rounded-lg p-3 border border-cebleu-purple-200 shadow-sm">
          <CategoryMenu />
        </div>
      </div>

      <div className="col-span-6 space-y-4">
        <ImageBanner imageSrc="/lovable-uploads/de7383ff-f064-4975-acfb-06e5f88275b0.png" />
      </div>

      <div className="col-span-3">
        <PopularSearches />
      </div>
    </div>
  );
};

export default HeroSection;
