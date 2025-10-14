import React, { useState } from "react";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import { ImageOff } from "lucide-react";

interface SuggestionItem {
  name: string;
  image: string;
}

interface GiftIdeasProps {
  items: SuggestionItem[];
  icon?: React.ReactNode;
}

const GiftIdeas = ({ items, icon }: GiftIdeasProps) => {
  // const { t } = useLanguage();
  const { t } = useTranslation();

  // Fallback images pour les cadeaux
  const fallbackImages = [
    "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557844352-761f2565b576?w=500&q=80&auto=format&fit=crop",
  ];

  const handleImageError =
    (index: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.onerror = null; // Éviter les boucles infinies

      // Utiliser une image de secours basée sur l'index
      const fallbackIndex = index % fallbackImages.length;
      target.src = fallbackImages[fallbackIndex];

      // Si le fallback échoue aussi, montrer une image d'erreur stylée
      target.onerror = () => {
        // Ajouter la classe pour montrer l'overlay d'erreur
        const parent = target.parentElement;
        if (parent) {
          parent.classList.add("image-error");
        }
      };
    };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-cebleu-purple-800 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {t("products.giftIdeasTitle")}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map((item, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="overflow-hidden rounded-lg border border-gray-200 mb-2 aspect-square relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                onError={handleImageError(index)}
              />
              {/* Overlay d'erreur qui s'affiche si toutes les tentatives échouent */}
              <div className="absolute inset-0 flex items-center justify-center bg-cebleu-purple-50/80 opacity-0 pointer-events-none image-error:opacity-100">
                <div className="text-center">
                  <ImageOff className="h-8 w-8 text-cebleu-purple-300 mx-auto mb-1" />
                  <p className="text-xs text-cebleu-purple-400 font-medium">
                    {item.name}
                  </p>
                </div>
              </div>
            </div>
            <h4 className="text-xs font-medium text-center line-clamp-2">
              {item.name}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiftIdeas;
