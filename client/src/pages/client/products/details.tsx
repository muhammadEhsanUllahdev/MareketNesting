// import { useParams } from "wouter";
// import { useQuery } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Star, ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";

// export default function ProductDetails() {
//   const { id } = useParams();

//   // Fetch product details
//   const {
//     data: product,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["/api/products", id],
//     queryFn: async () => {
//       const response = await fetch(`/api/products/${id}`);
//       if (!response.ok) throw new Error("Failed to fetch product");
//       return response.json();
//     },
//     enabled: !!id,
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-7xl mx-auto">
//           <Skeleton className="h-8 w-32 mb-6" />
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <Skeleton className="aspect-square rounded-lg" />
//             <div className="space-y-4">
//               <Skeleton className="h-8 w-3/4" />
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-2/3" />
//               <Skeleton className="h-12 w-32" />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             Product Not Found
//           </h1>
//           <p className="text-gray-600 mb-4">
//             The product you're looking for doesn't exist.
//           </p>
//           <Button onClick={() => window.history.back()}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const renderStars = (rating: number) => {
//     return [...Array(5)].map((_, i) => (
//       <Star
//         key={i}
//         className={`h-4 w-4 ${
//           i < Math.floor(rating)
//             ? "fill-yellow-400 text-yellow-400"
//             : "text-gray-300"
//         }`}
//       />
//     ));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <Button
//             variant="ghost"
//             onClick={() => window.history.back()}
//             className="mb-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//         </div>
//       </div>

//       {/* Product Details */}
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//           {/* Product Images */}
//           <div className="space-y-4">
//             <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
//               {product.images?.[0] ? (
//                 <img
//                   src={product.images[0]?.url}
//                   alt={product.name}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                   <div className="text-center">
//                     <div className="text-gray-400 text-6xl mb-2">📦</div>
//                     <p className="text-gray-500">No image available</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Thumbnail Gallery */}
//             {product.images && product.images.length > 1 && (
//               <div className="grid grid-cols-4 gap-2">
//                 {product.images
//                   .slice(1, 5)
//                   .map((image: string, index: number) => (
//                     <div
//                       key={index}
//                       className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden"
//                     >
//                       <img
//                         src={image}
//                         alt={`${product.name} ${index + 2}`}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   ))}
//               </div>
//             )}
//           </div>

//           {/* Product Info */}
//           <div className="space-y-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 {product.name}
//               </h1>
//               <p className="text-gray-600">SKU: {product.sku}</p>
//             </div>

//             {/* Rating */}
//             <div className="flex items-center gap-3">
//               <div className="flex items-center">
//                 {renderStars(product.rating || 0)}
//               </div>
//               <span className="text-sm text-gray-600">
//                 {product.rating || 0} ({product.reviewCount || 0} reviews)
//               </span>
//             </div>

//             {/* Price */}
//             <div className="flex items-center gap-3">
//               <span className="text-3xl font-bold text-primary-600">
//                 ${product.price}
//               </span>
//               {product.originalPrice && (
//                 <span className="text-xl text-gray-500 line-through">
//                   ${product.originalPrice}
//                 </span>
//               )}
//             </div>

//             {/* Stock Status */}
//             <div>
//               <Badge
//                 className={`${
//                   product.stock > 10
//                     ? "bg-green-100 text-green-800"
//                     : product.stock > 0
//                     ? "bg-yellow-100 text-yellow-800"
//                     : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {product.stock > 10
//                   ? "In Stock"
//                   : product.stock > 0
//                   ? "Low Stock"
//                   : "Out of Stock"}
//               </Badge>
//               <p className="text-sm text-gray-600 mt-1">
//                 {product.stock} units available
//               </p>
//             </div>

//             {/* Description */}
//             {product.description && (
//               <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">
//                   Description
//                 </h3>
//                 <p className="text-gray-700">{product.description}</p>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex gap-4">
//               <Button
//                 size="lg"
//                 className="flex-1"
//                 disabled={product.stock === 0}
//               >
//                 <ShoppingCart className="h-5 w-5 mr-2" />
//                 Add to Cart
//               </Button>
//               <Button size="lg" variant="outline">
//                 <Heart className="h-5 w-5" />
//               </Button>
//               <Button size="lg" variant="outline">
//                 <Share2 className="h-5 w-5" />
//               </Button>
//             </div>

//             {/* Vendor Info */}
//             {product.vendorName && (
//               <Card>
//                 <CardContent className="p-4">
//                   <h3 className="font-semibold text-gray-900 mb-2">Sold by</h3>
//                   <p className="text-gray-700">{product.vendorName}</p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductDetails() {
  const { id } = useParams();
  const { t } = useTranslation();

  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error(t("product.fetchError"));
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("product.notFoundTitle")}
          </h1>
          <p className="text-gray-600 mb-4">{t("product.notFoundDesc")}</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.goBack")}
          </Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-2">📦</div>
                    <p className="text-gray-500">{t("product.noImage")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images
                  .slice(1, 5)
                  .map((image: string, index: number) => (
                    <div
                      key={index}
                      className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600">
                {t("product.sku")}: {product.sku}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating || 0} ({product.reviewCount || 0}{" "}
                {t("product.reviews")})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary-600">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div>
              <Badge
                className={`${
                  product.stock > 10
                    ? "bg-green-100 text-green-800"
                    : product.stock > 0
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 10
                  ? t("product.inStock")
                  : product.stock > 0
                  ? t("product.lowStock")
                  : t("product.outOfStock")}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                {product.stock} {t("product.unitsAvailable")}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("product.description")}
                </h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("product.addToCart")}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Vendor Info */}
            {product.vendorName && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("product.soldBy")}
                  </h3>
                  <p className="text-gray-700">{product.vendorName}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
