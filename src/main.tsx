import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "@/store";
import { getRouter } from "@/router";
import "./styles.css";

const queryClient = new QueryClient();
const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ queryClient }} />
      </QueryClientProvider>
    </ReduxProvider>
  </StrictMode>,
);
