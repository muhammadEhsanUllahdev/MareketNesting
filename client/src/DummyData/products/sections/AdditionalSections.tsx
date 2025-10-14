import React from "react";
import { Gift } from "lucide-react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import GiftIdeas from "./GiftIdeas";
import ProductSuggestions from "./ProductSuggestions";
import { getSuggestionItems } from "../data/productGroupsData";

const AdditionalSections = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();
  const suggestionItems = getSuggestionItems(t);

  return (
    <>
      {/* Gift Ideas Section */}
      <div className="mt-8">
        <GiftIdeas
          items={suggestionItems.slice(0, 5)}
          icon={<Gift className="h-5 w-5 text-cebleu-gold" />}
        />
      </div>

      {/* You Might Also Like Section */}
      <div className="mt-8 mb-8">
        <ProductSuggestions />
      </div>
    </>
  );
};

export default AdditionalSections;
