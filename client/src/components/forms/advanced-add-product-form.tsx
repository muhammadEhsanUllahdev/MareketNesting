import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Upload,
  Link2,
  Plus,
  X,
  Package,
  Save,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Switch } from "../ui/switch";

const SUPPORTED_LANGS = ["en", "fr", "ar"] as const;

// Product schema for validation
const productSpecificationSchema = z.object({
  featureName: z.string().min(1, "Feature name is required"),
  featureValue: z.string().min(1, "Feature value is required"),
  featureType: z.string().min(1, "Feature type is required"),
});

const productFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

// Multilingual translation schema
const productTranslationSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  highlights: z.string().optional(),
});

// Optional translation schema for secondary languages
const optionalProductTranslationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  highlights: z.string().optional(),
});

const addProductSchema = z.object({
  // Multilingual Information - Only English required
  translations: z.object({
    en: productTranslationSchema,
    fr: optionalProductTranslationSchema,
    ar: optionalProductTranslationSchema,
  }),

  // Product Details
  brand: z.string().min(1, "Brand is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  originalPrice: z.number().optional(),
  purchasePrice: z.number().optional(),
  minThreshold: z.number().min(0, "Min thresold must be 0 or greater"),
  suggestedQuantity: z
    .number()
    .min(0, "Suggested quantity must be 0 or greater"),
  stock: z.number().min(0, "Stock must be 0 or greater"),
  categoryId: z.string().min(1, "Category is required"),

  // Status
  status: z.enum(["active", "inactive"]).default("active"),

  // Images with upload method tracking
  images: z
    .array(
      z.object({
        url: z.string(),
        uploadMethod: z.enum(["upload", "url", "existing"]),
      })
    )
    .max(8, "Maximum 8 images allowed"),

  // Specifications (dynamic based on category)
  specifications: z.array(productSpecificationSchema).optional(),

  // FAQs
  faqs: z.array(productFaqSchema).optional(),
  isFeatured: z.boolean().optional(),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

interface AdvancedAddProductFormProps {
  onSubmit: (data: AddProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  editMode?: boolean;
  editProduct?: any;
}

export function AdvancedAddProductForm({
  onSubmit,
  onCancel,
  isLoading = false,
  editMode = false,
  editProduct,
}: AdvancedAddProductFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("information");

  // Initialize translations state
  const [translations, setTranslations] = useState(
    SUPPORTED_LANGS.reduce((acc, lang) => {
      // Initialize with edit data if available
      const editData = editMode && editProduct?.translations?.[lang];
      acc[lang] = {
        name: editData?.name || "",
        description: editData?.description || "",
        highlights: editData?.highlights || "",
      };
      return acc;
    }, {} as Record<string, { name: string; description: string; highlights: string }>)
  );

  // Handle translation changes
  const handleTranslationChange = (
    lang: string,
    field: "name" | "description" | "highlights",
    value: string
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));

    // Also update the form
    form.setValue(`translations.${lang}.${field}` as any, value);
  };

  // Separate uploaded images from URL images in edit mode
  const initializeImages = () => {
    if (editMode && editProduct && editProduct.images) {
      // Check if images have the new structure or old structure
      const images = editProduct.images;
      if (images.length > 0 && typeof images[0] === "string") {
        // Old structure - treat all as existing images
        return {
          uploaded: [],
          urls: images as string[],
        };
      } else {
        // New structure - separate by upload method
        const imageObjects = images as { url: string; uploadMethod: string }[];
        return {
          uploaded: imageObjects
            .filter((img) => img.uploadMethod === "upload")
            .map((img) => img.url),
          urls: imageObjects
            .filter((img) => img.uploadMethod !== "upload")
            .map((img) => img.url),
        };
      }
    }
    return { uploaded: [], urls: [] };
  };

  const { uploaded: initialUploaded, urls: initialUrls } = initializeImages();
  const [uploadedImages, setUploadedImages] =
    useState<string[]>(initialUploaded);
  const [imageUrls, setImageUrls] = useState<string[]>(initialUrls);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    editMode && editProduct ? editProduct.categoryId || "" : ""
  );
  const [isDraft, setIsDraft] = useState(
    editMode && editProduct ? editProduct.status === "draft" : false
  );

  const form = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues:
      editMode && editProduct
        ? {
            translations: {
              en: {
                name: editProduct.translations?.en?.name || "",
                description: editProduct.translations?.en?.description || "",
                highlights: editProduct.translations?.en?.highlights || "",
              },
              fr: {
                name: editProduct.translations?.fr?.name || "",
                description: editProduct.translations?.fr?.description || "",
                highlights: editProduct.translations?.fr?.highlights || "",
              },
              ar: {
                name: editProduct.translations?.ar?.name || "",
                description: editProduct.translations?.ar?.description || "",
                highlights: editProduct.translations?.ar?.highlights || "",
              },
            },
            brand: editProduct.brand || "",
            sku: editProduct.sku || "",
            price: parseFloat(editProduct.price) || 0,
            originalPrice: editProduct.originalPrice
              ? parseFloat(editProduct.originalPrice)
              : 0,
            purchasePrice: editProduct.purchasePrice
              ? parseFloat(editProduct.purchasePrice)
              : 0,
            minThreshold: editProduct.minThreshold
              ? parseFloat(editProduct.minThreshold)
              : 0,
            suggestedQuantity: editProduct.suggestedQuantity
              ? parseFloat(editProduct.suggestedQuantity)
              : 0,
            stock: editProduct.stock || 0,
            categoryId: editProduct.categoryId || "",
            status: editProduct.status || "active",
            images: editProduct.images
              ? typeof editProduct.images[0] === "string"
                ? (editProduct.images as string[]).map((url) => ({
                    url,
                    uploadMethod: "existing" as const,
                  }))
                : editProduct.images
              : [],
            specifications: editProduct.specifications || [],
            faqs: editProduct.faqs || [],
            isFeatured: editProduct.isFeatured || false,
          }
        : {
            translations: {
              en: { name: "", description: "", highlights: "" },
              fr: { name: "", description: "", highlights: "" },
              ar: { name: "", description: "", highlights: "" },
            },
            brand: "",
            sku: "",
            price: "" as any,
            purchasePrice: "" as any,
            minThreshold: "" as any,
            suggestedQuantity: "" as any,
            originalPrice: "" as any,
            stock: "" as any,
            categoryId: "",
            status: "active",
            images: [],
            specifications: [],
            faqs: [],
            isFeatured: false,
          },
  });

  const {
    fields: specificationFields,
    append: appendSpecification,
    remove: removeSpecification,
  } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch category features when category is selected
  const { data: categoryFeatures = [] } = useQuery({
    queryKey: ["/api/categories", selectedCategory, "features"],
    enabled: !!selectedCategory,
    queryFn: async () => {
      const response = await fetch(
        `/api/categories/${selectedCategory}/features`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch category features");
      return response.json();
    },
  });

  // Initialize translations, FAQs and Images when in edit mode
  useEffect(() => {
    if (editMode && editProduct) {
      // Initialize translations from edit product
      if (editProduct.translations) {
        setTranslations(editProduct.translations);
        // Also set form values to ensure they appear in the form
        form.setValue(
          "translations.en.name",
          editProduct.translations.en?.name || ""
        );
        form.setValue(
          "translations.en.description",
          editProduct.translations.en?.description || ""
        );
        form.setValue(
          "translations.en.highlights",
          editProduct.translations.en?.highlights || ""
        );
        form.setValue(
          "translations.fr.name",
          editProduct.translations.fr?.name || ""
        );
        form.setValue(
          "translations.fr.description",
          editProduct.translations.fr?.description || ""
        );
        form.setValue(
          "translations.fr.highlights",
          editProduct.translations.fr?.highlights || ""
        );
        form.setValue(
          "translations.ar.name",
          editProduct.translations.ar?.name || ""
        );
        form.setValue(
          "translations.ar.description",
          editProduct.translations.ar?.description || ""
        );
        form.setValue(
          "translations.ar.highlights",
          editProduct.translations.ar?.highlights || ""
        );
      }

      // Also ensure brand and other fields are set
      if (editProduct.brand) {
        form.setValue("brand", editProduct.brand);
      }

      // Clear existing FAQs first
      const currentFaqs = form.getValues("faqs") || [];
      for (let i = currentFaqs.length - 1; i >= 0; i--) {
        removeFaq(i);
      }

      // Add existing FAQs if they exist
      if (editProduct.faqs && editProduct.faqs.length > 0) {
        editProduct.faqs.forEach((faq: any) => {
          appendFaq({
            question: faq.question || "",
            answer: faq.answer || "",
          });
        });
      }

      // Reinitialize images to fix disappearing issue
      const { uploaded, urls } = initializeImages();
      setUploadedImages(uploaded);
      setImageUrls(urls);
    }
  }, [editMode, editProduct, form, appendFaq, removeFaq]);

  // Auto-populate specifications when category changes
  useEffect(() => {
    if (categoryFeatures.length > 0 && !editMode) {
      // Clear existing specifications only when not in edit mode
      form.setValue("specifications", []);

      // Add specifications based on category features
      const newSpecifications = categoryFeatures.map((feature: any) => ({
        featureName: feature.name,
        featureValue: "",
        featureType: feature.type,
      }));

      form.setValue("specifications", newSpecifications);
    } else if (selectedCategory && !editMode) {
      // Clear specifications if category has no features and not in edit mode
      form.setValue("specifications", []);
    }
  }, [categoryFeatures, selectedCategory, form]);

  const calculateProgress = () => {
    const values = form.getValues();
    let completed = 0;
    const total = 4;

    // Information tab - check if basic required fields are filled (only English translation required)
    const hasBasicInfo =
      values.brand &&
      values.sku &&
      values.categoryId &&
      values.price &&
      values.translations?.en?.name &&
      values.translations?.en?.description;

    if (hasBasicInfo) {
      completed++;
    }

    // Specifications tab - only count as complete if specifications exist and have values
    if (values.specifications && values.specifications.length > 0) {
      const hasValidSpecs = values.specifications.some(
        (spec) => spec.featureName && spec.featureValue
      );
      if (hasValidSpecs) completed++;
    }

    // Images tab - only count if images are actually uploaded
    if (uploadedImages.length > 0 || imageUrls.length > 0) {
      completed++;
    }

    // FAQ tab - only count if FAQs have content
    if (values.faqs && values.faqs.length > 0) {
      const hasValidFAQs = values.faqs.some(
        (faq) => faq.question && faq.answer
      );
      if (hasValidFAQs) completed++;
    }

    return Math.round((completed / total) * 100);
  };

  // Function to check if a tab has validation errors
  const getTabValidationStatus = (tabName: string) => {
    const errors = form.formState.errors;
    const values = form.getValues();

    switch (tabName) {
      case "information":
        return !!(
          errors.translations ||
          errors.brand ||
          errors.sku ||
          errors.categoryId ||
          errors.price ||
          !values.translations?.en?.name ||
          !values.translations?.en?.description
        );
      case "specifications":
        return !!errors.specifications;
      case "images":
        return !!errors.images;
      case "faqs":
        return !!errors.faqs;
      default:
        return false;
    }
  };

  const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const files = Array.from(event.target.files || []);
  const totalImages = uploadedImages.length + imageUrls.length;

  if (totalImages + files.length > 8) {
    alert(t("addProduct.alert.maxImages"));
    return;
  }

  // Show loading state
  const loadingToast = toast({
    title: t("addProduct.toast.uploading.title"),
    description: t("addProduct.toast.uploading.description"),
  });

  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch("/api/upload/images", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(t("product.images.uploadError"));
    }

    const result = await response.json();

    // Update state with uploaded file paths
    const newImagePaths = result.files.map((file: any) => file.path);
    setUploadedImages((prev) => [...prev, ...newImagePaths]);

    // Update form with new image structure
    const currentImages = form.getValues("images") || [];
    const newImages = [
      ...currentImages,
      ...newImagePaths.map((path: string) => ({
        url: path,
        uploadMethod: "upload" as const,
      })),
    ];
    form.setValue("images", newImages);

    loadingToast.dismiss();
    toast({
      title: t("addProduct.toast.success.titles"),
      description: t("addProduct.toast.success.description", {
        count: files.length,
      }),
    });
  } catch (error) {
    loadingToast.dismiss();
    console.error("Error uploading images:", error);
    toast({
      title: t("addProduct.toast.error.titles"),
      description: t("addProduct.toast.error.descriptions"),
      variant: "destructive",
    });
  }

  // Reset file input
  event.target.value = "";
};


  const addImageUrl = (url: string) => {
    const totalImages = uploadedImages.length + imageUrls.length;

    if (totalImages >= 8) {
  alert(t("addProduct.alert.maxImages"));
  return;
}


    if (url && !imageUrls.includes(url)) {
      const newUrls = [...imageUrls, url];
      setImageUrls(newUrls);

      // Update form with new image structure
      const currentImages = form.getValues("images") || [];
      const newImages = [
        ...currentImages,
        { url: url, uploadMethod: "url" as const },
      ];
      form.setValue("images", newImages);
    }
  };

  const removeImage = (index: number, type: "upload" | "url") => {
    if (type === "upload") {
      const newUploaded = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newUploaded);
    } else {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
    }

    // Update form by removing the image at the correct position
    const currentImages = form.getValues("images") || [];
    const updatedImages = currentImages.filter((_, i) => {
      if (type === "upload") {
        return !(i < uploadedImages.length && i === index);
      } else {
        return !(
          i >= uploadedImages.length && i - uploadedImages.length === index
        );
      }
    });
    form.setValue("images", updatedImages);
  };

  const handleSubmit = (data: AddProductFormData, asDraft: boolean = false) => {
    // Combine all images with their upload methods
    const allImages = [
      ...uploadedImages.map((url) => ({
        url,
        uploadMethod: "upload" as const,
      })),
      ...imageUrls.map((url) => ({ url, uploadMethod: "url" as const })),
    ];

    const finalData = {
      ...data,
      images: allImages,
      status: asDraft ? "inactive" : data.status || "active",
      // Extract primary language data for backward compatibility with backend
      name: data.translations.en.name,
      description: data.translations.en.description,
      highlights: data.translations.en.highlights,
    };
    onSubmit(finalData);
  };

  const getTabIcon = (
    tab: string,
    isCompleted: boolean,
    hasErrors: boolean
  ) => {
    if (hasErrors) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Info className="h-4 w-4 text-gray-400" />;
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {editMode
                ? t("seller.product.edit.title")
                : t("seller.product.add.title")}
            </CardTitle>
            {/* <CardTitle className="text-2xl font-bold">
              {editMode ? "Edit Product" : "Add a New Product"}
            </CardTitle> */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {t("seller.product.add.progress")}: {progress}%
              </div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>{t("seller.product.add.note")}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>{t("seller.product.add.error.productName")}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>{t("seller.product.add.error.description")}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>{t("seller.product.add.error.price")}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>{t("seller.product.add.error.brand")}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => handleSubmit(data, false))}
            >
              <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="information"
                    className={`flex items-center gap-2 ${
                      getTabValidationStatus("information")
                        ? "text-red-600 border-red-200"
                        : ""
                    }`}
                  >
                    {getTabIcon(
                      "information",
                      !!(
                        form.watch("translations.en.name") &&
                        form.watch("translations.fr.name") &&
                        form.watch("translations.ar.name")
                      ),
                      getTabValidationStatus("information")
                    )}
                    {t("seller.product.add.tab.information")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="specifications"
                    className={`flex items-center gap-2 ${
                      getTabValidationStatus("specifications")
                        ? "text-red-600 border-red-200"
                        : ""
                    }`}
                  >
                    {getTabIcon(
                      "specifications",
                      specificationFields.length > 0,
                      getTabValidationStatus("specifications")
                    )}
                    {t("seller.product.add.tab.specifications")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="faq"
                    className={`flex items-center gap-2 ${
                      getTabValidationStatus("faqs")
                        ? "text-red-600 border-red-200"
                        : ""
                    }`}
                  >
                    {getTabIcon(
                      "faq",
                      faqFields.length > 0,
                      getTabValidationStatus("faqs")
                    )}
                    {t("seller.product.add.tab.faq")}
                  </TabsTrigger>
                </TabsList>

                {/* Information Tab */}
                <TabsContent value="information" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("seller.product.add.basicInfo")}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {t("seller.product.add.basicInfo.desc")}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Product Names - Three Column Layout */}
                      <div className="space-y-4">
                        <div>
                          <FormLabel className="text-base font-semibold mb-4 block">
                            {t("seller.product.add.productName")}
                          </FormLabel>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* English Name */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Name (English) *
                              </FormLabel>
                              <Input
                                placeholder="Ex: Samsung Galaxy S24 Ultra Phone - 256 GB - Black"
                                value={translations.en?.name || ""}
                                onChange={(e) =>
                                  handleTranslationChange(
                                    "en",
                                    "name",
                                    e.target.value
                                  )
                                }
                                data-testid="input-name-en"
                                dir="ltr"
                                className="mt-1"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                A clear and descriptive name improves the
                                visibility of your product
                              </p>
                            </div>

                            {/* French Name */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                Nom (Français)
                              </FormLabel>
                              <Input
                                placeholder="Ex: Téléphone Samsung Galaxy S24 Ultra - 256 Go - Noir"
                                value={translations.fr?.name || ""}
                                onChange={(e) =>
                                  handleTranslationChange(
                                    "fr",
                                    "name",
                                    e.target.value
                                  )
                                }
                                data-testid="input-name-fr"
                                dir="ltr"
                                className="mt-1"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Un nom clair et descriptif améliore la
                                visibilité de votre produit
                              </p>
                            </div>

                            {/* Arabic Name */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700">
                                الاسم (عربي)
                              </FormLabel>
                              <Input
                                placeholder="مثال: هاتف سامسونج غالكسي إس 24 ألترا - 256 جيجابايت - أسود"
                                value={translations.ar?.name || ""}
                                onChange={(e) =>
                                  handleTranslationChange(
                                    "ar",
                                    "name",
                                    e.target.value
                                  )
                                }
                                data-testid="input-name-ar"
                                dir="rtl"
                                className="mt-1"
                              />
                              <p
                                className="text-xs text-gray-500 mt-1"
                                dir="rtl"
                              >
                                يحسن الاسم الواضح والوصفي من ظهور منتجك
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Brand and SKU */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("seller.product.add.brand")} *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Samsung, Apple, Sony..."
                                  {...field}
                                  data-testid="input-brand"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("seller.product.add.sku")} *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: PROD-12345"
                                  {...field}
                                  data-testid="input-sku"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Price and Stock */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("seller.product.add.price")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 24999"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? "" : parseFloat(value) || 0
                                    );
                                  }}
                                  data-testid="input-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="originalPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("seller.product.add.originalPrice")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 26999"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? "" : parseFloat(value) || 0
                                    );
                                  }}
                                  data-testid="input-original-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("seller.product.add.stockQuantity")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ex: 100"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? "" : parseInt(value) || 0
                                    );
                                  }}
                                  data-testid="input-stock"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* purchase price min thresold suggested quantity */}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="purchasePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("products.purchasePrice")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 24999"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? "" : parseFloat(value) || 0
                                    );
                                  }}
                                  data-testid="input-purchase-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="minThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("products.minThreshold")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 26999"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? "" : parseFloat(value) || 0
                                    );
                                  }}
                                  data-testid="input-min-thresold"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="suggestedQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("products.suggestedQuantity")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ex: 100"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? "" : parseInt(value) || 0
                                    );
                                  }}
                                  data-testid="input-suggested-quantity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Status and Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t("seller.product.add.status")}
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-status">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">
                                    {t("seller.product.active")}
                                  </SelectItem>
                                  <SelectItem value="inactive">
                                    {t("seller.product.inactive")}
                                  </SelectItem>
                                  {/* <SelectItem value="draft">Draft</SelectItem> */}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("products.category")} *</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedCategory(value);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-category">
                                    <SelectValue placeholder={t("products.selectCategory")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category: any) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.translations?.[0]?.name ||
                                        category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Description with Rich Text - Three Column Layout */}
                      <div className="space-y-4">
                        <div>
                          <FormLabel className="text-base font-semibold mb-4 block">
                            {t("seller.product.add.description")}
                          </FormLabel>
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 [&_.ql-editor]:mb-8">
                            {/* English Description */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                Description (English) *
                              </FormLabel>
                              <ReactQuill
                                theme="snow"
                                value={translations.en?.description || ""}
                                onChange={(value) =>
                                  handleTranslationChange(
                                    "en",
                                    "description",
                                    value
                                  )
                                }
                                placeholder="Detailed product description..."
                                modules={{
                                  toolbar: [
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["clean"],
                                  ],
                                }}
                                style={{ direction: "ltr", height: "200px" }}
                              />
                            </div>

                            {/* French Description */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                Description (Français)
                              </FormLabel>
                              <ReactQuill
                                theme="snow"
                                value={translations.fr?.description || ""}
                                onChange={(value) =>
                                  handleTranslationChange(
                                    "fr",
                                    "description",
                                    value
                                  )
                                }
                                placeholder="Description détaillée du produit..."
                                modules={{
                                  toolbar: [
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["clean"],
                                  ],
                                }}
                                style={{ direction: "ltr", height: "200px" }}
                              />
                            </div>

                            {/* Arabic Description */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                الوصف (عربي)
                              </FormLabel>
                              <ReactQuill
                                theme="snow"
                                value={translations.ar?.description || ""}
                                onChange={(value) =>
                                  handleTranslationChange(
                                    "ar",
                                    "description",
                                    value
                                  )
                                }
                                placeholder="وصف مفصل للمنتج..."
                                modules={{
                                  toolbar: [
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["clean"],
                                  ],
                                }}
                                style={{ direction: "rtl", height: "200px" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Highlights - Three Column Layout */}
                      <div className="space-y-4 ">
                        <div>
                          <FormLabel className="text-base font-semibold mb-4  block">
                            {t("products.highlights")}
                          </FormLabel>
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 [&_.ql-editor]:mb-8">
                            {/* English Highlights */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                Highlights (English)
                              </FormLabel>
                              <ReactQuill
                                theme="snow"
                                value={translations.en?.highlights || ""}
                                onChange={(value) =>
                                  handleTranslationChange(
                                    "en",
                                    "highlights",
                                    value
                                  )
                                }
                                placeholder="Ex: Premium quality, Elegant design, Ease of use..."
                                modules={{
                                  toolbar: [
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["clean"],
                                  ],
                                }}
                                style={{ direction: "ltr", height: "150px" }}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                List the main features that distinguish this
                                product
                              </p>
                            </div>

                            {/* French Highlights */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                Points forts (Français)
                              </FormLabel>
                              <ReactQuill
                                theme="snow"
                                value={translations.fr?.highlights || ""}
                                onChange={(value) =>
                                  handleTranslationChange(
                                    "fr",
                                    "highlights",
                                    value
                                  )
                                }
                                placeholder="Ex: Qualité premium, Design élégant, Facilité d'utilisation..."
                                modules={{
                                  toolbar: [
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["clean"],
                                  ],
                                }}
                                style={{ direction: "ltr", height: "150px" }}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Listez les principales fonctionnalités qui
                                distinguent ce produit
                              </p>
                            </div>

                            {/* Arabic Highlights */}
                            <div>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                                المميزات (عربي)
                              </FormLabel>
                              <ReactQuill
                                theme="snow"
                                value={translations.ar?.highlights || ""}
                                onChange={(value) =>
                                  handleTranslationChange(
                                    "ar",
                                    "highlights",
                                    value
                                  )
                                }
                                placeholder="مثال: جودة عالية، تصميم أنيق، سهولة الاستخدام..."
                                modules={{
                                  toolbar: [
                                    ["bold", "italic", "underline"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["link"],
                                    ["clean"],
                                  ],
                                }}
                                style={{ direction: "rtl", height: "150px" }}
                              />
                              <p
                                className="text-xs text-gray-500 mt-1"
                                dir="rtl"
                              >
                                اذكر الميزات الرئيسية التي تميز هذا المنتج
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Images Section moved to Information tab */}
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {t("seller.product.images.title")}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {t("seller.product.images.note")}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Upload Images */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Existing uploaded images */}
                            {uploadedImages.map((image, index) => (
                              <div
                                key={index}
                                className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                              >
                                <img
                                  src={image}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => removeImage(index, "upload")}
                                  data-testid={`button-remove-upload-${index}`}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                {index === 0 && (
                                  <Badge className="absolute bottom-2 left-2 bg-blue-600">
                                    Main Image
                                  </Badge>
                                )}
                              </div>
                            ))}

                            {/* Existing URL images */}
                            {imageUrls.map((url, index) => (
                              <div
                                key={index}
                                className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                              >
                                <img
                                  src={url}
                                  alt={`URL ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => removeImage(index, "url")}
                                  data-testid={`button-remove-url-${index}`}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <Badge className="absolute bottom-2 left-2 bg-green-600">
                                  <Link2 className="h-3 w-3 mr-1" />
                                  {editMode ? "Existing" : "URL"}
                                </Badge>
                              </div>
                            ))}

                            {/* Upload button */}
                            {uploadedImages.length + imageUrls.length < 8 && (
                              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">
                                  {t("seller.product.images.upload")}
                                </span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  data-testid="input-image-upload"
                                />
                              </label>
                            )}
                          </div>

                          {/* Add by URL */}
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              {t("seller.product.images.addUrl")}
                            </h4>
                            <div className="flex gap-2">
                              <Input
                                placeholder={t(
                                  "seller.product.images.urlPlaceholder"
                                )}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    addImageUrl(input.value);
                                    input.value = "";
                                  }
                                }}
                                data-testid="input-image-url"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                  const input = (e.target as HTMLElement)
                                    .previousElementSibling as HTMLInputElement;
                                  addImageUrl(input.value);
                                  input.value = "";
                                }}
                                data-testid="button-add-image-url"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">
                              {t("seller.product.images.recommendations.title")}
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>
                                {t(
                                  "seller.product.images.recommendations.format"
                                )}
                              </li>
                              <li>
                                {t(
                                  "seller.product.images.recommendations.size"
                                )}
                              </li>
                              <li>
                                {t(
                                  "seller.product.images.recommendations.background"
                                )}
                              </li>
                              <li>
                                {t(
                                  "seller.product.images.recommendations.watermark"
                                )}
                              </li>
                              <li>
                                {t(
                                  "seller.product.images.recommendations.maxSize"
                                )}
                              </li>
                            </ul>
                          </div>

                          <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <FormLabel>{t("products.isFeatured")}</FormLabel>

                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Specifications Tab - Category defined fields only */}
                <TabsContent value="specifications" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
  <CardTitle>{t("products.technicalSpecifications")}</CardTitle>
  <p className="text-sm text-gray-600">
    {t("products.technicalSpecificationsDescription")}
  </p>
</CardHeader>

                    <CardContent className="space-y-6">
                     {!selectedCategory && (
  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-600 mb-4">
      {t("product.selectCategoryFirst")}
    </p>
  </div>
)}


                     {selectedCategory && categoryFeatures.length === 0 && (
  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-600 mb-4">
      {t("product.noSpecificationsForCategory")}
    </p>
  </div>
)}


                      {selectedCategory && categoryFeatures.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {categoryFeatures.map(
                            (feature: any, index: number) => (
                              <FormField
                                key={feature.id}
                                control={form.control}
                                name={`specifications.${index}.featureValue`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      {feature.name}
                                      {feature.isRequired && (
                                        <span className="text-red-500 text-sm">
                                          *
                                        </span>
                                      )}
                                    </FormLabel>
                                    <FormControl>
                                      {feature.type === "select" ? (
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <SelectTrigger
                                            data-testid={`select-spec-${index}`}
                                          >
                                            <SelectValue
                                              placeholder={`Select ${feature.name.toLowerCase()}`}
                                            />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {(feature.options || []).map(
                                              (option: string) => (
                                                <SelectItem
                                                  key={option}
                                                  value={option}
                                                >
                                                  {option}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      ) : feature.type === "color" ? (
                                        <div className="flex gap-2">
                                          <Input
                                            {...field}
                                            placeholder={
                                              feature.value ||
                                              `Ex: Red, Blue, Green`
                                            }
                                            data-testid={`input-spec-${index}`}
                                            className="flex-1"
                                          />
                                          <input
                                            type="color"
                                            onChange={(e) =>
                                              field.onChange(e.target.value)
                                            }
                                            value={field.value || "#000000"}
                                            className="w-12 h-10 rounded border border-gray-300"
                                          />
                                        </div>
                                      ) : feature.type === "number" ? (
                                        <Input
                                          {...field}
                                          type="number"
                                          placeholder={
                                            feature.value ||
                                            `Enter ${feature.name.toLowerCase()}`
                                          }
                                          data-testid={`input-spec-${index}`}
                                        />
                                      ) : feature.type === "url" ? (
                                        <Input
                                          {...field}
                                          type="url"
                                          placeholder={
                                            feature.value ||
                                            `https://example.com`
                                          }
                                          data-testid={`input-spec-${index}`}
                                        />
                                      ) : (
                                        <Input
                                          {...field}
                                          placeholder={
                                            feature.value ||
                                            `Enter ${feature.name.toLowerCase()}`
                                          }
                                          data-testid={`input-spec-${index}`}
                                        />
                                      )}
                                    </FormControl>
                                    {feature.value && (
                                      <p className="text-sm text-gray-500">
  {t("product.example")}: {feature.value}
</p>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        {t("product.frequentlyAskedQuestions")}
      </CardTitle>
      <p className="text-sm text-gray-600 mt-1">
        {t("product.addFaqDescription")}
      </p>
    </div>
    <Button
      type="button"
      variant="outline"
      onClick={() => appendFaq({ question: "", answer: "" })}
      data-testid="button-add-faq"
    >
      <Plus className="h-4 w-4 mr-2" />
      {t("common.add")}
    </Button>
  </div>
</CardHeader>

                    <CardContent className="space-y-6">
                      {faqFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-4 border rounded-lg space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">FAQ #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFaq(index)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-remove-faq-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`faqs.${index}.question`}
                            render={({ field }) => (
                              <FormItem>
  <FormLabel>{t("product.faqQuestion")}:</FormLabel>
  <FormControl>
    <Input
      {...field}
      placeholder={t("product.faqQuestionPlaceholder")}
      data-testid={`input-faq-question-${index}`}
    />
  </FormControl>
  <FormMessage />
</FormItem>

                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`faqs.${index}.answer`}
                            render={({ field }) => (
                              <FormItem>
  <FormLabel>{t("product.faqAnswer")}:</FormLabel>
  <FormControl>
    <Textarea
      {...field}
      placeholder={t("product.faqAnswerPlaceholder")}
      rows={3}
      data-testid={`textarea-faq-answer-${index}`}
    />
  </FormControl>
  <FormMessage />
</FormItem>

                            )}
                          />
                        </div>
                      ))}

                      {faqFields.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  <p className="text-gray-600 mb-4">
    {t("product.noFaqsAddedYet")}
  </p>
  <Button
    type="button"
    variant="outline"
    onClick={() => appendFaq({ question: "", answer: "" })}
    data-testid="button-add-first-faq"
  >
    <Plus className="h-4 w-4 mr-2" />
    {t("product.addAnotherQuestion")}
  </Button>
</div>

                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  data-testid="button-cancel"
                >
                  {t("seller.product.images.cancel")}
                </Button>

                <div className="flex items-center gap-4">


                  <Button
                    type="submit"
                    disabled={isLoading}
                    data-testid="button-publish"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading
                      ? t("seller.product.images.publishing")
                      : t("seller.product.images.publish")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
