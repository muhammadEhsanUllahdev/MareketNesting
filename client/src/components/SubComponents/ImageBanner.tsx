import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, AlertCircle } from "lucide-react";
import { ShoppingCartIcon } from "./ShoppingCartIcon";
// import DisputeChat from './disputes/DisputeChat';
import { useTranslation } from "react-i18next";

const ImageBanner = ({ imageSrc }: { imageSrc?: string }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.classList.add("animate-fade-in");
    }
  }, []);

  return (
    <div
      ref={bannerRef}
      className="rounded-lg overflow-hidden shadow-sm opacity-0 bg-white"
    >
      <div className="relative">
        <div className="bg-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-6 md:p-10 md:w-1/2 flex flex-col items-center md:items-start">
              <div className="flex items-center mb-4 text-cebleu-dark">
                <h2 className="text-4xl font-bold text-cebleu-purple-dark tracking-tight">
                  {t("common.findEverything")}
                </h2>
                <div className="ml-3">
                  <ShoppingCartIcon />
                </div>
              </div>
              <p className="mb-6 text-gray-600 text-base font-poppins max-w-md">
                {t("common.shopDescription")}
              </p>
              <button className="bg-[#403E43] text-white font-semibold py-3 px-7 rounded-full hover:bg-[#333333] transition-all duration-300 flex items-center font-poppins text-base">
                {t("common.exploreMarketplace")}
                <ChevronRight className="ml-2" size={20} />
              </button>

              <div className="mt-4">{/* <DisputeChat /> */}</div>
            </div>
            <div className="md:w-1/2 flex justify-center items-center p-6 md:p-10">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Marketplace Illustration"
                  className="w-full max-w-[450px] h-auto object-cover rounded-lg shadow-sm"
                />
              ) : (
                <div className="scale-[2.5] text-cebleu-dark">
                  <ShoppingCartIcon />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageBanner;
