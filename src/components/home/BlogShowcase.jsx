"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import CoverflowSlider from "@/components/blog/coverflow-slider";
import SectionCta from "@/components/noor/SectionCta";
import { reveal } from "@/components/noor/motion";
import { Accent, Eyebrow, Lead, SectionHeading } from "@/components/lux/effects";
import { blogs } from "@/app/(pages)/blogs/data";

// The Blog page's articles in the same order, keyed the same way
const posts = blogs.map((post, i) => ({ ...post, key: `${post.id}-${i}` }));

// Room under the slider that it must leave free: the 68px sticky header plus
// the section's bottom padding
const RESERVE = 104;

// The Blog page's 3D slider, moving on one card every 3 seconds, with a way
// through to the Blog page
export default function BlogShowcase() {
  const headRef = useRef(null);

  return (
    // overflow-x-clip: the slider's side cards reach past the screen edge on phones
    <section className="relative flex flex-col justify-center overflow-x-clip bg-white py-[clamp(2rem,5vh,4rem)] lg:min-h-[calc(100svh-68px)] lg:snap-start">
      <div className="mx-auto w-full max-w-7xl px-[1rem] sm:px-[1.5rem] lg:px-[2rem]">
        <div
          ref={headRef}
          className="flex flex-col items-center gap-[1rem] max-sm:text-center sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Eyebrow>Latest articles</Eyebrow>
            <SectionHeading className="mt-[1rem]">
              <Accent text="Blogs" />
            </SectionHeading>
            <motion.div {...reveal(0.1)}>
              <Lead className="mt-[0.9rem] max-w-[620px]">
                Explore Islamic knowledge, Quran learning tips, and spiritual insights from our qualified scholars and educators.
              </Lead>
            </motion.div>
          </div>
          <motion.div className="shrink-0" {...reveal(0.15)}>
            <SectionCta href="/blogs">Read the blog</SectionCta>
          </motion.div>
        </div>

        <motion.div className="mt-[clamp(1rem,3vh,1.75rem)]" {...reveal(0.2)}>
          <CoverflowSlider posts={posts} fitFromRef={headRef} reserve={RESERVE} autoplay={3000} />
        </motion.div>
      </div>
    </section>
  );
}
