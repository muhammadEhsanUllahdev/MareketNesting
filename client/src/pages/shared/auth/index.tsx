import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Store, Users, ShoppingBag, Shield } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.enum(["client", "seller"]).default("client"),
    // Seller-specific fields (conditional)
    storeName: z.string().optional(),
    storeDescription: z.string().optional(),
    businessType: z.enum(["individual", "company", "partnership"]).optional(),
    // businessAddress: z.string().optional(),
    businessAddressStreet: z.string().optional(),
    businessAddressCity: z.string().optional(),
    businessAddressZipCode: z.string().optional(),
    businessAddressCountry: z.string().optional(),
    businessPhone: z.string().optional(),
    businessWebsite: z.string().url().optional().or(z.literal("")),
    taxId: z.string().optional(),
    avatar: z.any().optional(), // For file upload
  })
  .refine(
    (data) => {
      if (data.role === "seller") {
        return data.storeName && data.storeName.length > 0;
      }
      return true;
    },
    {
      message: "Store name is required for sellers",
      path: ["storeName"],
    }
  );

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const { t } = useTranslation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [, setLocation] = useLocation();
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  // Get reset token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await apiRequest("POST", "/api/forgot-password", data);
      return response.json();
    },
    onSuccess: (data) => {
      setForgotPasswordMessage(data.message);
      forgotPasswordForm.reset();
    },
    onError: (error: any) => {
      setForgotPasswordMessage(
        error.message || t("auth.failedToSendResetEmail")
      );
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await apiRequest("POST", "/api/reset-password", {
        token: resetToken,
        password: data.password,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResetPasswordMessage(data.message);
      setResetPasswordError("");
      resetPasswordForm.reset();
      // Redirect to login after successful reset
      setTimeout(() => {
        setActiveTab("login");
        setLocation("/auth");
      }, 2000);
    },
    onError: (error: any) => {
      setResetPasswordError(error.message || t("auth.failedToResetPassword"));
      setResetPasswordMessage("");
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "client",
      storeName: "",
      storeDescription: "",
      // businessType: "individual",
      // businessAddress: "",
      businessAddressStreet: "",
      businessAddressCity: "",
      businessAddressZipCode: "",
      businessAddressCountry: "",
      businessPhone: "",
      businessWebsite: "",
      taxId: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check if this is a password reset URL
  useEffect(() => {
    if (resetToken) {
      setActiveTab("reset-password");
    }
  }, [resetToken]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      let redirectPath = "/";

      switch (user.role) {
        case "seller":
          redirectPath = "/dashboard/seller";
          break;
        case "admin":
          redirectPath = "/dashboard/admin";
          break;
        case "client":
        default:
          redirectPath = "/";
          break;
      }

      setLocation(redirectPath);
    }
  }, [user, setLocation]);

  if (user) {
    return null; // Don't render anything while redirecting
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    setIsRegistering(true);
    // Create FormData for file upload support
    const formData = new FormData();

    // Add all form fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key === "avatar" && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    // Use fetch for FormData instead of the mutation (which expects JSON)
    const submitRegistration = async () => {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          // Reset the registration form
          registerForm.reset();
          // Switch to login tab
          setActiveTab("login");
          // Show success message
          setRegistrationMessage(t("auth.registrationSuccessMessage"));
          // Clear any previous registration message after a delay
          setTimeout(() => {
            setRegistrationMessage("");
          }, 5000);
        } else {
          throw new Error(result.error || t("auth.registrationFailed"));
        }
      } catch (error) {
        console.error(t("auth.registrationError"), error);
        setRegistrationMessage("");
        // Handle error - you might want to show error in the form
      } finally {
        setIsRegistering(false);
      }
    };

    submitRegistration();
  };

  const onForgotPassword = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  const onResetPassword = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "seller":
        return <Store className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Store className="text-white h-6 w-6" />
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">
                {t("auth.brandName")}
              </span>
            </div>
            <p className="text-gray-600">
              {activeTab === "login"
                ? t("auth.welcome")
                : t("auth.createAccount")}
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {resetToken ? (
              // Show only reset password tab when token is present
              <div className="mb-6">
                <h2 className="text-center text-lg font-semibold text-gray-900">
                  {t("auth.resetPassword")}
                </h2>
              </div>
            ) : (
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">
                  {t("auth.login")}
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">
                  {t("auth.register")}
                </TabsTrigger>
              </TabsList>
            )}

            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {t("auth.welcome")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-username">
                        {t("auth.username")}
                      </Label>
                      <Input
                        id="login-username"
                        {...loginForm.register("username")}
                        placeholder={t("auth.username")}
                        data-testid="input-login-username"
                      />
                      {loginForm.formState.errors.username && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-login-username"
                        >
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">
                        {t("auth.password")}
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        {...loginForm.register("password")}
                        placeholder={t("auth.password")}
                        data-testid="input-login-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-login-password"
                        >
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {loginMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription data-testid="error-login-general">
                          {loginMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      disabled={loginMutation.isPending}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("common.loading")}
                        </>
                      ) : (
                        t("auth.loginButton")
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("forgot-password")}
                        className="text-sm text-primary-600 hover:text-primary-700 block mx-auto"
                        data-testid="link-forgot-password"
                      >
                        {t("auth.forgotPasswordQuestion")}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("register")}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        data-testid="link-switch-to-register"
                      >
                        {t("auth.switchToRegister")}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {t("auth.createAccount")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName">
                          {t("auth.firstName")}
                        </Label>
                        <Input
                          id="register-firstName"
                          {...registerForm.register("firstName")}
                          placeholder={t("auth.firstName")}
                          data-testid="input-register-firstName"
                        />
                        {registerForm.formState.errors.firstName && (
                          <p
                            className="text-sm text-red-600"
                            data-testid="error-register-firstName"
                          >
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-lastName">
                          {t("auth.lastName")}
                        </Label>
                        <Input
                          id="register-lastName"
                          {...registerForm.register("lastName")}
                          placeholder={t("auth.lastName")}
                          data-testid="input-register-lastName"
                        />
                        {registerForm.formState.errors.lastName && (
                          <p
                            className="text-sm text-red-600"
                            data-testid="error-register-lastName"
                          >
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-username">
                        {t("auth.username")}
                      </Label>
                      <Input
                        id="register-username"
                        {...registerForm.register("username")}
                        placeholder={t("auth.username")}
                        data-testid="input-register-username"
                      />
                      {registerForm.formState.errors.username && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-register-username"
                        >
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t("auth.email")}</Label>
                      <Input
                        id="register-email"
                        type="email"
                        {...registerForm.register("email")}
                        placeholder={t("auth.email")}
                        data-testid="input-register-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-register-email"
                        >
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">
                        {t("auth.password")}
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        {...registerForm.register("password")}
                        placeholder={t("auth.password")}
                        data-testid="input-register-password"
                      />
                      {registerForm.formState.errors.password && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-register-password"
                        >
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-role">{t("auth.role")}</Label>
                      <Select
                        value={registerForm.watch("role")}
                        onValueChange={(value) =>
                          registerForm.setValue(
                            "role",
                            value as "client" | "seller"
                          )
                        }
                      >
                        <SelectTrigger data-testid="select-register-role">
                          <SelectValue placeholder={t("auth.role")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="client"
                            data-testid="option-role-client"
                          >
                            <div className="flex items-center">
                              {getRoleIcon("client")}
                              <span className="ml-2">{t("auth.client")}</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="seller"
                            data-testid="option-role-seller"
                          >
                            <div className="flex items-center">
                              {getRoleIcon("seller")}
                              <span className="ml-2">{t("auth.seller")}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.role && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-register-role"
                        >
                          {registerForm.formState.errors.role.message}
                        </p>
                      )}
                    </div>

                    {/* Seller-specific fields - only show when seller role is selected */}
                    {registerForm.watch("role") === "seller" && (
                      <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-900 flex items-center">
                          <Store className="mr-2 h-4 w-4" />
                          {t("auth.sellerInformation")}
                        </h4>

                        <div className="space-y-2">
                          <Label htmlFor="register-storeName">
                            {t("auth.storeNameRequired")}
                          </Label>
                          <Input
                            id="register-storeName"
                            {...registerForm.register("storeName")}
                            placeholder={t("auth.storeNamePlaceholder")}
                            data-testid="input-register-storeName"
                          />
                          {registerForm.formState.errors.storeName && (
                            <p
                              className="text-sm text-red-600"
                              data-testid="error-register-storeName"
                            >
                              {registerForm.formState.errors.storeName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-avatar">
                            {t("auth.storeLogoAvatar")}
                          </Label>
                          <Input
                            id="register-avatar"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              registerForm.setValue("avatar", file);
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            data-testid="input-register-avatar"
                          />
                          <p className="text-xs text-gray-500">
                            {t("auth.storeLogoAvatarHint")}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-storeDescription">
                            {t("auth.storeDescription")}
                          </Label>
                          <textarea
                            id="register-storeDescription"
                            {...registerForm.register("storeDescription")}
                            placeholder={t("auth.storeDescriptionPlaceholder")}
                            className="w-full p-2 border rounded-md"
                            rows={3}
                            data-testid="input-register-storeDescription"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="register-businessPhone">
                              {t("auth.businessPhone")}
                            </Label>
                            <Input
                              id="register-businessPhone"
                              {...registerForm.register("businessPhone")}
                              placeholder={t("auth.businessPhonePlaceholder")}
                              data-testid="input-register-businessPhone"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("auth.businessAddress")}</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Input
                                id="register-street"
                                placeholder={t("auth.streetPlaceholder")}
                                {...registerForm.register(
                                  "businessAddressStreet"
                                )}
                                data-testid="input-register-street"
                              />
                            </div>
                            <div>
                              <Input
                                id="register-city"
                                placeholder={t("auth.cityPlaceholder")}
                                {...registerForm.register(
                                  "businessAddressCity"
                                )}
                                data-testid="input-register-city"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <Input
                                id="register-zipCode"
                                placeholder={t("auth.zipCodePlaceholder")}
                                {...registerForm.register(
                                  "businessAddressZipCode"
                                )}
                                data-testid="input-register-zipCode"
                              />
                            </div>
                            <div>
                              <Input
                                id="register-country"
                                placeholder={t("auth.countryPlaceholder")}
                                {...registerForm.register(
                                  "businessAddressCountry"
                                )}
                                data-testid="input-register-country"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="register-businessWebsite">
                              {t("auth.websiteOptional")}
                            </Label>
                            <Input
                              id="register-businessWebsite"
                              {...registerForm.register("businessWebsite")}
                              placeholder={t("auth.websitePlaceholder")}
                              data-testid="input-register-businessWebsite"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="register-taxId">
                              {t("auth.taxIdOptional")}
                            </Label>
                            <Input
                              id="register-taxId"
                              {...registerForm.register("taxId")}
                              placeholder={t("auth.taxIdPlaceholder")}
                              data-testid="input-register-taxId"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {registerMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription data-testid="error-register-general">
                          {registerMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {registrationMessage && (
                      <Alert>
                        <AlertDescription data-testid="message-registration-success">
                          {registrationMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      disabled={registerMutation.isPending}
                      data-testid="button-register-submit"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("common.loading")}
                        </>
                      ) : (
                        t("auth.registerButton")
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        data-testid="link-switch-to-login"
                      >
                        {t("auth.switchToLogin")}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forgot Password Form */}
            <TabsContent value="forgot-password">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {t("auth.forgotPassword")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">
                        {t("auth.emailAddress")}
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        {...forgotPasswordForm.register("email")}
                        placeholder={t("auth.enterYourEmailAddress")}
                        data-testid="input-forgot-email"
                      />
                      {forgotPasswordForm.formState.errors.email && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-forgot-email"
                        >
                          {forgotPasswordForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {forgotPasswordMessage && (
                      <Alert>
                        <AlertDescription data-testid="message-forgot-password">
                          {forgotPasswordMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      disabled={forgotPasswordMutation.isPending}
                      data-testid="button-forgot-submit"
                    >
                      {forgotPasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("auth.sending")}
                        </>
                      ) : (
                        t("auth.sendResetEmail")
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab("login")}
                        className="text-sm text-primary-600 hover:text-primary-700"
                        data-testid="link-back-to-login"
                      >
                        {t("auth.backToLogin")}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reset Password Form */}
            <TabsContent value="reset-password">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    {t("auth.setNewPassword")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={resetPasswordForm.handleSubmit(onResetPassword)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="reset-password">
                        {t("auth.newPassword")}
                      </Label>
                      <Input
                        id="reset-password"
                        type="password"
                        {...resetPasswordForm.register("password")}
                        placeholder={t("auth.enterNewPasswordPlaceholder")}
                        data-testid="input-reset-password"
                      />
                      {resetPasswordForm.formState.errors.password && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-reset-password"
                        >
                          {resetPasswordForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reset-confirm-password">
                        {t("auth.confirmNewPassword")}
                      </Label>
                      <Input
                        id="reset-confirm-password"
                        type="password"
                        {...resetPasswordForm.register("confirmPassword")}
                        placeholder={t("auth.confirmNewPasswordPlaceholder")}
                        data-testid="input-reset-confirm-password"
                      />
                      {resetPasswordForm.formState.errors.confirmPassword && (
                        <p
                          className="text-sm text-red-600"
                          data-testid="error-reset-confirm-password"
                        >
                          {
                            resetPasswordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    {resetPasswordMessage && (
                      <Alert>
                        <AlertDescription data-testid="message-reset-success">
                          {resetPasswordMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    {resetPasswordError && (
                      <Alert variant="destructive">
                        <AlertDescription data-testid="error-reset-password-general">
                          {resetPasswordError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      disabled={resetPasswordMutation.isPending}
                      data-testid="button-reset-submit"
                    >
                      {resetPasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("auth.resetting")}
                        </>
                      ) : (
                        t("auth.resetPassword")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-primary-800 text-white items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <Users className="h-24 w-24 mx-auto mb-4 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">{t("hero.title")}</h2>
            <p className="text-xl text-primary-100">{t("hero.subtitle")}</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-6 w-6 flex-shrink-0" />
              <span className="text-primary-100">
                {t("home.shopFromTrustedVendors")}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Store className="h-6 w-6 flex-shrink-0" />
              <span className="text-primary-100">
                {t("home.sellToGlobalCustomers")}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 flex-shrink-0" />
              <span className="text-primary-100">
                {t("home.securePaymentsAndFastShipping")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
