// import { useTranslation } from "react-i18next";
// import { useQuery } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { useLocation } from "wouter";
// import { useAuth } from "@/hooks/use-auth";
// import { Header } from "@/components/layout/header";
// import { Footer } from "@/components/layout/footer";
// import { CategoryGrid } from "@/components/categories/category-grid";
// import { ProductCard } from "@/components/products/product-card";
// import { VendorCard } from "@/components/vendors/vendor-card";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
// import { User, Store, Settings } from "lucide-react";
// import { Link } from "wouter";

// export default function HomePage() {
//   const { t } = useTranslation();
//   const { user } = useAuth();
//   const [, setLocation] = useLocation();

//   // Redirect sellers and admins to their dashboards
//   useEffect(() => {
//     if (user) {
//       if (user.role === "seller") {
//         setLocation("/dashboard/seller");
//         return;
//       }
//       if (user.role === "admin") {
//         setLocation("/dashboard/admin");
//         return;
//       }
//     }
//   }, [user, setLocation]);

//   // Fetch all active products
//   const { data: products, isLoading: productsLoading } = useQuery({
//     queryKey: ["/api/products"],
//     queryFn: async () => {
//       const response = await fetch("/api/products");
//       if (!response.ok) throw new Error("Failed to fetch products");
//       return response.json();
//     },
//   });

//   // Fetch categories
//   const { data: categories, isLoading: categoriesLoading } = useQuery({
//     queryKey: ["/api/categories"],
//     queryFn: async () => {
//       const response = await fetch("/api/categories");
//       if (!response.ok) throw new Error("Failed to fetch categories");
//       return response.json();
//     },
//   });

//   // Fetch vendors
//   const { data: vendors, isLoading: vendorsLoading } = useQuery({
//     queryKey: ["/api/vendors"],
//     queryFn: async () => {
//       const response = await fetch("/api/vendors?limit=3");
//       if (!response.ok) throw new Error("Failed to fetch vendors");
//       return response.json();
//     },
//   });

//   // Mock data for demonstration if API fails
//   const mockProducts = [
//     {
//       id: "1",
//       name: "Premium Wireless Headphones",
//       description:
//         "High-quality wireless headphones with noise cancellation and premium sound",
//       price: 199.99,
//       originalPrice: 249.99,
//       images: [
//         "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&w=400&h=300",
//       ],
//       rating: 4.5,
//       reviewCount: 124,
//       vendorName: "TechWorld Electronics",
//       isFeatured: true,
//       discount: 20,
//       features: ["Fast Shipping"],
//     },
//     {
//       id: "2",
//       name: 'Gaming Laptop Pro 15"',
//       description:
//         "High-performance gaming laptop with RTX graphics and fast SSD storage",
//       price: 1299.99,
//       originalPrice: 1599.99,
//       images: [
//         "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&w=400&h=300",
//       ],
//       rating: 4.0,
//       reviewCount: 89,
//       vendorName: "GameTech Store",
//       isHotDeal: true,
//       discount: 19,
//       features: ["Free Shipping"],
//     },
//     {
//       id: "3",
//       name: "Smart Fitness Watch",
//       description:
//         "Advanced fitness tracking with heart rate monitoring and GPS navigation",
//       price: 299.99,
//       images: [
//         "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&w=400&h=300",
//       ],
//       rating: 5.0,
//       reviewCount: 203,
//       vendorName: "FitTech Wearables",
//       isNew: true,
//       features: ["Best Seller"],
//     },
//     {
//       id: "4",
//       name: "Professional Camera Kit",
//       description:
//         "Complete camera bundle with lens, tripod, and professional accessories",
//       price: 899.99,
//       originalPrice: 1199.99,
//       images: [
//         "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&w=400&h=300",
//       ],
//       rating: 4.5,
//       reviewCount: 156,
//       vendorName: "PhotoPro Equipment",
//       isBundle: true,
//       discount: 25,
//       features: ["2Y Warranty"],
//     },
//   ];

//   const mockVendors = [
//     {
//       id: "1",
//       name: "TechWorld Electronics",
//       description: "Premium electronics and gadgets from Silicon Valley",
//       avatar:
//         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=80&h=80",
//       rating: 4.8,
//       productCount: 1.2,
//     },
//     {
//       id: "2",
//       name: "Fashion Forward Boutique",
//       description: "Trendy clothing and accessories for modern lifestyle",
//       avatar:
//         "https://images.unsplash.com/photo-1494790108755-2616b332c902?ixlib=rb-4.0.3&w=80&h=80",
//       rating: 4.9,
//       productCount: 0.856,
//     },
//     {
//       id: "3",
//       name: "Home & Garden Paradise",
//       description: "Beautiful home decor and garden essentials",
//       avatar:
//         "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&w=80&h=80",
//       rating: 4.7,
//       productCount: 2.1,
//     },
//   ];

//   const displayProducts = products || [];
//   const displayVendors = vendors?.length ? vendors : mockVendors;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       {/* Hero Section */}
//       <section className="relative hero-overlay text-white overflow-hidden">
//         <div
//           className="absolute inset-0 bg-black bg-opacity-20"
//           style={{
//             backgroundImage:
//               "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&w=1920&h=600')",
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             backgroundBlendMode: "overlay",
//           }}
//         ></div>

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
//           <div className="max-w-3xl animate-fade-in">
//             <h1
//               className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
//               data-testid="text-hero-title"
//             >
//               {t("hero.title")}
//             </h1>
//             <p
//               className="text-xl lg:text-2xl mb-8 text-purple-100"
//               data-testid="text-hero-subtitle"
//             >
//               {t("hero.subtitle")}
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Button
//                 size="lg"
//                 className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
//                 data-testid="button-start-shopping"
//               >
//                 {t("hero.startShopping")}
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
//                 data-testid="button-become-seller"
//               >
//                 {t("hero.becomeSeller")}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Categories */}
//         <CategoryGrid categories={categories} />

//         {/* Featured Products */}
//         <section className="py-12">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2
//                 className="text-3xl font-bold text-gray-900 mb-2"
//                 data-testid="text-products-title"
//               >
//                 {t("products.title")}
//               </h2>
//               <p className="text-gray-600" data-testid="text-products-subtitle">
//                 {t("products.subtitle")}
//               </p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2">
//                 <label className="text-sm font-medium text-gray-700">
//                   {t("products.sortBy")}
//                 </label>
//                 <Select defaultValue="featured">
//                   <SelectTrigger className="w-48" data-testid="select-sort">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="featured">
//                       {t("products.featured")}
//                     </SelectItem>
//                     <SelectItem value="price-low">
//                       {t("products.priceLowHigh")}
//                     </SelectItem>
//                     <SelectItem value="price-high">
//                       {t("products.priceHighLow")}
//                     </SelectItem>
//                     <SelectItem value="newest">
//                       {t("products.newest")}
//                     </SelectItem>
//                     <SelectItem value="rating">
//                       {t("products.bestRating")}
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {productsLoading
//               ? // Loading skeletons
//                 Array.from({ length: 4 }).map((_, i) => (
//                   <div key={i} className="bg-white rounded-xl shadow-sm p-4">
//                     <Skeleton className="h-48 w-full mb-4 rounded-lg" />
//                     <Skeleton className="h-4 w-3/4 mb-2" />
//                     <Skeleton className="h-3 w-full mb-4" />
//                     <Skeleton className="h-6 w-1/2 mb-4" />
//                     <Skeleton className="h-10 w-full" />
//                   </div>
//                 ))
//               : displayProducts.map((product: any) => (
//                   <ProductCard key={product.id} product={product} />
//                 ))}
//           </div>

//           <div className="text-center mt-12">
//             <Link href="/products">
//               <Button
//                 size="lg"
//                 className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
//                 data-testid="button-view-all-products"
//               >
//                 View All Products
//               </Button>
//             </Link>
//           </div>
//         </section>

//         {/* Vendor Spotlight */}
//         <section className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="text-center mb-12">
//               <h2
//                 className="text-3xl font-bold text-gray-900 mb-4"
//                 data-testid="text-vendors-title"
//               >
//                 {t("vendors.title")}
//               </h2>
//               <p
//                 className="text-lg text-gray-600 max-w-2xl mx-auto"
//                 data-testid="text-vendors-subtitle"
//               >
//                 {t("vendors.subtitle")}
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {vendorsLoading
//                 ? Array.from({ length: 3 }).map((_, i) => (
//                     <div
//                       key={i}
//                       className="bg-white rounded-xl shadow-sm p-6 text-center"
//                     >
//                       <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
//                       <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
//                       <Skeleton className="h-4 w-full mb-4" />
//                       <Skeleton className="h-10 w-full" />
//                     </div>
//                   ))
//                 : displayVendors.map((vendor: any) => (
//                     <VendorCard key={vendor.id} vendor={vendor} />
//                   ))}
//             </div>
//           </div>
//         </section>

//         {/* Dashboard Preview Section */}
//         <section className="py-16">
//           <div className="text-center mb-12">
//             <h2
//               className="text-3xl font-bold text-gray-900 mb-4"
//               data-testid="text-dashboards-title"
//             >
//               {t("dashboards.title")}
//             </h2>
//             <p
//               className="text-lg text-gray-600 max-w-2xl mx-auto"
//               data-testid="text-dashboards-subtitle"
//             >
//               {t("dashboards.subtitle")}
//             </p>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Customer Dashboard Preview */}
//             <div
//               className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-8 text-white"
//               data-testid="card-dashboard-customer"
//             >
//               <div className="flex items-center mb-6">
//                 <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
//                   <User className="h-6 w-6" />
//                 </div>
//                 <div className="ml-4">
//                   <h3
//                     className="text-xl font-bold"
//                     data-testid="text-dashboard-customer-title"
//                   >
//                     {t("dashboard.customer.title")}
//                   </h3>
//                   <p
//                     className="text-primary-100"
//                     data-testid="text-dashboard-customer-subtitle"
//                   >
//                     {t("dashboard.customer.subtitle")}
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-3 mb-6">
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.customer.orders")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-customer-orders"
//                   >
//                     12
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.customer.wishlist")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-customer-wishlist"
//                   >
//                     24
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.customer.reviews")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-customer-reviews"
//                   >
//                     8
//                   </span>
//                 </div>
//               </div>
//               <Button
//                 className="w-full bg-white text-primary-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
//                 data-testid="button-customer-demo"
//               >
//                 {t("dashboard.customer.demo")}
//               </Button>
//             </div>

//             {/* Seller Dashboard Preview */}
//             <div
//               className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-8 text-white"
//               data-testid="card-dashboard-seller"
//             >
//               <div className="flex items-center mb-6">
//                 <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
//                   <Store className="h-6 w-6" />
//                 </div>
//                 <div className="ml-4">
//                   <h3
//                     className="text-xl font-bold"
//                     data-testid="text-dashboard-seller-title"
//                   >
//                     {t("dashboard.seller.title")}
//                   </h3>
//                   <p
//                     className="text-green-100"
//                     data-testid="text-dashboard-seller-subtitle"
//                   >
//                     {t("dashboard.seller.subtitle")}
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-3 mb-6">
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.seller.products")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-seller-products"
//                   >
//                     156
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.seller.sales")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-seller-sales"
//                   >
//                     $2.4k
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.seller.customers")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-seller-customers"
//                   >
//                     89
//                   </span>
//                 </div>
//               </div>
//               <Button
//                 className="w-full bg-white text-green-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
//                 data-testid="button-seller-demo"
//               >
//                 {t("dashboard.seller.demo")}
//               </Button>
//             </div>

//             {/* Admin Dashboard Preview */}
//             <div
//               className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-8 text-white"
//               data-testid="card-dashboard-admin"
//             >
//               <div className="flex items-center mb-6">
//                 <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
//                   <Settings className="h-6 w-6" />
//                 </div>
//                 <div className="ml-4">
//                   <h3
//                     className="text-xl font-bold"
//                     data-testid="text-dashboard-admin-title"
//                   >
//                     {t("dashboard.admin.title")}
//                   </h3>
//                   <p
//                     className="text-orange-100"
//                     data-testid="text-dashboard-admin-subtitle"
//                   >
//                     {t("dashboard.admin.subtitle")}
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-3 mb-6">
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.admin.totalUsers")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-admin-users"
//                   >
//                     1.2k
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.admin.vendors")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-admin-vendors"
//                   >
//                     45
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="flex items-center">
//                     {t("dashboard.admin.revenue")}
//                   </span>
//                   <span
//                     className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm"
//                     data-testid="text-admin-revenue"
//                   >
//                     $45k
//                   </span>
//                 </div>
//               </div>
//               <Button
//                 className="w-full bg-white text-orange-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
//                 data-testid="button-admin-demo"
//               >
//                 {t("dashboard.admin.demo")}
//               </Button>
//             </div>
//           </div>
//         </section>
//       </div>

//       <Footer />
//     </div>
//   );
// }

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

  // Fetch all active products
  // const { data: products, isLoading: productsLoading } = useQuery({
  //   queryKey: ["/api/products"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/products");
  //     if (!response.ok) throw new Error("Failed to fetch products");
  //     return response.json();
  //   },
  // });

  // Fetch categories
  // const { data: categories, isLoading: categoriesLoading } = useQuery({
  //   queryKey: ["/api/categories"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/categories");
  //     if (!response.ok) throw new Error("Failed to fetch categories");
  //     return response.json();
  //   },
  // });

  // Fetch vendors
  // const { data: vendors, isLoading: vendorsLoading } = useQuery({
  //   queryKey: ["/api/vendors"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/vendors?limit=3");
  //     if (!response.ok) throw new Error("Failed to fetch vendors");
  //     return response.json();
  //   },
  // });

  // Mock data for demonstration if API fails

  // const mockVendors = [
  //   {
  //     id: "1",
  //     name: "TechWorld Electronics",
  //     description: "Premium electronics and gadgets from Silicon Valley",
  //     avatar:
  //       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=80&h=80",
  //     rating: 4.8,
  //     productCount: 1.2,
  //   },
  //   {
  //     id: "2",
  //     name: "Fashion Forward Boutique",
  //     description: "Trendy clothing and accessories for modern lifestyle",
  //     avatar:
  //       "https://images.unsplash.com/photo-1494790108755-2616b332c902?ixlib=rb-4.0.3&w=80&h=80",
  //     rating: 4.9,
  //     productCount: 0.856,
  //   },
  //   {
  //     id: "3",
  //     name: "Home & Garden Paradise",
  //     description: "Beautiful home decor and garden essentials",
  //     avatar:
  //       "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&w=80&h=80",
  //     rating: 4.7,
  //     productCount: 2.1,
  //   },
  // ];

  // const displayProducts = products || [];
  // const displayVendors = vendors?.length ? vendors : mockVendors;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
      <HeaderC />
      {/* Hero Section */}
      <main className="flex-grow w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <TrendingCategories />

        <MainLayout />
      </main>

      <ProductShowcase />
      <ProductGroups />
      <Footer />
    </div>
  );
}
