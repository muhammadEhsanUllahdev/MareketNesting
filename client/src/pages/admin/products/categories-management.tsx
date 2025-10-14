import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  X,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AddCategoryModal } from "@/components/modals/add-category-modal";
import { AddSupercategoryModal } from "@/components/modals/add-supercategory-modal";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { categories as dummycats }  from "@/data/categories-data"; // Import sample categories
import { useEffect } from "react";
// Category interface based on the existing schema
interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  subcategoryCount: number;
}

async function seedCategories() {
  console.log(`🚀 Starting category seeding for ${dummycats.length} categories...`);

  for (let i = 0; i < dummycats.length; i++) {
    const category = dummycats[i];
    try {
      console.log(`📦 [${i + 1}/${dummycats.length}] Sending: ${category.translations[1].name}`);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed: ${category.slug}`, errorText);
      } else {
        console.log(`✅ Success: ${category.slug}`);
      }
    } catch (error) {
      console.error(`⚠️ Error sending ${category.slug}:`, error);
    }

    await new Promise((res) => setTimeout(res, 1000)); // 1s delay
  }

  console.log("🎉 All categories processed!");
}

export default function CategoriesManagement() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All categories");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupercategoryModal, setShowSupercategoryModal] = useState(false);
  const [showCategoryDetailModal, setShowCategoryDetailModal] = useState(false);
  const [selectedCategoryForView, setSelectedCategoryForView] =
    useState<Category | null>(null);
 const [seeded, setSeeded] = useState(false);
  // Edit category modal states
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] =
    useState<any>(null);

  // Edit supercategory modal states
  const [showEditSupercategoryModal, setShowEditSupercategoryModal] =
    useState(false);
  const [selectedSupercategoryForEdit, setSelectedSupercategoryForEdit] =
    useState<any>(null);

  // Delete category modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategoryForDelete, setSelectedCategoryForDelete] =
    useState<any>(null);

  // Fetch categories data from API
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  // Fetch supercategories data for the table
  const { data: supercategories = [], isLoading: isLoadingSupercategories } =
    useQuery({
      queryKey: ["/api/admin/supercategories"],
    });
  // useEffect(() => {
  //   // Run only once on first load
  //   if (!seeded) {
  //     seedCategories();
  //     setSeeded(true);
  //   }
  // }, [seeded]);
  // Filter categories with proper null/undefined checks
  // const filteredCategories = categories.filter((category) => {
  //   if (!category || !searchQuery) return true;

  //   // Handle category name from translations or direct name property
  //   const categoryName =
  //     category.translations?.[0]?.name || category.name || "";
  //   const categoryDescription =
  //     category.translations?.[0]?.description || category.description || "";

  //   return (
  //     categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     categoryDescription.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  // });

  const filteredCategories = categories.filter((category) => {
    if (!category) return false;

    // Search filter
    const categoryName =
      category.translations?.[0]?.name || category.name || "";
    const categoryDescription =
      category.translations?.[0]?.description || category.description || "";

    const matchesSearch =
      !searchQuery ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryDescription.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    if (selectedFilter === "Featured") {
      return matchesSearch && category.isFeatured;
    }

    if (selectedFilter === "Super Categories") {
      return matchesSearch && category.type === "super";
    }

    // Default: All categories
    return matchesSearch;
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/categories/${id}`
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setShowDeleteModal(false);
      setSelectedCategoryForDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // Delete supercategory mutation (separate from regular categories)
  const deleteSupercategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/categories/${id}`
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Supercategory deleted successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/supercategories"],
      });
      setShowDeleteModal(false);
      setSelectedCategoryForDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete supercategory",
        variant: "destructive",
      });
    },
  });

  const handleCategoryDelete = async (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
  };

  const handleSupercategoryDelete = async (supercategoryId: string) => {
    deleteSupercategoryMutation.mutate(supercategoryId);
  };

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setShowCategoryModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCategorySubmit = (data: any) => {
    createCategoryMutation.mutate(data);
  };

  // Create supercategory mutation
  const createSupercategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/supercategories", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/supercategories"],
      });
      toast({
        title: "Success",
        description: "Supercategory created successfully",
      });
      setShowSupercategoryModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create supercategory",
        variant: "destructive",
      });
    },
  });

  // Update supercategory mutation
  const updateSupercategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/categories/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/supercategories"],
      });
      toast({
        title: "Success",
        description: "Supercategory updated successfully",
      });
      setShowEditSupercategoryModal(false);
      setSelectedSupercategoryForEdit(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update supercategory",
        variant: "destructive",
      });
    },
  });

  const handleSupercategorySubmit = (data: any) => {
    if (selectedSupercategoryForEdit) {
      // Update existing supercategory
      updateSupercategoryMutation.mutate({
        id: selectedSupercategoryForEdit.id,
        data,
      });
    } else {
      // Create new supercategory
      createSupercategoryMutation.mutate(data);
    }
  };

  function getTranslatedField(category: any, field: string, language: string) {
    const translation = category.translations.find(
      (tr: any) => tr.language === language
    );
    return translation?.[field] || category[field] || "";
  }

  return (
    <DashboardLayout
      title={t("categories.heading")}
      subtitle={t("categories.subheading")}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowCategoryModal(true)}
              data-testid="button-add-category"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("categories.add")}
            </Button>
            <Button
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
              onClick={() => setShowSupercategoryModal(true)}
              data-testid="button-add-supercategory"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("categories.addSuper")}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("categories.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-categories"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b">
          <Button
            variant={selectedFilter === "All categories" ? "default" : "ghost"}
            className={`rounded-5 border-b-2 ${
              selectedFilter === "All categories"
                ? "border-gray-100"
                : "border-transparent"
            }`}
            onClick={() => setSelectedFilter("All categories")}
            data-testid="tab-all-categories"
          >
            {t("categories.all")}
          </Button>

          <Button
            variant={selectedFilter === "Featured" ? "default" : "ghost"}
            className={`rounded-5 border-b-2 ${
              selectedFilter === "Featured"
                ? "border-blue-500"
                : "border-transparent"
            }`}
            onClick={() => setSelectedFilter("Featured")}
            data-testid="tab-featured"
          >
            {t("categories.features")}
          </Button>
          <Button
            variant={
              selectedFilter === "Super Categories" ? "default" : "ghost"
            }
            className={`rounded-5 border-b-2 ${
              selectedFilter === "Super Categories"
                ? "border-blue-500"
                : "border-transparent"
            }`}
            onClick={() => setSelectedFilter("Super Categories")}
            data-testid="tab-super-categories"
          >
            {t("categories.super")}
          </Button>
        </div>

        {/* Category Cards Grid */}
        {isLoading ? (
          <div className="text-center py-12" data-testid="loading-state">
            <div className="text-lg text-gray-600">Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-state">
            <div className="text-lg text-gray-600 mb-2">
               <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {t("categories.notfound")}
            </div>
            {/* <div className="text-sm text-gray-500">
              {categories.length === 0
                ? "Get started by creating your first category"
                : "No categories match your search criteria"}
            </div> */}
            <div className="text-sm text-gray-500">
              {categories.length === 0
                ? t("categories.createdesc")
                : t("categories.noMatch")}
            </div>
            {/* {categories.length === 0 && (
              <Button
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowCategoryModal(true)}
                data-testid="button-create-first-category"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("categories.createfirstcate")}
              </Button>
            )} */}
          </div>
        ) : selectedFilter === "Featured" && filteredCategories.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-featured-state">
            <div className="text-lg text-gray-600 mb-2">
              No featured categories available
            </div>
            <div className="text-sm text-gray-500">
              Mark some categories as featured to see them here.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredCategories.map((category: any) => {
              // Get category name from translations or fallback
              const categoryName = getTranslatedField(
                category,
                "name",
                i18n.language
              );
              const categoryDescription = getTranslatedField(
                category,
                "description",
                i18n.language
              );
              const imageUrl =
                category.imageUrl ||
                "https://media.istockphoto.com/id/1359362604/vector/woman-filling-form.jpg?s=2048x2048&w=is&k=20&c=8x1JF6peIwRG3aIouflvEt23aZH5pO5apsIGwm3Eqlw=";

              return (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`card-category-${category.id}`}
                >
                  <CardHeader className="p-0">
                    <div className="relative h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={categoryName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Error loading image:");
                        }}
                      />
                      {category.isFeatured && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                            {t("categories.featured")}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-sm font-medium mb-2">
                      {categoryName}
                    </CardTitle>
                    {categoryDescription && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {categoryDescription}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        {/* {t("categories.products", {
                          count: category.productCount || 0,
                        })} */}
                        {category.productCount > 0 && (
                          <span>
                            {category.productCount} {t("categories.products")}
                          </span>
                        )}
                      </div>
                      <div>
                        {/* {t("categories.subcategories", {
                          count: category.subcategoryCount || 0,
                        })} */}
                        {category.subcategoryCount > 0 && (
                          <span>
                            {category.subcategoryCount}{" "}
                            {t("categories.subcategories")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            category.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></span>
                        {category.isActive
                          ? t("categories.active")
                          : t("categories.inactive")}
                      </div>
                    </div>
                    <div className="flex items-center mt-3 ">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-xs p-1 h-auto focus:bg-gray-200 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedCategoryForView(category);
                          setShowCategoryDetailModal(true);
                        }}
                        data-testid={`button-view-category-${category.id}`}
                      >
                        <Eye className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500"></span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-xs p-1 h-auto focus:bg-gray-200 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedCategoryForEdit(category);
                          setShowEditCategoryModal(true);
                        }}
                        data-testid={`button-edit-category-${category.id}`}
                      >
                        <Edit className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500"></span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-xs p-1 h-auto focus:bg-gray-200 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedCategoryForDelete(category);
                          setShowDeleteModal(true);
                        }}
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                        <span className="text-red-500"></span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Structure of Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("categories.structure")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("categories.name")}</TableHead>
                  <TableHead>{t("categories.description")}</TableHead>
                  <TableHead>{t("categories.products")}</TableHead>
                  <TableHead>{t("categories.subcategories")}</TableHead>
                  <TableHead>{t("categories.features")}</TableHead>
                  <TableHead className="w-[100px]">
                    {t("categories.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSupercategories ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {t("categories.loadingSuper")}
                    </TableCell>
                  </TableRow>
                ) : supercategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-lg text-gray-600 mb-2">
                        <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        {t("categories.noSuperFound")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("categories.createFirst")}
                      </div>
                      {/* <Button
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                        onClick={() => setShowSupercategoryModal(true)}
                        data-testid="button-create-first-supercategory"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("categories.createBtn")}
                      </Button> */}
                    </TableCell>
                  </TableRow>
                ) : (
                  supercategories.map((supercategory: any) => {
                    const name = getTranslatedField(
                      supercategory,
                      "name",
                      i18n.language
                    );
                    const description = getTranslatedField(
                      supercategory,
                      "description",
                      i18n.language
                    );
                    const childrenCount = supercategory.children?.length || 0;
                    const enabledFeatures =
                      supercategory.metadata?.enabledFeatures || [];

                    return (
                      <TableRow
                        key={supercategory.id}
                        data-testid={`row-supercategory-${supercategory.id}`}
                      >
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <span
                            className="text-sm text-gray-600"
                            title={description}
                          >
                            {description || t("categories.noDescription")}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {t("categories.productsCount", { count: 0 })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <div className="flex flex-wrap gap-1">
                            {childrenCount > 0 ? (
                              supercategory.children
                                .slice(0, 2)
                                .map((child: any, index: number) => (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                                  >
                                    {child.translations?.[0]?.name ||
                                      t("categories.unnamed")}
                                  </span>
                                ))
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {t("categories.noSubcategories")}
                              </span>
                            )}
                            {childrenCount > 2 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {t("categories.more", {
                                  count: childrenCount - 2,
                                })}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[150px]">
                          {enabledFeatures.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {enabledFeatures.map(
                                (feature: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs"
                                    title={feature}
                                  >
                                    {feature}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span>{t("categories.noFeatures")}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedSupercategoryForEdit(supercategory);
                                setShowEditSupercategoryModal(true);
                              }}
                              data-testid={`button-edit-supercategory-${supercategory.id}`}
                            >
                              <Edit className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedCategoryForDelete(supercategory);
                                setShowDeleteModal(true);
                              }}
                              data-testid={`button-delete-supercategory-${supercategory.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedCategoryForView(supercategory);
                                setShowCategoryDetailModal(true);
                              }}
                              data-testid={`button-view-supercategory-${supercategory.id}`}
                            >
                              <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modals */}
        <AddCategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={handleCategorySubmit}
        />
        <AddSupercategoryModal
          isOpen={showSupercategoryModal}
          onClose={() => setShowSupercategoryModal(false)}
          onSubmit={handleSupercategorySubmit}
        />
        <AddSupercategoryModal
          isOpen={showEditSupercategoryModal}
          onClose={() => {
            setShowEditSupercategoryModal(false);
            setSelectedSupercategoryForEdit(null);
          }}
          onSubmit={handleSupercategorySubmit}
          initialData={selectedSupercategoryForEdit}
          isEdit={true}
        />

        {/* Category Detail Modal */}
        {selectedCategoryForView && (
          <CategoryDetailModal
            isOpen={showCategoryDetailModal}
            onClose={() => {
              setShowCategoryDetailModal(false);
              setSelectedCategoryForView(null);
            }}
            category={selectedCategoryForView}
          />
        )}

        {/* Edit Category Modal */}
        {selectedCategoryForEdit && (
          <AddCategoryModal
            isOpen={showEditCategoryModal}
            onClose={() => {
              setShowEditCategoryModal(false);
              setSelectedCategoryForEdit(null);
            }}
            onSubmit={handleCategorySubmit}
            initialData={selectedCategoryForEdit}
            isEditMode={true}
          />
        )}

        {/* Delete Confirmation Modal */}
        {selectedCategoryForDelete && (
          <DeleteCategoryModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCategoryForDelete(null);
            }}
            category={selectedCategoryForDelete}
            onConfirm={() => {
              // Use appropriate delete handler based on category type
              if (selectedCategoryForDelete.type === "super") {
                handleSupercategoryDelete(selectedCategoryForDelete.id);
                console.log(
                  "Delete supercategory:",
                  selectedCategoryForDelete.id
                );
              } else {
                handleCategoryDelete(selectedCategoryForDelete.id);
                console.log("Delete category:", selectedCategoryForDelete.id);
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Category Detail Modal Component
function CategoryDetailModal({
  isOpen,
  onClose,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: any;
}) {
  if (!category) return null;

  // Get category data with fallbacks
  const { t, i18n } = useTranslation();
  function getTranslatedField(category: any, field: string, language: string) {
    const translation = category.translations.find(
      (tr: any) => tr.language === language
    );
    return translation?.[field] || category[field] || "";
  }
  const categoryName = getTranslatedField(category, "name", i18n.language);
  const categoryDescription = getTranslatedField(
    category,
    "description",
    i18n.language
  );
  const imageUrl = category.imageUrl || "/api/placeholder/800/400";
  // Sample subcategories data
  const subcategories = [
    { name: "Téléphones", count: 68 },
    { name: "Ordinateurs", count: 45 },
    { name: "Accessoires", count: 43 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="category-detail-description"
      >
        <DialogHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {categoryName}
              </h2>
              <div className="text-sm text-gray-500">
                Type: {category.type || "Standard"}
              </div>
              {category.isFeatured && (
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                  {t("categories.featured")}
                </div>
              )}
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Header Image */}
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={categoryName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/api/placeholder/800/400";
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold">{categoryName}</h3>
                <p className="text-lg opacity-90">{categoryDescription}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {category.productCount || 0}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded"></div>
                </div>
                {t("categories.products")}
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {category.subcategoryCount || 0}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                {t("categories.subcategories")}
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm font-medium text-purple-600 mb-2">
                {t("categories.status")}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    category.isActive ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded ${
                      category.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                </div>
                {category.isActive
                  ? t("categories.active")
                  : t("categories.inactive")}
              </div>
            </div>
          </div>

          {/* Features */}
          {category.features && category.features.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {t("categories.features")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {category.features.map((feature: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{feature.name}</span>
                      <span className="text-xs text-gray-500">
                        {feature.type}
                      </span>
                    </div>
                    {feature.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {feature.description}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Category Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">{t("categories.info")}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">
                    {t("categories.type")}:
                  </span>
                  <span className="ml-2 text-sm font-medium">
                    {category.type || t("categories.standard")}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {t("categories.status")}:
                  </span>
                  <span className="ml-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive
                        ? t("categories.active")
                        : t("categories.inactive")}
                    </span>
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">
                    {t("categories.slug")}:
                  </span>
                  <span className="ml-2 text-sm font-medium">
                    {category.slug || t("categories.noSlug")}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {t("categories.featured")}:
                  </span>
                  <span className="ml-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        category.isFeatured
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {category.isFeatured ? t("common.yes") : t("common.no")}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">{t("categories.description")}:</h4>
            <p className="text-sm text-gray-600">{categoryDescription}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Delete Category Confirmation Modal Component
function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: any;
  onConfirm: () => void;
}) {
  if (!category) return null;
  const { t, i18n } = useTranslation();
  const categoryName =
    category.translations?.[0]?.name || category.name || "Unnamed Category";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t("categories.deleteTitle")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("categories.deleteSubtitle")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            {t("categories.deleteConfirm", { name: categoryName })}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-amber-400 rounded-full flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <strong>{t("common.warning")}:</strong>{" "}
                {t("categories.deleteWarning")}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel-delete"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            data-testid="button-confirm-delete"
          >
            {t("categories.deleteTitle")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
