import { useTranslation } from "react-i18next";
import { 
  Laptop, 
  Shirt, 
  Home, 
  Gamepad2, 
  Book, 
  Dumbbell, 
  Car, 
  Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface CategoryGridProps {
  categories?: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const { t } = useTranslation();

  // Default categories with icons
  const defaultCategories = [
    { id: "1", name: t("category.electronics"), slug: "electronics", icon: "laptop" },
    { id: "2", name: t("category.fashion"), slug: "fashion", icon: "shirt" },
    { id: "3", name: t("category.home"), slug: "home-garden", icon: "home" },
    { id: "4", name: t("category.gaming"), slug: "gaming", icon: "gamepad" },
    { id: "5", name: t("category.books"), slug: "books", icon: "book" },
    { id: "6", name: t("category.sports"), slug: "sports", icon: "dumbbell" },
    { id: "7", name: t("category.automotive"), slug: "automotive", icon: "car" },
    { id: "8", name: t("category.more"), slug: "more", icon: "plus" },
  ];

  // Transform API categories to match the expected format
  const transformedCategories = categories?.map((category: any) => ({
    id: category.id,
    name: category.translations?.en?.name || category.name || "Unnamed Category",
    slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-') || 'category',
    icon: category.icon || 'laptop' // Default to laptop icon if no icon specified
  }));

  const categoriesToShow = transformedCategories?.length ? transformedCategories : defaultCategories;

  const getIcon = (iconName: string) => {
    const iconClass = "text-primary-600";
    switch (iconName) {
      case "laptop":
        return <Laptop className={iconClass} />;
      case "shirt":
        return <Shirt className={iconClass} />;
      case "home":
        return <Home className={iconClass} />;
      case "gamepad":
        return <Gamepad2 className={iconClass} />;
      case "book":
        return <Book className={iconClass} />;
      case "dumbbell":
        return <Dumbbell className={iconClass} />;
      case "car":
        return <Car className={iconClass} />;
      case "plus":
        return <Plus className={iconClass} />;
      default:
        return <Laptop className={iconClass} />;
    }
  };

  const handleCategoryClick = (category: Category) => {
    // TODO: Navigate to category page or filter products
    console.log("Category clicked:", category.slug);
  };

  return (
    <section className="py-8 border-b">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900" data-testid="text-categories-title">
          {t("categories.title")}
        </h2>
        <Button 
          variant="ghost"
          className="text-primary-600 hover:text-primary-700 font-medium"
          data-testid="button-view-all-categories"
        >
          {t("categories.viewAll")}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categoriesToShow.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className="category-card flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
            data-testid={`card-category-${category.slug}`}
          >
            <div className="category-icon w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
              {getIcon(category.icon)}
            </div>
            <span 
              className="text-sm font-medium text-gray-700 text-center"
              data-testid={`text-category-name-${category.slug}`}
            >
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
