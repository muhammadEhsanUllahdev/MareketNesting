// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useMutation } from "@tanstack/react-query";
// import { useLocation } from "wouter";
// import { apiRequest } from "@/lib/queryClient";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, Store } from "lucide-react";

// const resetPasswordSchema = z.object({
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

// type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// export default function ResetPasswordPage() {
//   const [, setLocation] = useLocation();
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // Get reset token from URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const resetToken = urlParams.get('token');

//   const form = useForm<ResetPasswordFormData>({
//     resolver: zodResolver(resetPasswordSchema),
//     defaultValues: {
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   // Reset password mutation
//   const resetPasswordMutation = useMutation({
//     mutationFn: async (data: ResetPasswordFormData) => {
//       const response = await apiRequest("POST", "/api/reset-password", {
//         token: resetToken,
//         password: data.password,
//       });
//       return response.json();
//     },
//     onSuccess: (data) => {
//       setMessage(data.message);
//       setError("");
//       form.reset();
//       // Redirect to login after successful reset
//       setTimeout(() => {
//         setLocation("/auth");
//       }, 3000);
//     },
//     onError: (error: any) => {
//       setError(error.message || "Failed to reset password");
//       setMessage("");
//     },
//   });

//   // Redirect if no token
//   useEffect(() => {
//     if (!resetToken) {
//       setLocation("/auth");
//     }
//   }, [resetToken, setLocation]);

//   const onSubmit = (data: ResetPasswordFormData) => {
//     resetPasswordMutation.mutate(data);
//   };

//   if (!resetToken) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center mb-4">
//             <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
//               <Store className="text-white h-6 w-6" />
//             </div>
//             <span className="ml-3 text-2xl font-bold text-gray-900">MultiMarket</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
//           <p className="text-gray-600">Enter your new password below</p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-center">Set New Password</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="password">New Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   {...form.register("password")}
//                   placeholder="Enter new password"
//                   data-testid="input-new-password"
//                 />
//                 {form.formState.errors.password && (
//                   <p className="text-sm text-red-600" data-testid="error-new-password">
//                     {form.formState.errors.password.message}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Confirm New Password</Label>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   {...form.register("confirmPassword")}
//                   placeholder="Confirm new password"
//                   data-testid="input-confirm-password"
//                 />
//                 {form.formState.errors.confirmPassword && (
//                   <p className="text-sm text-red-600" data-testid="error-confirm-password">
//                     {form.formState.errors.confirmPassword.message}
//                   </p>
//                 )}
//               </div>

//               {message && (
//                 <Alert>
//                   <AlertDescription data-testid="message-success">
//                     {message}
//                   </AlertDescription>
//                 </Alert>
//               )}

//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription data-testid="error-reset">
//                     {error}
//                   </AlertDescription>
//                 </Alert>
//               )}

//               <Button
//                 type="submit"
//                 className="w-full bg-primary-600 hover:bg-primary-700"
//                 disabled={resetPasswordMutation.isPending}
//                 data-testid="button-reset-password"
//               >
//                 {resetPasswordMutation.isPending ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Resetting Password...
//                   </>
//                 ) : (
//                   "Reset Password"
//                 )}
//               </Button>

//               <div className="text-center">
//                 <button
//                   type="button"
//                   onClick={() => setLocation("/auth")}
//                   className="text-sm text-primary-600 hover:text-primary-700"
//                   data-testid="link-back-to-auth"
//                 >
//                   Back to Login
//                 </button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Store } from "lucide-react";

// const resetPasswordSchema = z.object({
//   password: z.string().min(6, t("auth.validation.passwordMin")),
//   confirmPassword: z.string().min(6, t("auth.validation.passwordMin")),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: t("auth.validation.passwordsMismatch"),
//   path: ["confirmPassword"],
// });

// type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const resetPasswordSchema = z.object({
  password: z.string().min(6, t("auth.validation.passwordMin")),
  confirmPassword: z.string().min(6, t("auth.validation.passwordMin")),
}).refine((data) => data.password === data.confirmPassword, {
  message: t("auth.validation.passwordsMismatch"),
  path: ["confirmPassword"],
});

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const response = await apiRequest("POST", "/api/reset-password", {
        token: resetToken,
        password: data.password,
      });
      if (!response.ok) throw new Error(t("auth.error.resetFailed"));
      return response.json();
    },
    onSuccess: (data) => {
      setMessage(data.message);
      setError("");
      form.reset();
      setTimeout(() => {
        setLocation("/auth");
      }, 3000);
    },
    onError: (error: any) => {
      setError(error.message || t("auth.error.resetFailed"));
      setMessage("");
    },
  });

  useEffect(() => {
    if (!resetToken) {
      setLocation("/auth");
    }
  }, [resetToken, setLocation]);

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  if (!resetToken) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Store className="text-white h-6 w-6" />
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">MultiMarket</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("auth.resetPassword.title")}
          </h1>
          <p className="text-gray-600">{t("auth.resetPassword.subtitle")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {t("auth.resetPassword.setNewPassword")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.resetPassword.newPassword")}</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.resetPassword.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.resetPassword.resetting")}
                  </>
                ) : (
                  t("auth.resetPassword.button")
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setLocation("/auth")}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {t("auth.resetPassword.backToLogin")}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
