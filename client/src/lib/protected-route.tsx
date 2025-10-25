// import { useAuth } from "@/hooks/use-auth";
// import { Loader2, Mail, Clock } from "lucide-react";
// import { Link, Redirect, Route } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";

// export function ProtectedRoute({
//   path,
//   component: Component,
// }: {
//   path: string;
//   component: () => React.JSX.Element;
// }) {
//   const { user, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <Route path={path}>
//         <div className="flex items-center justify-center min-h-screen">
//           <Loader2 className="h-8 w-8 animate-spin text-border" />
//         </div>
//       </Route>
//     );
//   }

//   if (!user) {
//     return (
//       <Route path={path}>
//         <Redirect to="/auth" />
//       </Route>
//     );
//   }

//   // Check email verification for all users
//   if (!user.emailVerified) {
//     return (
//       <Route path={path}>
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
//           <Card className="w-full max-w-md">
//             <CardHeader>
//               <CardTitle className="text-center flex items-center justify-center">
//                 <Mail className="mr-2 h-5 w-5 text-blue-600" />
//                 Email Verification Required
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Alert>
//                 <Mail className="h-4 w-4" />
//                 <AlertDescription>
//                   Please verify your email address to access your account. Check your inbox for a verification link.
//                 </AlertDescription>
//               </Alert>
//               <div className="text-center space-y-2">
//                 <p className="text-sm text-gray-600">
//                   Didn't receive the email? Check your spam folder or request a new verification email.
//                 </p>
//                 <Link href="/auth">
//                 <Button 
//                   variant="outline" 
//                   className="w-full"
//                   data-testid="button-back-to-auth"
//                 >
//                   Back to Login
//                 </Button>
//                 </Link>
                
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </Route>
//     );
//   }

//   // Check seller approval status for seller routes
//   if (user.role === "seller" && path.includes("/dashboard/seller")) {
//     if (user.sellerStatus !== "approved") {
//       return (
//         <Route path={path}>
//           <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
//             <Card className="w-full max-w-md">
//               <CardHeader>
//                 <CardTitle className="text-center flex items-center justify-center">
//                   <Clock className="mr-2 h-5 w-5 text-orange-600" />
//                   {user.sellerStatus === "pending" ? "Approval Pending" : "Application Rejected"}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Alert variant={user.sellerStatus === "rejected" ? "destructive" : "default"}>
//                   <Clock className="h-4 w-4" />
//                   <AlertDescription>
//                     {user.sellerStatus === "pending" 
//                       ? "Your seller application is under review by our admin team. You'll receive an email notification once approved."
//                       : "Your seller application has been rejected. Please contact support for more information."
//                     }
//                   </AlertDescription>
//                 </Alert>
//                 <div className="text-center">
//                   <Link href="/">
//                   <Button 
//                     className="w-full bg-primary-600 hover:bg-primary-700"
//                     data-testid="button-go-home"
//                   >
//                     Go to Homepage
//                   </Button>
//                   </Link>
                  
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </Route>
//       );
//     }
//   }

//   return <Route path={path}><Component /></Route>
// }

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, Clock } from "lucide-react";
import { Link, Redirect, Route } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check email verification for all users
  if (!user.emailVerified) {
    return (
      <Route path={path}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <Mail className="mr-2 h-5 w-5 text-blue-600" />
                {t("protected.emailVerificationTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  {t("protected.emailVerificationMessage")}
                </AlertDescription>
              </Alert>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  {t("protected.emailResendNote")}
                </p>
                <Link href="/auth">
                  <Button
                    variant="outline"
                    className="w-full"
                    data-testid="button-back-to-auth"
                  >
                    {t("protected.backToLogin")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Route>
    );
  }

  // Check seller approval status for seller routes
  if (user.role === "seller" && path.includes("/dashboard/seller")) {
    if (user.sellerStatus !== "approved") {
      return (
        <Route path={path}>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center">
                  <Clock className="mr-2 h-5 w-5 text-orange-600" />
                  {user.sellerStatus === "pending"
                    ? t("protected.approvalPendingTitle")
                    : t("protected.applicationRejectedTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert
                  variant={
                    user.sellerStatus === "rejected"
                      ? "destructive"
                      : "default"
                  }
                >
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    {user.sellerStatus === "pending"
                      ? t("protected.pendingMessage")
                      : t("protected.rejectedMessage")}
                  </AlertDescription>
                </Alert>
                <div className="text-center">
                  <Link href="/">
                    <Button
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      data-testid="button-go-home"
                    >
                      {t("protected.goToHomepage")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </Route>
      );
    }
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
