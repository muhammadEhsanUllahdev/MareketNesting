import React from "react";
import { Button } from "@/components/ui/button";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import { Star, Tag, ArrowRight, ShoppingBag } from "lucide-react";

interface TrendingItem {
  name: string;
  image: string;
  price: string;
  oldPrice?: string;
}

interface TrendingItemsProps {
  title: string;
  items: TrendingItem[];
}

const TrendingItems = ({ title, items }: TrendingItemsProps) => {
  // const { t } = useLanguage();
  const { t } = useTranslation();

  // Enhanced collection of fallback images with higher quality selections
  const fallbackImages = [
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&q=80&auto=format&fit=crop",
  ];

  // Additional product images for variety
  const productImages = [
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80&auto=format&fit=crop",
  ];

  return (
    <div className="bg-gradient-to-b from-white to-cebleu-purple-50/30 p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full border border-cebleu-purple-100/40">
      <h3 className="font-bold text-lg text-cebleu-purple-800 mb-5 flex items-center">
        <Tag className="w-4 h-4 mr-2 text-cebleu-gold" />
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, idx) => {
          // Use a combination of provided image, product images, or fallbacks
          const imageToUse =
            item.image && item.image !== ""
              ? item.image
              : productImages[idx % productImages.length] ||
                fallbackImages[idx % fallbackImages.length];

          return (
            <div key={idx} className="cursor-pointer group">
              <div className="mb-2 border border-cebleu-purple-100/50 rounded-md overflow-hidden relative shadow-sm group-hover:shadow-md transition-all duration-300">
                {item.oldPrice && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] px-2 py-0.5 rounded-bl-md font-medium z-10">
                    {t("products.sale")}
                  </div>
                )}
                <div className="h-28 overflow-hidden bg-gradient-to-br from-cebleu-purple-50 to-cebleu-purple-100/30">
                  <img
                    src={imageToUse}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      // Enhanced fallback logic with multiple fallback options
                      const target = e.target as HTMLImageElement;
                      const currentSrc = target.src;
                      const fallbackIndex = idx % fallbackImages.length;

                      // Try the assigned fallback first
                      if (currentSrc !== fallbackImages[fallbackIndex]) {
                        target.src = fallbackImages[fallbackIndex];
                      } else {
                        // If that fails, use a different fallback
                        const alternativeFallback =
                          fallbackImages[
                            (fallbackIndex + 1) % fallbackImages.length
                          ];
                        target.src = alternativeFallback;
                      }
                    }}
                  />
                </div>
              </div>
              <h5 className="text-xs font-medium line-clamp-1 group-hover:text-cebleu-purple-700 transition-colors">
                {item.name}
              </h5>
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-bold text-cebleu-purple-800">
                  {item.price}
                </p>
                {item.oldPrice && (
                  <p className="text-xs line-through text-gray-500">
                    {item.oldPrice}
                  </p>
                )}
              </div>
              <div className="flex items-center mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Star className="h-3 w-3 text-gray-300" />
                <span className="text-[10px] text-gray-500 ml-1">4.0</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-cebleu-purple-100/40">
        <Button
          variant="link"
          className="p-0 text-sm text-cebleu-purple-600 font-medium hover:text-cebleu-purple-800 hover:translate-x-1 transition-transform flex items-center"
        >
          {t("products.viewMore")}
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default TrendingItems;
