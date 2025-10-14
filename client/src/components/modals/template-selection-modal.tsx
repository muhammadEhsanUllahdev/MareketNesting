import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import {
  categoryTemplates,
  CategoryTemplate,
  TemplateFeature,
} from "../../data/categoryTemplates";

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplates: (features: TemplateFeature[]) => void;
  selectedTemplateIds?: string[];
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  onApplyTemplates,
  selectedTemplateIds = [],
}: TemplateSelectionModalProps) {
  const [selectedTemplates, setSelectedTemplates] =
    useState<string[]>(selectedTemplateIds);

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/admin/categories"],
    enabled: isOpen,
  });

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId],
    );
  };

  const handleApplyTemplate = () => {
    // Merge features from all selected templates and categories
    const allFeatures: TemplateFeature[] = [];
    const seenKeys = new Set<string>();

    selectedTemplates.forEach((templateId) => {
      // Handle predefined templates
      if (!templateId.startsWith("category-")) {
        const template = categoryTemplates.find((t) => t.id === templateId);
        if (template) {
          template.features.forEach((feature) => {
            if (!seenKeys.has(feature.key)) {
              allFeatures.push({ ...feature });
              seenKeys.add(feature.key);
            }
          });
        }
      } else {
        // Handle category features
        const categoryId = templateId.replace("category-", "");
        const category = categories.find((c: any) => c.id === categoryId);
        if (category && category.features) {
          category.features.forEach((feature: any) => {
            if (!seenKeys.has(feature.name)) {
              allFeatures.push({
                key: feature.name,
                type: feature.type,
                default_value: feature.value || "",
                description: `Feature from ${category.translations?.[0]?.name || "category"}`,
                category: "category_features",
              });
              seenKeys.add(feature.name);
            }
          });
        }
      }
    });

    onApplyTemplates(allFeatures);
    onClose();
  };

  const handleBackToProperties = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              Select a template to pre-populate your supercategory metadata
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Each template contains optimized configurations for a specific
            product type.
          </p>
        </DialogHeader>

        {/* Templates Section */}
        <div className="space-y-6 p-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Predefined Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryTemplates.map((template) => {
                const isSelected = selectedTemplates.includes(template.id);

                return (
                  <div
                    key={template.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleTemplate(template.id)}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Template icon */}
                    <div
                      className={`w-full h-24 ${template.color} rounded-lg flex items-center justify-center text-white text-3xl mb-3`}
                    >
                      {template.icon}
                    </div>

                    {/* Template info */}
                    <h3 className="font-semibold text-lg mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Features count */}
                    <div className="text-xs text-gray-500">
                      {template.features.length} features
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories Section */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Available Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category: any) => {
                  const categoryName =
                    category.translations?.[0]?.name || "Unnamed Category";
                  const description =
                    category.translations?.[0]?.description || "";
                  const isSelected = selectedTemplates.includes(
                    `category-${category.id}`,
                  );

                  return (
                    <div
                      key={category.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleTemplate(`category-${category.id}`)}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {/* Category icon */}
                      {/* <div className="w-full h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white text-2xl mb-3">
                        {category.icon || "📦"}
                      </div> */}
                      <div
                        className="w-full h-16 rounded-lg flex items-center justify-center text-white text-2xl mb-3"
                        style={{
                          backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                        }}
                      >
                        {(category.icon || "📦")
                          .toString()
                          .charAt(0)
                          .toUpperCase() +
                          (category.icon || "📦").toString().slice(1)}
                      </div>

                      {/* Category info */}
                      <h3 className="font-semibold text-base mb-2">
                        {categoryName}
                      </h3>
                      {description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {description}
                        </p>
                      )}

                      {/* Features count - simulated for now */}
                      <div className="text-xs text-gray-500">
                        {category.features.length} features
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center p-4 border-t">
          <Button variant="outline" onClick={handleBackToProperties}>
            Back to properties
          </Button>

          <div className="flex gap-2">
            <span className="text-sm text-gray-600 self-center">
              {selectedTemplates.length} template(s) selected
            </span>
            <Button
              onClick={handleApplyTemplate}
              disabled={selectedTemplates.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply this template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
