import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";
import MirrorWrapper from "@/components/MirrorWrapper";
import { AITryOnStudio } from "@/components/AITryOnStudio";
import Integrations from "@/components/Integrations";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <MirrorWrapper />
        <AITryOnStudio />
        <Integrations />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
