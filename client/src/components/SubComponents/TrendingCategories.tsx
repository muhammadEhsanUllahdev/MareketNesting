import React, { useRef, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
// import { useLanguage } from '../contexts/LanguageContext';
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryItem {
  icon: string;
  name: string;
}

// Separate Category Card component for better structure
const CategoryCard: React.FC<{ category: CategoryItem }> = ({ category }) => (
  <div className="flex flex-col items-center min-w-[65px] sm:min-w-[90px] cursor-pointer group">
    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-white to-cebleu-purple-50 flex items-center justify-center shadow-md border border-cebleu-purple-100/80 mb-2 transition-transform duration-300 transform group-hover:scale-110 group-hover:shadow-lg group-hover:border-cebleu-purple-300/80">
      <span className="text-lg sm:text-2xl">{category.icon}</span>
    </div>
    <span className="text-[10px] sm:text-xs font-medium text-cebleu-purple-800 text-center w-full truncate max-w-[65px] sm:max-w-[90px] group-hover:text-cebleu-purple transition-colors">
      {category.name}
    </span>
  </div>
);

// Navigation Button component for better structure
const ScrollButton: React.FC<{
  direction: "left" | "right";
  onClick: () => void;
  className?: string;
}> = ({ direction, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-cebleu-purple-50 transition-colors z-10 border border-cebleu-purple-100 ${className}`}
  >
    {direction === "left" ? (
      <ChevronLeft size={16} className="text-cebleu-purple-800" />
    ) : (
      <ChevronRight size={16} className="text-cebleu-purple-800" />
    )}
  </button>
);

const TrendingCategories: React.FC = () => {
  const { t, i18n } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  // const categories: CategoryItem[] = [
  //   { icon: '🏥', name: t('categories.medical') },
  //   { icon: '💅', name: t('categories.beauty') },
  //   { icon: '🧘', name: t('categories.wellness') },
  //   { icon: '🔧', name: t('categories.plumber') },
  //   { icon: '⚡', name: t('categories.electrical') },
  //   { icon: '👷', name: t('categories.tradesmen') },
  //   { icon: '🧹', name: t('categories.cleaning') },
  //   { icon: '📚', name: t('categories.tutors') },
  //   { icon: '🚗', name: t('categories.auto') },
  //   { icon: '🛡️', name: t('categories.insurance') },
  //   { icon: '🏠', name: t('categories.mortgage') },
  //   { icon: '🍳', name: t('categories.kitchen') },
  //   { icon: '🚿', name: t('categories.bathroom') },
  // ];
  const categories: CategoryItem[] = [
    { icon: "🏥", name: t("categories.medical") },
    { icon: "💅", name: t("categories.beauty") },
    { icon: "🧘", name: t("categories.wellness") },
    { icon: "🔧", name: t("categories.plumber") },
    { icon: "⚡", name: t("categories.electrical") },
    { icon: "👷", name: t("categories.tradesmen") },
    { icon: "🧹", name: t("categories.cleaning") },
    { icon: "📚", name: t("categories.tutors") },
    { icon: "🚗", name: t("categories.auto") },
    { icon: "🛡️", name: t("categories.insurance") },
    { icon: "🏠", name: t("categories.mortgage") },
    { icon: "🍳", name: t("categories.kitchen") },
    { icon: "🚿", name: t("categories.bathroom") },
  ];

  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const scrollAmount = isMobile ? 120 : 250;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    [isMobile]
  );

  return (
    <div className="w-full bg-white py-3 shadow-sm mb-4 relative max-w-[100vw] overflow-hidden">
      <div className="container mx-auto px-2 sm:px-4 relative">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <h3 className="text-xs sm:text-base font-medium text-cebleu-purple-800 whitespace-nowrap pl-1 flex-shrink-0">
            {t("index.popularCategories")}
            {/* Popular Categories */}
          </h3>

          <div className="relative flex-1 min-w-0 mx-1">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1.5 scrollbar-none scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {categories.map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))}
            </div>

            {/* Gradients for smooth scroll edges */}
            <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-6 bg-gradient-to-l from-white to-transparent z-10"></div>
          </div>

          <div className="flex items-center gap-1 shrink-0 pr-1">
            <ScrollButton direction="left" onClick={() => scroll("left")} />
            <ScrollButton direction="right" onClick={() => scroll("right")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingCategories;
