import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Heart,
  Clock,
  User,
  Settings,
  Users,
  BarChart3,
  Bell,
  Menu,
  X,
  MessageSquare,
  HelpCircle,
  Store,
  ChevronLeft,
  ChevronRight,
  Truck,
  Star,
  BookmarkX,
  TriangleAlert,
  Flag,
  Eye,
  Wallet,
  CreditCard,
  TrendingUp,
  Banknote,
  Gift,
  FileText,
  Layers,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  House,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  active: boolean;
  children?: { name: string; href: string }[];
}

export function DashboardSidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location] = useLocation();
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        name: t("sidebar.dashboard"),
        href: `/dashboard/${user?.role || "client"}`,
        icon: House,
        active: location === `/dashboard/${user?.role || "client"}`,
      },
    ];

    switch (user?.role) {
      case "admin":
        return [
          ...baseItems,
          {
            name: t("sidebar.user"),
            href: "/dashboard/admin/users",
            icon: Users,
            active: location.startsWith("/dashboard/admin/users"),
          },
          {
            name: t("sidebar.store"),
            href: "/dashboard/admin/stores",
            icon: Store,
            active: location.startsWith("/dashboard/admin/stores"),
          },
          {
            name: t("sidebar.products"),
            href: "/dashboard/admin/products",
            icon: Package,
            active: location.startsWith("/dashboard/admin/products"),
          },
          {
            name: t("sidebar.category"),
            href: "/dashboard/admin/categories",
            icon: Layers,
            active: location.startsWith("/dashboard/admin/categories"),
          },
          {
            name: t("sidebar.order"),
            icon: ShoppingCart,
            href: "/dashboard/admin/orders",
            active: location.startsWith("/dashboard/admin/orders"),
          },
          {
            name: t("sidebar.blacklist"),
            icon: BookmarkX,
            href: "/dashboard/admin/blacklisted",
            active: location.startsWith("/dashboard/admin/blacklisted"),
          },
          {
            name: t("sidebar.dispute"),
            icon: TriangleAlert,
            href: "/dashboard/admin/disputes",
            active: location.startsWith("/dashboard/admin/disputes"),
          },
          {
            name: t("sidebar.productReports"),
            icon: Flag,
            href: "/dashboard/admin/report",
            active: location.startsWith("/dashboard/admin/report"),
          },
          {
            name: t("sidebar.reportedReviews"),
            icon: Flag,
            href: "/dashboard/admin/reviews",
            active: location.startsWith("/dashboard/admin/reviews"),
          },
          {
            name: t("sidebar.moderationReviews"),
            icon: Eye,
            href: "/dashboard/admin/moderation",
            active: location.startsWith("/dashboard/admin/moderation"),
          },
          {
            name: t("sidebar.withdrawal"),
            icon: Wallet,
            href: "/dashboard/admin/withdrawals",
            active: location.startsWith("/dashboard/admin/withdrawals"),
          },
          {
            name: t("sidebar.promotions"),
            icon: Gift,
            href: "/dashboard/admin/promotions",
            active: location.startsWith("/dashboard/admin/promotions"),
          },
          {
            name: t("sidebar.parcel"),
            icon: Truck,
            href: "/dashboard/admin/tracking",
            active: location.startsWith("/dashboard/admin/tracking"),
          },
          {
            name: t("sidebar.invoices"),
            icon: FileText,
            href: "/dashboard/admin/invoices",
            active: location.startsWith("/dashboard/admin/invoices"),
          },
          {
            name: t("sidebar.income"),
            icon: DollarSign,
            href: "/dashboard/admin/income",
            active: location.startsWith("/dashboard/admin/income"),
          },
          {
            name: t("sidebar.revenueStore"),
            icon: Store,
            href: "/dashboard/admin/revenues",
            active: location.startsWith("/dashboard/admin/revenues"),
          },
          {
            name: t("sidebar.package"),
            icon: Package,
            href: "/dashboard/admin/management",
            active: location.startsWith("/dashboard/admin/management"),
          },
          {
            name: t("sidebar.subscription"),
            icon: CreditCard,
            href: "/dashboard/admin/subscription",
            active: location.startsWith("/dashboard/admin/subscription"),
          },
          {
            name: t("sidebar.messages"),
            icon: MessageSquare,
            href: "/dashboard/admin/messages",
            active: location.startsWith("/dashboard/admin/messages"),
          },
          {
            name: t("sidebar.systemSettings"),
            icon: Settings,
            href: "/dashboard/admin/settings",
            active: location.startsWith("/dashboard/admin/settings"),
          },
          {
            name: t("sidebar.shipping"),
            icon: Truck,
            href: "/dashboard/admin/shipping",
            active: location.startsWith("/dashboard/admin/shipping"),
          },
        ];

      case "seller":
        return [
          ...baseItems,
          {
            name: t("seller.sidebar.products"),
            href: "/dashboard/seller/products",
            icon: Package,
            active: location.startsWith("/dashboard/seller/products"),
          },
          {
            name: t("seller.sidebar.products.inventory"),
            icon: Package,
            children: [
              {
                name: t("seller.sidebar.products.overview"),
                href: "/dashboard/seller/inventory/overview",
              },
              {
                name: t("seller.sidebar.products.replenishment"),
                href: "/dashboard/seller/replenishment",
              },
              {
                name: t("seller.sidebar.products.stockalerts"),
                href: "/dashboard/seller/stock-alerts",
              },
            ],
            active: false,
            //  location.startsWith("/dashboard/seller/inventory") ||
            // location.startsWith("/dashboard/seller/replenishment") ||
            // location.startsWith("/dashboard/seller/stock-alerts"),
          },
          {
            name: t("seller.sidebar.orders"),
            href: "/dashboard/seller/orders",
            icon: ShoppingCart,
            active: location.startsWith("/dashboard/seller/orders"),
          },
          {
            name: t("seller.sidebar.customers"),
            href: "/dashboard/seller/customers",
            icon: Users,
            active: location.startsWith("/dashboard/seller/customers"),
          },
          {
            name: t("seller.sidebar.messages"),
            href: "/dashboard/seller/messages",
            icon: MessageSquare,
            active: location.startsWith("/dashboard/seller/messages"),
          },
          {
            name: t("seller.sidebar.transactions"),
            href: "/dashboard/seller/transactions",
            icon: CreditCard,
            active: location.startsWith("/dashboard/seller/transactions"),
          },
          {
            name: t("seller.sidebar.revenue"),
            href: "/dashboard/seller/revenue",
            icon: TrendingUp,
            active: location.startsWith("/dashboard/seller/revenue"),
          },
          {
            name: t("seller.sidebar.withdrawals"),
            href: "/dashboard/seller/withdrawals",
            icon: Banknote,
            active: location.startsWith("/dashboard/seller/withdrawals"),
          },
          {
            name: t("seller.sidebar.disputes"),
            href: "/dashboard/seller/disputes",
            icon: TriangleAlert,
            active: location.startsWith("/dashboard/seller/disputes"),
          },
          {
            name: t("seller.sidebar.reports"),
            href: "/dashboard/seller/reports",
            icon: BarChart3,
            active: location.startsWith("/dashboard/seller/reports"),
          },
          {
            name: t("seller.sidebar.reviews"),
            href: "/dashboard/seller/reviews",
            icon: Star,
            active: location.startsWith("/dashboard/seller/reviews"),
          },
          {
            name: t("seller.sidebar.shipping"),
            icon: Truck,
            children: [
              {
                name: t("seller.sidebar.configuration"),
                href: "/dashboard/seller/shipping/configuration",
              },
              {
                name: t("seller.sidebar.configuration.carriers"),
                href: "/dashboard/seller/shipping/carriers",
              },
              {
                name: t("seller.sidebar.configuration.rates"),
                href: "/dashboard/seller/shipping/rates",
              },
              {
                name: t("seller.sidebar.configuration.areas"),
                href: "/dashboard/seller/shipping/areas",
              },
            ],
            active: false,
            // active: location.startsWith("/dashboard/admin/inventory"),
          },
          {
            name: t("seller.sidebar.promotions"),
            href: "/dashboard/seller/promotions",
            icon: Gift,
            active: location.startsWith("/dashboard/seller/promotions"),
          },
          {
            name: t("seller.sidebar.settings"),
            href: "/dashboard/seller/settings",
            icon: Settings,
            active: location.startsWith("/dashboard/seller/settings"),
          },
        ];

      default: // client
        return [
          ...baseItems,
          // {
          //   name: t("client.products"),
          //   href: "/dashboard/client/products",
          //   icon: ShoppingBag,
          //   active: location.startsWith("/dashboard/client/products"),
          // },
          {
            name: t("client.cart"),
            href: "/dashboard/client/shoppingcart",
            icon: Package,
            active: location.startsWith("/dashboard/client/shoppingcart"),
          },
          {
            name: t("client.orders"),
            href: "/dashboard/client/orders",
            icon: Package,
            active: location.startsWith("/dashboard/client/orders"),
          },
          {
            name: t("client.wishlist"),
            href: "/dashboard/client/wishlist",
            icon: Heart,
            active: location.startsWith("/dashboard/client/wishlist"),
          },
          {
            name: t("client.messages"),
            href: "/dashboard/client/messages",
            icon: MessageSquare,
            active: location.startsWith("/dashboard/client/messages"),
          },
          {
            name: t("client.orderTracking"),
            href: "/dashboard/client/tracking",
            icon: Truck,
            active: location.startsWith("/dashboard/client/tracking"),
          },
          {
            name: t("client.pointsMenu"),
            href: "/dashboard/client/points",
            icon: Clock,
            active: location.startsWith("/dashboard/client/points"),
          },
          {
            name: t("client.orderHistory"),
            href: "/dashboard/client/history",
            icon: Clock,
            active: location.startsWith("/dashboard/client/history"),
          },
          {
            name: t("client.reviews"),
            href: "/dashboard/client/reviews",
            icon: Star,
            active: location.startsWith("/dashboard/client/reviews"),
          },
          {
            name: t("client.notifications"),
            href: "/dashboard/client/notifications",
            icon: Bell,
            active: location.startsWith("/dashboard/client/notifications"),
          },
          {
            name: t("client.statistics"),
            href: "/dashboard/client/statistics",
            icon: BarChart3,
            active: location.startsWith("/dashboard/client/statistics"),
          },
          {
            name: t("client.profile"),
            href: "/dashboard/client/profile",
            icon: User,
            active: location.startsWith("/dashboard/client/profile"),
          },
          {
            name: t("client.settings"),
            href: "/dashboard/client/settings",
            icon: Settings,
            active: location.startsWith("/dashboard/client/settings"),
          },
        ];
    }
  };
  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };
  const navigationItems = getNavigationItems();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleDropdown = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-800 rounded-lg flex items-center justify-center">
              <Store className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-800 leading-tight">
                {user?.role === "admin"
                  ? t("sidebar.heading")
                  : user?.role === "seller"
                  ? t("seller.sidebar.dashboard.heading")
                  : t("client.heading")}
              </h2>
              <p className="text-xs text-gray-500">
                {user?.role === "admin"
                  ? t("sidebar.management")
                  : user?.role === "seller"
                  ? t("seller.sidebar.dashboard.subheading")
                  : t("client.subheading")}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          // const isExpanded = expandedItems.includes(item.name);
          const isExpanded =
            expandedItems.includes(item.name) ||
            item.children?.some((child) => location === child.href);

          return (
            <div key={item.name}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-medium transition-colors",
                    isCollapsed ? "px-2" : "px-3",
                    item.active
                      ? "bg-primary-50 text-primary-800"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => toggleDropdown(item.name)}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isCollapsed ? "" : "mr-3"
                      )}
                    />
                  )}
                  {!isCollapsed && <span>{item.name}</span>}
                  {!isCollapsed && (
                    <span className="ml-auto">
                      {isExpanded ? <ChevronDown /> : <ChevronRight />}
                    </span>
                  )}
                </Button>
              ) : (
                <Link href={item.href || "#"}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-medium transition-colors",
                      isCollapsed ? "px-2" : "px-3",
                      item.active
                        ? "bg-primary-50 text-primary-800 "
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={(e) => {
                      // Prevent click event from bubbling when collapsed to avoid unwanted expansion
                      if (isCollapsed) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isCollapsed ? "" : "mr-3"
                        )}
                      />
                    )}
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              )}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children!.map((child) => {
                    const childActive = location === child.href;

                    return (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-left transition-colors",
                            childActive
                              ? "bg-primary-50 text-primary-800  font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <span>{child.name}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
              {/* {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link key={child.href} href={child.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-gray-600 hover:bg-gray-50"
                      >
                        <span>{child.name}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              )} */}
            </div>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="p-2 border-t border-gray-200">
        <Link href="/help">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal text-gray-600 hover:bg-gray-50",
              isCollapsed ? "px-2" : "px-3"
            )}
          >
            <HelpCircle
              className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "" : "mr-3")}
            />
            {!isCollapsed && <span>{t("seller.sidebar.helpsupport")}</span>}
          </Button>
        </Link>
      </div>
    </div>
  );
}
