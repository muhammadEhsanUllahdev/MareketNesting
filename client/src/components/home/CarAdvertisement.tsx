import { use } from "passport";
import React from "react";
import { useTranslation } from "react-i18next";

const CarAdvertisement = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
      <div className="p-4 md:p-6">
        <h3 className="font-bold text-gray-800 text-xl md:text-2xl mb-2">
          {t("index.luxuryAutomobiles")}
        </h3>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-1">
            <div className="bg-gradient-to-r from-blue-100 via-blue-200 to-gray-200 rounded-lg p-4 relative">
              <img
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"
                alt="Mercedes EQS"
                className="rounded-lg shadow-md w-full h-40 md:h-52 object-cover mb-2"
              />
              <h4 className="font-bold text-gray-900 text-lg mt-2">
                Mercedes-Benz EQS 2023
              </h4>
              <p className="text-sm text-gray-700 mt-1">
                {t("index.electricLuxurySedanDesc")}
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-bold text-2xl text-gray-900">
                  89 900€<sup>00</sup>
                </span>
                <span className="text-xs text-gray-500 line-through">
                  104 780€
                </span>
              </div>

              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                12% OFF
              </span>
            </div>

            <div className="mt-3">
              <div className="flex space-x-2 pb-2">
                <div className="border-2 border-gray-300 hover:border-cebleu-purple transition-colors rounded-md overflow-hidden w-16 h-16 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=150&q=80"
                    alt="Mercedes exterior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="border-2 border-cebleu-purple rounded-md overflow-hidden w-16 h-16 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=150&q=80"
                    alt="Mercedes interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="border-2 border-gray-300 hover:border-cebleu-purple transition-colors rounded-md overflow-hidden w-16 h-16 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1631294839366-1caf083c3343?auto=format&fit=crop&w=150&q=80"
                    alt="Mercedes dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="border-2 border-gray-300 hover:border-cebleu-purple transition-colors rounded-md overflow-hidden w-16 h-16 flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1571987502227-9231b837d92a?auto=format&fit=crop&w=150&q=80"
                    alt="Mercedes rear view"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <button className="mt-3 w-full bg-cebleu-purple-700 hover:bg-cebleu-purple-800 text-white font-medium py-2 px-4 rounded-md transition-colors">
              {t("index.discoverVehicle")}
            </button>
          </div>

          <div className="hidden md:block border-l border-gray-200"></div>

          <div className="flex-1 md:pl-4">
            <h4 className="font-medium text-gray-700 mb-3">
              {t("index.similarVehicles")}
            </h4>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 flex gap-3 hover:bg-gray-100 transition-colors cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1617469767053-d3b16ee6829f?auto=format&fit=crop&w=150&q=80"
                  alt="BMW i7"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h5 className="font-medium text-sm">BMW i7 xDrive60</h5>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("index.electricSedanBMW")}
                  </p>
                  <div className="mt-1">
                    <span className="font-bold text-gray-900">92 800€</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex gap-3 hover:bg-gray-100 transition-colors cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=150&q=80"
                  alt="Audi e-tron"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h5 className="font-medium text-sm">Audi e-tron GT</h5>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("index.sportbackElectric")}
                  </p>
                  <div className="mt-1">
                    <span className="font-bold text-gray-900">86 500€</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex gap-3 hover:bg-gray-100 transition-colors cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1562911791-c7a97b729ec5?auto=format&fit=crop&w=150&q=80"
                  alt="Tesla Model S"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h5 className="font-medium text-sm">Tesla Model S Plaid</h5>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("index.electricSedanTesla")}
                  </p>
                  <div className="mt-1">
                    <span className="font-bold text-gray-900">101 990€</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex gap-3 hover:bg-gray-100 transition-colors cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=150&q=80"
                  alt="Porsche Taycan"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h5 className="font-medium text-sm">Porsche Taycan Turbo</h5>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("index.sportElectric")}
                  </p>
                  <div className="mt-1">
                    <span className="font-bold text-gray-900">96 254€</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-3 w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-colors">
              {t("index.viewAllModels")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarAdvertisement;
