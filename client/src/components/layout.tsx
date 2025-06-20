import { useLocation } from "@tanstack/react-router";

import AppErrorBoundary from "@/components/app-error-boundary";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // For login page, render without sidebar
  if (isLoginPage) {
    return (
      <>
        <AppErrorBoundary>{children}</AppErrorBoundary>
        <Toaster />
      </>
    );
  }

  // For other pages, render with sidebar
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <AppErrorBoundary>{children}</AppErrorBoundary>
            </div>
            <Toaster />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
