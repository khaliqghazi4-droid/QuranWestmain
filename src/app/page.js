"use client";

import { useCallback, useState } from "react";
import { MotionConfig } from "framer-motion";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import EnrollModal from "@/components/enroll-modal";
import ProgrammesSection from "@/components/programmes/ProgrammesSection";
import HeroLux from "@/components/home/HeroLux";
import ReviewMarquee from "@/components/home/ReviewMarquee";
import WhyFamilies from "@/components/home/WhyFamilies";
import StepsTimeline from "@/components/home/StepsTimeline";
import WhoWeTeach from "@/components/home/WhoWeTeach";
import MeetTeachers from "@/components/home/MeetTeachers";
import HomePricing from "@/components/home/HomePricing";
import BlogShowcase from "@/components/home/BlogShowcase";
import HomeFaq from "@/components/home/HomeFaq";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState();
  const openEnroll = useCallback(() => {
    setCourse(undefined);
    setOpen(true);
  }, []);
  const enrollFor = useCallback((name) => {
    setCourse(name);
    setOpen(true);
  }, []);
  const closeEnroll = useCallback(() => setOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="noor-snap w-full overflow-x-clip">
        <Header />
        <main className="w-full">
          <div className="flex min-h-[calc(100svh-84px)] flex-col lg:snap-start lg:scroll-mt-[16px]">
            <HeroLux onEnroll={openEnroll} />
            <ReviewMarquee />
          </div>
          <WhyFamilies />
          <ProgrammesSection onEnroll={openEnroll} />
          <StepsTimeline onEnroll={openEnroll} />
          <WhoWeTeach />
          <MeetTeachers />
          <BlogShowcase />
          <HomeFaq onEnroll={openEnroll} />
          <HomePricing onChoose={enrollFor} />
        </main>
        <div className="lg:snap-start">
          <Footer />
        </div>
      </div>
      <EnrollModal open={open} onClose={closeEnroll} defaultCourse={course} />
    </MotionConfig>
  );
}
