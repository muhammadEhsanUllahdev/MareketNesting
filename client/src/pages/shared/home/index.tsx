import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CategoryGrid } from "@/components/categories/category-grid";
import { ProductCard } from "@/components/products/product-card";
import { VendorCard } from "@/components/vendors/vendor-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Store, Settings } from "lucide-react";
import { Link } from "wouter";
import HeaderC from "@/components/layout/headerC";
import TrendingCategories from "@/components/SubComponents/TrendingCategories";
import MainLayout from "@/components/home/MainLayout";
import ProductShowcase from "@/DummyData/products/ProductShowcase";
import ProductGroups from "@/DummyData/products/ProductGroups";
import CartComponent from "@/components/home/CartComponent";
import FeaturedProducts from "@/DummyData/products/FeaturedProducts";

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect sellers and admins to their dashboards
  useEffect(() => {
    if (user) {
      if (user.role === "seller") {
        setLocation("/dashboard/seller");
        return;
      }
      if (user.role === "admin") {
        setLocation("/dashboard/admin");
        return;
      }
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
      <HeaderC />
      {/* Hero Section */}
      <main className="flex-grow w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <TrendingCategories />

        <MainLayout />
      </main>
      <FeaturedProducts />
      <ProductShowcase />
      <ProductGroups />
      <Footer />
    </div>
  );
}
