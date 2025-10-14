// Dummy data to supplement database data when needed
export const dummyOrders = [
  {
    id: "dummy-ord-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b332c902?ixlib=rb-4.0.3&w=40&h=40",
    status: "pending",
    totalAmount: "299.99",
    createdAt: "2024-08-19T10:30:00Z",
    items: [
      {
        id: "item-1",
        productName: "Wireless Bluetooth Earbuds",
        productDescription: "Premium noise-cancelling earbuds",
        quantity: 1,
        unitPrice: "149.99",
        totalPrice: "149.99"
      },
      {
        id: "item-2", 
        productName: "Phone Case",
        productDescription: "Protective silicone case",
        quantity: 1,
        unitPrice: "29.99",
        totalPrice: "29.99"
      }
    ]
  },
  {
    id: "dummy-ord-002",
    customerName: "Michael Chen",
    customerEmail: "michael.chen@email.com", 
    customerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=40&h=40",
    status: "processing",
    totalAmount: "599.98",
    createdAt: "2024-08-18T14:15:00Z",
    items: [
      {
        id: "item-3",
        productName: "Gaming Headset",
        productDescription: "Professional gaming headset with RGB",
        quantity: 2,
        unitPrice: "299.99",
        totalPrice: "599.98"
      }
    ]
  },
  {
    id: "dummy-ord-003",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.rodriguez@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=40&h=40",
    status: "shipped",
    totalAmount: "89.97",
    createdAt: "2024-08-17T09:45:00Z",
    items: [
      {
        id: "item-4",
        productName: "USB-C Cable",
        productDescription: "Fast charging cable 6ft",
        quantity: 3,
        unitPrice: "29.99",
        totalPrice: "89.97"
      }
    ]
  },
  {
    id: "dummy-ord-004",
    customerName: "David Thompson",
    customerEmail: "david.thompson@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40",
    status: "cancelled",
    totalAmount: "199.99",
    createdAt: "2024-08-16T16:20:00Z",
    items: [
      {
        id: "item-5",
        productName: "Portable Speaker",
        productDescription: "Waterproof Bluetooth speaker",
        quantity: 1,
        unitPrice: "199.99",
        totalPrice: "199.99"
      }
    ]
  },
  {
    id: "dummy-ord-005",
    customerName: "Lisa Wang",
    customerEmail: "lisa.wang@email.com",
    customerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&w=40&h=40",
    status: "completed",
    totalAmount: "449.99",
    createdAt: "2024-08-15T11:30:00Z",
    items: [
      {
        id: "item-6",
        productName: "Smart Watch",
        productDescription: "Fitness tracking smartwatch",
        quantity: 1,
        unitPrice: "449.99",
        totalPrice: "449.99"
      }
    ]
  }
];

export const dummyProducts = [
  {
    id: "dummy-prod-001",
    name: "Laptop Stand",
    price: "79.99",
    rating: "4.5",
    sales: "45 of 100 sold",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&w=100&h=100"
  },
  {
    id: "dummy-prod-002", 
    name: "Mechanical Keyboard",
    price: "149.99",
    rating: "4.8",
    sales: "32 of 75 sold",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&w=100&h=100"
  },
  {
    id: "dummy-prod-003",
    name: "Wireless Mouse",
    price: "59.99", 
    rating: "4.3",
    sales: "28 of 60 sold",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&w=100&h=100"
  },
  {
    id: "dummy-prod-004",
    name: "Monitor Stand",
    price: "39.99",
    rating: "4.2",
    sales: "15 of 40 sold", 
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&w=100&h=100"
  },
  {
    id: "dummy-prod-005",
    name: "Desk Organizer",
    price: "24.99",
    rating: "4.6",
    sales: "22 of 50 sold",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&w=100&h=100"
  }
];

export const dummyStats = {
  totalRevenue: "12,450.00",
  totalOrders: 28,
  totalProducts: 15,
  totalPromotions: 3,
  growthMetrics: {
    revenue: "+15.2%",
    orders: "+8.5%", 
    products: "+12.1%",
    promotions: "+33.3%"
  }
};

// Enhanced dummy data for dashboard charts and graphs
export const dummyChartData = {
  // Sales data for line/area charts (last 30 days)
  salesData: [
    { date: "2024-01-01", sales: 2400, orders: 12, revenue: 4800 },
    { date: "2024-01-02", sales: 1398, orders: 8, revenue: 3200 },
    { date: "2024-01-03", sales: 9800, orders: 24, revenue: 12400 },
    { date: "2024-01-04", sales: 3908, orders: 18, revenue: 7600 },
    { date: "2024-01-05", sales: 4800, orders: 22, revenue: 9800 },
    { date: "2024-01-06", sales: 3800, orders: 16, revenue: 6400 },
    { date: "2024-01-07", sales: 4300, orders: 19, revenue: 8200 },
    { date: "2024-01-08", sales: 2400, orders: 11, revenue: 4600 },
    { date: "2024-01-09", sales: 7200, orders: 28, revenue: 14200 },
    { date: "2024-01-10", sales: 5400, orders: 21, revenue: 9800 },
    { date: "2024-01-11", sales: 3200, orders: 14, revenue: 6200 },
    { date: "2024-01-12", sales: 6800, orders: 25, revenue: 11800 },
    { date: "2024-01-13", sales: 4200, orders: 17, revenue: 7400 },
    { date: "2024-01-14", sales: 5600, orders: 23, revenue: 10200 },
    { date: "2024-01-15", sales: 8200, orders: 32, revenue: 16400 },
    { date: "2024-01-16", sales: 3600, orders: 15, revenue: 6800 },
    { date: "2024-01-17", sales: 4800, orders: 20, revenue: 8600 },
    { date: "2024-01-18", sales: 6200, orders: 24, revenue: 11200 },
    { date: "2024-01-19", sales: 3800, orders: 16, revenue: 7200 },
    { date: "2024-01-20", sales: 7400, orders: 29, revenue: 13800 },
    { date: "2024-01-21", sales: 5200, orders: 22, revenue: 9400 },
    { date: "2024-01-22", sales: 4600, orders: 18, revenue: 8200 },
    { date: "2024-01-23", sales: 8600, orders: 34, revenue: 17200 },
    { date: "2024-01-24", sales: 6400, orders: 26, revenue: 12400 },
    { date: "2024-01-25", sales: 3400, orders: 14, revenue: 6400 },
    { date: "2024-01-26", sales: 5800, orders: 23, revenue: 10800 },
    { date: "2024-01-27", sales: 7200, orders: 28, revenue: 13600 },
    { date: "2024-01-28", sales: 4200, orders: 17, revenue: 7800 },
    { date: "2024-01-29", sales: 6800, orders: 27, revenue: 12800 },
    { date: "2024-01-30", sales: 9200, orders: 36, revenue: 18400 }
  ],

  // Product categories performance for pie/donut charts
  categoriesData: [
    { name: "Electronics", value: 35, sales: 18500, color: "#3B82F6" },
    { name: "Fashion", value: 25, sales: 12800, color: "#EF4444" },
    { name: "Home & Garden", value: 20, sales: 9600, color: "#10B981" },
    { name: "Sports", value: 12, sales: 6200, color: "#F59E0B" },
    { name: "Books", value: 8, sales: 3400, color: "#8B5CF6" }
  ],

  // Top products for bar charts
  topProductsData: [
    { name: "Gaming Laptop", sales: 1250, revenue: 87500 },
    { name: "Wireless Headphones", sales: 980, revenue: 49000 },
    { name: "Smart Watch", sales: 850, revenue: 42500 },
    { name: "Smartphone", sales: 720, revenue: 64800 },
    { name: "Tablet", sales: 650, revenue: 32500 },
    { name: "Camera", sales: 420, revenue: 29400 },
    { name: "Speaker", sales: 380, revenue: 15200 },
    { name: "Monitor", sales: 320, revenue: 19200 }
  ],

  // User activity data
  userActivityData: [
    { time: "00:00", active: 120 },
    { time: "01:00", active: 89 },
    { time: "02:00", active: 64 },
    { time: "03:00", active: 42 },
    { time: "04:00", active: 28 },
    { time: "05:00", active: 35 },
    { time: "06:00", active: 78 },
    { time: "07:00", active: 145 },
    { time: "08:00", active: 220 },
    { time: "09:00", active: 280 },
    { time: "10:00", active: 340 },
    { time: "11:00", active: 380 },
    { time: "12:00", active: 420 },
    { time: "13:00", active: 380 },
    { time: "14:00", active: 340 },
    { time: "15:00", active: 310 },
    { time: "16:00", active: 290 },
    { time: "17:00", active: 270 },
    { time: "18:00", active: 250 },
    { time: "19:00", active: 230 },
    { time: "20:00", active: 210 },
    { time: "21:00", active: 180 },
    { time: "22:00", active: 150 },
    { time: "23:00", active: 135 }
  ],

  // Monthly comparison data
  monthlyComparisonData: [
    { month: "Jan", thisYear: 15400, lastYear: 12300 },
    { month: "Feb", thisYear: 18200, lastYear: 14100 },
    { month: "Mar", thisYear: 22100, lastYear: 18600 },
    { month: "Apr", thisYear: 19800, lastYear: 16200 },
    { month: "May", thisYear: 24300, lastYear: 20100 },
    { month: "Jun", thisYear: 28700, lastYear: 23400 },
    { month: "Jul", thisYear: 31200, lastYear: 25800 },
    { month: "Aug", thisYear: 29600, lastYear: 24200 },
    { month: "Sep", thisYear: 26800, lastYear: 22100 },
    { month: "Oct", thisYear: 23400, lastYear: 19800 },
    { month: "Nov", thisYear: 27600, lastYear: 21200 },
    { month: "Dec", thisYear: 32800, lastYear: 26400 }
  ]
};