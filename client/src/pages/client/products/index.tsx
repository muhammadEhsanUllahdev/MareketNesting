import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  Star,
  Eye,
  ChevronDown,
} from "lucide-react";
import { ProductViewModal } from "@/components/modals/product-view-modal";

interface Product {
  id: string;
  sku: string;
  price: string;
  stock: number;
  status: "active" | "inactive";
  brand: string;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  translations?: {
    [key: string]: {
      name: string;
      description: string;
      highlights?: string;
    };
  };
}

interface Category {
  id: string;
  translations?: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", i18n.language],
    queryFn: async () => {
      const response = await fetch(`/api/products?language=${i18n.language}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", i18n.language],
    queryFn: async () => {
      const response = await fetch(`/api/categories?language=${i18n.language}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product: Product) => {
      const name = product.translations?.[i18n.language]?.name || 
                   product.translations?.en?.name || "Unnamed Product";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || 
                             product.category === selectedCategory;
      const isActive = product.status === "active";
      
      return matchesSearch && matchesCategory && isActive;
    });

    // Sort products
    filtered.sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "name":
          const nameA = a.translations?.[i18n.language]?.name || 
                       a.translations?.en?.name || "Unnamed Product";
          const nameB = b.translations?.[i18n.language]?.name || 
                       b.translations?.en?.name || "Unnamed Product";
          return nameA.localeCompare(nameB);
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, i18n.language]);

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

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-DZ' : 'en-US', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of stock</Badge>;
    } else if (stock <= 5) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        Only {stock} left in stock
      </Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">
        In stock
      </Badge>;
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
            <p className="text-gray-600">
              Discover our selection of products with customer reviews, questions and answers and detailed ratings.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for a product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48" data-testid="select-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.translations?.[i18n.language]?.name ||
                         category.translations?.en?.name ||
                         "Unnamed Category"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Name (A-Z)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => {
              const productName = product.translations?.[i18n.language]?.name ||
                                 product.translations?.en?.name ||
                                 "Unnamed Product";
              const productDescription = product.translations?.[i18n.language]?.description ||
                                        product.translations?.en?.description ||
                                        "";

              return (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="relative">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📦</div>
                            <span className="text-sm">No image</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.stock <= 5 && product.stock > 0 && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          {product.stock <= 3 ? "Few left" : "Low stock"}
                        </Badge>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-wishlist-${product.id}`}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    {/* Product Name and Brand */}
                    <div className="mb-2">
                      <h3 
                        className="font-medium text-gray-900 line-clamp-2 mb-1" 
                        data-testid={`text-product-name-${product.id}`}
                      >
                        {productName}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{product.brand}</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Serial No.: {product.sku}
                      </div>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-3">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {getStockBadge(product.stock)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        data-testid={`button-view-details-${product.id}`}
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={product.stock === 0}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Product View Modal */}
      <ProductViewModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={handleCloseModal}
        categories={categories}
        showActions={true}
      />
    </div>
  );
}