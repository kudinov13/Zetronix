import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { ThemeProvider } from "@/hooks/useTheme";
import { LeadFormProvider } from "@/hooks/useLeadForm";
import { AuthProvider } from "@/hooks/useAuth";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LeadFormProvider>
            <App />
          </LeadFormProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
