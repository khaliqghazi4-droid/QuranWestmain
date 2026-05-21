import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { Features } from "@/components/sections/features";
import { Courses } from "@/components/sections/courses";
import { Testimonials } from "@/components/sections/testimonials";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Courses />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
