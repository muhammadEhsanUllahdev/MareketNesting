// import React, { useState } from "react";
// // import { useLanguage } from '@/contexts/LanguageContext';
// import { useTranslation } from "react-i18next";
// import { Filter } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { ExpandedSectionsType } from "./filters/types";
// import FilterSection from "./filters/FilterSection";
// import RatingFilter from "./filters/RatingFilter";
// import SortByFilter from "./filters/SortByFilter";
// import AvailabilityFilter from "./filters/AvailabilityFilter";
// import ShippingFilter from "./filters/ShippingFilter";
// import DeliveryFilter from "./filters/DeliveryFilter";
// import RefreshRateFilter from "./filters/RefreshRateFilter";
// import PriceFilter from "./filters/PriceFilter";
// import PromotionsFilter from "./filters/PromotionsFilter";
// import ScreenSizeFilter from "./filters/ScreenSizeFilter";
// import ResolutionFilter from "./filters/ResolutionFilter";

// const ProductFilter = () => {
//   const [priceRange, setPriceRange] = useState([0, 12500]);
//   const [expandedSections, setExpandedSections] =
//     useState<ExpandedSectionsType>({
//       price: true,
//       shipping: true,
//       delivery: true,
//       rating: true,
//       refreshRate: false,
//       screenSize: false,
//       resolution: false,
//       promotions: false,
//       availability: false,
//       brand: false,
//       sort: true,
//     });
//   // const { t } = useLanguage();
//   const { t } = useTranslation();

//   const toggleSection = (section: string) => {
//     setExpandedSections({
//       ...expandedSections,
//       [section]: !expandedSections[section as keyof typeof expandedSections],
//     });
//   };

//   return (
//     <div className="space-y-4">
//       <FilterSection
//         title={t("products.rating")}
//         section="rating"
//         isExpanded={expandedSections.rating}
//         toggleSection={toggleSection}
//       >
//         <RatingFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.sortBy")}
//         section="sort"
//         isExpanded={expandedSections.sort}
//         toggleSection={toggleSection}
//       >
//         <SortByFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.availability")}
//         section="availability"
//         isExpanded={expandedSections.availability}
//         toggleSection={toggleSection}
//       >
//         <AvailabilityFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.freeShipping")}
//         section="shipping"
//         isExpanded={expandedSections.shipping}
//         toggleSection={toggleSection}
//       >
//         <ShippingFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.deliveryDay")}
//         section="delivery"
//         isExpanded={expandedSections.delivery}
//         toggleSection={toggleSection}
//       >
//         <DeliveryFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.refreshRate")}
//         section="refreshRate"
//         isExpanded={expandedSections.refreshRate}
//         toggleSection={toggleSection}
//       >
//         <RefreshRateFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.price")}
//         section="price"
//         isExpanded={expandedSections.price}
//         toggleSection={toggleSection}
//       >
//         <PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.promotions")}
//         section="promotions"
//         isExpanded={expandedSections.promotions}
//         toggleSection={toggleSection}
//       >
//         <PromotionsFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.screenSize")}
//         section="screenSize"
//         isExpanded={expandedSections.screenSize}
//         toggleSection={toggleSection}
//       >
//         <ScreenSizeFilter />
//       </FilterSection>

//       <Separator className="bg-cebleu-purple-100/50" />

//       <FilterSection
//         title={t("products.resolution")}
//         section="resolution"
//         isExpanded={expandedSections.resolution}
//         toggleSection={toggleSection}
//       >
//         <ResolutionFilter />
//       </FilterSection>

//       <div className="mt-6">
//         <Button className="w-full bg-cebleu-purple-700 hover:bg-cebleu-purple-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-300">
//           {t("products.apply")}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default ProductFilter;
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import FilterSection from "./filters/FilterSection";
import RatingFilter from "./filters/RatingFilter";
import SortByFilter from "./filters/SortByFilter";
import AvailabilityFilter from "./filters/AvailabilityFilter";
import ShippingFilter from "./filters/ShippingFilter";
import DeliveryFilter from "./filters/DeliveryFilter";
import RefreshRateFilter from "./filters/RefreshRateFilter";
import PriceFilter from "./filters/PriceFilter";
import PromotionsFilter from "./filters/PromotionsFilter";
import ScreenSizeFilter from "./filters/ScreenSizeFilter";
import ResolutionFilter from "./filters/ResolutionFilter";
import { ExpandedSectionsType } from "./filters/types";

const ProductFilter = ({ filters, setFilters }: any) => {
  const [expandedSections, setExpandedSections] =
    useState<ExpandedSectionsType>({
      price: true,
      shipping: true,
      delivery: true,
      rating: true,
      refreshRate: false,
      screenSize: false,
      resolution: false,
      promotions: false,
      availability: false,
      brand: false,
      sort: true,
    });

  const { t } = useTranslation();

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    });
  };

  return (
    <div className="space-y-4">
      <FilterSection
        title={t("products.rating")}
        section="rating"
        isExpanded={expandedSections.rating}
        toggleSection={toggleSection}
      >
        <RatingFilter
          value={filters.rating}
          onChange={(value: number) =>
            setFilters({ ...filters, rating: value })
          }
        />
      </FilterSection>

      <Separator className="bg-cebleu-purple-100/50" />

      <FilterSection
        title={t("products.sortBy")}
        section="sort"
        isExpanded={expandedSections.sort}
        toggleSection={toggleSection}
      >
        <SortByFilter
          value={filters.sort}
          onChange={(value: string) => setFilters({ ...filters, sort: value })}
        />
      </FilterSection>

      <Separator className="bg-cebleu-purple-100/50" />

      <FilterSection
        title={t("products.availability")}
        section="availability"
        isExpanded={expandedSections.availability}
        toggleSection={toggleSection}
      >
        <AvailabilityFilter
          value={filters.availability}
          onChange={(value: string) =>
            setFilters({ ...filters, availability: value })
          }
        />
      </FilterSection>

      <Separator className="bg-cebleu-purple-100/50" />

      <FilterSection
        title={t("products.freeShipping")}
        section="shipping"
        isExpanded={expandedSections.shipping}
        toggleSection={toggleSection}
      >
        <ShippingFilter
          checked={filters.freeShipping}
          onChange={(checked: boolean) =>
            setFilters({ ...filters, freeShipping: checked })
          }
        />
      </FilterSection>

      <Separator className="bg-cebleu-purple-100/50" />

      <FilterSection
        title={t("products.price")}
        section="price"
        isExpanded={expandedSections.price}
        toggleSection={toggleSection}
      >
        <PriceFilter
          priceRange={[filters.minPrice || 0, filters.maxPrice || 12500]}
          setPriceRange={([min, max]: number[]) =>
            setFilters({ ...filters, minPrice: min, maxPrice: max })
          }
        />
      </FilterSection>

      <div className="mt-6">
        <Button
          className="w-full bg-cebleu-purple-700 hover:bg-cebleu-purple-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-300"
          onClick={() => {
            // refetch triggered automatically by query key change
          }}
        >
          {t("products.apply")}
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;
