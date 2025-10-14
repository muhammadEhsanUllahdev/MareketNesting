import { useTranslation } from "react-i18next";
import { Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    rating: number;
    productCount: number;
  };
}

export function VendorCard({ vendor }: VendorCardProps) {
  const { t } = useTranslation();

  const handleVisitStore = () => {
    // TODO: Navigate to vendor store page
    console.log("Visiting store:", vendor.id);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 text-center" data-testid={`card-vendor-${vendor.id}`}>
      <CardContent className="p-0">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage 
            src={vendor.avatar} 
            alt={vendor.name}
            className="object-cover"
            data-testid={`img-vendor-avatar-${vendor.id}`}
          />
          <AvatarFallback className="text-xl font-semibold">
            {vendor.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="font-bold text-lg text-gray-900 mb-2" data-testid={`text-vendor-name-${vendor.id}`}>
          {vendor.name}
        </h3>
        
        <p className="text-gray-600 mb-4" data-testid={`text-vendor-description-${vendor.id}`}>
          {vendor.description}
        </p>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
            <span data-testid={`text-vendor-rating-${vendor.id}`}>
              {vendor.rating} {t("vendors.rating")}
            </span>
          </div>
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span data-testid={`text-vendor-product-count-${vendor.id}`}>
              {vendor.productCount}k {t("vendors.products")}
            </span>
          </div>
        </div>
        
        <Button
          onClick={handleVisitStore}
          variant="outline"
          className="w-full border-primary-600 text-primary-600 py-2 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          data-testid={`button-visit-store-${vendor.id}`}
        >
          {t("vendors.visitStore")}
        </Button>
      </CardContent>
    </Card>
  );
}
