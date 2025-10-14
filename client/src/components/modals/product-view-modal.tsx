// import { useState } from "react";
// import { Star, Package, ShoppingCart, Heart, Share2, ChevronDown, ChevronUp } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// interface ProductViewModalProps {
//   product: any;
//   isOpen: boolean;
//   onClose: () => void;
//   categories?: any[];
//   showActions?: boolean; // Whether to show Add to Cart and other action buttons
// }

// export function ProductViewModal({
//   product,
//   isOpen,
//   onClose,
//   categories = [],
//   showActions = true,
// }: ProductViewModalProps) {
//   const [currentLanguage, setCurrentLanguage] = useState<"en" | "fr" | "ar">("en");
//   const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
//     specifications: false,
//     faqs: false,
//   });

//   const category = categories.find((c) => c.id === product?.categoryId);
//   const SUPPORTED_LANGS = ["en", "fr", "ar"] as const;

//   const toggleSection = (section: string) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

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

//   const formatPrice = (price: string) => {
//     return new Intl.NumberFormat('en-DZ', {
//       style: 'currency',
//       currency: 'DZD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(parseFloat(price));
//   };

//   if (!product) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Product Details</DialogTitle>
//           <DialogDescription>
//             Complete product information and specifications
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Product Images */}
//           <div className="space-y-4">
//             <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden border">
//               {product.images?.[0] ? (
//                 <img
//                   src={product.images[0]}
//                   alt={product.name}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                   <div className="text-center">
//                     <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
//                     <p className="text-gray-500">No image available</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Thumbnail Gallery */}
//             {product.images && product.images.length > 1 && (
//               <div className="grid grid-cols-4 gap-2">
//                 {product.images.slice(1, 5).map((image: string, index: number) => (
//                   <div
//                     key={index}
//                     className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden border"
//                   >
//                     <img
//                       src={image}
//                       alt={`${product.name} ${index + 2}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Product Info */}
//           <div className="space-y-6">
//             {/* Language Selection Tabs */}
//             <div className="mb-6">
//               <div className="flex items-center gap-2 mb-4">
//                 <label className="text-sm font-medium">Language:</label>
//                 <div className="flex bg-gray-100 rounded-lg p-1">
//                   {SUPPORTED_LANGS.map((lang) => {
//                     const langLabels = {
//                       en: "English",
//                       fr: "Français",
//                       ar: "العربية",
//                     };
//                     return (
//                       <button
//                         key={lang}
//                         type="button"
//                         onClick={() => setCurrentLanguage(lang)}
//                         className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
//                           currentLanguage === lang 
//                             ? "bg-white shadow-sm text-gray-900" 
//                             : "text-gray-600 hover:text-gray-900"
//                         }`}
//                       >
//                         {langLabels[lang]}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Product Title and Basic Info */}
//             <div>
//               <h1
//                 className="text-2xl font-bold text-gray-900 mb-2"
//                 dir={currentLanguage === "ar" ? "rtl" : "ltr"}
//               >
//                 {product.translations?.[currentLanguage]?.name ||
//                   product.name ||
//                   "No name available"}
//               </h1>
//               <div className="text-gray-600 space-y-1">
//                 <p>{category?.name || "Uncategorized"}</p>
//                 <p>SKU: {product.sku} • Brand: {product.brand}</p>
//               </div>
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
//                 {formatPrice(product.price)}
//               </span>
//               {product.originalPrice && (
//                 <span className="text-lg text-gray-500 line-through">
//                   {formatPrice(product.originalPrice)}
//                 </span>
//               )}
//             </div>

//             {/* Stock Status */}
//             <div className="flex items-center gap-2">
//               <Badge
//                 className={`${
//                   product.stock > 10
//                     ? "bg-green-100 text-green-800"
//                     : product.stock > 0
//                       ? "bg-yellow-100 text-yellow-800"
//                       : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {product.stock > 10
//                   ? "In Stock"
//                   : product.stock > 0
//                     ? "Low Stock"
//                     : "Out of Stock"}
//               </Badge>
//               <span className="text-sm text-gray-600">
//                 {product.stock} units available
//               </span>
//             </div>

//             {/* Action Buttons */}
//             {showActions && (
//               <div className="flex gap-4">
//                 <Button 
//                   size="lg" 
//                   className="flex-1" 
//                   disabled={product.stock === 0}
//                   data-testid="button-add-to-cart"
//                 >
//                   <ShoppingCart className="h-5 w-5 mr-2" />
//                   Add to Cart
//                 </Button>
//                 <Button size="lg" variant="outline" data-testid="button-wishlist">
//                   <Heart className="h-5 w-5" />
//                 </Button>
//                 <Button size="lg" variant="outline" data-testid="button-share">
//                   <Share2 className="h-5 w-5" />
//                 </Button>
//               </div>
//             )}

//             {/* Vendor Info */}
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">Sold by</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 font-medium">{product.vendorName || "Store Owner"}</p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Product Details Sections */}
//         <div className="mt-8 space-y-6">
//           <Separator />

//           {/* Description */}
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-4 text-lg">Description</h3>
//             <div
//               className="text-gray-700"
//               dir={currentLanguage === "ar" ? "rtl" : "ltr"}
//             >
//               <div className="prose prose-sm max-w-none">
//                 <div
//                   dangerouslySetInnerHTML={{
//                     __html:
//                       product.translations?.[currentLanguage]?.description ||
//                       "No description available",
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Highlights */}
//           {product.translations?.[currentLanguage]?.highlights && (
//             <div>
//               <h3 className="font-semibold text-gray-900 mb-4 text-lg">Key Features</h3>
//               <div
//                 className="text-gray-700"
//                 dir={currentLanguage === "ar" ? "rtl" : "ltr"}
//               >
//                 <div className="prose prose-sm max-w-none">
//                   <div
//                     dangerouslySetInnerHTML={{
//                       __html: product.translations[currentLanguage].highlights,
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Specifications */}
//           {product.specifications && product.specifications.length > 0 && (
//             <Collapsible 
//               open={expandedSections.specifications} 
//               onOpenChange={() => toggleSection('specifications')}
//             >
//               <CollapsibleTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="w-full justify-between p-0 h-auto font-semibold text-lg text-gray-900"
//                   data-testid="button-toggle-specifications"
//                 >
//                   Specifications
//                   {expandedSections.specifications ? (
//                     <ChevronUp className="h-5 w-5" />
//                   ) : (
//                     <ChevronDown className="h-5 w-5" />
//                   )}
//                 </Button>
//               </CollapsibleTrigger>
//               <CollapsibleContent className="mt-4">
//                 <Card>
//                   <CardContent className="p-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {product.specifications.map((spec: any, index: number) => (
//                         <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
//                           <div className="font-medium text-gray-900">{spec.featureName}</div>
//                           <div className="text-gray-600">{spec.featureValue}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </CollapsibleContent>
//             </Collapsible>
//           )}

//           {/* FAQs */}
//           {product.faqs && product.faqs.length > 0 && (
//             <Collapsible 
//               open={expandedSections.faqs} 
//               onOpenChange={() => toggleSection('faqs')}
//             >
//               <CollapsibleTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   className="w-full justify-between p-0 h-auto font-semibold text-lg text-gray-900"
//                   data-testid="button-toggle-faqs"
//                 >
//                   Frequently Asked Questions
//                   {expandedSections.faqs ? (
//                     <ChevronUp className="h-5 w-5" />
//                   ) : (
//                     <ChevronDown className="h-5 w-5" />
//                   )}
//                 </Button>
//               </CollapsibleTrigger>
//               <CollapsibleContent className="mt-4">
//                 <div className="space-y-4">
//                   {product.faqs.map((faq: any, index: number) => (
//                     <Card key={index}>
//                       <CardContent className="p-4">
//                         <div className="font-medium text-gray-900 mb-2">{faq.question}</div>
//                         <div className="text-gray-600">{faq.answer}</div>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               </CollapsibleContent>
//             </Collapsible>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { useState } from "react";
import { Star, Package, ShoppingCart, Heart, Share2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";

interface ProductViewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  categories?: any[];
  showActions?: boolean;
}

export function ProductViewModal({
  product,
  isOpen,
  onClose,
  categories = [],
  showActions = true,
}: ProductViewModalProps) {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "fr" | "ar">("en");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    specifications: false,
    faqs: false,
  });

  const category = categories.find((c) => c.id === product?.categoryId);
  const SUPPORTED_LANGS = ["en", "fr", "ar"] as const;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("products.details")}</DialogTitle>
          <DialogDescription>{t("products.completeInformation")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden border">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">{t("products.noImage")}</p>
                  </div>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden border">
                    <img src={image} alt={`${product.name} ${index + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium">{t("products.language")}</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {SUPPORTED_LANGS.map((lang) => {
                    const langLabels = { en: t("products.english"), fr: t("products.french"), ar: t("products.arabic") };
                    return (
                      <button key={lang} type="button" onClick={() => setCurrentLanguage(lang)} className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentLanguage === lang ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"}`}>
                        {langLabels[lang]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
                {product.translations?.[currentLanguage]?.name || product.name || t("products.noName")}
              </h1>
              <div className="text-gray-600 space-y-1">
                <p>{category?.name || t("products.uncategorized")}</p>
                <p>{t("products.sku")}: {product.sku} • {t("products.brand")}: {product.brand}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center">{renderStars(product.rating || 0)}</div>
              <span className="text-sm text-gray-600">
                {product.rating || 0} ({product.reviewCount || 0} {t("products.reviews")})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary-600">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>}
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`${product.stock > 10 ? "bg-green-100 text-green-800" : product.stock > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                {product.stock > 10 ? t("products.inStock") : product.stock > 0 ? t("products.lowStock") : t("products.outOfStock")}
              </Badge>
              <span className="text-sm text-gray-600">{product.stock} {t("products.unitsAvailable")}</span>
            </div>

            {showActions && (
              <div className="flex gap-4">
                <Button size="lg" className="flex-1" disabled={product.stock === 0} data-testid="button-add-to-cart">
                  <ShoppingCart className="h-5 w-5 mr-2" />{t("products.addToCart")}
                </Button>
                <Button size="lg" variant="outline" data-testid="button-wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" data-testid="button-share">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t("products.soldBy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-medium">{product.vendorName || t("products.storeOwner")}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <Separator />

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">{t("products.description")}</h3>
            <div className="text-gray-700" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.translations?.[currentLanguage]?.description || t("products.noDescription") }} />
              </div>
            </div>
          </div>

          {product.translations?.[currentLanguage]?.highlights && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">{t("products.keyFeatures")}</h3>
              <div className="text-gray-700" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: product.translations[currentLanguage].highlights }} />
                </div>
              </div>
            </div>
          )}

          {product.specifications && product.specifications.length > 0 && (
            <Collapsible open={expandedSections.specifications} onOpenChange={() => toggleSection('specifications')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto font-semibold text-lg text-gray-900" data-testid="button-toggle-specifications">
                  {t("products.specifications")}
                  {expandedSections.specifications ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.specifications.map((spec: any, index: number) => (
                        <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                          <div className="font-medium text-gray-900">{spec.featureName}</div>
                          <div className="text-gray-600">{spec.featureValue}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {product.faqs && product.faqs.length > 0 && (
            <Collapsible open={expandedSections.faqs} onOpenChange={() => toggleSection('faqs')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto font-semibold text-lg text-gray-900" data-testid="button-toggle-faqs">
                  {t("products.faqs")}
                  {expandedSections.faqs ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-4">
                  {product.faqs.map((faq: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="font-medium text-gray-900 mb-2">{faq.question}</div>
                        <div className="text-gray-600">{faq.answer}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
