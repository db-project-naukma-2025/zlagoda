import { RouterProvider } from "@tanstack/react-router";

import { useTokenListener } from "./lib/api/auth";
import { router } from "./router";

function App() {
  // Initialize token listener for the entire app
  useTokenListener();

  return <RouterProvider router={router} />;
}

export default App;
