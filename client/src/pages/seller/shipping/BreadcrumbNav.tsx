import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Truck } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface BreadcrumbNavProps {
  currentPage: string;
}

export const BreadcrumbNav = ({ currentPage }: BreadcrumbNavProps) => {
  const { t } = useTranslation();

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/dashboard">
            <Home className="h-3.5 w-3.5 mr-1" />
            <span className="ml-1">{t("breadcrumb.administration")}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/shipping">
            <Truck className="h-3.5 w-3.5 mr-1" />
            <span className="ml-1">{t("breadcrumb.shippings")}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
