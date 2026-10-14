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
  // The course the enrolment form starts on, when it's opened from a plan
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
    // Movement is turned off for visitors who ask their device for reduced motion
    <MotionConfig reducedMotion="user">
      {/* clip, not hidden: hidden would make this a scroll box and stop the sticky header.
          `noor-snap` turns on section snapping for this page (globals.css). */}
      <div className="noor-snap w-full overflow-x-clip">
        <Header />
        <main className="w-full">
          {/* The hero and the reviews ribbon share the first screen under the header.
              The 16px scroll margin makes its snap point the very top of the page,
              where the header is still at its full 84px. */}
          <div className="flex min-h-[calc(100svh-84px)] flex-col lg:snap-start lg:scroll-mt-[16px]">
            <HeroLux onEnroll={openEnroll} />
            <ReviewMarquee />
          </div>
          <WhyFamilies />
          <ProgrammesSection onEnroll={openEnroll} />
          <StepsTimeline onEnroll={openEnroll} />
          {/* Previews of other pages, each with a button through to it:
              About (map), Instructors, Blog, FAQs and, last, Pricing */}
          <WhoWeTeach />
          <MeetTeachers />
          <BlogShowcase />
          <HomeFaq onEnroll={openEnroll} />
          <HomePricing onChoose={enrollFor} />
        </main>
        {/* The last place the page settles: the bottom, footer in view */}
        <div className="lg:snap-start">
          <Footer />
        </div>
      </div>
      <EnrollModal open={open} onClose={closeEnroll} defaultCourse={course} />
    </MotionConfig>
  );
}
