import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { TemplateSelectionModal } from "./template-selection-modal";
import {
  TemplateFeature,
  groupFeaturesByCategory,
} from "../../data/categoryTemplates";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Image } from "lucide-react";
import { useTranslation } from "react-i18next";

const supercategoryFormSchema = z.object({
  nameFr: z.string().min(1, "French name is required"),
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  icon: z.string().optional(),
  mainImageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  template: z.string().optional(),
  seoTitleFr: z.string().optional(),
  seoTitleEn: z.string().optional(),
  seoTitleAr: z.string().optional(),
  seoDescriptionFr: z.string().optional(),
  seoDescriptionEn: z.string().optional(),
  seoDescriptionAr: z.string().optional(),
  seoKeywordsFr: z.string().optional(),
  seoKeywordsEn: z.string().optional(),
  seoKeywordsAr: z.string().optional(),
  enabledFeatures: z.array(z.string()).default([]),
});

type SupercategoryFormData = z.infer<typeof supercategoryFormSchema>;

interface AddSupercategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupercategoryFormData) => void;
  initialData?: any;
  isEdit?: boolean;
}

export function AddSupercategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: AddSupercategoryModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [metadataView, setMetadataView] = useState<"list" | "groups">("list");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [appliedFeatures, setAppliedFeatures] = useState<TemplateFeature[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customMetadata, setCustomMetadata] = useState<
    { key: string; value: string; type: string }[]
  >([]);
  const { t, i18n } = useTranslation();
  // Predefined metadata types as shown in the image
  const metadataTypes = [
    "Text",
    "Number",
    "Boolean",
    "Date",
    "URL",
    "Email",
    "Color",
    "Image",
    "File",
    "JSON",
    "Rich Text",
    "Select",
  ];

  // Add new metadata handler
  const handleAddMetadata = () => {
    setCustomMetadata((prev) => [
      ...prev,
      { key: "", value: "", type: "Text" },
    ]);
  };

  // Remove metadata handler
  const handleRemoveMetadata = (index: number) => {
    setCustomMetadata((prev) => prev.filter((_, i) => i !== index));
  };

  // Update metadata handler
  const handleUpdateMetadata = (
    index: number,
    field: "key" | "value" | "type",
    value: string,
  ) => {
    setCustomMetadata((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // Function to get default values based on initial data
  const getDefaultValues = (): SupercategoryFormData => {
    if (initialData && isEdit) {
      // Extract translations if available
      const frTranslation =
        initialData.translations?.find((t: any) => t.language === "fr") || {};
      const enTranslation =
        initialData.translations?.find((t: any) => t.language === "en") || {};
      const arTranslation =
        initialData.translations?.find((t: any) => t.language === "ar") || {};

      return {
        nameFr: frTranslation.name || initialData.nameFr || "",
        nameEn: enTranslation.name || initialData.nameEn || "",
        nameAr: arTranslation.name || initialData.nameAr || "",
        descriptionFr:
          frTranslation.description || initialData.descriptionFr || "",
        descriptionEn:
          enTranslation.description || initialData.descriptionEn || "",
        descriptionAr:
          arTranslation.description || initialData.descriptionAr || "",
        icon: initialData.icon || "",
        mainImageUrl: initialData.mainImageUrl || "",
        isFeatured: initialData.isFeatured || false,
        isVisible:
          initialData.isVisible !== undefined ? initialData.isVisible : true,
        template: initialData.template || "",
        seoTitleFr: frTranslation.seoTitle || initialData.seoTitleFr || "",
        seoTitleEn: enTranslation.seoTitle || initialData.seoTitleEn || "",
        seoTitleAr: arTranslation.seoTitle || initialData.seoTitleAr || "",
        seoDescriptionFr:
          frTranslation.seoDescription || initialData.seoDescriptionFr || "",
        seoDescriptionEn:
          enTranslation.seoDescription || initialData.seoDescriptionEn || "",
        seoDescriptionAr:
          arTranslation.seoDescription || initialData.seoDescriptionAr || "",
        seoKeywordsFr:
          frTranslation.seoKeywords || initialData.seoKeywordsFr || "",
        seoKeywordsEn:
          enTranslation.seoKeywords || initialData.seoKeywordsEn || "",
        seoKeywordsAr:
          arTranslation.seoKeywords || initialData.seoKeywordsAr || "",
        enabledFeatures:
          initialData.metadata?.enabledFeatures ||
          initialData.enabledFeatures ||
          [],
      };
    }

    return {
      nameFr: "",
      nameEn: "",
      nameAr: "",
      descriptionFr: "",
      descriptionEn: "",
      descriptionAr: "",
      icon: "",
      mainImageUrl: "",
      isFeatured: false,
      isVisible: true,
      enabledFeatures: [],
    };
  };

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/admin/categories"],
    enabled: isOpen,
  });

  // Template application handler
  const handleApplyTemplates = (features: TemplateFeature[]) => {
    setAppliedFeatures(features);
    setIsTemplateModalOpen(false);
  };

  // Handle category selection
  const handleApplyCategories = () => {
    const categoryFeatures: TemplateFeature[] = [];
    let totalProductCount = 0;
    let totalSubcategoryCount = 0;
    let totalFeaturesCount = 0;

    selectedCategories.forEach((categoryId) => {
      const category = categories.find((c: any) => c.id === categoryId);

      if (category) {
        // Add counts from this category
        totalProductCount += category.productCount || 0;
        totalSubcategoryCount += category.subcategoryCount || 0;
        totalFeaturesCount += category.features ? category.features.length : 0;

        if (category.features) {
          category.features.forEach((feature: any) => {
            if (!appliedFeatures.find((f) => f.key === feature.name)) {
              categoryFeatures.push({
                key: feature.name,
                type: feature.type,
                default_value: feature.value || "",
                description: `Feature from ${category.translations?.[0]?.name || "category"}`,
                category: "category_features",
                isEditable: true,
              });
            }
          });
        }
      }
    });

    // Debug: Show what features we're adding
    console.log(
      "🔥 Final features being added to supercategory:",
      categoryFeatures,
    );

    // Store the merged counts for display purposes only (not as metadata fields)
    console.log(
      `📊 Merged statistics: ${totalProductCount} products, ${totalSubcategoryCount} subcategories, ${totalFeaturesCount} features from ${selectedCategories.length} categories`,
    );

    // Add category features to applied features
    setAppliedFeatures((prev) => [...prev, ...categoryFeatures]);
    // Clear selected categories
    setSelectedCategories([]);
  };

  const form = useForm<SupercategoryFormData>({
    resolver: zodResolver(supercategoryFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when modal opens with initial data
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
      if (initialData && isEdit) {
        // Load existing applied features from metadata.enabledFeatures
        const enabledFeatures = initialData.metadata?.enabledFeatures || [];
        if (enabledFeatures.length > 0) {
          setAppliedFeatures(enabledFeatures);
        } else {
          setAppliedFeatures([]);
        }
        setCustomMetadata([]);
      } else {
        // Reset for new supercategory
        setAppliedFeatures([]);
        setCustomMetadata([]);
      }
    }
  }, [isOpen, initialData, isEdit, form]);

  const handleClose = () => {
    form.reset(getDefaultValues());
    setActiveTab("general");
    setAppliedFeatures([]);
    setSelectedTemplateIds([]);
    setSelectedCategories([]);
    setCustomMetadata([]);
    onClose();
  };

  const handleSubmit = (data: SupercategoryFormData) => {
    // Include applied features in the submission data
    // Convert TemplateFeature objects to array of strings (feature keys)
    const templateFeatureKeys = appliedFeatures.map((feature) => feature.key);

    // Convert custom metadata to feature keys as well
    const customFeatureKeys = customMetadata.map((metadata) => metadata.key);

    // Combine both template features and custom metadata features
    const submissionData = {
      ...data,
      enabledFeatures: [...templateFeatureKeys, ...customFeatureKeys],
    };

    onSubmit(submissionData);
    form.reset();
    setActiveTab("general");
    setAppliedFeatures([]);
    setSelectedTemplateIds([]);
    setSelectedCategories([]);
    setCustomMetadata([]);
    onClose();
  };

  // Group applied features by category
  const groupedFeatures = groupFeaturesByCategory(appliedFeatures);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        aria-describedby="add-supercategory-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>
              {isEdit ? t("categories.editSuperCategory") : t("categories.addSuperCategory")}
            </DialogTitle>
            <Badge className="bg-orange-500 text-white">Super</Badge>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">{t("categories.generalInfo")}</TabsTrigger>
                <TabsTrigger value="metadata">{t("categories.metadata")}</TabsTrigger>
                <TabsTrigger value="seo">{t("categories.seo")}</TabsTrigger>
                <TabsTrigger value="preview">{t("categories.preview")}</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="nameFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (FR) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name in French"
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
                        <FormLabel>Name (EN) *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name in English"
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
                        <FormLabel>Nome (AR)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name in Arabic"
                            {...field}
                            data-testid="input-name-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="descriptionFr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (FR)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description in French"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-description-fr"
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
                        <FormLabel>Description (EN)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description in English"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-description-en"
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
                        <FormLabel>Description (AR)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description in Arabic"
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-description-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Icon name (eg: car, home, etc.)"
                            {...field}
                            data-testid="input-icon"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">
                          {t("categories.iconNot")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mainImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("categories.mainImage")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            data-testid="input-main-image"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">
                          {t("categories.mainImageNote")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-featured"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-normal cursor-pointer">
                            {t("categories.featuredCategory")}
                          </FormLabel>
                          <p className="text-sm text-gray-600">
                            {t("categories.featuredCategoryNote")}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isVisible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-visible"
                            className="bg-blue-500"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-normal cursor-pointer">
                            {t("categories.visibleCategory")}
                          </FormLabel>
                          <p className="text-sm text-gray-600">
                            {t("categories.visibleCategoryNote")}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {t("categories.superMetadata")}
                  </h3>

                  {/* Category and Template Selection */}
                  <div className="space-y-4 mb-6">
                    {/* Category Dropdown with Multi-select */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Select
                          value={
                            selectedCategories.length > 0 ? "multiple" : ""
                          }
                          onValueChange={() => {}} // Handled by individual checkboxes
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                selectedCategories.length > 0
                                  ? t("categories.selected", { count: selectedCategories.length })
                                  : t("categories.selectMerge")
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category: any) => {
                              const currentLang = i18n.language.split("-")[0]; // normalize code
                              const translation = category.translations?.find(
                                (tr: any) => tr.language === currentLang,
                              );

                              const categoryName =
                                translation?.name ||
                                category.translations?.[0]?.name ||
                                "Unnamed Category";

                              const isSelected = selectedCategories.includes(
                                category.id,
                              );

                              return (
                                <div
                                  key={category.id}
                                  className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isSelected) {
                                      setSelectedCategories((prev) =>
                                        prev.filter((id) => id !== category.id),
                                      );
                                    } else {
                                      setSelectedCategories((prev) => [
                                        ...prev,
                                        category.id,
                                      ]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => {}}
                                  />
                                  <span className="text-sm">
                                    {categoryName}
                                  </span>
                                </div>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCategories}
                        disabled={selectedCategories.length === 0}
                        type="button"
                      >
                        {t("categories.apply")}
                      </Button>
                    </div>

                    {/* Template Selection Button */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsTemplateModalOpen(true)}
                        type="button"
                      >
                        {t("categories.seeTemplates")}
                      </Button>
                      {selectedTemplateIds.length > 0 && (
                        <span className="text-sm text-gray-600">
                          {selectedTemplateIds.length} template
                          {selectedTemplateIds.length > 1 ? "s" : ""} selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View toggle buttons */}
                  <div className="flex gap-4 mb-6">
                    <Button
                      variant={metadataView === "list" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setMetadataView("list")}
                      type="button"
                    >
                      {t("categories.listProperties")}
                    </Button>
                    <Button
                      variant={
                        metadataView === "groups" ? "default" : "outline"
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() => setMetadataView("groups")}
                      type="button"
                    >
                      {t("categories.byGroups")}
                    </Button>
                  </div>
                </div>

                {/* List of properties view */}
                {metadataView === "list" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      {t("categories.metadataNote")}
                    </p>

                    {(appliedFeatures.length > 0 ||
                      customMetadata.length > 0) && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b pb-2">
                          <div className="col-span-3">Key</div>
                          <div className="col-span-4">Value</div>
                          <div className="col-span-3">Type</div>
                          <div className="col-span-2"></div>
                        </div>
                        {appliedFeatures.map((feature, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100"
                          >
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={feature.key}
                                onChange={(e) => {
                                  const newFeatures = [...appliedFeatures];
                                  newFeatures[index].key = e.target.value;
                                  setAppliedFeatures(newFeatures);
                                }}
                                className="w-full p-1 border rounded-md text-sm font-medium"
                                placeholder="Key name"
                              />
                            </div>
                            <div className="col-span-4">
                              {feature.type === "Boolean" ? (
                                <select
                                  value={feature.default_value}
                                  onChange={(e) => {
                                    const newFeatures = [...appliedFeatures];
                                    newFeatures[index].default_value =
                                      e.target.value;
                                    setAppliedFeatures(newFeatures);
                                  }}
                                  className="w-full p-1 border rounded-md text-sm"
                                >
                                  <option value="">Select...</option>
                                  <option value="true">True</option>
                                  <option value="false">False</option>
                                </select>
                              ) : feature.type === "Color" ? (
                                <div className="flex gap-1">
                                  <input
                                    type="color"
                                    value={feature.default_value || "#000000"}
                                    onChange={(e) => {
                                      const newFeatures = [...appliedFeatures];
                                      newFeatures[index].default_value =
                                        e.target.value;
                                      setAppliedFeatures(newFeatures);
                                    }}
                                    className="w-8 h-6 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={feature.default_value}
                                    onChange={(e) => {
                                      const newFeatures = [...appliedFeatures];
                                      newFeatures[index].default_value =
                                        e.target.value;
                                      setAppliedFeatures(newFeatures);
                                    }}
                                    className="flex-1 p-1 border rounded-md text-sm"
                                    placeholder="#FF0000"
                                  />
                                </div>
                              ) : feature.type === "Number" ? (
                                <input
                                  type="number"
                                  value={feature.default_value}
                                  onChange={(e) => {
                                    const newFeatures = [...appliedFeatures];
                                    newFeatures[index].default_value =
                                      e.target.value;
                                    setAppliedFeatures(newFeatures);
                                  }}
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="Ex: 100, 25.5"
                                />
                              ) : feature.type === "URL" ? (
                                <input
                                  type="url"
                                  value={feature.default_value}
                                  onChange={(e) => {
                                    const newFeatures = [...appliedFeatures];
                                    newFeatures[index].default_value =
                                      e.target.value;
                                    setAppliedFeatures(newFeatures);
                                  }}
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="https://example.com"
                                />
                              ) : feature.type === "Email" ? (
                                <input
                                  type="email"
                                  value={feature.default_value}
                                  onChange={(e) => {
                                    const newFeatures = [...appliedFeatures];
                                    newFeatures[index].default_value =
                                      e.target.value;
                                    setAppliedFeatures(newFeatures);
                                  }}
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="example@email.com"
                                />
                              ) : feature.type === "Date" ? (
                                <input
                                  type="date"
                                  value={feature.default_value}
                                  onChange={(e) => {
                                    const newFeatures = [...appliedFeatures];
                                    newFeatures[index].default_value =
                                      e.target.value;
                                    setAppliedFeatures(newFeatures);
                                  }}
                                  className="w-full p-1 border rounded-md text-sm"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={feature.default_value}
                                  onChange={(e) => {
                                    const newFeatures = [...appliedFeatures];
                                    newFeatures[index].default_value =
                                      e.target.value;
                                    setAppliedFeatures(newFeatures);
                                  }}
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="Property value"
                                />
                              )}
                            </div>
                            <div className="col-span-3">
                              <select
                                value={feature.type}
                                onChange={(e) => {
                                  const newFeatures = [...appliedFeatures];
                                  newFeatures[index].type = e.target.value;
                                  setAppliedFeatures(newFeatures);
                                }}
                                className="w-full p-1 border rounded-md text-sm"
                              >
                                <option value="Text">Text</option>
                                <option value="Number">Number</option>
                                <option value="Boolean">Boolean</option>
                                <option value="Date">Date</option>
                                <option value="URL">URL</option>
                                <option value="Email">Email</option>
                                <option value="Color">Color</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 p-1"
                                onClick={() => {
                                  const newFeatures = appliedFeatures.filter(
                                    (_, i) => i !== index,
                                  );
                                  setAppliedFeatures(newFeatures);
                                }}
                                type="button"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {/* Render custom metadata in the same section */}
                        {customMetadata.map((metadata, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100"
                          >
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={metadata.key}
                                onChange={(e) =>
                                  handleUpdateMetadata(
                                    index,
                                    "key",
                                    e.target.value,
                                  )
                                }
                                className="w-full p-1 border rounded-md text-sm"
                                placeholder="Property Name"
                              />
                            </div>
                            <div className="col-span-4">
                              {metadata.type === "Number" ? (
                                <input
                                  type="number"
                                  value={metadata.value}
                                  onChange={(e) =>
                                    handleUpdateMetadata(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="Ex: 100, 25.5"
                                />
                              ) : metadata.type === "Boolean" ? (
                                <select
                                  value={metadata.value}
                                  onChange={(e) =>
                                    handleUpdateMetadata(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-1 border rounded-md text-sm"
                                >
                                  <option value="">Select...</option>
                                  <option value="true">True</option>
                                  <option value="false">False</option>
                                </select>
                              ) : metadata.type === "Date" ? (
                                <input
                                  type="date"
                                  value={metadata.value}
                                  onChange={(e) =>
                                    handleUpdateMetadata(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-1 border rounded-md text-sm"
                                />
                              ) : metadata.type === "Color" ? (
                                <div className="flex gap-1">
                                  <input
                                    type="color"
                                    value={metadata.value}
                                    onChange={(e) =>
                                      handleUpdateMetadata(
                                        index,
                                        "value",
                                        e.target.value,
                                      )
                                    }
                                    className="w-8 h-6 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={metadata.value}
                                    onChange={(e) =>
                                      handleUpdateMetadata(
                                        index,
                                        "value",
                                        e.target.value,
                                      )
                                    }
                                    className="flex-1 p-1 border rounded-md text-sm"
                                    placeholder="#FF0000"
                                  />
                                </div>
                              ) : metadata.type === "URL" ? (
                                <input
                                  type="url"
                                  value={metadata.value}
                                  onChange={(e) =>
                                    handleUpdateMetadata(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="https://example.com"
                                />
                              ) : metadata.type === "Email" ? (
                                <input
                                  type="email"
                                  value={metadata.value}
                                  onChange={(e) =>
                                    handleUpdateMetadata(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="example@email.com"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={metadata.value}
                                  onChange={(e) =>
                                    handleUpdateMetadata(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full p-1 border rounded-md text-sm"
                                  placeholder="Property value"
                                />
                              )}
                            </div>
                            <div className="col-span-3">
                              <Select
                                value={metadata.type}
                                onValueChange={(value) =>
                                  handleUpdateMetadata(index, "type", value)
                                }
                              >
                                <SelectTrigger className="text-sm h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {metadataTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMetadata(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                                type="button"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add metadata button */}
                    <Button
                      variant="outline"
                      className="w-full border-dashed mt-4"
                      onClick={handleAddMetadata}
                      type="button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("categories.addMetadata")}
                    </Button>

                    {/* Directions for use - only show when no metadata applied */}
                    {appliedFeatures.length === 0 && (

                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium mb-2 text-blue-900">
                        {t("categories.directionsUse")}
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• {t("categories.displayStyle")}</li>
                        <li>• {t("categories.bannerUrl")}</li>
                        <li>• {t("categories.featuredBrands")}</li>
                        <li>• {t("categories.enableCompare")}</li>
                        <li>• {t("categories.customFilters")}</li>
                        <li>• {t("categories.layoutType")}</li>
                        <li>• {t("categories.searchBoostTerms")}</li>
                      </ul>
                    </div>

                      // <div className="border rounded-lg p-4 bg-blue-50">
                      //   <h4 className="font-medium mb-2 text-blue-900">
                      //     {t("categories.directionsUse")}
                      //   </h4>
                      //   <ul className="text-sm text-blue-800 space-y-1">
                      //     <li>
                      //       • Use{" "}
                      //       <code className="bg-blue-100 px-1 rounded text-xs">
                      //         display_style
                      //       </code>{" "}
                      //       to set the display ('grid', 'list', 'mosaic')
                      //     </li>
                      //     <li>
                      //       • Add{" "}
                      //       <code className="bg-blue-100 px-1 rounded text-xs">
                      //         banner_url
                      //       </code>{" "}
                      //       for a custom banner
                      //     </li>
                      //     <li>
                      //       • Set{" "}
                      //       <code className="bg-blue-100 px-1 rounded text-xs">
                      //         featured_brands
                      //       </code>{" "}
                      //       to highlight specific brands
                      //     </li>
                      //     <li>
                      //       • Use{" "}
                      //       <code className="bg-blue-100 px-1 rounded text-xs">
                      //         enable_compare
                      //       </code>
                      //       (true/false) for product comparison
                      //     </li>
                      //     <li>
                      //       • Add{" "}
                      //       <code className="bg-blue-100 px-1 rounded text-xs">
                      //         custom_filters
                      //       </code>{" "}
                      //       for filters specific to this supercategory
                      //     </li>
                      //     <li>
                      //       • Use{" "}
                      //       <code className="bg-blue-100 px-1 rounded text-xs">
                      //         layout_type
                      //       </code>{" "}
                      //       to change the arrangement of products
                      //     </li>
                      //     <li>
                      //       • Add{" "}
                      //       <code className="bg-blue-100 px-1 rounded text-xs">
                      //         search_boost_terms
                      //       </code>{" "}
                      //       to improve SEO
                      //     </li>
                      //   </ul>
                      // </div>
                    )}
                  </div>
                )}

                {/* By groups view */}
                {metadataView === "groups" && (
                  <div className="space-y-4">
                    {Object.keys(groupedFeatures).length > 0 ? (
                      Object.entries(groupedFeatures).map(
                        ([category, features]) => (
                          <div
                            key={category}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <h4 className="font-medium mb-3 capitalize">
                              {category.replace("_", " ")}
                            </h4>
                            <div className="space-y-2">
                              {features.map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded border"
                                >
                                  <div className="flex-1">
                                    <span className="text-sm font-medium">
                                      {feature.key}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                      {feature.description}
                                    </div>
                                  </div>
                                  <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                                    {feature.type}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">
                          {t("categories.notemp")}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setIsTemplateModalOpen(true)}
                          type="button"
                        >
                          {t("categories.choostemp")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="seo" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {t("categories.seo")}
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">{t("categories.tabs.seotitle")}</h4>
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

                    <div>
                      <h4 className="font-medium mb-4">{t("categories.tabs.seodesc")}</h4>
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
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="textarea-seo-description-fr"
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
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="textarea-seo-description-en"
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
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="textarea-seo-description-ar"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">{t("categories.tabs.seokeywords")}</h4>
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
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {t("categories.superPreview")}
                  </h3>

                  {form.watch("nameFr") || form.watch("nameEn") ? (
                    <div className="space-y-6">
                      {/* Basic Info Preview */}
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <h4 className="font-medium mb-4">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">
                              French Name:
                            </span>
                            <p className="font-medium">
                              {form.watch("nameFr") || "—"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              English Name:
                            </span>
                            <p className="font-medium">
                              {form.watch("nameEn") || "—"}
                            </p>
                          </div>
                          {form.watch("nameAr") && (
                            <div>
                              <span className="text-sm text-gray-500">
                                Arabic Name:
                              </span>
                              <p className="font-medium" dir="rtl">
                                {form.watch("nameAr")}
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-sm text-gray-500">
                              Status:
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${form.watch("isVisible") ? "bg-green-500" : "bg-red-500"}`}
                              ></span>
                              <span>
                                {form.watch("isVisible") ? "Visible" : "Hidden"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Applied Features Preview */}
                      {appliedFeatures.length > 0 && (
                        <div className="border rounded-lg p-6 bg-blue-50">
                          <h4 className="font-medium mb-4">
                            Applied Features ({appliedFeatures.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {appliedFeatures.map((feature, index) => (
                              <div
                                key={index}
                                className="bg-white rounded-lg p-3 border"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium">
                                      {feature.key}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {feature.description}
                                    </p>
                                  </div>
                                  <div className="ml-2">
                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                                      {feature.type}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs">
                                  <span className="text-gray-500">
                                    Default:{" "}
                                  </span>
                                  <span className="font-mono bg-gray-100 px-1 rounded">
                                    {feature.default_value}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Template Summary */}
                      {selectedTemplateIds.length > 0 && (
                        <div className="border rounded-lg p-6 bg-green-50">
                          <h4 className="font-medium mb-4">
                            Selected Templates
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTemplateIds.map((templateId, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {templateId.charAt(0).toUpperCase() +
                                  templateId.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SEO Preview */}
                      {(form.watch("seoTitleFr") ||
                        form.watch("seoTitleEn") ||
                        form.watch("seoDescriptionFr") ||
                        form.watch("seoDescriptionEn")) && (
                        <div className="border rounded-lg p-6 bg-yellow-50">
                          <h4 className="font-medium mb-4">
                            SEO Configuration
                          </h4>
                          <div className="space-y-3">
                            {form.watch("seoTitleFr") && (
                              <div>
                                <span className="text-sm text-gray-500">
                                  SEO Title (French):
                                </span>
                                <p className="font-medium">
                                  {form.watch("seoTitleFr")}
                                </p>
                              </div>
                            )}
                            {form.watch("seoTitleEn") && (
                              <div>
                                <span className="text-sm text-gray-500">
                                  SEO Title (English):
                                </span>
                                <p className="font-medium">
                                  {form.watch("seoTitleEn")}
                                </p>
                              </div>
                            )}
                            {form.watch("seoDescriptionFr") && (
                              <div>
                                <span className="text-sm text-gray-500">
                                  SEO Description (French):
                                </span>
                                <p className="text-sm">
                                  {form.watch("seoDescriptionFr")}
                                </p>
                              </div>
                            )}
                            {form.watch("seoDescriptionEn") && (
                              <div>
                                <span className="text-sm text-gray-500">
                                  SEO Description (English):
                                </span>
                                <p className="text-sm">
                                  {form.watch("seoDescriptionEn")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Configuration Summary */}
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <h4 className="font-medium mb-4">
                          Configuration Summary
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-white rounded p-3">
                            <div className="text-2xl font-bold text-blue-600">
                              {appliedFeatures.length}
                            </div>
                            <div className="text-xs text-gray-500">
                              Features
                            </div>
                          </div>
                          <div className="bg-white rounded p-3">
                            <div className="text-2xl font-bold text-green-600">
                              {selectedTemplateIds.length}
                            </div>
                            <div className="text-xs text-gray-500">
                              Templates
                            </div>
                          </div>
                          <div className="bg-white rounded p-3">
                            <div className="text-2xl font-bold text-yellow-600">
                              {Object.keys(groupedFeatures).length}
                            </div>
                            <div className="text-xs text-gray-500">
                              Categories
                            </div>
                          </div>
                          <div className="bg-white rounded p-3">
                            <div className="text-2xl font-bold text-purple-600">
                              {form.watch("isFeatured") ? "✓" : "—"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Featured
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Image className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t("categories.previewMode")}</h3>
                      <p>
                        {t("categories.previewNote")}
                      </p>
                      <p className="text-sm">
                        {t("categories.previewRequirement")}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel"
              >
                {t("categories.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-add"
              >
                {isEdit ? t("categories.superupdate") : t("categories.superadd")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplyTemplates={(features) => {
          handleApplyTemplates(features);
        }}
        selectedTemplateIds={selectedTemplateIds}
      />
    </Dialog>
  );
}
