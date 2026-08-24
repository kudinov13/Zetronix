import { useEffect, lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ChatWidget } from "@/components/ChatWidget";

const TemplatePage = lazy(() => import("@/pages/TemplatePage").then(m => ({ default: m.TemplatePage })));
const CasesPage = lazy(() => import("@/pages/CasesPage").then(m => ({ default: m.CasesPage })));
const CasePage = lazy(() => import("@/pages/CasePage").then(m => ({ default: m.CasePage })));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminTemplates = lazy(() => import("@/pages/admin/AdminTemplates").then(m => ({ default: m.AdminTemplates })));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories").then(m => ({ default: m.AdminCategories })));
const AdminCases = lazy(() => import("@/pages/admin/AdminCases").then(m => ({ default: m.AdminCases })));
const AdminCertificates = lazy(() => import("@/pages/admin/AdminCertificates").then(m => ({ default: m.AdminCertificates })));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads").then(m => ({ default: m.AdminLeads })));

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
        <Suspense fallback={null}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/templates/:slug" element={<TemplatePage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:slug" element={<CasePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
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
        </Suspense>
      </main>
      {!isViewer && !isAdmin && <Footer />}
      {!isAdmin && <ChatWidget />}
    </>
  );
}
