import React from "react";
import { useTranslation } from "react-i18next";

const RealEstateAd = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm w-full overflow-visible">
      <div className="h-auto space-y-3">
        <h3 className="font-bold text-lg text-gray-800">
          {t("realEstate.title")}
        </h3>
        <img
          src="https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?auto=format&fit=crop&w=600&q=80"
          alt="Apartment building"
          className="w-full h-32 object-cover rounded-md"
        />
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Appartement de Luxe</h4>
          <p className="text-xs text-gray-600">
            3 chambres • 2 salles de bain • 120m²
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm text-gray-900">259 000€</span>
            <span className="text-xs text-gray-500">Saint-Germain</span>
          </div>
          <button className="w-full bg-cebleu-purple hover:bg-cebleu-purple-dark text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors">
            Voir le bien
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealEstateAd;
