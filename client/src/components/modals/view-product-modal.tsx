// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { useTranslation } from "react-i18next";

// interface Product {
//   id: string;
//   name: string;
//   sku: string;
//   price: string;
//   stock: number;
//   category: string;
//   categoryName?: string;
//   status: "active" | "inactive";
//   isActive: boolean;
//   description?: string;
//   shortDescription?: string;
//   images?: string[];
//   specifications?: Array<{ name: string; value: string }>;
//   faqs?: Array<{ question: string; answer: string }>;
//   translations?: {
//     [key: string]: {
//       name: string;
//       description?: string;
//     };
//   };
// }

// interface ViewProductModalProps {
//   product: Product | null;
//   onClose: () => void;
// }

// export default function ViewProductModal({
//   product,
//   onClose,
// }: ViewProductModalProps) {
//   const { t, i18n } = useTranslation();

//   if (!product) return null;

//   const productName =
//     product.translations?.[i18n.language]?.name ||
//     product.translations?.en?.name ||
//     product.name;

//   // const productDescription =
//   //   product.translations?.[i18n.language]?.description ||
//   //   product.translations?.en?.description ||
//   //   product.description;

//   const getPlainText = (html: string) => {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, "text/html");
//     return doc.body.textContent || "";
//   };

//   return (
//     <Dialog open={!!product} onOpenChange={() => onClose()}>
//       <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle data-testid="text-view-product-title">
//             {productName}
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Basic Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Basic Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     Product Name
//                   </label>
//                   <p className="font-medium">{productName}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     SKU
//                   </label>
//                   <p className="font-mono text-sm">{product.sku}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     Category
//                   </label>
//                   <Badge variant="outline">
//                     {product.categoryName || product.category}
//                   </Badge>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     Status
//                   </label>
//                   <Badge
//                     className={
//                       product.isActive
//                         ? "bg-green-100 text-green-800"
//                         : "bg-gray-100 text-gray-800"
//                     }
//                   >
//                     {product.isActive ? "Active" : "Inactive"}
//                   </Badge>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     Price
//                   </label>
//                   <p className="font-semibold text-lg">
//                     {new Intl.NumberFormat("en-US", {
//                       style: "currency",
//                       currency: "DZD",
//                       minimumFractionDigits: 0,
//                     }).format(parseFloat(product.price))}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     Stock
//                   </label>
//                   <Badge
//                     variant={product.stock > 0 ? "outline" : "destructive"}
//                     className={
//                       product.stock > 0 ? "text-green-700 bg-green-50" : ""
//                     }
//                   >
//                     {product.stock > 0
//                       ? `${product.stock} in stock`
//                       : "Out of stock"}
//                   </Badge>
//                 </div>
//               </div>

//               {product.translations?.[i18n.language]?.description && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     Description
//                   </label>
//                   <p className="mt-1 text-gray-900">
//                     {getPlainText(
//                       product.translations?.[i18n.language]?.description || ""
//                     )}
//                   </p>
//                 </div>
//               )}

//               {product.shortDescription && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-600">
//                     Short Description
//                   </label>
//                   <p className="mt-1 text-gray-900">
//                     {product.shortDescription}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Images */}
//           {product.images && product.images.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Product Images</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
//                   {product.images.map((image, index) => (
//                     <div key={index} className="aspect-square">
//                       <img
//                         src={image}
//                         alt={`${productName} ${index + 1}`}
//                         className="w-full h-full object-cover rounded-lg border"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Specifications */}
//           {product.specifications && product.specifications.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Specifications</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {product.specifications.map((spec, index) => (
//                     <div
//                       key={index}
//                       className="flex justify-between py-2 border-b last:border-0"
//                     >
//                       <span className="font-medium text-gray-600">
//                         {spec.name}
//                       </span>
//                       <span className="text-gray-900">{spec.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* FAQs */}
//           {product.faqs && product.faqs.length > 0 && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">
//                   Frequently Asked Questions
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {product.faqs.map((faq, index) => (
//                     <div key={index} className="space-y-2">
//                       <h4 className="font-medium text-gray-900">
//                         {faq.question}
//                       </h4>
//                       <p className="text-gray-600 leading-relaxed">
//                         {faq.answer}
//                       </p>
//                       {index < product.faqs!.length - 1 && <Separator />}
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  category: string;
  categoryName?: string;
  status: "active" | "inactive";
  isActive: boolean;
  description?: string;
  shortDescription?: string;
  images?: string[];
  specifications?: Array<{ name: string; value: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  translations?: {
    [key: string]: {
      name: string;
      description?: string;
    };
  };
}

interface ViewProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ViewProductModal({
  product,
  onClose,
}: ViewProductModalProps) {
  const { t, i18n } = useTranslation();

  if (!product) return null;

  const productName =
    product.translations?.[i18n.language]?.name ||
    product.translations?.en?.name ||
    product.name;

  const getPlainText = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-view-product-title">
            {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("viewProductModal.basicInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.productName")}
                  </label>
                  <p className="font-medium">{productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.sku")}
                  </label>
                  <p className="font-mono text-sm">{product.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.category")}
                  </label>
                  <Badge variant="outline">
                    {product.categoryName || product.category}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.status")}
                  </label>
                  <Badge
                    className={
                      product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {product.isActive
                      ? t("viewProductModal.active")
                      : t("viewProductModal.inactive")}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.price")}
                  </label>
                  <p className="font-semibold text-lg">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "DZD",
                      minimumFractionDigits: 0,
                    }).format(parseFloat(product.price))}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.stock")}
                  </label>
                  <Badge
                    variant={product.stock > 0 ? "outline" : "destructive"}
                    className={
                      product.stock > 0 ? "text-green-700 bg-green-50" : ""
                    }
                  >
                    {product.stock > 0
                      ? t("viewProductModal.inStock", { count: product.stock })
                      : t("viewProductModal.outOfStock")}
                  </Badge>
                </div>
              </div>

              {product.translations?.[i18n.language]?.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.description")}
                  </label>
                  <p className="mt-1 text-gray-900">
                    {getPlainText(
                      product.translations?.[i18n.language]?.description || ""
                    )}
                  </p>
                </div>
              )}

              {product.shortDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("viewProductModal.shortDescription")}
                  </label>
                  <p className="mt-1 text-gray-900">
                    {product.shortDescription}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {product.images && product.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("viewProductModal.productImages")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={image}
                        alt={`${productName} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("viewProductModal.specifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-2 border-b last:border-0"
                    >
                      <span className="font-medium text-gray-600">
                        {spec.name}
                      </span>
                      <span className="text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAQs */}
          {product.faqs && product.faqs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("viewProductModal.faqs")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.faqs.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-gray-900">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                      {index < product.faqs!.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
