import React from "react";
import { Button } from "@/components/ui/button";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import { ArrowRight, BadgePercent } from "lucide-react";

interface FeaturedSection {
  title: string;
  bgColor: string;
  textColor: string;
  image: string;
  link: string;
  linkText: string;
}

interface FeaturedPromotionsProps {
  featuredSections: FeaturedSection[];
}

const FeaturedPromotions = ({ featuredSections }: FeaturedPromotionsProps) => {
  // const { t } = useLanguage();
  const { t } = useTranslation();

  // Enhanced fallback images with high quality photos
  const fallbackImages = [
    "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1603384179269-c506545097b5?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&q=80&auto=format&fit=crop",
  ];

  // Additional themed promotion images
  const promotionImages = [
    "https://images.unsplash.com/photo-1558089687-f282ffcbc0d4?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&q=80&auto=format&fit=crop",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {featuredSections.map((section, index) => (
        <div
          key={index}
          className={`${section.bgColor} ${section.textColor} rounded-lg overflow-hidden shadow-md h-full relative hover:shadow-xl transition-all duration-300 group border border-cebleu-purple-100/40`}
        >
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <BadgePercent className="h-3.5 w-3.5 text-cebleu-gold" />
              <span className="text-xs font-medium text-cebleu-purple-800">
  {t("offers.special")}
</span>
            </div>
          </div>

          <div className="p-5 pb-16">
            <h3 className="font-bold text-lg mb-5 relative">
              {section.title}
              <span className="absolute bottom-[-6px] left-0 w-12 h-1 bg-current opacity-50 rounded-full"></span>
            </h3>
            <div className="flex justify-center items-center h-48 mb-4 overflow-hidden rounded-md bg-gradient-to-br from-cebleu-purple-50/50 to-cebleu-purple-100/30">
              <img
                src={
                  section.image ||
                  promotionImages[index % promotionImages.length] ||
                  fallbackImages[index % fallbackImages.length]
                }
                alt={section.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  // Enhanced fallback image logic
                  const target = e.target as HTMLImageElement;
                  const currentSrc = target.src;

                  // First try a themed promotion image if available
                  if (
                    index < promotionImages.length &&
                    currentSrc !== promotionImages[index]
                  ) {
                    target.src = promotionImages[index];
                  }
                  // Otherwise use one of the general fallback images
                  else if (
                    currentSrc !== fallbackImages[index % fallbackImages.length]
                  ) {
                    target.src = fallbackImages[index % fallbackImages.length];
                  }
                  // If both failed, use the first fallback image
                  else {
                    target.src = fallbackImages[0];
                  }
                }}
              />
            </div>
            <div className="absolute bottom-4 left-5">
              <Button
                variant="link"
                className={`p-0 flex items-center ${section.textColor} font-medium group-hover:translate-x-1 transition-transform`}
              >
                {section.linkText}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 opacity-80" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedPromotions;
