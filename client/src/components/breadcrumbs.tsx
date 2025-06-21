import { Link, useLocation } from "@tanstack/react-router";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbPath } from "@/config/navigation";

export function Breadcrumbs() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbPath(location.pathname);

  if (breadcrumbs.length === 0) {
    return null;
  }

  // If only one breadcrumb (top-level page), show just the page name
  if (breadcrumbs.length === 1) {
    const firstBreadcrumb = breadcrumbs[0];
    if (!firstBreadcrumb) return null;

    return (
      <Breadcrumb className="text-base">
        <BreadcrumbList className="text-base gap-2">
          <BreadcrumbItem>
            <BreadcrumbPage className="text-base font-semibold">
              {firstBreadcrumb.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className="text-base">
      <BreadcrumbList className="text-base gap-2">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="text-base font-semibold">
                  {item.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    className="text-muted-foreground font-medium hover:text-foreground"
                    to={item.path}
                  >
                    {item.title}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
