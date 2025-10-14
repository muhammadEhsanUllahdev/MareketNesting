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
  Car,
  Book,
  Music,
  Gift,
  Plane,
  Coffee,
  Utensils,
  Clapperboard,
  Globe,
  Gem,
  Briefcase,
  Brush,
  Camera,
  Cast,
  Cloud,
  Headphones,
  Laptop,
  Leaf,
  Palette,
  Pizza,
  Scissors,
  PiggyBank,
  Printer,
  Cookie,
  Microscope,
  Smartphone as PhoneIcon,
  Ticket,
  Watch,
  Hammer,
  FileText,
  LayoutGrid,
  Flame,
  Luggage,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CategoryItemData } from "./CategoryList";

export const useCategoryData = (): CategoryItemData[] => {
  const { t } = useTranslation();

  // Extended list of categories with their icons and item counts
  const categories: CategoryItemData[] = [
    {
      icon: <Smartphone size={18} />,
      label: t("categories.phoneTablets"),
      count: `4,352 ${t("categories.items")}`,
    },
    {
      icon: <Tv size={18} />,
      label: t("categories.tvTech"),
      count: `2,817 ${t("categories.items")}`,
    },
    {
      icon: <Monitor size={18} />,
      label: t("categories.computers"),
      count: `3,219 ${t("categories.items")}`,
    },
    {
      icon: <Home size={18} />,
      label: t("categories.homeKitchenOffice"),
      count: `5,704 ${t("categories.items")}`,
    },
    {
      icon: <ShoppingBag size={18} />,
      label: t("categories.appliances"),
      count: `1,532 ${t("categories.items")}`,
    },
    {
      icon: <Shirt size={18} />,
      label: t("categories.clothingShoes"),
      count: `8,932 ${t("categories.items")}`,
    },
    {
      icon: <Heart size={18} />,
      label: t("categories.healthBeauty"),
      count: `4,251 ${t("categories.items")}`,
    },
    {
      icon: <Gamepad2 size={18} />,
      label: t("categories.videoGamesConsoles"),
      count: `907 ${t("categories.items")}`,
    },
    {
      icon: <Wrench size={18} />,
      label: t("categories.diy"),
      count: `3,175 ${t("categories.items")}`,
    },
    {
      icon: <Dumbbell size={18} />,
      label: t("categories.sportsLeisure"),
      count: `2,654 ${t("categories.items")}`,
    },
    {
      icon: <Baby size={18} />,
      label: t("categories.babyToys"),
      count: `1,849 ${t("categories.items")}`,
    },
    // New categories
    {
      icon: <Wrench size={18} />,
      label: t("categories.bricolage"),
      count: `2,345 ${t("categories.items")}`,
    },
    {
      icon: <Hammer size={18} />,
      label: t("categories.hardware"),
      count: `1,780 ${t("categories.items")}`,
    },
    {
      icon: <Briefcase size={18} />,
      label: t("categories.office"),
      count: `2,120 ${t("categories.items")}`,
    },
    {
      icon: <LayoutGrid size={18} />,
      label: t("categories.furniture"),
      count: `3,450 ${t("categories.items")}`,
    },
    {
      icon: <FileText size={18} />,
      label: t("categories.stationery"),
      count: `1,890 ${t("categories.items")}`,
    },
    {
      icon: <Brush size={18} />,
      label: t("categories.housekeeping"),
      count: `2,230 ${t("categories.items")}`,
    },
    {
      icon: <LayoutGrid size={18} />,
      label: t("categories.pool"),
      count: `950 ${t("categories.items")}`,
    },
    {
      icon: <Flame size={18} />,
      label: t("categories.heating"),
      count: `1,340 ${t("categories.items")}`,
    },
    {
      icon: <Luggage size={18} />,
      label: t("categories.luggage"),
      count: `2,780 ${t("categories.items")}`,
    },
    {
      icon: <Book size={18} />,
      label: t("common.categories.books"),
      count: `3,850 ${t("categories.items")}`,
    },
    {
      icon: <Music size={18} />,
      label: t("common.categories.music"),
      count: `2,142 ${t("categories.items")}`,
    },
    {
      icon: <Car size={18} />,
      label: t("common.categories.automotive"),
      count: `1,580 ${t("categories.items")}`,
    },
    {
      icon: <Gift size={18} />,
      label: t("common.categories.gifts"),
      count: `4,350 ${t("categories.items")}`,
    },
    {
      icon: <Plane size={18} />,
      label: t("common.categories.travel"),
      count: `720 ${t("categories.items")}`,
    },
    {
      icon: <Coffee size={18} />,
      label: t("common.categories.coffee"),
      count: `950 ${t("categories.items")}`,
    },
    {
      icon: <Utensils size={18} />,
      label: t("common.categories.kitchenware"),
      count: `3,250 ${t("categories.items")}`,
    },
    {
      icon: <Clapperboard size={18} />,
      label: t("common.categories.movies"),
      count: `1,820 ${t("categories.items")}`,
    },
    {
      icon: <Globe size={18} />,
      label: t("common.categories.outdoors"),
      count: `2,130 ${t("categories.items")}`,
    },
    {
      icon: <Gem size={18} />,
      label: t("common.categories.jewelry"),
      count: `1,540 ${t("categories.items")}`,
    },
    {
      icon: <Briefcase size={18} />,
      label: t("common.categories.business"),
      count: `1,270 ${t("categories.items")}`,
    },
    {
      icon: <Brush size={18} />,
      label: t("common.categories.art"),
      count: `2,980 ${t("categories.items")}`,
    },
    {
      icon: <Camera size={18} />,
      label: t("common.categories.photography"),
      count: `1,850 ${t("categories.items")}`,
    },
    {
      icon: <PiggyBank size={18} />,
      label: t("common.categories.finance.short"),
      count: `1,320 ${t("categories.items")}`,
    },
    {
      icon: <Printer size={18} />,
      label: t("common.categories.printing.short"),
      count: `950 ${t("categories.items")}`,
    },
    {
      icon: <Cookie size={18} />,
      label: t("common.categories.bakery.short"),
      count: `1,180 ${t("categories.items")}`,
    },
    {
      icon: <Microscope size={18} />,
      label: t("common.categories.science.short"),
      count: `875 ${t("categories.items")}`,
    },
    {
      icon: <PhoneIcon size={18} />,
      label: t("common.categories.accessories.short"),
      count: `4,210 ${t("categories.items")}`,
    },
    {
      icon: <Ticket size={18} />,
      label: t("common.categories.events.short"),
      count: `630 ${t("categories.items")}`,
    },
    {
      icon: <Watch size={18} />,
      label: t("common.categories.watches.short"),
      count: `1,420 ${t("categories.items")}`,
    },
    {
      icon: <CircleEllipsis size={18} />,
      label: t("categories.otherCategories.short"),
      count: `10,000+ ${t("categories.items")}`,
    },
  ];

  return categories;
};
