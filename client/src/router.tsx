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
import { tokenStorage } from "./lib/api/auth";
import LoginPage from "./pages/login-page";

// Auth protection function
const requireAuth = () => {
  const token = tokenStorage.get();
  if (!token) {
    return redirect({ to: "/login" });
  }
  return null;
};

// Redirect authenticated users away from login
const redirectIfAuthenticated = () => {
  const token = tokenStorage.get();
  if (token) {
    return redirect({ to: "/dashboard" });
  }
  return null;
};

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: redirectIfAuthenticated,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    return redirect({ to: "/dashboard" });
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
          beforeLoad: requireAuth, // Protect all main routes
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  ...generatedRoutes,
]);

export const router = createRouter({ routeTree });
