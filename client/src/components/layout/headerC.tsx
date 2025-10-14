// import React, { useRef } from "react";
// import { Search, Heart, User, ChevronDown, Store } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { ShoppingCartIcon } from "../SubComponents/ShoppingCartIcon";
// import SearchCommand from "../SubComponents/SearchCommand";
// import CartComponent from "../home/CartComponent";
// // import { useLanguage } from "../contexts/LanguageContext";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useAuth } from "@/hooks/use-auth";
// import { useTranslation } from "react-i18next";
// import { Link } from "wouter";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { LanguageSwitcher } from "@/components/ui/language-switcher";
// const HeaderC = () => {
//   const [searchOpen, setSearchOpen] = React.useState(false);
//   const searchRef = useRef<HTMLDivElement>(null);
//   //   const { language, setLanguage, t, currentFlag } = useLanguage();
//   const { user, logoutMutation } = useAuth();
//   const { t } = useTranslation();

//   const handleLogout = () => {
//     logoutMutation.mutate();
//   };

//   const languages = [
//     { code: "en", name: "English", flag: "🇬🇧" },
//     { code: "fr", name: "Français", flag: "🇫🇷" },
//     { code: "ar", name: "العربية", flag: "🇩🇿" },
//   ];

//   const handleLanguageChange = (langCode: "en" | "fr" | "ar") => {
//     // setLanguage(langCode);
//   };

//   const getDashboardPath = () => {
//     if (!user) return "/auth";
//     switch (user.role) {
//       case "admin":
//         return "/dashboard/admin";
//       case "seller":
//         return "/dashboard/seller";
//       default:
//         return "/dashboard/client";
//     }
//   };

//   return (
//     <header className="w-full bg-white border-b border-cebleu-purple-200 shadow-sm">
//       <div className="max-w-[1920px] mx-auto px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <div className="flex items-center">
//               <div className="h-12 w-auto"></div>
//             </div>

//             <div className="flex items-center">
//               <button className="flex items-center gap-2 bg-cebleu-gold-light/10 border border-cebleu-gold text-cebleu-dark px-4 py-2 rounded-full hover:bg-cebleu-gold-light/20 transition-colors group">
//                 <Store
//                   size={20}
//                   className="text-cebleu-gold group-hover:text-cebleu-gold-rich transition-colors"
//                 />
//                 <span className="font-medium group-hover:text-cebleu-dark transition-colors">
//                   {t("index.becomeSeller")}
//                 </span>
//               </button>
//             </div>
//           </div>

//           <div className="relative flex-1 max-w-3xl mx-6" ref={searchRef}>
//             <div className="relative flex items-center">
//               <Input
//                 type="text"
//                 placeholder={t("nav.searchPlaceholder")}
//                 className="w-full py-2 pl-4 pr-10 rounded-full border border-cebleu-purple-300 focus:border-cebleu-purple-500 focus:ring-2 focus:ring-cebleu-purple-200 bg-cebleu-purple-50/30"
//                 onClick={() => setSearchOpen(true)}
//               />
//               <div className="absolute right-3 p-1 rounded-full text-cebleu-purple">
//                 <Search size={18} />
//               </div>
//             </div>

//             <SearchCommand
//               isOpen={searchOpen}
//               onClose={() => setSearchOpen(false)}
//               searchRef={searchRef}
//             />
//           </div>

//           <div className="flex items-center gap-6">
//             <div className="font-medium text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
//               <span>{t("nav.deals")}</span>
//             </div>

//             <div className="flex items-center gap-1.5 text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
//               <User size={22} />
//             </div>

//             {/* <div className="flex items-center gap-1.5 text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
//               <Link href="/wishlist">
//                 <Heart size={22} />
//               </Link>
//             </div> */}

//             <div className="flex items-center gap-1.5 text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
//               <CartComponent className="text-cebleu-purple hover:text-cebleu-purple-dark" />
//             </div>

//             <LanguageSwitcher />

//             {user ? (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     className="flex items-center space-x-2 p-1"
//                     data-testid="button-user-menu"
//                   >
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage
//                         src={user.avatar || undefined}
//                         alt={user.username}
//                       />
//                       <AvatarFallback>
//                         {user.firstName?.[0]}
//                         {user.lastName?.[0]}
//                       </AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <div className="flex items-center justify-start gap-2 p-2">
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage
//                         src={user.avatar || undefined}
//                         alt={user.username}
//                       />
//                       <AvatarFallback>
//                         {user.firstName?.[0]}
//                         {user.lastName?.[0]}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex flex-col space-y-1 leading-none">
//                       <p
//                         className="font-medium text-sm"
//                         data-testid="text-user-name"
//                       >
//                         {user.firstName} {user.lastName}
//                       </p>
//                       <p
//                         className="w-[200px] truncate text-xs text-muted-foreground"
//                         data-testid="text-user-email"
//                       >
//                         {user.email}
//                       </p>
//                     </div>
//                   </div>
//                   <DropdownMenuSeparator />
//                   <Link href={getDashboardPath()}>
//                     <DropdownMenuItem
//                       className="cursor-pointer"
//                       data-testid="link-dashboard"
//                     >
//                       <User className="mr-2 h-4 w-4" />
//                       {t("nav.profile")}
//                     </DropdownMenuItem>
//                   </Link>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem
//                     onClick={handleLogout}
//                     className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
//                     data-testid="button-logout"
//                   >
//                     {t("nav.logout")}
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <Link href="/auth">
//                 <Button
//                   variant="default"
//                   size="sm"
//                   className="bg-primary-600 hover:bg-primary-700 text-white"
//                   data-testid="button-login"
//                 >
//                   {t("nav.login")}
//                 </Button>
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default HeaderC;
import React, { useRef } from "react";
import {
  Search,
  Heart,
  User,
  ChevronDown,
  Store,
  Gift,
  Globe,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ShoppingCartIcon } from "../SubComponents/ShoppingCartIcon";
import SearchCommand from "../SubComponents/SearchCommand";
import CartComponent from "../home/CartComponent";
// import { useLanguage } from "../contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
const HeaderC = () => {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  //   const { language, setLanguage, t, currentFlag } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇩🇿" },
  ];

  const handleLanguageChange = (langCode: "en" | "fr" | "ar") => {
    // setLanguage(langCode);
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

  return (
    <header className="w-full bg-white border-b border-cebleu-purple-200 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <div className="h-12 w-auto"></div>
            </div>

            <div className="flex items-center">
              <button className="flex items-center gap-2 bg-cebleu-gold-light/10 border border-cebleu-gold text-cebleu-dark px-4 py-2 rounded-full hover:bg-cebleu-gold-light/20 transition-colors group">
                <Store
                  size={20}
                  className="text-cebleu-gold group-hover:text-cebleu-gold-rich transition-colors"
                />
                <span className="font-medium group-hover:text-cebleu-dark transition-colors hidden md:block">
                  {t("index.becomeSeller")}
                </span>
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 max-w-3xl mx-6 hidden lg:block"
            ref={searchRef}
          >
            <div className="relative flex items-center ">
              <Input
                type="text"
                placeholder={t("nav.searchPlaceholder")}
                className="w-full py-2 pl-4 pr-10 rounded-full border border-cebleu-purple-300 focus:border-cebleu-purple-500 focus:ring-2 focus:ring-cebleu-purple-200 bg-cebleu-purple-50/30 "
                onClick={() => setSearchOpen(true)}
              />
              <div className="absolute right-3 p-1 rounded-full text-cebleu-purple">
                <Search size={18} />
              </div>
            </div>

            <SearchCommand
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              searchRef={searchRef}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="font-medium text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
              <span className="hidden md:block">{t("nav.deals")}</span>
              <Gift size={22} className="md:hidden" />
            </div>

            <div className="flex items-center gap-1.5 text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
              <User size={22} />
            </div>

            {/* <div className="flex items-center gap-1.5 text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
              <Link href="/wishlist">
                <Heart size={22} />
              </Link>
            </div> */}

            <div className="flex items-center gap-1.5 text-cebleu-purple hover:text-cebleu-purple-dark transition-colors cursor-pointer">
              <CartComponent className="text-cebleu-purple hover:text-cebleu-purple-dark" />
            </div>

            <LanguageSwitcher />

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
        <div
          className="relative flex-1 max-w-3xl mx-6 block lg:hidden"
          ref={searchRef}
        >
          <div className="relative flex items-center ">
            <Input
              type="text"
              placeholder={t("nav.searchPlaceholder")}
              className="w-full py-2 pl-4 pr-10 rounded-full border border-cebleu-purple-300 focus:border-cebleu-purple-500 focus:ring-2 focus:ring-cebleu-purple-200 bg-cebleu-purple-50/30 "
              onClick={() => setSearchOpen(true)}
            />
            <div className="absolute right-3 p-1 rounded-full text-cebleu-purple">
              <Search size={18} />
            </div>
          </div>

          <SearchCommand
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            searchRef={searchRef}
          />
        </div>
      </div>
    </header>
  );
};

export default HeaderC;
