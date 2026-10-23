import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { AppProviders } from "@/app/AppProviders";
import "./index.css";
import { AuthProvider } from "./features/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppProviders>
  </StrictMode>,
);
