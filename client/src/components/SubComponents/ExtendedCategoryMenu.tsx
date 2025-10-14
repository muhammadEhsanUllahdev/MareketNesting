import { useCategoryData } from "@/DummyData/categoryData/CategoryData";
import CategoryList from "@/DummyData/categoryData/CategoryList";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
const ExtendedCategoryMenu = () => {
  const { t } = useTranslation();
  // const categories = useCategoryData();
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    enabled: true,
  });
  return (
    <div className="bg-gradient-to-br from-white to-cebleu-blue-extra-pale rounded-xl shadow-md h-full border border-cebleu-purple-200">
      <div className="px-4 py-2 border-b border-cebleu-purple-200/70">
        <h3 className="text-base font-semibold text-cebleu-purple-800">
          {t("categories.heading")}
        </h3>
      </div>
      <CategoryList categories={categories} />
    </div>
  );
};

export default ExtendedCategoryMenu;
