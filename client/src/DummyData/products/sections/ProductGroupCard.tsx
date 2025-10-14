import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ImageOff,
  ShoppingBag,
  Zap,
  FolderOpen,
  Gift,
} from "lucide-react";
interface ProductGroupCardItem {
  name: string;
  image: string;
  consultations?: number;
}
interface ProductGroupCardProps {
  title: string;
  iconName: "shopping-bag" | "zap" | "folder-open" | "gift";
  items: ProductGroupCardItem[];
  index: number;
}
const ProductGroupCard = ({
  title,
  iconName,
  items,
  index,
}: ProductGroupCardProps) => {
  // const { t } = useLanguage();
  const { t } = useTranslation();

  // Render the appropriate icon based on the iconName
  const renderIcon = () => {
    switch (iconName) {
      case "shopping-bag":
        return <ShoppingBag className="h-5 w-5 text-cebleu-gold" />;
      case "zap":
        return (
          <Zap className="h-5 w-5 text-cebleu-gold fill-cebleu-gold-light" />
        );
      case "folder-open":
        return <FolderOpen className="h-5 w-5 text-cebleu-gold" />;
      case "gift":
        return <Gift className="h-5 w-5 text-cebleu-gold" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-cebleu-gold" />;
    }
  };

  // Fallback images array for different categories
  const fallbackImages = [
    // Tech & Electronics
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80&auto=format&fit=crop",
    // Home & Furniture
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80&auto=format&fit=crop",
    // Fashion
    "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=500&q=80&auto=format&fit=crop",
    // Gaming
    "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=500&q=80&auto=format&fit=crop",
  ];
  const handleImageError =
    (idx: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      const fallbackIndex = idx % fallbackImages.length;

      // First try a category-specific fallback
      target.src = fallbackImages[fallbackIndex];

      // Add a second error handler in case the fallback itself fails
      target.onerror = () => {
        // If the fallback fails, use the first image as a last resort
        target.src = fallbackImages[0];
        target.onerror = null; // Prevent infinite error handling loop

        // Show the error placeholder
        const parent = target.closest(".image-container");
        if (parent) {
          parent.classList.add("image-error");
        }
      };
    };
  return (
    <Card className="border-gray-200 h-full shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          {renderIcon()}
          <h3 className="font-semibold ml-2 text-cebleu-purple-800">{title}</h3>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, idx) => (
            <div key={idx} className="group/item cursor-pointer">
              <div className="relative h-28 md:h-32 rounded-md overflow-hidden mb-2 border border-gray-200 bg-gradient-to-br from-cebleu-purple-50/50 to-cebleu-purple-100/30 image-container">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                  loading="lazy"
                  onError={handleImageError(idx)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>

                {/* Image loading error placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-cebleu-purple-50/80 opacity-0 image-error:opacity-100 pointer-events-none">
                  <ImageOff className="w-8 h-8 text-cebleu-purple-300 mb-1" />
                  <p className="text-xs text-cebleu-purple-400 font-medium px-2 text-center">
                    {item.name}
                  </p>
                </div>
              </div>
              <p className="text-xs md:text-sm font-medium line-clamp-2">
                {item.name}
              </p>
              {item.consultations}
            </div>
          ))}
        </div>

        <Button
          variant="link"
          className="p-0 mt-4 text-cebleu-purple-600 hover:text-cebleu-purple-900 text-sm"
        >
          <span>{t("products.seeAllButton")}</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
export default ProductGroupCard;
