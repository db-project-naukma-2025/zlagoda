import {
  IconArchive,
  IconBox,
  IconDashboard,
  IconPackage,
  IconReceipt,
  IconReport,
  IconTags,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { type RouteComponent } from "@tanstack/react-router";

import CategoriesPage from "../pages/categories";
import ChecksSalesPage from "../pages/checks-sales-page";
import CustomersPage from "../pages/customers";
import DashboardPage from "../pages/dashboard-page";
import EmployeesPage from "../pages/employees";
import ProductsPage from "../pages/products";
import ReportsPage from "../pages/reports-page";
import StoreProductsPage from "../pages/store-products";

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon?: React.ComponentType<{ className?: string; size?: string | number }>;
  component?: RouteComponent;
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    icon: IconDashboard,
    component: DashboardPage,
  },
  {
    id: "employees",
    title: "Employees",
    path: "/employees",
    icon: IconUsers,
    component: EmployeesPage,
  },
  {
    id: "products",
    title: "Products",
    path: "/products",
    icon: IconPackage,
    component: ProductsPage,
    children: [
      {
        id: "base-products",
        title: "Base Products",
        path: "/products/base-products",
        icon: IconBox,
        component: ProductsPage,
      },
      {
        id: "store-inventory",
        title: "Store Inventory",
        path: "/products/store-inventory",
        icon: IconArchive,
        component: StoreProductsPage,
      },
    ],
  },
  {
    id: "categories",
    title: "Categories",
    path: "/categories",
    icon: IconTags,
    component: CategoriesPage,
  },
  {
    id: "customers",
    title: "Customers",
    path: "/customers",
    icon: IconUser,
    component: CustomersPage,
  },
  {
    id: "checks-sales",
    title: "Checks / Sales",
    path: "/checks-sales",
    icon: IconReceipt,
    component: ChecksSalesPage,
  },
  {
    id: "reports",
    title: "Reports",
    path: "/reports",
    icon: IconReport,
    component: ReportsPage,
  },
];

// Helper function to find navigation item by path
export function findNavigationItemByPath(path: string): NavigationItem | null {
  function searchItems(items: NavigationItem[]): NavigationItem | null {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const found = searchItems(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  return searchItems(navigationConfig);
}

export function getBreadcrumbPath(path: string): NavigationItem[] {
  const breadcrumbs: NavigationItem[] = [];

  function searchItems(
    items: NavigationItem[],
    currentPath: NavigationItem[],
  ): boolean {
    for (const item of items) {
      const newPath = [...currentPath, item];

      if (item.path === path) {
        breadcrumbs.push(...newPath);
        return true;
      }

      if (item.children && searchItems(item.children, newPath)) {
        return true;
      }
    }
    return false;
  }

  searchItems(navigationConfig, []);
  return breadcrumbs;
}
