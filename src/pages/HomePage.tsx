import { lazy, Suspense } from "react";
import { Hero } from "@/components/Hero";

const HowItWorks = lazy(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const TemplateCatalog = lazy(() => import("@/components/TemplateCatalog").then(m => ({ default: m.TemplateCatalog })));
const TeamSection = lazy(() => import("@/components/TeamSection").then(m => ({ default: m.TeamSection })));
const CertificatesSection = lazy(() => import("@/components/CertificatesSection").then(m => ({ default: m.CertificatesSection })));
const IncludedSection = lazy(() => import("@/components/IncludedSection").then(m => ({ default: m.IncludedSection })));
const PricingSection = lazy(() => import("@/components/PricingSection").then(m => ({ default: m.PricingSection })));
const FaqSection = lazy(() => import("@/components/FaqSection").then(m => ({ default: m.FaqSection })));
const LeadSection = lazy(() => import("@/components/LeadSection").then(m => ({ default: m.LeadSection })));

export function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={null}>
        <TemplateCatalog />
      </Suspense>
      <Suspense fallback={null}>
        <TeamSection />
      </Suspense>
      <Suspense fallback={null}>
        <CertificatesSection />
      </Suspense>
      <Suspense fallback={null}>
        <IncludedSection />
      </Suspense>
      <Suspense fallback={null}>
        <PricingSection />
      </Suspense>
      <Suspense fallback={null}>
        <FaqSection />
      </Suspense>
      <Suspense fallback={null}>
        <LeadSection />
      </Suspense>
    </>
  );
}
