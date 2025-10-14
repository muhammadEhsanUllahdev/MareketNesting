import React from "react";
import { useTranslation } from "react-i18next";

const AdvertisementBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 mb-4 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="p-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/3 flex justify-center mb-4 md:mb-0">
          <img
            src="https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80"
            alt="iPhone"
            className="h-40 object-contain"
          />
        </div>
        <div className="md:w-2/3 md:pl-6 text-center md:text-left">
          <h3 className="font-bold text-xl text-gray-800 mb-2">
            iPhone 15 Pro
          </h3>
          <p className="text-gray-600 mb-3">
            {t("index.discoverNewTech")}. {t("index.titanium")}.{" "}
            {t("index.newCamera")}. {t("index.allDayBattery")}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button className="bg-black text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
              {t("index.buyNow")}
            </button>
            <button className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
              {t("index.learnMore")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanner;
