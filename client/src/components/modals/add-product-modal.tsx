import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
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
import { Plus, X, Package, Store, Upload } from "lucide-react";

const addProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  vendorId: z.string().min(1, "Store is required"),
  brand: z.string().optional(),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  specifications: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .default([]),
  translations: z
    .object({
      en: z
        .object({
          name: z.string().optional(),
          description: z.string().optional(),
          shortDescription: z.string().optional(),
        })
        .optional(),
      fr: z
        .object({
          name: z.string().optional(),
          description: z.string().optional(),
          shortDescription: z.string().optional(),
        })
        .optional(),
      ar: z
        .object({
          name: z.string().optional(),
          description: z.string().optional(),
          shortDescription: z.string().optional(),
        })
        .optional(),
    })
    .partial()
    .optional(),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean; // NEW
  initialData?: Partial<AddProductFormData> & { id: string };
}

interface Store {
  id: string;
  name: string;
  ownerId: string;
  status: string;
  user?: {
    username: string;
    email: string;
  };
}

interface Category {
  id: string;
  type: string;
  slug: string;
  icon: string;
  translations: {
    [key: string]: {
      name: string;
      description?: string;
    };
  };
}

export default function AddProductModal({
  isOpen,
  onClose,
  isEdit = false,
  initialData,
}: AddProductModalProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images || []
  );
  const [specifications, setSpecifications] = useState(
    initialData?.specifications || []
  );
  const [faqs, setFaqs] = useState(initialData?.faqs || []);
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: isEdit
      ? {
          ...initialData,
          name: initialData?.translations?.en?.name || initialData?.name || "",
          description:
            initialData?.translations?.en?.description ||
            initialData?.description ||
            "",
          shortDescription:
            initialData?.translations?.en?.shortDescription ||
            initialData?.shortDescription ||
            "",
        }
      : {
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
      if (!response.ok) throw new Error(t("sellers.fetchFailed"));
      return response.json();
    },
    enabled: isOpen,
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/categories"],
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: async (data: AddProductFormData) => {
      const payload = {
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
      };

      const url = isEdit
        ? `/api/admin/products/${initialData?.id}`
        : "/api/admin/products";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("products.saveFailed"));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/sellers-with-products"],
      });
      toast({
        title: t("common.success"),
        description: isEdit
          ? t("products.updateSuccess")
          : t("products.createSuccess"),
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message || t("products.saveFailed"),
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

  // const onSubmit = (data: AddProductFormData) => {
  //   createProductMutation.mutate(data);
  // };

  const onSubmit = (data: AddProductFormData) => {
    mutation.mutate(data);
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
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

      if (!response.ok) throw new Error(t("products.imageUploadFailed"));

      const result = await response.json();
      const newUrls = result.files.map((file: any) => file.path);
      setImageUrls([...imageUrls, ...newUrls]);

      toast({
        title: t("common.success"),
        description: t("products.imageUploadSuccess", {
          count: result.files.length,
        }),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("products.imageUploadFailed"),
        variant: "destructive",
      });
    }
  };

  const addImageUrl = () => {
    const newUrl = prompt(t("products.enterImageUrl"));
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

  const updateSpecification = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="mx-auto h-12 w-12 text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold">
                {t("products.basicInfo.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("products.basicInfo.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.fields.name")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.placeholders.name")}
                        {...field}
                        data-testid="input-product-name"
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
                    <FormLabel>{t("products.fields.sku")} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.placeholders.sku")}
                        {...field}
                        data-testid="input-product-sku"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.fields.price")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        data-testid="input-product-price"
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
                    <FormLabel>{t("products.fields.originalPrice")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        data-testid="input-product-original-price"
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
                    <FormLabel>{t("products.fields.stock")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        data-testid="input-product-stock"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.fields.brand")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("products.placeholders.brand")}
                        {...field}
                        data-testid="input-product-brand"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("products.fields.shortDescription")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("products.placeholders.shortDescription")}
                      {...field}
                      data-testid="input-product-short-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("products.fields.description")} *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("products.placeholders.description")}
                      rows={4}
                      {...field}
                      data-testid="textarea-product-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Store className="mx-auto h-12 w-12 text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold">
                {t("products.storeCategory.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("products.storeCategory.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.fields.seller")} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-seller">
                          <SelectValue
                            placeholder={t("products.placeholders.seller")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sellers
                          .filter((seller: any) => seller.role === "seller")
                          .map((seller: any) => (
                            <SelectItem key={seller.id} value={seller.id}>
                              <div className="flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">
                                    {`${seller.firstName} ${seller.lastName}`.trim() ||
                                      seller.username}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {seller.username} • {seller.email}
                                  </div>
                                </div>
                              </div>
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.fields.category")} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue
                            placeholder={t("products.placeholders.category")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories
                          .filter((cat: Category) => cat.type === "standard")
                          .map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span>
                                  {category.translations?.[i18n.language]
                                    ?.name ||
                                    category.translations?.en?.name ||
                                    category.slug}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Product Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("products.fields.featured")}
                      </FormLabel>
                      <FormDescription>
                        {t("products.descriptions.featured")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-featured"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("products.fields.active")}
                      </FormLabel>
                      <FormDescription>
                        {t("products.descriptions.active")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t("products.fields.images")}</Label>
                <div className="flex gap-2">
                  <div className="relative">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="button-upload-image"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("products.buttons.uploadImages")}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrl}
                    data-testid="button-add-image-url"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("products.buttons.addUrl")}
                  </Button>
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={t("products.alt.image", { index: index + 1 })}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImageUrl(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="mx-auto h-12 w-12 text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold">
                {t("products.additional.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("products.additional.subtitle")}
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t("products.fields.specifications")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecification}
                  data-testid="button-add-specification"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("products.buttons.addSpecification")}
                </Button>
              </div>

              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={t("products.placeholders.specName")}
                    value={spec.name}
                    onChange={(e) =>
                      updateSpecification(index, "name", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder={t("products.placeholders.specValue")}
                    value={spec.value}
                    onChange={(e) =>
                      updateSpecification(index, "value", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
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
                <Label>{t("products.fields.faqs")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFaq}
                  data-testid="button-add-faq"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("products.buttons.addFaq")}
                </Button>
              </div>

              {faqs.map((faq, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label>
                      {t("products.fields.faqNumber", { number: index + 1 })}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFaq(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder={t("products.placeholders.faqQuestion")}
                    value={faq.question}
                    onChange={(e) =>
                      updateFaq(index, "question", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder={t("products.placeholders.faqAnswer")}
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("products.editProduct") : t("products.addNewProduct")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("products.updateProductDetails")
              : t("products.createNewProductDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 3) {
                form.handleSubmit(onSubmit)(e);
              }
            }}
            className="space-y-6"
          >
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? "bg-blue-600 text-white"
                        : step < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        step < currentStep ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {getStepContent()}

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    data-testid="button-previous"
                  >
                    {t("common.previous")}
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  data-testid="button-cancel"
                >
                  {t("common.cancel")}
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    data-testid="button-next"
                  >
                    {t("common.next")}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    data-testid="button-save"
                  >
                    {mutation.isPending
                      ? isEdit
                        ? t("products.updating")
                        : t("products.creating")
                      : isEdit
                      ? t("products.updateProduct")
                      : t("products.createProduct")}
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
