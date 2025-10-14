export interface TemplateFeature {
  key: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'url';
  defaultValue?: any;
  options?: string[];
  group: string;
  description?: string;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  features: TemplateFeature[];
}

export const categoryTemplates: CategoryTemplate[] = [
  {
    id: 'automobile',
    name: 'Automobile',
    description: 'Designed for automotive configuration for...',
    icon: '🚗',
    color: 'bg-blue-500',
    tags: ['Comparison', 'Year/Price Filters', 'Test drive'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'cards',
        options: ['cards', 'list', 'grid'],
        group: 'Display & Design'
      },
      {
        key: 'primary_color',
        name: 'primary_color',
        type: 'color',
        defaultValue: '#1D4ED8',
        group: 'Display & Design'
      },
      {
        key: 'enable_comparison',
        name: 'enable_comparison',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'show_year_filter',
        name: 'show_year_filter',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'show_price_filter',
        name: 'show_price_filter',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'brand_showcase',
        name: 'brand_showcase',
        type: 'select',
        defaultValue: 'BMW, Audi',
        options: ['BMW', 'Audi', 'Mercedes', 'Toyota'],
        group: 'Brands & Categorizations'
      }
    ]
  },
  {
    id: 'real_estate',
    name: 'Real estate',
    description: 'Templates for real estate sector...',
    icon: '🏠',
    color: 'bg-green-500',
    tags: ['Map view', 'Surface/Rooms', 'Energy'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'cards',
        options: ['cards', 'list', 'map'],
        group: 'Display & Design'
      },
      {
        key: 'enable_map_view',
        name: 'enable_map_view',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'show_surface_filter',
        name: 'show_surface_filter',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'show_rooms_filter',
        name: 'show_rooms_filter',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'energy_class',
        name: 'energy_class',
        type: 'select',
        defaultValue: 'A+',
        options: ['A+', 'A', 'B', 'C', 'D'],
        group: 'Brands & Categorizations'
      }
    ]
  },
  {
    id: 'electronic',
    name: 'Electronic',
    description: 'For electronic products with...',
    icon: '📱',
    color: 'bg-purple-500',
    tags: ['Technical specifications', 'Comparison', 'Compatibility'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'grid',
        options: ['cards', 'list', 'grid'],
        group: 'Display & Design'
      },
      {
        key: 'show_specifications',
        name: 'show_specifications',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'enable_comparison',
        name: 'enable_comparison',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'compatibility_check',
        name: 'compatibility_check',
        type: 'boolean',
        defaultValue: false,
        group: 'Filters & Navigation'
      }
    ]
  },
  {
    id: 'household_appliances',
    name: 'Household appliances',
    description: 'Designed for household appliance...',
    icon: '🧠',
    color: 'bg-cyan-500',
    tags: ['Energy class', 'Facility', 'Guarantee'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'cards',
        options: ['cards', 'list'],
        group: 'Display & Design'
      },
      {
        key: 'show_energy_rating',
        name: 'show_energy_rating',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'warranty_info',
        name: 'warranty_info',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      }
    ]
  },
  {
    id: 'clothes',
    name: 'Clothes',
    description: 'Suitable for clothing with filtering by size...',
    icon: '👕',
    color: 'bg-pink-500',
    tags: ['Size guide', 'Virtual try-on', 'Materials'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'grid',
        options: ['cards', 'list', 'grid'],
        group: 'Display & Design'
      },
      {
        key: 'size_guide',
        name: 'size_guide',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'virtual_try_on',
        name: 'virtual_try_on',
        type: 'boolean',
        defaultValue: false,
        group: 'Filters & Navigation'
      }
    ]
  },
  {
    id: 'sports_leisure',
    name: 'Sports & Leisure',
    description: 'For sports equipment with features by sport...',
    icon: '⚽',
    color: 'bg-orange-500',
    tags: ['By sport', 'Video Demos', 'Level'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'cards',
        options: ['cards', 'list'],
        group: 'Display & Design'
      },
      {
        key: 'sport_category',
        name: 'sport_category',
        type: 'select',
        defaultValue: 'Football',
        options: ['Football', 'Basketball', 'Tennis', 'Swimming'],
        group: 'Brands & Categorizations'
      },
      {
        key: 'skill_level',
        name: 'skill_level',
        type: 'select',
        defaultValue: 'Beginner',
        options: ['Beginner', 'Intermediate', 'Advanced'],
        group: 'Filters & Navigation'
      }
    ]
  },
  {
    id: 'furniture_decor',
    name: 'Furniture & Decor',
    description: 'Furniture template with advanced...',
    icon: '🪑',
    color: 'bg-yellow-600',
    tags: ['Dimensions', 'Style', 'Materials'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'grid',
        options: ['cards', 'list', 'grid'],
        group: 'Display & Design'
      },
      {
        key: 'show_dimensions',
        name: 'show_dimensions',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'material_filter',
        name: 'material_filter',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      }
    ]
  },
  {
    id: 'beauty_cosmetics',
    name: 'Beauty & Cosmetics',
    description: 'Optimized for beauty products with filters...',
    icon: '💄',
    color: 'bg-purple-400',
    tags: ['Skin type', 'Ingredients', 'Tutorials'],
    features: [
      {
        key: 'display_style',
        name: 'display_style',
        type: 'select',
        defaultValue: 'cards',
        options: ['cards', 'grid'],
        group: 'Display & Design'
      },
      {
        key: 'skin_type_filter',
        name: 'skin_type_filter',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      },
      {
        key: 'ingredients_display',
        name: 'ingredients_display',
        type: 'boolean',
        defaultValue: true,
        group: 'Filters & Navigation'
      }
    ]
  }
];

export const getTemplateById = (id: string): CategoryTemplate | undefined => {
  return categoryTemplates.find(template => template.id === id);
};

export const mergeTemplateFeatures = (templateIds: string[]): TemplateFeature[] => {
  const allFeatures: TemplateFeature[] = [];
  const seenKeys = new Set<string>();

  templateIds.forEach(templateId => {
    const template = getTemplateById(templateId);
    if (template) {
      template.features.forEach(feature => {
        if (!seenKeys.has(feature.key)) {
          allFeatures.push({ ...feature });
          seenKeys.add(feature.key);
        }
      });
    }
  });

  return allFeatures;
};

export const groupFeaturesByCategory = (features: TemplateFeature[]) => {
  return features.reduce((groups, feature) => {
    const group = feature.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(feature);
    return groups;
  }, {} as Record<string, TemplateFeature[]>);
};