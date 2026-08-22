import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TemplateCatalog } from "@/components/TemplateCatalog";
import { TeamSection } from "@/components/TeamSection";
import { CertificatesSection } from "@/components/CertificatesSection";
import { IncludedSection } from "@/components/IncludedSection";
import { PricingSection } from "@/components/PricingSection";
import { FaqSection } from "@/components/FaqSection";
import { LeadSection } from "@/components/LeadSection";

export function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TemplateCatalog />
      <TeamSection />
      <CertificatesSection />
      <IncludedSection />
      <PricingSection />
      <FaqSection />
      <LeadSection />
    </>
  );
}
