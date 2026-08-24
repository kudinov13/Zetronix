import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { TemplatePage } from "@/pages/TemplatePage";
import { CasesPage } from "@/pages/CasesPage";
import { CasePage } from "@/pages/CasePage";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminTemplates } from "@/pages/admin/AdminTemplates";
import { AdminCategories } from "@/pages/admin/AdminCategories";
import { AdminCases } from "@/pages/admin/AdminCases";
import { AdminCertificates } from "@/pages/admin/AdminCertificates";
import { AdminLeads } from "@/pages/admin/AdminLeads";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ChatWidget } from "@/components/ChatWidget";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export function App() {
  const { pathname } = useLocation();
  const isViewer = pathname.startsWith("/templates/");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {!isViewer && !isAdmin && <AnimatedBackground />}
      {!isViewer && !isAdmin && <Header />}
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/templates/:slug" element={<TemplatePage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:slug" element={<CasePage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="cases" element={<AdminCases />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="leads" element={<AdminLeads />} />
          </Route>
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {!isViewer && !isAdmin && <Footer />}
      {!isAdmin && <ChatWidget />}
    </>
  );
}
