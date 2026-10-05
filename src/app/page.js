"use client";

import Image from "next/image";
import EnrollNow from "@/components/footer/enrollNow/enrollNow";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import ProgrammesSection from "@/components/programmes/ProgrammesSection";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"
import { IoPlay } from "react-icons/io5"
import { useState, useRef, useEffect } from "react";
import { FiStar } from "react-icons/fi";


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
})

const fadeRight = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.7, ease: 'easeOut', delay },
})

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.88 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: false, amount: 0.3 },
  transition: { duration: 0.5, ease: 'easeOut', delay },
})

export default function Home() {
  const [open, setOpen] = useState(false);
  const testimonialRef = useRef(null);
  const [testimonialVisible, setTestimonialVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const el = testimonialRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTestimonialVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="!border overflow-x-hidden w-full">
      <Header />
      <main className="page-content overflow-x-hidden w-full">
        <section
          className="hero-banner-one"
          style={{ backgroundImage: "url(/assets/images/hero-banner/bg-lines.png)" }}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-7 col-lg-6">
                <div className="hero-content">
                  <img className="animted-star star1" src="/assets/images/star/star5.svg" alt="" aria-hidden="true" />
                  <img className="animted-star star2" src="/assets/images/star/star6.svg" alt="" aria-hidden="true" />
                  <motion.h1
                    className="m-b20 !text-balance hidden md:block !text-[#0B1A37]"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    The Quran Deserves a <br />Teacher Who Cares.<br /> Not Just a Screen.
                  </motion.h1>
                  <motion.h1
                    className="!text-4xl heading md:hidden !mb-10 !text-[#0B1A37]"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    The Quran Deserves a Teacher Who Cares. Not Just a Screen.
                  </motion.h1>
                  <motion.p
                    className="!mb-10"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    Every child learns differently. Our qualified Quran teachers get to know your child their pace, their learning style, their confidence and build a programme around that. Live. One to one. From your home.
                  </motion.p>

                  <motion.div
                    className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.6 }}
                    transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                  >
                    <motion.button
                      className="btn btn-primary btn-lg btn-standard w-full sm:w-auto"
                      onClick={() => setOpen(!open)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      Enroll Now
                      <span className="btn-icon" aria-hidden="true">
                        <img src="/assets/images/icon/arrow.svg" alt="" />
                      </span>
                    </motion.button>
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full sm:w-auto"
                    >
                      <Link href="/coursesGrid" className="btn btn-secondary btn-standard w-full sm:w-auto ms-0 sm:ms-2">
                        Courses
                        <span className="btn-icon" aria-hidden="true">
                          <img src="/assets/images/icon/arrow.svg" alt="" />
                        </span>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              <div className="col-xl-5 !rounded-2xl">
                <motion.div
                  className="!mb-6 md:!mb-1 !rounded-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                >
                  <Image
                    src="/hero.png"
                    alt="Child learning Quran online with a qualified teacher"
                    width={900}
                    height={900}
                    className="!rounded-2xl w-full h-auto"
                    style={{ width: '100%', height: 'auto' }}
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* end::Hero Banner */}

        {/* begin::Marquee One */}
        <div className="marquee-one bg-[#EECC65]">
          <div className="marquee-track">
            {[0, 1].map((set) => (
              <div key={set} className="marquee-set" aria-hidden={set === 1 ? "true" : undefined}>
                {[
                  "Parent Review — Manchester, UK",
                  "“We tried two other academies before QuranWest. Our son actually asks to attend his class now.”",
                  "Sister Hafsa R. — Manchester, United Kingdom",
                  "14 live classes happening right now across 3 time zones",
                  "Hifz Programme — Mariam, age 11 · Juz 18 of 30",
                  "Parent Review — Manchester, UK",
                ].map((text) => (
                  <span key={text}>
                    <img src="/assets/images/star.svg" alt="" aria-hidden="true" loading="lazy" />
                    {text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* end::Marquee One */}

        {/* begin::Learning Focused on Your Goals */}
        <section className="section-area section-sp2 bg-primary about-section-one">
          <div className="container">
            <div className="row align-items-center">

              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex flex-col md:w-[82.5rem]">
                  <motion.div className="" {...fadeUp(0.1)}>
                    <h2 className="text-white">
                      Why Families are Choosing Us
                    </h2>
                  </motion.div>
                  <motion.div className="m-b30 mt-5" {...fadeRight(0.2)}>
                    <ul className="list-style1 text-white m-0">
                      <li className="text-balance">One Teacher, One Student real relationship with your child&apos;s teacher</li>
                      <li className="text-balance">Qualified & Verified Teachers formal Ijazah certification</li>
                    </ul>
                  </motion.div>
                </div>
                <div className="row">
                  {[
                    {
                      delay: 0.2,
                      src: "/assets/images/landing/qurankid.webp",
                      alt: "One teacher one student",
                      title: "One Teacher, One Student",
                      desc: "Your child builds a real relationship with someone who knows their progress inside out.",
                    },
                    {
                      delay: 0.3,
                      src: "/assets/images/landing/classAround.jpg",
                      alt: "Family scheduling classes",
                      title: "Classes Around Your Schedule",
                      desc: "You pick the time that works for your family — morning before school, after homework, or weekends.",
                    },
                    {
                      delay: 0.4,
                      src: "/assets/images/teacher.jpg",
                      alt: "teacher",
                      title: "Qualified & Verified Teachers",
                      desc: "All our teachers hold formal Ijazah certification. We verify every qualification.",
                    },
                  ].map(({ delay, src, alt, title, desc }) => (
                    <motion.div key={title} className="col-lg-4 col-md-6 m-b30" {...scaleIn(delay)}>
                      <div className="featured-bx1 data-item-hover">
                        <div className="featured-media data-img-hover" data-displacement="/assets/libs/tree/effect6.jpg" data-intensity="0.2" data-speedin={1} data-speedout={1}>
                          <Image src={src} alt={alt} width={400} height={300} style={{ objectFit: "cover", borderRadius: "16px" }} />
                        </div>
                        <div className="featured-content">
                          <h3 className="featured-title">{title}</h3>
                          <p>{desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* end::Learning Focused on Your Goals */}

        {/* begin::Explore Top Courses */}
        <ProgrammesSection />
        {/* end::Explore Top Courses */}

        {/* begin::Getting Started */}
        <section className="section-area section-sp1 bg-white">
          <div className="container">
            <motion.div className="heading-bx style1 text-center" {...fadeUp(0)}>
              <h2 className="title-head-sm m-b0">Getting Started Up and Running in 24 Hours</h2>
            </motion.div>
            <div className="row">
              {[
                { delay: 0.1, icon: '/icons/icons.svg', frontTitle: 'Tell us about your child', frontSub: 'Fill out the enrolment form of your child', backTitle: 'Tell us about your child', backSub: 'No commitment required' },
                { delay: 0.2, icon: '/icons/icon.svg', frontTitle: 'We match you with right teacher', frontSub: 'Based on age & course', backTitle: 'We match you with the right teacher', backSub: 'Verified panel' },
                { delay: 0.3, icon: '/icons/icon1.svg', frontTitle: 'Attend three free trial classes', frontSub: 'No charge, no credit card', backTitle: 'Attend three free trial classes', backSub: 'Real classes' },
                { delay: 0.4, icon: '/icons/icon-2.svg', frontTitle: 'Enrol and continue learning', frontSub: 'Same teacher, same time', backTitle: 'Enrol and continue learning', backSub: 'No disruption' },
                { delay: 0.5, icon: '/icons/icon-4.svg', frontTitle: 'Limited Spots Available', frontSub: 'Three Free Classes available', backTitle: 'Three Free Classes', backSub: 'No strings attached' },
                { delay: 0.6, icon: '/icons/icon5.svg', frontTitle: 'Claim Your Free Trial', frontSub: 'Live session with qualified teacher', backTitle: 'Claim Your Free Trial', backSub: 'No payment info required' },
              ].map(({ delay, icon, frontTitle, frontSub, backTitle, backSub }) => (
                <motion.div
                  key={frontTitle}
                  className="col-xl-2 col-md-4 col-6"
                  initial={{ opacity: 0, rotateY: 90 }}
                  whileInView={{ opacity: 1, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay, ease: 'easeOut' }}
                >
                  <div className="categories-card">
                    <div className="categories-card-inner">
                      <div className="categories-card-front !h-[17.5rem]">
                        <img className="card-icon" src={icon} alt="" aria-hidden="true" loading="lazy" />
                        <h5 className="categorie-title !text-balance">{frontTitle}</h5>
                        <h5 className="text-white !font-extralight">{frontSub}</h5>
                      </div>
                      <div className="categories-card-back !h-[17.5rem]">
                        <img className="card-icon !invert" src={icon} alt="step" />
                        <h5 className="categorie-title">{backTitle}</h5>
                        <p>{backSub}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* end::Getting Started */}

        {/* begin::Simple Honest Pricing */}
        <section className="section-area !pb-0 section-sp1 testimonial-section-one bg-white">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 position-relative">
                <motion.div className="heading-bx style1 mb-lg-5" {...fadeUp(0)}>
                  <h2 className="title-head m-b0">
                    Simple, <span className="text-primary">Honest Pricing</span>
                  </h2>
                  <p className="!text-lg">
                    No hidden costs. No long-term contracts. Pay monthly and cancel whenever you like.
                  </p>
                </motion.div>
              </div>
              <div className="col-lg-6">
                <motion.div
                  ref={testimonialRef}
                  className="testimonial-wrapper-one"
                  initial={{ opacity: 0, x: 50 }}
                  animate={testimonialVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
                >
                  {(() => {
                    const plans = [
                      {
                        plan: "Starter Plan — £25/month",
                        desc: "4 live 1-to-1 classes per month · One course of your choice · Weekly progress summary · WhatsApp support · Includes 3 free trial classes",
                      },
                      {
                        plan: "Family Plan — £45/month (Most Popular)",
                        desc: "8 live classes per month · Up to 2 children · Two courses simultaneously · Detailed written reports · Priority teacher matching · Includes 3 free trial classes",
                      },
                      {
                        plan: "Intensive Plan — £70/month",
                        desc: "16 live classes per month · Dedicated teacher (no rotation) · All courses available · Daily revision tracking · Course completion certificate · Includes 3 free trial classes",
                      },
                    ];
                    const { plan, desc } = plans[activeCard];
                    return (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeCard}
                          initial={{ opacity: 0, x: -80 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 80 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                          <div className="testimonial-card">
                            <div className="rating-wrap">
                              <div className="d-flex">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className="text-yellow-500" />
                                ))}
                              </div>
                              <span className="text-dark">{plan}</span>
                            </div>
                            <div className="testimonial-content">
                              <p>{desc}</p>
                            </div>
                            <div className="testimonial-info">
                              <div className="clearfix">
                                <Link href="coursesGrid" className="testimonial-name">
                                  Start Free Trial →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    );
                  })()}
                  <div className="pagination-wrapper">
                    <div className="testimonial-btn-prev1 swiper-button-prev">
                      <i className="fi fi-rr-arrow-small-left" />
                    </div>
                    <div className="testimonial-pagination swiper-pagination" />
                    <div className="testimonial-btn-next1 swiper-button-next">
                      <i className="fi fi-rr-arrow-small-right" />
                    </div>
                    <div className="swiper-pagination-fraction" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* end::Simple Honest Pricing */}

        {/* begin::Brand Swiper */}
        {/* <div className="brand-swiper-section ">
          <div className="container">
            <hr className="m-0" />
            <div className="swiper brand-logo-swiper linear-swiper">
              <div className="swiper-wrapper">
                {[1, 2, 3, 4, 5, 1, 2].map((n, i) => (
                  <div key={i} className="swiper-slide">
                    <div className="brand-logo">
                      <img src={`/assets/images/brand/brand${n}.png`} alt="" aria-hidden="true" loading="lazy" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div> */}
        {/* end::Brand Swiper */}
      </main>
      <Footer />
      <AnimatePresence>
        {open && (
          <motion.section
            className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-center p-5 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 !z-10" onClick={() => setOpen(false)}></div>
            <motion.div
              className="w-[900px] max-w-[95vw] !z-40 max-h-[90vh] my-10 !rounded-lg overflow-y-auto scroller"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-end py-4"></div>
              <EnrollNow />
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </section>
  );
}

