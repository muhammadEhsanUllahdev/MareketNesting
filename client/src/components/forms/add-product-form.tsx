import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Check,
  Package,
  Image as ImageIcon,
  FileText,
  Star,
  X,
  Plus,
  Save,
  Eye,
} from "lucide-react";

const SUPPORTED_LANGS = ["en", "fr", "ar"] as const;

const addProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be positive"),
  stockQuantity: z.number().min(0, "Stock must be positive"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  referenceUrl: z.string().url().optional().or(z.literal("")),
  productNumber: z.string().optional(),
  color: z.string().optional(),
  colorFamily: z.string().optional(),
  displaySize: z.string().optional(),
  dimensions: z.string().optional(),
  highlights: z.string().optional(),
  images: z.array(z.string()).max(8, "Maximum 8 images allowed"),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

interface AddProductFormProps {
  onSubmit: (data: AddProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddProductForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: AddProductFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("general");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      price: "" as any,
      stockQuantity: "" as any,
      description: "",
      categoryId: "",
      referenceUrl: "",
      productNumber: "",
      color: "",
      colorFamily: "",
      displaySize: "",
      dimensions: "",
      highlights: "",
      images: [],
    },
  });

  const handleSubmit = (data: AddProductFormData) => {
    onSubmit({ ...data, images: uploadedImages });
  };

  const calculateProgress = () => {
    const values = form.getValues();
    let completed = 0;
    const total = 4;

    // General info
    if (values.name && values.price > 0 && values.categoryId) completed++;
    // Description
    if (values.description && values.description.length >= 10) completed++;
    // Images
    if (uploadedImages.length > 0) completed++;
    // Reviews (optional, so count as completed)
    completed++;

    return (completed / total) * 100;
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (uploadedImages.length + files.length > 8) {
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

      loadingToast.dismiss();
      toast({
        title: t("addProduct.toast.success.title"),
        description: t("addProduct.toast.success.description", {
          count: files.length,
        }),
      });
    } catch (error) {
      loadingToast.dismiss();
      console.error("Error uploading images:", error);
      toast({
        title: t("addProduct.toast.error.title"),
        description: t("addProduct.toast.error.description"),
        variant: "destructive",
      });
    }

    // Reset file input
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const renderImageSlots = () => {
    const slots = Array.from({ length: 8 }, (_, index) => {
      const hasImage = uploadedImages[index];

      return (
        <div key={index} className="relative">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
            {hasImage ? (
              <>
                <img
                  src={uploadedImages[index]}
                  alt={t("addProduct.image.alt", { index: index + 1 })}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : index === 0 || uploadedImages[index - 1] ? (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Plus className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 text-center">
                  {index === 0
                    ? t("addProduct.image.main")
                    : t("addProduct.image.label", { index: index + 1 })}
                </span>
              </label>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-300 mb-1" />
                <span className="text-xs text-gray-400 text-center">
                  {t("addProduct.image.placeholder", { index: index + 1 })}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    });

    return slots;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("addProduct.heading")}
          </h1>
          <p className="text-gray-600 mt-1">{t("addProduct.subheading")}</p>
        </div>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Package className="h-5 w-5 mr-2" />
            {t("addProduct.progress.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={calculateProgress()} className="w-full" />
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    form.watch("name") &&
                    form.watch("price") > 0 &&
                    form.watch("categoryId")
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  {form.watch("name") &&
                    form.watch("price") > 0 &&
                    form.watch("categoryId") && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                </div>
                <span className="text-sm text-gray-600">
                  {t("addProduct.progress.general")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    form.watch("description") &&
                    form.watch("description").length >= 10
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  {form.watch("description") &&
                    form.watch("description").length >= 10 && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                </div>
                <span className="text-sm text-gray-600">
                  {t("addProduct.progress.description")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    uploadedImages.length > 0 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {uploadedImages.length > 0 && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {t("addProduct.progress.images")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">
                  {t("addProduct.progress.reviews")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                {" "}
                {t("addProduct.tabs.general")}
              </TabsTrigger>
              <TabsTrigger value="images">
                {t("addProduct.tabs.images")}
              </TabsTrigger>
              <TabsTrigger value="details">
                {t("addProduct.tabs.details")}
              </TabsTrigger>
              <TabsTrigger value="description">
                {t("addProduct.tabs.description")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("product.card.basicInfo.title")}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {t("product.card.basicInfo.subtitle")}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("product.form.name.label")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("product.form.name.placeholder")}
                              {...field}
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
                          <FormLabel>{t("product.form.price.label")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={t("product.form.price.placeholder")}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? "" : parseFloat(value) || 0
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("product.form.stockQuantity.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t(
                                "product.form.stockQuantity.placeholder"
                              )}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? "" : parseInt(value) || 0
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="referenceUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("product.form.referenceUrl.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "product.form.referenceUrl.placeholder"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("product.form.category.label")}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "product.form.category.placeholder"
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="electronics">
                                {t("product.form.category.electronics")}
                              </SelectItem>
                              <SelectItem value="clothing">
                                {t("product.form.category.clothing")}
                              </SelectItem>
                              <SelectItem value="home">
                                {t("product.form.category.home")}
                              </SelectItem>
                              <SelectItem value="sports">
                                {t("product.form.category.sports")}
                              </SelectItem>
                              <SelectItem value="books">
                                {t("product.form.category.books")}
                              </SelectItem>
                              <SelectItem value="health">
                                {t("product.form.category.health")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("product.form.productNumber.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "product.form.productNumber.placeholder"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("product.card.images.title")}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {t("product.card.addimages.subtitle")}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      {renderImageSlots()}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {t("product.images.recommendations.title")}
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• {t("product.images.recommendations.format")}</li>
                        <li>
                          • {t("product.images.recommendations.resolution")}
                        </li>
                        <li>
                          •{" "}
                          {t("product.images.recommendations.backgroundLight")}
                        </li>
                        <li>
                          •{" "}
                          {t(
                            "product.images.recommendations.backgroundNeutral"
                          )}
                        </li>
                        <li>• {t("product.images.recommendations.quality")}</li>
                        <li>• {t("product.images.recommendations.focus")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("product.card.appearanceDimensions.title")}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {t("product.card.appearanceDimensions.subtitle")}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("product.form.color.label")}</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Red" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colorFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("product.form.colorFamily.label")}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Ex: Red" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="red">
                                {t("product.form.color.red")}
                              </SelectItem>
                              <SelectItem value="blue">
                                {t("product.form.color.blue")}
                              </SelectItem>
                              <SelectItem value="green">
                                {t("product.form.color.green")}
                              </SelectItem>
                              <SelectItem value="yellow">
                                {t("product.form.color.yellow")}
                              </SelectItem>
                              <SelectItem value="black">
                                {t("product.form.color.black")}
                              </SelectItem>
                              <SelectItem value="white">
                                {t("product.form.color.white")}
                              </SelectItem>
                              <SelectItem value="gray">
                                {t("product.form.color.gray")}
                              </SelectItem>
                              <SelectItem value="brown">
                                {t("product.form.color.brown")}
                              </SelectItem>
                              <SelectItem value="orange">
                                {t("product.form.color.orange")}
                              </SelectItem>
                              <SelectItem value="purple">
                                {t("product.form.color.purple")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="displaySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("product.form.displaySize.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "product.form.displaySize.placeholder"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dimensions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("product.form.dimensions.label")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t(
                                "product.form.dimensions.placeholder"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("product.card.descriptionHighlights.title")}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {t("product.card.descriptionHighlights.subtitle")}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("product.form.description.label")}
                        </FormLabel>
                        <FormControl>
                          <ReactQuill
                            theme="snow"
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder={t(
                              "product.form.description.placeholder"
                            )}
                            modules={{
                              toolbar: [
                                [{ header: [1, 2, 3, false] }],
                                ["bold", "italic", "underline"],
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["link", "clean"],
                              ],
                            }}
                            style={{ height: "200px", marginBottom: "50px" }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="highlights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("product.form.highlights.label")}
                        </FormLabel>
                        <FormControl>
                          <ReactQuill
                            theme="snow"
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder={t(
                              "product.form.highlights.placeholder"
                            )}
                            modules={{
                              toolbar: [
                                [{ header: [1, 2, 3, false] }],
                                ["bold", "italic", "underline"],
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["link", "clean"],
                              ],
                            }}
                            style={{ height: "150px" }}
                            className="mb-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("addProduct.actions.cancel")}
            </Button>
            <div className="flex space-x-3">
              <Button type="button" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {t("addProduct.actions.preview")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading
                  ? t("addProduct.actions.saving")
                  : t("addProduct.actions.save")}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
