import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { cleanupLegacyPwa } from "@/app/bootstrap/cleanup-legacy-pwa";
import { ErrorBoundary } from "@/app/error-boundary";
import { router } from "@/app/router";
import { queryClient } from "@/shared/lib/react-query/query-client";
import "@/app/styles/index.css";

cleanupLegacyPwa();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
