import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  Package,
  Store,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
const { t, i18n } = useTranslation();
const editProductSchema = z.object({
  name: z.string().min(1, t("validation.productNameRequired")),
  description: z.string().min(10, t("validation.descriptionMin")),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, t("validation.skuRequired")),
  price: z.string().min(1, t("validation.priceRequired")),
  originalPrice: z.string().optional(),
  stock: z.number().min(0, t("validation.stockNonNegative")),
  categoryId: z.string().min(1, t("validation.categoryRequired")),
  vendorId: z.string().min(1, t("validation.storeRequired")),

  brand: z.string().optional(),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  specifications: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .default([]),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
  category: string;
  categoryId?: string;
  categoryName?: string;
  vendorId?: string;
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
      shortDescription?: string;
    };
  };
}

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function EditProductModal({
  product,
  onClose,
}: EditProductModalProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<
    Array<{ name: string; value: string }>
  >([]);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    [],
  );
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      sku: "",
      price: "",
      originalPrice: "",
      stock: 0,
      categoryId: "",
      vendorId: "",
      brand: "",
      images: [],
      isFeatured: false,
      isActive: true,
      specifications: [],
      faqs: [],
    },
  });

  // Fetch sellers from users table (role: seller)
  const { data: sellers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users?role=seller"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users?role=seller", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(t("errors.fetchSellersFailed"));
      return response.json();
    },
    enabled: !!product,
  });


  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/categories"],
    enabled: !!product,
  });

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.translations?.en?.name || "",
        description: product.translations?.en?.description || "",
        shortDescription: product.translations?.en?.shortDescription || "",
        sku: product.sku || "",
        price: product.price || "",
        originalPrice: "",
        stock: product.stock || 0,
        categoryId: product.categoryId || "",
        vendorId: product.vendorId || "",
        brand: "",
        images: product.images || [],
        isFeatured: false,
        isActive: product.isActive || true,
        specifications: product.specifications || [],
        faqs: product.faqs || [],
      });

      setImageUrls(product.images || []);
      setSpecifications(product.specifications || []);
      setFaqs(product.faqs || []);
      setCurrentStep(1);
    }
  }, [product, form]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: EditProductFormData) => {
      if (!product) throw new Error(t("errors.noProductToUpdate"));

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          images: imageUrls,
          specifications,
          faqs,
          translations: {
            en: {
              name: data.name,
              description: data.description,
              shortDescription: data.shortDescription,
            },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("errors.failedToUpdateProduct"));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/sellers-with-products"],
      });
      toast({
        title: t("common.success"),
        description: t("products.updateSuccess"),
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message || t("errors.failedToUpdateProduct"),
        variant: "destructive",
      });
    },
  });


  const handleClose = () => {
    form.reset();
    setImageUrls([]);
    setSpecifications([]);
    setFaqs([]);
    setCurrentStep(1);
    onClose();
  };

  const onSubmit = (data: EditProductFormData) => {
    updateProductMutation.mutate(data);
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch("/api/upload/images", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error(t("errors.failedToUploadImages"));

      const result = await response.json();
      const newUrls = result.files.map((file: any) => file.path);
      setImageUrls([...imageUrls, ...newUrls]);

      toast({
        title: t("common.success"),
        description: t("images.uploadSuccess", { count: result.files.length }),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("errors.failedToUploadImages"),
        variant: "destructive",
      });
    }

  };

  const addImageUrl = () => {
    const newUrl = prompt(t("images.enterUrl"));
    if (newUrl && newUrl.trim()) {
      setImageUrls([...imageUrls, newUrl.trim()]);
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { name: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    const updated = specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec,
    );
    setSpecifications(updated);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    const updated = faqs.map((faq, i) =>
      i === index ? { ...faq, [field]: value } : faq,
    );
    setFaqs(updated);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToStep2 = () => {
    const basicFields = form.getValues();
    return (
      basicFields.name &&
      basicFields.description &&
      basicFields.sku &&
      basicFields.price &&
      basicFields.categoryId &&
      basicFields.vendorId
    );
  };

  const canSubmit = () => {
    return canProceedToStep2() && currentStep === 3;
  };

  const getFilteredCategories = () => {
    return categories.filter((cat) => cat.type === "standard");
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t("products.edit.title")}
          </DialogTitle>
          <DialogDescription>
            {t("products.edit.description", { step: currentStep })}
          </DialogDescription>
        </DialogHeader>


        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              aria-label={t("products.steps.step1")}
            >
              {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className="flex-1 h-1 bg-gray-200">
              <div
                className={`h-full ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                  } transition-all duration-300`}
              />
            </div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              aria-label={t("products.steps.step2")}
            >
              {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <div className="flex-1 h-1 bg-gray-200">
              <div
                className={`h-full ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
                  } transition-all duration-300`}
              />
            </div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              aria-label={t("products.steps.step3")}
            >
              3
            </div>
          </div>
        </div>


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("products.form.basicInfo")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("products.form.name")} *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t("products.form.enterName")} />
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
                        <FormLabel>{t("products.form.sku")} *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t("products.form.enterSku")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("products.form.description")} *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("products.form.enterDescription")}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("products.form.shortDescription")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("products.form.enterShortDescription")}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("products.form.price")} *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("products.form.enterPrice")}
                            type="number"
                            step="0.01"
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
                        <FormLabel>{t("products.form.stockQty")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("products.form.enterStockQty")}
                            type="number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("products.form.category")} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("products.form.selectCategory")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getFilteredCategories().map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.translations?.[i18n.language]?.name ||
                                  category.translations?.en?.name ||
                                  category.slug}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("products.form.store")} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("products.form.selectStore")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sellers.map((seller) => (
                              <SelectItem key={seller.id} value={seller.id}>
                                {seller.storeName || seller.username} ({seller.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>{t("products.form.activeStatus")}</FormLabel>
                          <FormDescription>
                            {t("products.form.activeStatusDescription")}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}


            {/* Step 2: Images */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t("products.form.productImages")}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                          <Upload className="h-4 w-4" />
                          {t("products.form.uploadImages")}
                        </div>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addImageUrl}
                    >
                      {t("products.form.addImageUrl")}
                    </Button>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={t("products.form.productImageAlt", { number: index + 1 })}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImageUrl(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Step 3: Specifications & FAQs */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">{t("products.form.specsFaqs")}</h3>

                {/* Specifications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      {t("products.form.specifications")}
                    </Label>
                    <Button type="button" onClick={addSpecification} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      {t("products.form.addSpecification")}
                    </Button>
                  </div>

                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Input
                        placeholder={t("products.form.specNamePlaceholder")}
                        value={spec.name}
                        onChange={(e) =>
                          updateSpecification(index, "name", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder={t("products.form.specValuePlaceholder")}
                        value={spec.value}
                        onChange={(e) =>
                          updateSpecification(index, "value", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSpecification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">{t("products.form.faqs")}</Label>
                    <Button type="button" onClick={addFaq} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      {t("products.form.addFaq")}
                    </Button>
                  </div>

                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <Label>{t("products.form.faqLabel", { number: index + 1 })}</Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFaq(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder={t("products.form.questionPlaceholder")}
                        value={faq.question}
                        onChange={(e) =>
                          updateFaq(index, "question", e.target.value)
                        }
                      />
                      <Textarea
                        placeholder={t("products.form.answerPlaceholder")}
                        value={faq.answer}
                        onChange={(e) =>
                          updateFaq(index, "answer", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}


            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("products.form.previous")}
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t("products.form.cancel")}
                </Button>
              </div>

              <div className="flex gap-2">
                {currentStep < 3 && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={currentStep === 1 && !canProceedToStep2()}
                    className="flex items-center gap-2"
                  >
                    {t("products.form.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button
                    type="submit"
                    disabled={updateProductMutation.isPending || !canSubmit()}
                    className="flex items-center gap-2"
                  >
                    {updateProductMutation.isPending
                      ? t("products.form.updating")
                      : t("products.form.updateProduct")}
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
