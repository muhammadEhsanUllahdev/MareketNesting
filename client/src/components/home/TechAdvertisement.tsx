import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Clock, Star, TrendingUp, Globe } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { use } from "passport";

const TechAdvertisement = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-b from-white via-sky-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm w-full overflow-hidden flex flex-col h-full group hover:shadow-md transition-all duration-300">
      <div className="flex-grow flex flex-col space-y-2 p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-blue-800 flex items-center">
            <Globe className="mr-1.5 text-blue-600" size={16} />{" "}
            {t("common.flightBooking")}
          </h3>
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm group-hover:scale-110 transition-transform">
            -30%
          </div>
        </div>

        <div className="relative overflow-hidden rounded-md shadow-sm">
          <AspectRatio ratio={16 / 9} className="bg-blue-50">
            <img
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=600&q=80"
              alt="Airplane in sky"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </AspectRatio>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Star
                  key={index}
                  fill="#FFCA28"
                  stroke="none"
                  className="w-3 h-3 mr-0.5"
                />
              ))}
              <span className="text-white text-xs ml-1 font-medium">4.9/5</span>
            </div>
          </div>

          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-md group-hover:bg-blue-700 transition-colors">
            <TrendingUp size={14} />
          </div>
        </div>

        <div className="flex-grow flex flex-col space-y-2">
          <div className="bg-white/70 backdrop-blur-sm p-2 rounded-md border border-blue-100 shadow-inner">
            <h4 className="font-medium text-xs text-blue-700 mb-1.5 flex items-center">
              <Calendar className="mr-1 text-blue-500" size={14} />{" "}
              {t("common.topDestinations")}
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer">
                <span className="font-medium">Paris → New York</span>
                <span className="text-red-600 font-bold">399€</span>
              </div>
              <div className="flex items-center justify-between text-xs hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer">
                <span className="font-medium">London → Tokyo</span>
                <span className="text-red-600 font-bold">549€</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 p-1.5 rounded-md shadow-inner text-xs">
            <div className="flex items-center text-blue-700">
              <Clock size={12} className="mr-1 animate-pulse text-red-500" />
              <span>{t("common.limitedTimeOffer")}</span>
            </div>
            <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              48h
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2.5 transition-colors group-hover:from-blue-600 group-hover:to-blue-800">
        <Button className="w-full h-7 bg-white hover:bg-blue-50 text-blue-700 text-xs font-medium py-0 px-2 rounded-md transition-colors shadow-sm flex items-center justify-center">
          <Plane className="mr-1 text-blue-600" size={14} />
          {t("common.bookNow")}
        </Button>
      </div>
    </div>
  );
};

export default TechAdvertisement;
