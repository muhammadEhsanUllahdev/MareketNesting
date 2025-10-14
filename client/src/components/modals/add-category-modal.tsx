import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { initDatabase } from "server/dbInit";
import { IconPicker } from "./AutoFillSearch/autofillsearch";

const featureSchema = z.object({
  name: z.string().min(1, "Feature name is required"),
  type: z.enum([
    "text",
    "number",
    "boolean",
    "select",
    "multiselect",
    "color",
    "url",
  ]),
  value: z.string().optional(),
  isRequired: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
});

const categoryFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["standard", "super"]),
  parentId: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  icon: z.string().default("package"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  metadata: z.record(z.any()).default({}),
  // Multilingual fields
  nameFr: z.string().min(1, "French name is required"),
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  // SEO fields
  seoTitleFr: z.string().optional(),
  seoTitleEn: z.string().optional(),
  seoTitleAr: z.string().optional(),
  seoDescriptionFr: z.string().optional(),
  seoDescriptionEn: z.string().optional(),
  seoDescriptionAr: z.string().optional(),
  seoKeywordsFr: z.string().optional(),
  seoKeywordsEn: z.string().optional(),
  seoKeywordsAr: z.string().optional(),
  // Features
  features: z.array(featureSchema).default([]),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  initialData?: any;
  isEditMode?: boolean;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
}: AddCategoryModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Prepare default values based on edit mode
  const getDefaultValues = () => {
    if (isEditMode && initialData) {
      const frTranslation =
        initialData.translations?.find((t: any) => t.language === "fr") || {};
      const enTranslation =
        initialData.translations?.find((t: any) => t.language === "en") || {};
      const arTranslation =
        initialData.translations?.find((t: any) => t.language === "ar") || {};

      return {
        type: initialData.type || "standard",
        parentId: initialData.parentId || "",
        slug: initialData.slug || "",
        icon: initialData.icon || "package",
        imageUrl: initialData.imageUrl || "",
        isFeatured: initialData.isFeatured || false,
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
        sortOrder: initialData.sortOrder || 0,
        metadata: initialData.metadata || {},
        nameFr: frTranslation.name || "",
        nameEn: enTranslation.name || "",
        nameAr: arTranslation.name || "",
        descriptionFr: frTranslation.description || "",
        descriptionEn: enTranslation.description || "",
        descriptionAr: arTranslation.description || "",
        seoTitleFr: frTranslation.seoTitle || "",
        seoTitleEn: enTranslation.seoTitle || "",
        seoTitleAr: arTranslation.seoTitle || "",
        seoDescriptionFr: frTranslation.seoDescription || "",
        seoDescriptionEn: enTranslation.seoDescription || "",
        seoDescriptionAr: arTranslation.seoDescription || "",
        seoKeywordsFr: frTranslation.seoKeywords || "",
        seoKeywordsEn: enTranslation.seoKeywords || "",
        seoKeywordsAr: arTranslation.seoKeywords || "",
        features: initialData.features || [],
      };
    }

    return {
      type: "standard",
      parentId: "",
      slug: "",
      icon: "package",
      imageUrl: "",
      isFeatured: false,
      isActive: true,
      sortOrder: 0,
      metadata: {},
      nameFr: "",
      nameEn: "",
      nameAr: "",
      descriptionFr: "",
      descriptionEn: "",
      descriptionAr: "",
      seoTitleFr: "",
      seoTitleEn: "",
      seoTitleAr: "",
      seoDescriptionFr: "",
      seoDescriptionEn: "",
      seoDescriptionAr: "",
      seoKeywordsFr: "",
      seoKeywordsEn: "",
      seoKeywordsAr: "",
      features: [],
    };
  };

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const watchedType = form.watch("type");

  // Reset form when modal opens with initial data
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, initialData, form]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData & { id?: string }) => {
      console.log("🚀 Form Data Received:", data);

      const categoryData = {
        type: data.type,
        parentId:
          data.parentId && data.parentId !== "none" ? data.parentId : undefined,
        slug: data.slug,
        icon: data.icon,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        metadata: data.metadata,
        translations: [
          {
            language: "fr",
            name: data.nameFr,
            description: data.descriptionFr,
            seoTitle: data.seoTitleFr,
            seoDescription: data.seoDescriptionFr,
            seoKeywords: data.seoKeywordsFr,
          },
          {
            language: "en",
            name: data.nameEn,
            description: data.descriptionEn,
            seoTitle: data.seoTitleEn,
            seoDescription: data.seoDescriptionEn,
            seoKeywords: data.seoKeywordsEn,
          },
          {
            language: "ar",
            name: data.nameAr,
            description: data.descriptionAr,
            seoTitle: data.seoTitleAr,
            seoDescription: data.seoDescriptionAr,
            seoKeywords: data.seoKeywordsAr,
          },
        ].filter((t) => t.name), // Only include translations with names
        features: data.features,
      };

      console.log("📦 Category Data Prepared:", categoryData);
      console.log("🌐 API Request Details:", {
        method: data.id ? "PUT" : "POST",
        url: `/api/admin/categories${data.id ? `/${data.id}` : ""}`,
        payload: categoryData,
      });

      try {
        const response = await apiRequest(
          data.id ? "PUT" : "POST",
          `/api/admin/categories${data.id ? `/${data.id}` : ""}`,
          categoryData
        );
        console.log("✅ API Response:", response);
        const result = await response.json();
        console.log("📄 API Result:", result);
        return result;
      } catch (error) {
        console.error("❌ API Request Failed:", error);
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (variables.id) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      form.reset(getDefaultValues());
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset(getDefaultValues());
    setActiveTab("general");
    onClose();
  };

  const handleSubmit = (data: CategoryFormData) => {
    console.log("🎯 Form Submitted with data:", data);
    console.log("📝 Form validation errors:", form.formState.errors);
    console.log("🔄 Initial data:", initialData);

    if (initialData?.id) {
      console.log("📝 Updating existing category with ID:", initialData.id);
      // Update existing category
      createCategoryMutation.mutate({ ...data, id: initialData.id });
    } else {
      console.log("➕ Creating new category");
      // Create new category
      createCategoryMutation.mutate(data);
    }
  };

  const addFeature = () => {
    appendFeature({
      name: "",
      type: "text",
      isRequired: false,
      options: [],
      sortOrder: featureFields.length,
    });
  };

  // Fetch categories for parent selection
  const { data: allCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/categories"],
    enabled: isOpen,
  });

  // Get current language from useTranslation
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  // Format categories for parent selection (only show standard categories and supercategories)
  const parentCategories = allCategories.map((category: any) => ({
    id: category.id,
    name:
      category.translations?.find((t: any) => t.language === i18n.language)
        ?.name ||
      category.translations?.find((t: any) => t.language === "en")?.name ||
      "Unnamed Category",
  }));

  // Debug function to fill form with test data
  const fillTestData = () => {
    console.log("🧪 Filling form with test data");
    form.setValue("type", "standard");
    form.setValue("slug", "test-category-" + Date.now());
    form.setValue("nameFr", "Catégorie Test");
    form.setValue("nameEn", "Test Category");
    form.setValue("nameAr", "فئة اختبار");
    form.setValue("descriptionFr", "Description de test en français");
    form.setValue("descriptionEn", "Test description in English");
    form.setValue("descriptionAr", "وصف الاختبار بالعربية");
    form.setValue("icon", "package");
    form.setValue("imageUrl", "");
    form.setValue("isFeatured", false);
    form.setValue("isActive", true);
    form.setValue("sortOrder", 0);
    form.setValue("parentId", "none");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="add-category-description"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditMode
                ? t("categories.editCategory")
                : t("categories.addCategory")}
            </DialogTitle>
            {/* {!isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={fillTestData}
                className="h-8 text-xs"
                type="button"
              >
                🧪 Fill Test Data
              </Button>
            )} */}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Category Type Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("categories.type")}</h3>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem
                            value="standard"
                            id="standard"
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <label
                              htmlFor="standard"
                              className="font-medium cursor-pointer"
                            >
                              {t("categories.type.standard")}
                            </label>
                            <p className="text-sm text-gray-600">
                              {t("categories.type.standardDesc")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem
                            value="super"
                            id="super"
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <label
                              htmlFor="super"
                              className="font-medium cursor-pointer flex items-center gap-2"
                            >
                              {t("categories.type.super")}
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                                {" "}
                                {t("badge.new")}{" "}
                              </span>
                            </label>
                            <p className="text-sm text-gray-600">
                              {t("categories.type.superDesc")}
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-sm text-gray-600 mt-2">
                {t("categories.type.superNote")}
              </div>
            </div>

            {/* Parent Category Selection - Only show for standard categories */}
            {form.watch("type") === "standard" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("categories.parent")}
                </h3>
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-parent-category">
                            <SelectValue
                              placeholder={t("categories.noparent")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            {t("categories.noparent")}
                          </SelectItem>
                          {parentCategories.map((parent: any) => (
                            <SelectItem key={parent.id} value={parent.id}>
                              {parent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-gray-600">
                  {t("categories.parent.select")}
                </div>
              </div>
            )}

            {/* Tabs for different sections */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">
                  {t("categories.tabs.general")}
                </TabsTrigger>
                <TabsTrigger value="features">
                  {t("categories.tabs.features")}
                </TabsTrigger>
                <TabsTrigger value="seo">
                  {t("categories.tabs.seo")}
                </TabsTrigger>
              </TabsList>

              {/* General Information Tab */}
              <TabsContent value="general" className="space-y-6 mt-6">
                {/* Slug Field */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("categories.slug")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("categories.slug.placeholder")}
                          {...field}
                          data-testid="input-slug"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Multilingual Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nameFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name (French)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nom de la catégorie"
                            {...field}
                            data-testid="input-name-fr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name (English)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Category Name"
                            {...field}
                            data-testid="input-name-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name (Arabic)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="اسم الفئة"
                            {...field}
                            data-testid="input-name-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Multilingual Description Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="descriptionFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (French)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description de la catégorie"
                            {...field}
                            data-testid="input-description-fr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Category description"
                            {...field}
                            data-testid="input-description-en"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف الفئة"
                            {...field}
                            data-testid="input-description-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Icon and Image URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("categories.icon")}</FormLabel>
                        <FormControl>
                          <IconPicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("categories.image")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("categories.image.placeholder")}
                            {...field}
                            data-testid="input-image-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Switches */}
                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {t("categories.featuredCategory")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {t("categories.active")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Features Tab */}

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {t("categories.features.title")}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="flex items-center gap-2"
                    data-testid="button-add-feature"
                  >
                    <Plus className="h-4 w-4" />
                    {t("categories.features.add")}
                  </Button>
                </div>

                {featureFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t("categories.features.emptyTitle")}</p>
                    <p className="text-sm">
                      {t("categories.features.emptyDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featureFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700">
                            {t("categories.features.feature")} #{index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700"
                            data-testid={`button-remove-feature-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`features.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("categories.features.name")}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("categories.features.name")}
                                    {...field}
                                    data-testid={`input-feature-name-${index}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`features.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {t("categories.features.type")}
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      data-testid={`select-feature-type-${index}`}
                                    >
                                      <SelectValue
                                        placeholder={t(
                                          "categories.features.selectType"
                                        )}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="text">
                                      {t("categories.features.types.text")}
                                    </SelectItem>
                                    <SelectItem value="number">
                                      {t("categories.features.types.number")}
                                    </SelectItem>
                                    <SelectItem value="boolean">
                                      {t("categories.features.types.boolean")}
                                    </SelectItem>
                                    <SelectItem value="select">
                                      {t("categories.features.types.select")}
                                    </SelectItem>
                                    <SelectItem value="multiselect">
                                      {t(
                                        "categories.features.types.multiselect"
                                      )}
                                    </SelectItem>
                                    <SelectItem value="color">
                                      {t("categories.features.types.color")}
                                    </SelectItem>
                                    <SelectItem value="url">
                                      {t("categories.features.types.url")}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`features.${index}.isRequired`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid={`switch-feature-required-${index}`}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {t("categories.features.mandatory")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* <TabsContent value="features" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Product Features</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="flex items-center gap-2"
                    data-testid="button-add-feature"
                  >
                    <Plus className="h-4 w-4" />
                    Add a feature
                  </Button>
                </div>

                {featureFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No features added yet</p>
                    <p className="text-sm">Click "Add a feature" to start</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featureFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700">
                            Feature #{index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700"
                            data-testid={`button-remove-feature-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`features.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Color, Size, Material"
                                    {...field}
                                    data-testid={`input-feature-name-${index}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`features.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      data-testid={`select-feature-type-${index}`}
                                    >
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">
                                      Number
                                    </SelectItem>
                                    <SelectItem value="boolean">
                                      Boolean
                                    </SelectItem>
                                    <SelectItem value="select">
                                      Select
                                    </SelectItem>
                                    <SelectItem value="multiselect">
                                      Multi-select
                                    </SelectItem>
                                    <SelectItem value="color">Color</SelectItem>
                                    <SelectItem value="url">URL</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`features.${index}.value`}
                            render={({ field }) => {
                              const featureType = form.watch(
                                `features.${index}.type`,
                              );

                              return (
                                <FormItem>
                                  <FormLabel>Value</FormLabel>
                                  <FormControl>
                                    {featureType === "number" ? (
                                      <Input
                                        type="number"
                                        placeholder="Ex: 100, 25.5"
                                        {...field}
                                        data-testid={`input-feature-value-${index}`}
                                      />
                                    ) : featureType === "boolean" ? (
                                      <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <SelectTrigger
                                          data-testid={`select-feature-value-${index}`}
                                        >
                                          <SelectValue placeholder="Select true or false" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="true">
                                            True
                                          </SelectItem>
                                          <SelectItem value="false">
                                            False
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : featureType === "color" ? (
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          {...field}
                                          className="w-16 h-8 p-1 border rounded"
                                          data-testid={`input-feature-color-${index}`}
                                        />
                                        <Input
                                          type="text"
                                          placeholder="Ex: #FF0000 or Red"
                                          {...field}
                                          data-testid={`input-feature-value-${index}`}
                                        />
                                      </div>
                                    ) : featureType === "url" ? (
                                      <Input
                                        type="url"
                                        placeholder="Ex: https://example.com"
                                        {...field}
                                        data-testid={`input-feature-value-${index}`}
                                      />
                                    ) : featureType === "select" ||
                                      featureType === "multiselect" ? (
                                      <Input
                                        placeholder="Ex: Small, Medium, Large (comma separated)"
                                        {...field}
                                        data-testid={`input-feature-value-${index}`}
                                      />
                                    ) : (
                                      <Input
                                        type="text"
                                        placeholder="Ex: Red, Large, Cotton"
                                        {...field}
                                        data-testid={`input-feature-value-${index}`}
                                      />
                                    )}
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`features.${index}.isRequired`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid={`switch-feature-required-${index}`}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Mandatory
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent> */}

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-6 mt-6">
                {/* SEO Title */}
                {/* <div>
                  {" "}
                  <h3 className="text-lg font-medium mb-4">
                    {t("seo.title")}
                  </h3>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {" "}
                    <FormField
                      control={form.control}
                      name="seoTitleFr"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.title.fr")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Input
                              placeholder={t("seo.title.fr.placeholder")}
                              {...field}
                              data-testid="input-seo-title-fr"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                    <FormField
                      control={form.control}
                      name="seoTitleEn"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.title.en")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Input
                              placeholder={t("seo.title.en.placeholder")}
                              {...field}
                              data-testid="input-seo-title-en"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                    <FormField
                      control={form.control}
                      name="seoTitleAr"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.title.ar")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Input
                              placeholder={t("seo.title.ar.placeholder")}
                              {...field}
                              data-testid="input-seo-title-ar"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                  </div>{" "}
                </div> */}

                <div>
                  <h3 className="text-lg font-medium mb-4">SEO Title</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="seoTitleFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title (French)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO title in French"
                              {...field}
                              data-testid="input-seo-title-fr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoTitleEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title (English)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO title in English"
                              {...field}
                              data-testid="input-seo-title-en"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoTitleAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title (Arabic)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO Title in Arabic"
                              {...field}
                              data-testid="input-seo-title-ar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SEO Description */}
                {/* <div>
                  {" "}
                  <h3 className="text-lg font-medium mb-4">
                    {t("seo.description")}
                  </h3>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {" "}
                    <FormField
                      control={form.control}
                      name="seoDescriptionFr"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.description.fr")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Textarea
                              placeholder={t("seo.description.fr.placeholder")}
                              {...field}
                              data-testid="input-seo-description-fr"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                    <FormField
                      control={form.control}
                      name="seoDescriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.description.en")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Textarea
                              placeholder={t("seo.description.en.placeholder")}
                              {...field}
                              data-testid="input-seo-description-en"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                    <FormField
                      control={form.control}
                      name="seoDescriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.description.ar")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Textarea
                              placeholder={t("seo.description.ar.placeholder")}
                              {...field}
                              data-testid="input-seo-description-ar"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                  </div>{" "}
                </div> */}

                <div>
                  <h3 className="text-lg font-medium mb-4">SEO Description</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="seoDescriptionFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description (French)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="SEO description in French"
                              {...field}
                              data-testid="input-seo-description-fr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoDescriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description (English)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="SEO description in English"
                              {...field}
                              data-testid="input-seo-description-en"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoDescriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description SEO (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="SEO Description in Arabic"
                              {...field}
                              data-testid="input-seo-description-ar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SEO Keywords */}

                {/* <div>
                  {" "}
                  <h3 className="text-lg font-medium mb-4">
                    {t("seo.keywords")}
                  </h3>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {" "}
                    <FormField
                      control={form.control}
                      name="seoKeywordsFr"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.keywords.fr")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Input
                              placeholder={t("seo.keywords.fr.placeholder")}
                              {...field}
                              data-testid="input-seo-keywords-fr"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                    <FormField
                      control={form.control}
                      name="seoKeywordsEn"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.keywords.en")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Input
                              placeholder={t("seo.keywords.en.placeholder")}
                              {...field}
                              data-testid="input-seo-keywords-en"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                    <FormField
                      control={form.control}
                      name="seoKeywordsAr"
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel>{t("seo.keywords.ar")}</FormLabel>{" "}
                          <FormControl>
                            {" "}
                            <Input
                              placeholder={t("seo.keywords.ar.placeholder")}
                              {...field}
                              data-testid="input-seo-keywords-ar"
                            />{" "}
                          </FormControl>{" "}
                          <FormMessage />{" "}
                        </FormItem>
                      )}
                    />{" "}
                  </div>{" "}
                </div> */}
                <div>
                  <h3 className="text-lg font-medium mb-4">SEO Keywords</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="seoKeywordsFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords (French)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="mot-clé1, mot-clé2, mot-clé3"
                              {...field}
                              data-testid="input-seo-keywords-fr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoKeywordsEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords (English)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="keyword1, keyword2, keyword3"
                              {...field}
                              data-testid="input-seo-keywords-en"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoKeywordsAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords (Arabic)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Key word 1, Key word 2"
                              {...field}
                              data-testid="input-seo-keywords-ar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createCategoryMutation.isPending}
                data-testid="button-cancel"
              >
                {t("categories.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createCategoryMutation.isPending}
                data-testid="button-submit"
              >
                {createCategoryMutation.isPending
                  ? isEditMode
                    ? t("categories.updating")
                    : t("categories.creating")
                  : isEditMode
                  ? t("categories.update")
                  : t("categories.created")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
