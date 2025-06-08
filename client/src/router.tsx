import {
  type AnyRoute,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { Layout } from "./components/layout";
import { navigationConfig, type NavigationItem } from "./config/navigation";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    throw redirect({
      to: "/dashboard",
    });
  },
});

function createRoutesFromConfig(items: NavigationItem[]): AnyRoute[] {
  const routes: AnyRoute[] = [];

  for (const item of items) {
    if (item.component) {
      routes.push(
        createRoute({
          getParentRoute: () => rootRoute,
          path: item.path,
          component: item.component,
        }),
      );
    }

    if (item.children) {
      routes.push(...createRoutesFromConfig(item.children));
    }
  }

  return routes;
}

const generatedRoutes = createRoutesFromConfig(navigationConfig);

const routeTree = rootRoute.addChildren([indexRoute, ...generatedRoutes]);

export const router = createRouter({ routeTree });
