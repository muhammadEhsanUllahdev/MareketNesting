import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface ProductGroupCardItem {
  name: string;
  image: string;
  consultations?: number;
}

export interface ProductGroup {
  title: string;
  iconName: "shopping-bag" | "zap" | "folder-open" | "gift";
  items: ProductGroupCardItem[];
}

export interface FeaturedSection {
  title: string;
  bgColor: string;
  textColor: string;
  image: string;
  link: string;
  linkText: string;
}

export interface TrendingItem {
  name: string;
  image: string;
  price: string;
  oldPrice?: string;
}

export const getProductGroups = (
  t: (key: string) => string
): ProductGroup[] => [
  {
    title: t("products.resumeShopping"),
    iconName: "shopping-bag",
    items: [
      {
        name: t("products.miniRefrigerators"),
        image:
          "https://images.unsplash.com/photo-1584568694244-14e439b58f31?w=500&q=80&auto=format&fit=crop",
        consultations: 3,
      },
      {
        name: t("products.smartphones"),
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80&auto=format&fit=crop",
        consultations: 1,
      },
      {
        name: t("products.officeChairs"),
        image:
          "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80&auto=format&fit=crop",
        consultations: 3,
      },
      {
        name: t("products.books"),
        image:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80&auto=format&fit=crop",
        consultations: 1,
      },
    ],
  },
  {
    title: t("products.flashSales"),
    iconName: "zap",
    items: [
      {
        name: t("products.gamingMonitor"),
        image:
          "https://images.unsplash.com/photo-1616763355603-6c41b1a4f30b?w=500&q=80&auto=format&fit=crop",
      },
      {
        name: t("products.gamingDesk"),
        image:
          "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=500&q=80&auto=format&fit=crop",
      },
      {
        name: t("products.gamingMouse"),
        image:
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80&auto=format&fit=crop",
      },
      {
        name: t("products.gamingHeadphones"),
        image:
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80&auto=format&fit=crop",
      },
    ],
  },
  {
    title: t("products.categoriesToExplore"),
    iconName: "folder-open",
    items: [
      {
        name: t("products.gamingMouse"),
        image:
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80&auto=format&fit=crop",
      },
      {
        name: t("products.motherboards"),
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80&auto=format&fit=crop",
      },
      {
        name: t("products.ram"),
        image:
          "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80&auto=format&fit=crop",
      },
      {
        name: t("products.internalStorage"),
        image:
          "https://images.unsplash.com/photo-1600348712459-d11aac4be94e?w=500&q=80&auto=format&fit=crop",
      },
    ],
  },
];

export const getFeaturedSections = (t: (key: string) => string) => [
  {
    title: `${t("header.deals")} - 25€ ${t("products.offersFor")} 25000 ${t(
      "products.clients"
    )}`,
    bgColor: "bg-gradient-to-r from-indigo-700 to-indigo-600",
    textColor: "text-white",
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500&q=80&auto=format&fit=crop",
    link: "/deals",
    linkText: t("products.viewConditions"),
  },
  {
    title: `${t("products.flashSales")} - 25 ${t("products.anniversary")}`,
    bgColor: "bg-gradient-to-br from-white to-cebleu-purple-50",
    textColor: "text-gray-800",
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&q=80&auto=format&fit=crop",
    link: "/anniversary",
    linkText: t("products.learnMore"),
  },
  {
    title: t("products.frenchShowcase"),
    bgColor: "bg-gradient-to-r from-red-500 to-red-600",
    textColor: "text-white",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80&auto=format&fit=crop",
    link: "/french-products",
    linkText: t("products.learnMore"),
  },
];

export const getTrendingItems = (t: (key: string) => string) => [
  {
    name: 'KTC 32" Gaming Monitor',
    image:
      "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=500&q=80&auto=format&fit=crop",
    price: "199.99€",
    oldPrice: "249.99€",
  },
  {
    name: t("products.blackLeggings"),
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&q=80&auto=format&fit=crop",
    price: "29.99€",
    oldPrice: "39.99€",
  },
  {
    name: t("products.miniRefrigerator"),
    image:
      "https://images.unsplash.com/photo-1584568694244-14e439b58f31?w=500&q=80&auto=format&fit=crop",
    price: "159.90€",
    oldPrice: "189.90€",
  },
  {
    name: `BuyWeek Mini ${t("products.miniRefrigerator")}`,
    image:
      "https://images.unsplash.com/photo-1638864616275-9f0b291a2eb2?w=500&q=80&auto=format&fit=crop",
    price: "30.99€",
    oldPrice: "45.99€",
  },
];

export const getSuggestionItems = (t: (key: string) => string) => [
  {
    name: t("products.blackBackpack"),
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80&auto=format&fit=crop",
  },
  {
    name: t("products.mathsBook"),
    image:
      "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?w=500&q=80&auto=format&fit=crop",
  },
  {
    name: t("products.bluetoothSpeaker"),
    image:
      "https://images.unsplash.com/photo-1589003077984-894e762f8a5e?w=500&q=80&auto=format&fit=crop",
  },
  {
    name: t("products.childrenBook"),
    image:
      "https://images.unsplash.com/photo-1594280813511-69170c9c271c?w=500&q=80&auto=format&fit=crop",
  },
  {
    name: t("products.cordlessVacuum"),
    image:
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&q=80&auto=format&fit=crop",
  },
  {
    name: t("products.smartWatch"),
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80&auto=format&fit=crop",
  },
  {
    name: t("products.wirelessEarbuds"),
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80&auto=format&fit=crop",
  },
  {
    name: t("products.yogaMat"),
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80&auto=format&fit=crop",
  },
];
