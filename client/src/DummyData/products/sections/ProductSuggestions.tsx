import React from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";

const ProductSuggestions = () => {
  // const { t } = useLanguage();
  const { t } = useTranslation();

  const photoIds = [
    "photo-1556742502-ec7c0e9f34b1",
    "photo-1523275335684-37898b6baf30",
    "photo-1546868871-7041f2a55e12",
    "photo-1585386959984-a4155224a1ad",
    "photo-1600080972464-8e5f35f63d08",
    "photo-1581539250439-c96689b516dd",
    "photo-1560769629-975ec94e6a86",
    "photo-1484704849700-f032a568e944",
  ];

  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="font-bold text-lg text-cebleu-purple-800 mb-5">
        {t("products.youMayAlsoLike")}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
        {photoIds.map((photoId, idx) => (
          <div
            key={idx}
            className="cursor-pointer border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all duration-300"
          >
            <img
              src={`https://images.unsplash.com/${photoId}?w=200&q=80`}
              alt={`Suggested product ${idx + 1}`}
              className="w-full h-24 object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSuggestions;
