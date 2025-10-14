import React from "react";
import CategoryItem from "./CategoryItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { IconName } from "./CategoryItem";
export interface CategoryItemData {
  icon: IconName;
  name: string;
  count: string;
}

interface CategoryListProps {
  categories: CategoryItemData[];
}

const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <ScrollArea className="py-2 px-1.5 h-[calc(100%-44px)]">
      <div className="grid grid-cols-1 gap-1">
        {categories.map((category, index) => (
          <CategoryItem
            key={index}
            icon={category.icon}
            name={category.name}
            count={category.count}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default CategoryList;
