import { IconInnerShadowTop } from "@tabler/icons-react";
import * as React from "react";
import { useMemo } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigationConfig, type NavigationItem } from "@/config/navigation";
import { useAuth, useLogout } from "@/lib/api/auth";
import { type User } from "@/lib/api/auth/types";

function filterNavigation(
  user: User | null,
  config: NavigationItem[],
): NavigationItem[] {
  if (!user) return [];

  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter((item) => {
        // Allow item if view_scope is undefined or user has the scope
        return !item.view_scope || user.scopes.includes(item.view_scope);
      })
      .map((item) => {
        // If item has children, recursively filter them
        if (item.children) {
          const filteredChildren = filterNavigationItems(item.children);
          if (filteredChildren.length === 0) {
            return {
              ...item,
              children: undefined,
            };
          }
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter((item) => {
        // Keep items that either have no children or have at least one child after filtering
        return !item.children || item.children.length > 0;
      }) as NavigationItem[];
  };

  return filterNavigationItems(config);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const filteredNavigation = useMemo(() => {
    return filterNavigation(user, navigationConfig);
  }, [user]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // If no user is authenticated, don't render the sidebar
  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Zlagoda</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.username,
            groups: user.groups,
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
