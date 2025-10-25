// import { useState, useEffect } from "react";
// import { useLocation } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Loader2, Store, CheckCircle, XCircle } from "lucide-react";

// export default function VerifyEmailPage() {
//   const [, setLocation] = useLocation();
//   const [isVerifying, setIsVerifying] = useState(true);
//   const [verificationResult, setVerificationResult] = useState<{
//     success: boolean;
//     message: string;
//     user?: any;
//   } | null>(null);

//   // Get verification token from URL
//   const urlParams = new URLSearchParams(window.location.search);
//   const verificationToken = urlParams.get('token');

//   useEffect(() => {
//     const verifyEmail = async () => {
//       if (!verificationToken) {
//         setVerificationResult({
//           success: false,
//           message: "Invalid verification link. No token provided."
//         });
//         setIsVerifying(false);
//         return;
//       }

//       try {
//         const response = await fetch(`/api/verify-email?token=${verificationToken}`, {
//           method: 'GET',
//           credentials: 'include',
//         });

//         const data = await response.json();

//         if (response.ok) {
//           setVerificationResult({
//             success: true,
//             message: data.message,
//             user: data.user
//           });
          
//           // Redirect to login after 3 seconds
//           setTimeout(() => {
//             setLocation("/auth");
//           }, 3000);
//         } else {
//           setVerificationResult({
//             success: false,
//             message: data.error || "Verification failed"
//           });
//         }
//       } catch (error) {
//         console.error("Email verification error:", error);
//         setVerificationResult({
//           success: false,
//           message: "An error occurred during verification. Please try again."
//         });
//       } finally {
//         setIsVerifying(false);
//       }
//     };

//     // Auto-verify on component mount
//     verifyEmail();
//   }, [verificationToken, setLocation]);

//   const handleGoToLogin = () => {
//     setLocation("/auth");
//   };

//   const handleResendVerification = async () => {
//     // This would need the user's email - for now just redirect to auth
//     setLocation("/auth");
//   };

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
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verification</h1>
//           <p className="text-gray-600">Verifying your email address...</p>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-center flex items-center justify-center">
//               {isVerifying ? (
//                 <>
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                   Verifying Your Email
//                 </>
//               ) : verificationResult?.success ? (
//                 <>
//                   <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
//                   Email Verified!
//                 </>
//               ) : (
//                 <>
//                   <XCircle className="mr-2 h-5 w-5 text-red-600" />
//                   Verification Failed
//                 </>
//               )}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {isVerifying ? (
//               <div className="text-center py-8">
//                 <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
//                 <p className="text-gray-600">Please wait while we verify your email address...</p>
//               </div>
//             ) : (
//               <>
//                 <Alert variant={verificationResult?.success ? "default" : "destructive"}>
//                   <AlertDescription data-testid={verificationResult?.success ? "message-success" : "message-error"}>
//                     {verificationResult?.message}
//                   </AlertDescription>
//                 </Alert>

//                 {verificationResult?.success ? (
//                   <div className="space-y-4">
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600 mb-4">
//                         Your email has been successfully verified!
//                         {verificationResult.user?.role === "seller" && (
//                           <><br />Your seller application is now pending admin approval.</>
//                         )}
//                         <br />
//                         <span className="font-medium">Redirecting to login in 3 seconds...</span>
//                       </p>
//                     </div>
//                     <Button
//                       onClick={handleGoToLogin}
//                       className="w-full bg-primary-600 hover:bg-primary-700"
//                       data-testid="button-go-to-login"
//                     >
//                       Go to Login Now
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     <div className="text-center">
//                       <p className="text-sm text-gray-600 mb-4">
//                         The verification link may be invalid or expired.
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <Button
//                         onClick={handleGoToLogin}
//                         className="w-full bg-primary-600 hover:bg-primary-700"
//                         data-testid="button-back-to-auth"
//                       >
//                         Back to Login
//                       </Button>
//                       <Button
//                         onClick={handleResendVerification}
//                         variant="outline"
//                         className="w-full"
//                         data-testid="button-resend-verification"
//                       >
//                         Request New Verification Email
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Store, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
  } | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const verificationToken = urlParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!verificationToken) {
        setVerificationResult({
          success: false,
          message: t("verify.invalidLink"),
        });
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-email?token=${verificationToken}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationResult({
            success: true,
            message: data.message,
            user: data.user,
          });
          setTimeout(() => {
            setLocation("/auth");
          }, 3000);
        } else {
          setVerificationResult({
            success: false,
            message: data.error || t("verify.failed"),
          });
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setVerificationResult({
          success: false,
          message: t("verify.errorOccurred"),
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [verificationToken, setLocation, t]);

  const handleGoToLogin = () => setLocation("/auth");
  const handleResendVerification = async () => setLocation("/auth");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Store className="text-white h-6 w-6" />
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">{t("app.name")}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("verify.title")}</h1>
          <p className="text-gray-600">{t("verify.verifyingMessage")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("verify.verifyingTitle")}
                </>
              ) : verificationResult?.success ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  {t("verify.successTitle")}
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-5 w-5 text-red-600" />
                  {t("verify.failedTitle")}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerifying ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                <p className="text-gray-600">{t("verify.waitMessage")}</p>
              </div>
            ) : (
              <>
                <Alert variant={verificationResult?.success ? "default" : "destructive"}>
                  <AlertDescription data-testid={verificationResult?.success ? "message-success" : "message-error"}>
                    {verificationResult?.message}
                  </AlertDescription>
                </Alert>

                {verificationResult?.success ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        {t("verify.successMessage")}
                        {verificationResult.user?.role === "seller" && (
                          <><br />{t("verify.pendingApproval")}</>
                        )}
                        <br />
                        <span className="font-medium">{t("verify.redirectMessage")}</span>
                      </p>
                    </div>
                    <Button
                      onClick={handleGoToLogin}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                      data-testid="button-go-to-login"
                    >
                      {t("verify.goToLogin")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        {t("verify.linkInvalid")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={handleGoToLogin}
                        className="w-full bg-primary-600 hover:bg-primary-700"
                        data-testid="button-back-to-auth"
                      >
                        {t("verify.backToLogin")}
                      </Button>
                      <Button
                        onClick={handleResendVerification}
                        variant="outline"
                        className="w-full"
                        data-testid="button-resend-verification"
                      >
                        {t("verify.resendEmail")}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
