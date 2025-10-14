// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Mail, Phone, MessageSquare, Send } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useMutation } from "@tanstack/react-query";

// interface ContactCustomerDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   orderNumber: string;
//   customerName: string;
//   customerEmail: string;
//   customerPhone?: string;
//   onSendEmail: (data: {
//     subject: string;
//     message: string;
//     template: string;
//   }) => Promise<void>;
//   onInitiateCall: (data: { reason: string; notes: string }) => Promise<void>;
// }

// const ContactCustomerDialog = ({
//   open,
//   onOpenChange,
//   orderNumber,
//   customerName,
//   customerEmail,
//   customerPhone,
//   onSendEmail,
//   onInitiateCall,
// }: ContactCustomerDialogProps) => {
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [emailTemplate, setEmailTemplate] = useState<string | undefined>(
//     undefined,
//   );
//   // const [emailTemplate, setEmailTemplate] = useState("");
//   const [callReason, setCallReason] = useState("");
//   const [callNotes, setCallNotes] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

//   const emailTemplates = [
//     {
//       value: "order_update",
//       label: "Mise à jour commande",
//       subject: `Mise à jour de votre commande ${orderNumber}`,
//       content: `Bonjour ${customerName},\n\nNous souhaitions vous informer d'une mise à jour concernant votre commande ${orderNumber}.\n\n[Détails de la mise à jour]\n\nCordialement,\nL'équipe support`,
//     },
//     {
//       value: "payment_issue",
//       label: "Problème de paiement",
//       subject: `Action requise - Commande ${orderNumber}`,
//       content: `Bonjour ${customerName},\n\nNous rencontrons un problème avec le paiement de votre commande ${orderNumber}.\n\n[Détails du problème et étapes à suivre]\n\nCordialement,\nL'équipe support`,
//     },
//     {
//       value: "shipping_delay",
//       label: "Retard de livraison",
//       subject: `Retard de livraison - Commande ${orderNumber}`,
//       content: `Bonjour ${customerName},\n\nNous vous informons d'un retard dans la livraison de votre commande ${orderNumber}.\n\n[Nouvelle date estimée et raison du retard]\n\nNous nous excusons pour ce désagrément.\n\nCordialement,\nL'équipe support`,
//     },
//     {
//       value: "custom",
//       label: "Message personnalisé",
//       subject: "",
//       content: "",
//     },
//   ];

//   const callReasons = [
//     { value: "payment_verification", label: "Vérification de paiement" },
//     { value: "address_confirmation", label: "Confirmation d'adresse" },
//     { value: "order_clarification", label: "Clarification de commande" },
//     { value: "complaint_resolution", label: "Résolution de réclamation" },
//     { value: "delivery_arrangement", label: "Arrangement de livraison" },
//     { value: "technical_support", label: "Support technique" },
//     { value: "other", label: "Autre" },
//   ];

//   const handleTemplateChange = (templateValue: string) => {
//     setEmailTemplate(templateValue);
//     const template = emailTemplates.find((t) => t.value === templateValue);
//     if (template) {
//       setEmailSubject(template.subject);
//       setEmailMessage(template.content);
//     }
//   };

//   const sendEmailMutation = useMutation({
//     mutationFn: async ({
//       to,
//       subject,
//       html,
//       text,
//     }: {
//       to: string;
//       subject: string;
//       html: string;
//       text?: string;
//     }) => {
//       const response = await fetch("/api/send-email", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ to, subject, html, text }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Échec de l’envoi de l’email");
//       }

//       return response.json();
//     },
//     onMutate: () => {
//       setIsLoading(true);
//     },
//     onSuccess: (data, { to }) => {
//       toast({
//         title: "Email envoyé",
//         description: `Email envoyé à ${to}`,
//       });
//       onOpenChange(false);
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Erreur",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//     onSettled: () => {
//       setIsLoading(false);
//     },
//   });

//   const handleSendEmail = () => {
//     if (!emailSubject || !emailMessage) {
//       toast({
//         title: "Informations manquantes",
//         description: "Veuillez renseigner l'objet et le message",
//         variant: "destructive",
//       });
//       return;
//     }

//     sendEmailMutation.mutate({
//       to: customerEmail,
//       subject: emailSubject,
//       html: emailMessage.replace(/\n/g, "<br/>"), // convert text to HTML
//       text: emailMessage,
//     });
//   };

//   // const handleSendEmail = async () => {
//   //   if (!emailSubject || !emailMessage) {
//   //     toast({
//   //       title: "Informations manquantes",
//   //       description: "Veuillez renseigner l'objet et le message",
//   //       variant: "destructive",
//   //     });
//   //     return;
//   //   }

//   //   setIsLoading(true);
//   //   try {
//   //     await onSendEmail({
//   //       subject: emailSubject,
//   //       message: emailMessage,
//   //       template: emailTemplate,
//   //     });
//   //     toast({
//   //       title: "Email envoyé",
//   //       description: `Email envoyé à ${customerEmail}`,
//   //     });
//   //     onOpenChange(false);
//   //   } catch (error) {
//   //     toast({
//   //       title: "Erreur",
//   //       description: "Impossible d'envoyer l'email",
//   //       variant: "destructive",
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const handleInitiateCall = async () => {
//     if (!callReason) {
//       toast({
//         title: "Raison manquante",
//         description: "Veuillez sélectionner une raison pour l'appel",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await onInitiateCall({
//         reason: callReason,
//         notes: callNotes,
//       });
//       toast({
//         title: "Appel programmé",
//         description: `Appel vers ${
//           customerPhone || customerName
//         } ajouté à votre liste`,
//       });
//       onOpenChange(false);
//     } catch (error) {
//       toast({
//         title: "Erreur",
//         description: "Impossible de programmer l'appel",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-2xl bg-white">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <MessageSquare className="h-5 w-5 text-blue-600" />
//             Contacter {customerName} - Commande {orderNumber}
//           </DialogTitle>
//         </DialogHeader>

//         <Tabs defaultValue="email" className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="email" className="flex items-center gap-2">
//               <Mail className="h-4 w-4" />
//               Email
//             </TabsTrigger>
//             <TabsTrigger value="call" className="flex items-center gap-2">
//               <Phone className="h-4 w-4" />
//               Appel téléphonique
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="email" className="space-y-4">
//             <div className="space-y-2">
//               <Label>Modèle d'email</Label>
//               <Select
//                 value={emailTemplate}
//                 onValueChange={handleTemplateChange}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Choisir un modèle" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {emailTemplates.map((template) => (
//                     <SelectItem key={template.value} value={template.value}>
//                       {template.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email-subject">Objet *</Label>
//               <Input
//                 id="email-subject"
//                 value={emailSubject}
//                 onChange={(e) => setEmailSubject(e.target.value)}
//                 placeholder="Objet de l'email"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email-message">Message *</Label>
//               <Textarea
//                 id="email-message"
//                 value={emailMessage}
//                 onChange={(e) => setEmailMessage(e.target.value)}
//                 placeholder="Tapez votre message ici..."
//                 rows={8}
//               />
//             </div>

//             <div className="bg-blue-50 p-3 rounded-lg">
//               <p className="text-sm text-blue-800">
//                 <strong>Destinataire:</strong> {customerEmail}
//               </p>
//             </div>

//             <DialogFooter>
//               <Button variant="outline" onClick={() => onOpenChange(false)}>
//                 Annuler
//               </Button>
//               <Button onClick={handleSendEmail} disabled={isLoading}>
//                 <Send className="h-4 w-4 mr-2" />
//                 {isLoading ? "Envoi..." : "Envoyer l'email"}
//               </Button>
//             </DialogFooter>
//           </TabsContent>

//           <TabsContent value="call" className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="call-reason">Raison de l'appel *</Label>
//               <Select value={callReason} onValueChange={setCallReason}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Sélectionner une raison" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white">
//                   {callReasons.map((reason) => (
//                     <SelectItem key={reason.value} value={reason.value}>
//                       {reason.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="call-notes">Notes pour l'appel</Label>
//               <Textarea
//                 id="call-notes"
//                 value={callNotes}
//                 onChange={(e) => setCallNotes(e.target.value)}
//                 placeholder="Points à aborder, informations importantes..."
//                 rows={6}
//               />
//             </div>

//             <div className="bg-green-50 p-3 rounded-lg">
//               <p className="text-sm text-green-800">
//                 <strong>Numéro:</strong> {customerPhone || "Non renseigné"}
//               </p>
//               <p className="text-sm text-green-700 mt-1">
//                 L'appel sera ajouté à votre liste de tâches avec toutes les
//                 informations nécessaires.
//               </p>
//             </div>

//             <DialogFooter>
//               <Button variant="outline" onClick={() => onOpenChange(false)}>
//                 Annuler
//               </Button>
//               <Button
//                 onClick={handleInitiateCall}
//                 disabled={isLoading || !customerPhone}
//               >
//                 <Phone className="h-4 w-4 mr-2" />
//                 {isLoading ? "Programmation..." : "Programmer l'appel"}
//               </Button>
//             </DialogFooter>
//           </TabsContent>
//         </Tabs>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ContactCustomerDialog;



import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface ContactCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onSendEmail: (data: {
    subject: string;
    message: string;
    template: string;
  }) => Promise<void>;
  onInitiateCall: (data: { reason: string; notes: string }) => Promise<void>;
}

const ContactCustomerDialog = ({
  open,
  onOpenChange,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  onSendEmail,
  onInitiateCall,
}: ContactCustomerDialogProps) => {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<string | undefined>(
    undefined,
  );
  const [callReason, setCallReason] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const emailTemplates = [
    {
      value: "order_update",
      label: t("orders.contact.templates.orderUpdate"),
      subject: t("orders.contact.templates.orderUpdateSubject", { orderNumber }),
      content: t("orders.contact.templates.orderUpdateContent", {
        customerName,
        orderNumber,
      }),
    },
    {
      value: "payment_issue",
      label: t("orders.contact.templates.paymentIssue"),
      subject: t("orders.contact.templates.paymentIssueSubject", { orderNumber }),
      content: t("orders.contact.templates.paymentIssueContent", {
        customerName,
        orderNumber,
      }),
    },
    {
      value: "shipping_delay",
      label: t("orders.contact.templates.shippingDelay"),
      subject: t("orders.contact.templates.shippingDelaySubject", { orderNumber }),
      content: t("orders.contact.templates.shippingDelayContent", {
        customerName,
        orderNumber,
      }),
    },
    {
      value: "custom",
      label: t("orders.contact.templates.custom"),
      subject: "",
      content: "",
    },
  ];

  const callReasons = [
    { value: "payment_verification", label: t("orders.contact.call.paymentVerification") },
    { value: "address_confirmation", label: t("orders.contact.call.addressConfirmation") },
    { value: "order_clarification", label: t("orders.contact.call.orderClarification") },
    { value: "complaint_resolution", label: t("orders.contact.call.complaintResolution") },
    { value: "delivery_arrangement", label: t("orders.contact.call.deliveryArrangement") },
    { value: "technical_support", label: t("orders.contact.call.technicalSupport") },
    { value: "other", label: t("orders.contact.call.other") },
  ];

  const handleTemplateChange = (templateValue: string) => {
    setEmailTemplate(templateValue);
    const template = emailTemplates.find((t) => t.value === templateValue);
    if (template) {
      setEmailSubject(template.subject);
      setEmailMessage(template.content);
    }
  };

  const sendEmailMutation = useMutation({
    mutationFn: async ({
      to,
      subject,
      html,
      text,
    }: {
      to: string;
      subject: string;
      html: string;
      text?: string;
    }) => {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to, subject, html, text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("orders.contact.errors.emailFailed"));
      }

      return response.json();
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data, { to }) => {
      toast({
        title: t("orders.contact.success.emailSent"),
        description: t("orders.contact.success.emailTo", { to }),
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("orders.contact.errors.error"),
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSendEmail = () => {
    if (!emailSubject || !emailMessage) {
      toast({
        title: t("orders.contact.errors.missingInfo"),
        description: t("orders.contact.errors.missingSubjectMessage"),
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      to: customerEmail,
      subject: emailSubject,
      html: emailMessage.replace(/\n/g, "<br/>"),
      text: emailMessage,
    });
  };

  const handleInitiateCall = async () => {
    if (!callReason) {
      toast({
        title: t("orders.contact.errors.missingReason"),
        description: t("orders.contact.errors.selectReason"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onInitiateCall({
        reason: callReason,
        notes: callNotes,
      });
      toast({
        title: t("orders.contact.success.callScheduled"),
        description: t("orders.contact.success.callTo", {
          target: customerPhone || customerName,
        }),
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t("orders.contact.errors.error"),
        description: t("orders.contact.errors.callFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            {t("orders.contact.title", { customerName, orderNumber })}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("orders.contact.tabs.email")}
            </TabsTrigger>
            <TabsTrigger value="call" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t("orders.contact.tabs.call")}
            </TabsTrigger>
          </TabsList>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label>{t("orders.contact.labels.emailTemplate")}</Label>
              <Select
                value={emailTemplate}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("orders.contact.placeholders.chooseTemplate")} />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">{t("orders.contact.labels.subject")} *</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={t("orders.contact.placeholders.subject")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-message">{t("orders.contact.labels.message")} *</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder={t("orders.contact.placeholders.message")}
                rows={8}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t("orders.contact.labels.recipient")}:</strong> {customerEmail}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("orders.contact.actions.cancel")}
              </Button>
              <Button onClick={handleSendEmail} disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? t("orders.contact.actions.sending") : t("orders.contact.actions.sendEmail")}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Call Tab */}
          <TabsContent value="call" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="call-reason">{t("orders.contact.labels.callReason")} *</Label>
              <Select value={callReason} onValueChange={setCallReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t("orders.contact.placeholders.selectReason")} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {callReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="call-notes">{t("orders.contact.labels.callNotes")}</Label>
              <Textarea
                id="call-notes"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder={t("orders.contact.placeholders.callNotes")}
                rows={6}
              />
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>{t("orders.contact.labels.phone")}:</strong> {customerPhone || t("orders.contact.noPhone")}
              </p>
              <p className="text-sm text-green-700 mt-1">
                {t("orders.contact.info.callAdded")}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("orders.contact.actions.cancel")}
              </Button>
              <Button
                onClick={handleInitiateCall}
                disabled={isLoading || !customerPhone}
              >
                <Phone className="h-4 w-4 mr-2" />
                {isLoading ? t("orders.contact.actions.scheduling") : t("orders.contact.actions.scheduleCall")}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ContactCustomerDialog;
