import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { Features } from "@/components/homepage/Features";
import { SuccessStory } from "@/components/homepage/SuccessStory";
import { CTASection } from "@/components/homepage/CTASection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 flex flex-col gap-3 py-3">
          <Hero />
          <HowItWorks />
          <Features />
          <SuccessStory />
          <CTASection />
        </div>
      </main>
      <Footer />
    </>
  );
}
