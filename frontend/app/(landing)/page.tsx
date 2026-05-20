import { HeroSection } from "./sections/hero-section";
import { MarqueeSection } from "./sections/marquee-section";
import { BenefitsSection } from "./sections/benefits-section";
import { CTASection } from "./sections/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <BenefitsSection />
      <CTASection />
    </>
  );
}
