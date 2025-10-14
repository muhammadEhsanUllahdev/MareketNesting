import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Search, ShoppingCart, User, Store } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDashboardPath = () => {
    if (!user) return "/auth";
    switch (user.role) {
      case "admin":
        return "/dashboard/admin";
      case "seller":
        return "/dashboard/seller";
      default:
        return "/dashboard/client";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-orange-100 text-orange-700";
      case "seller":
        return "bg-green-100 text-green-700";
      default:
        return "bg-primary-100 text-primary-700";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return t("auth.admin");
      case "seller":
        return t("auth.seller");
      default:
        return t("auth.client");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              data-testid="link-home"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Store className="text-white text-sm" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                CEBLEU
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {user && (
              <>
                {/* Role Badge */}
                <Badge
                  className={`text-xs font-medium rounded-full ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  <span data-testid="text-user-role">
                    {getRoleDisplayName(user.role)}
                  </span>
                </Badge>

                {/* Cart - only show for clients */}
                {user.role === "client" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    data-testid="button-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      <span data-testid="text-cart-count">3</span>
                    </span>
                  </Button>
                )}
              </>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-1"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar || undefined}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar || undefined}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p
                        className="font-medium text-sm"
                        data-testid="text-user-name"
                      >
                        {user.firstName} {user.lastName}
                      </p>
                      <p
                        className="w-[200px] truncate text-xs text-muted-foreground"
                        data-testid="text-user-email"
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href={getDashboardPath()}>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      data-testid="link-dashboard"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t("nav.profile")}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid="button-logout"
                  >
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  data-testid="button-login"
                >
                  {t("nav.login")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
