import React from "react";
import {
  Smartphone,
  Tv,
  Monitor,
  Home,
  ShoppingBag,
  Shirt,
  Heart,
  Gamepad2,
  Wrench,
  Dumbbell,
  Baby,
  CircleEllipsis,
} from "lucide-react";
// import { useLanguage } from '../contexts/LanguageContext';
import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";
export type IconName = keyof typeof Icons;
const CategoryMenu = () => {
  // const { t } = useLanguage();

  // List of categories with their icons and item counts
  //remove all t() functions
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: true,
  });

  function capitalizeFirst(str: any) {
    str = String(str || "");
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="bg-gradient-to-br from-white to-cebleu-blue-extra-pale rounded-xl shadow-md h-full border border-cebleu-purple-200">
      <div className="px-4 py-3 border-b border-cebleu-purple-200/70">
        <h3 className="text-lg font-semibold text-cebleu-purple-800">
          Categories
        </h3>
      </div>
      <div className="py-2 px-2">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-2 mb-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-cebleu-purple-50 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-cebleu-purple-50 to-white shadow-sm border border-cebleu-purple-100 group-hover:bg-cebleu-purple-100 group-hover:text-cebleu-purple transition-colors">
                {(() => {
                  const iconName = capitalizeFirst(
                    category.icon
                  ) as keyof typeof Icons;
                  const IconComponent = Icons[
                    iconName
                  ] as React.FC<LucideProps>;
                  return IconComponent ? (
                    <IconComponent
                      size={16}
                      className="text-cebleu-purple-600"
                    />
                  ) : (
                    <CircleEllipsis
                      size={16}
                      className="text-cebleu-purple-600"
                    />
                  );
                })()}
              </div>
              <span className="text-sm font-medium text-cebleu-purple-800 group-hover:text-cebleu-purple-900">
                {category.name}
              </span>
            </div>
            <span className="text-xs font-medium text-cebleu-purple-400 group-hover:opacity-100 transition-all">
              {category.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMenu;
