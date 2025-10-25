import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/shared/home";
import AuthPage from "@/pages/shared/auth";
import ResetPasswordPage from "@/pages/shared/auth/reset-password";
import VerifyEmailPage from "@/pages/shared/auth/verify-email";
import ClientDashboard from "@/pages/client/profile";
import WishlistPage from "@/pages/client/wishlist";
import CheckoutPage from "@/pages/checkout";
import OrdersPage from "@/pages/client/orders";
import SellerDashboard from "@/pages/seller/dashboard";
import SellerProducts from "@/pages/seller/products";
import EditProduct from "@/pages/seller/products/edit";
import InventoryOverview from "@/pages/seller/inventory/overview";
import ReplenishmentPage from "@/pages/seller/replenishment";
import ShippingConfiguration from "./pages/seller/shipping/pages/ShippingConfiguration";
import ShippingRates from "./pages/seller/shipping/pages/ShippingRates";
import ShippingZones from "./pages/seller/shipping/pages/ShippingZones";
import ShippingCarriers from "./pages/seller/shipping/pages/ShippingCarriers";
import StockAlertsPage from "@/pages/seller/stock-alerts";
import SellerOrdersPage from "@/pages/seller/orders";
import SellerCustomersPage from "@/pages/seller/customers";
import ProductDetails from "@/pages/client/products/details";
import ProductsPage from "@/pages/client/products";
import ClientProductsDashboard from "@/pages/client/products/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/users/user-management";
import StoreManagement from "@/pages/admin/settings/store-management";
import CategoriesManagement from "@/pages/admin/products/categories-management";
import ProductsManagement from "@/pages/admin/products-management";
import OrderManagement from "@/pages/admin/order-management";
import NotFound from "@/pages/not-found";
import SellerTransactions from "./pages/seller/transactions/transaction";
import sellerRevenues from "./pages/seller/revenues/revenue";
import PromotionManagement from "./pages/admin/promotions/promotions";
import PackageManagement from "./pages/admin/packages/packages";
import ClientNotifications from "./pages/client/notifications/notifications";
import ShoppingCartComponent from "./pages/client/shoppingcart/shoppingCart";
import ClientOrderTracking from "./pages/client/ordertracking/ordertracking";
import ShippingManagement from "./pages/admin/shipping/Shipping";
import ClientStatistics from "./pages/client/statistics/Statistics";
import ClientProfile from "./pages/client/myProfile/Profile";
import SellerSettings from "./pages/seller/settings/Settings";
import StoreRevenues from "./pages/admin/revenue/StoreRevenues";
import WithdrawalRequests from "./pages/seller/withdrawal/WithdrawalRequests";
import ProductBlacklist from "./pages/admin/blacklist/ProductBlacklist";
import Shipments from "./pages/admin/parcelTracking/Shipments";
import SearchResults from "./pages/SearchResults";
import "./lib/i18n";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
function CheckoutWrapper() {
  const stripePromise = loadStripe(
    "pk_test_51KMzn1SHHfrH8iaca5YGz9YWQl1kU3Sw1UtfBm1u8TP7LAupLRpAIaaJdj12a3J6OYNHDxT3M3P1UCry3nAneJE600vYe8X0uE"
  );

  return (
    <Elements stripe={stripePromise}>
      <CheckoutPage />
    </Elements>
  );
}

function Router() {
  // const stripePromise = loadStripe(
  //   "pk_test_51KMzn1SHHfrH8iaca5YGz9YWQl1kU3Sw1UtfBm1u8TP7LAupLRpAIaaJdj12a3J6OYNHDxT3M3P1UCry3nAneJE600vYe8X0uE"
  // );
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetails} />
      <Route path="/search" component={SearchResults} />
      {/* <Route
        path="/checkout"
        element={
          <Elements stripe={stripePromise}>
            <CheckoutPage />
          </Elements>
        }
      /> */}

      <ProtectedRoute path="/checkout" component={CheckoutWrapper} />
      <ProtectedRoute path="/dashboard/client/orders" component={OrdersPage} />
      <ProtectedRoute
        path="/dashboard/client/wishlist"
        component={WishlistPage}
      />
      <ProtectedRoute
        path="/dashboard/client/statistics"
        component={ClientStatistics}
      />
      <ProtectedRoute
        path="/dashboard/client/profile"
        component={ClientProfile}
      />
      <ProtectedRoute
        path="/dashboard/client/products"
        component={ClientProductsDashboard}
      />
      <ProtectedRoute
        path="/dashboard/admin/shipping"
        component={ShippingManagement}
      />
      <ProtectedRoute
        path="/dashboard/seller/settings"
        component={SellerSettings}
      />
      <ProtectedRoute path="/dashboard/client" component={ClientDashboard} />
      <ProtectedRoute
        path="/dashboard/seller/products/edit/:id"
        component={EditProduct}
      />
      <ProtectedRoute
        path="/dashboard/seller/products"
        component={SellerProducts}
      />

      {/* Shipping Routes */}
      <ProtectedRoute
        path="/dashboard/seller/shipping/configuration"
        component={ShippingConfiguration}
      />

      <ProtectedRoute
        path="/dashboard/seller/shipping/carriers"
        component={ShippingCarriers}
      />
      <ProtectedRoute
        path="/dashboard/seller/shipping/rates"
        component={ShippingRates}
      />
      <ProtectedRoute
        path="/dashboard/seller/shipping/areas"
        component={ShippingZones}
      />

      <ProtectedRoute
        path="/dashboard/seller/inventory/overview"
        component={InventoryOverview}
      />
      <ProtectedRoute
        path="/dashboard/seller/replenishment"
        component={ReplenishmentPage}
      />
      <ProtectedRoute
        path="/dashboard/seller/stock-alerts"
        component={StockAlertsPage}
      />
      <ProtectedRoute
        path="/dashboard/seller/withdrawals"
        component={WithdrawalRequests}
      />
      <ProtectedRoute
        path="/dashboard/seller/orders"
        component={SellerOrdersPage}
      />
      <ProtectedRoute
        path="/dashboard/seller/customers"
        component={SellerCustomersPage}
      />
      <ProtectedRoute path="/dashboard/seller" component={SellerDashboard} />
      <ProtectedRoute
        path="/dashboard/admin/users"
        component={UserManagement}
      />
      <ProtectedRoute
        path="/dashboard/admin/stores"
        component={StoreManagement}
      />
      <ProtectedRoute
        path="/dashboard/admin/blacklisted"
        component={ProductBlacklist}
      />
      <ProtectedRoute path="/dashboard/admin/tracking" component={Shipments} />
      <ProtectedRoute
        path="/dashboard/admin/revenues"
        component={StoreRevenues}
      />
      <ProtectedRoute
        path="/dashboard/admin/products"
        component={ProductsManagement}
      />
      <ProtectedRoute
        path="/dashboard/admin/categories"
        component={CategoriesManagement}
      />
      <ProtectedRoute
        path="/dashboard/admin/orders"
        component={OrderManagement}
      />
      <ProtectedRoute
        path="/dashboard/seller/transactions"
        component={SellerTransactions}
      />
      <ProtectedRoute
        path="/dashboard/seller/revenue"
        component={sellerRevenues}
      />
      <ProtectedRoute
        path="/dashboard/admin/promotions"
        component={PromotionManagement}
      />
      <ProtectedRoute
        path="/dashboard/admin/management"
        component={PackageManagement}
      />

      <ProtectedRoute
        path="/dashboard/client/notifications"
        component={ClientNotifications}
      />

      <ProtectedRoute
        path="/dashboard/client/shoppingcart"
        component={ShoppingCartComponent}
      />

      <ProtectedRoute
        path="/dashboard/client/tracking"
        component={ClientOrderTracking}
      />

      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
      {/* <Route component={NotFound} /> */}
      <Route>
        <DashboardLayout title="Page Not Found">
          <NotFound />
        </DashboardLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
